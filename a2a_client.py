#!/usr/bin/env python3
"""
A2A Client for OpenClaw Agents

This module enables OpenClaw agents to discover external agents via Agent Cards,
send tasks via JSON-RPC 2.0, and process responses. It supports SSE streaming
for long-running tasks.
"""

import json
import asyncio
import aiohttp
import time
from typing import Dict, Any, Optional, List, Union
from dataclasses import dataclass
from urllib.parse import urljoin, urlparse
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AgentCard:
    """Represents an A2A Agent Card (/.well-known/agent.json)"""
    id: str
    name: str
    description: str
    version: str
    endpoints: Dict[str, str]
    capabilities: List[str]
    authentication: Optional[Dict[str, Any]]
    contact: Optional[Dict[str, Any]]

@dataclass
class A2ATask:
    """Represents an A2A task to be sent to external agents"""
    id: str
    method: str
    params: Dict[str, Any]
    jsonrpc: str = "2.0"
    timeout: int = 30  # seconds

@dataclass
class A2ATaskResponse:
    """Represents a response from an A2A task"""
    id: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[Dict[str, Any]] = None
    jsonrpc: str = "2.0"

class A2AClient:
    """A2A Client for OpenClaw agents to communicate with external agents"""
    
    def __init__(self, base_url: str, session: Optional[aiohttp.ClientSession] = None):
        """
        Initialize the A2A Client
        
        Args:
            base_url: The base URL of the external agent
            session: Optional aiohttp session for reusable connections
        """
        self.base_url = base_url.rstrip('/')
        self.session = session or aiohttp.ClientSession()
        self.agent_card: Optional[AgentCard] = None
        self.discovery_cache_duration = 300  # 5 minutes
        self._last_discovery_time = 0
        
    async def discover_agent(self, force_refresh: bool = False) -> AgentCard:
        """
        Discover an external agent by fetching its Agent Card
        
        Args:
            force_refresh: Force fetching a new agent card
            
        Returns:
            AgentCard: The discovered agent card
        """
        current_time = time.time()
        
        # Check if we have a cached card and if it's still valid
        if not force_refresh and self.agent_card and \
           current_time - self._last_discovery_time < self.discovery_cache_duration:
            return self.agent_card
            
        agent_card_url = urljoin(self.base_url, '/.well-known/agent.json')
        
        try:
            async with self.session.get(agent_card_url) as response:
                if response.status == 200:
                    agent_data = await response.json()
                    self.agent_card = AgentCard(
                        id=agent_data.get('id'),
                        name=agent_data.get('name'),
                        description=agent_data.get('description'),
                        version=agent_data.get('version'),
                        endpoints=agent_data.get('endpoints', {}),
                        capabilities=agent_data.get('capabilities', []),
                        authentication=agent_data.get('authentication'),
                        contact=agent_data.get('contact')
                    )
                    self._last_discovery_time = current_time
                    logger.info(f"Discovered agent {self.agent_card.name} ({self.agent_card.id})")
                    return self.agent_card
                else:
                    raise Exception(f"Failed to fetch agent card: HTTP {response.status}")
                    
        except Exception as e:
            logger.error(f"Error discovering agent: {e}")
            raise
    
    async def send_task(self, task: A2ATask, endpoint: Optional[str] = None) -> A2ATaskResponse:
        """
        Send a task to an external agent
        
        Args:
            task: The task to send
            endpoint: Optional specific endpoint to use (defaults to "task" endpoint)
            
        Returns:
            A2ATaskResponse: The response from the agent
        """
        if not self.agent_card:
            await self.discover_agent()
            
        # Determine the endpoint to use
        if endpoint:
            endpoint_url = urljoin(self.base_url, endpoint)
        else:
            # Default to "task" endpoint or first available
            endpoints = self.agent_card.endpoints
            if 'task' in endpoints:
                endpoint_url = urljoin(self.base_url, endpoints['task'])
            elif endpoints:
                # Use the first endpoint
                first_endpoint = list(endpoints.values())[0]
                endpoint_url = urljoin(self.base_url, first_endpoint)
            else:
                raise ValueError("No task endpoints found in agent card")
        
        # Prepare JSON-RPC request
        jsonrpc_request = {
            "jsonrpc": task.jsonrpc,
            "method": task.method,
            "params": task.params,
            "id": task.id
        }
        
        try:
            async with self.session.post(
                endpoint_url,
                json=jsonrpc_request,
                timeout=aiohttp.ClientTimeout(total=task.timeout)
            ) as response:
                if response.status == 200:
                    response_data = await response.json()
                    
                    return A2ATaskResponse(
                        id=response_data.get('id'),
                        result=response_data.get('result'),
                        error=response_data.get('error'),
                        jsonrpc=response_data.get('jsonrpc', '2.0')
                    )
                else:
                    raise Exception(f"Task send failed: HTTP {response.status}")
                    
        except Exception as e:
            logger.error(f"Error sending task: {e}")
            raise
    
    async def poll_task_status(self, task_id: str, endpoint: Optional[str] = None) -> A2ATaskResponse:
        """
        Poll for the status of a task
        
        Args:
            task_id: The ID of the task to poll
            endpoint: Optional specific endpoint to use (defaults to "status" endpoint)
            
        Returns:
            A2ATaskResponse: The task status or result
        """
        if not self.agent_card:
            await self.discover_agent()
            
        # Determine the status endpoint
        if endpoint:
            endpoint_url = urljoin(self.base_url, endpoint)
        else:
            # If we have an HTTP task endpoint, we might also have a status endpoint
            endpoints = self.agent_card.endpoints
            if 'status' in endpoints:
                endpoint_url = urljoin(self.base_url, endpoints['status'])
            elif 'task' in endpoints:
                # Try to use task endpoint with status query
                base_endpoint = urljoin(self.base_url, endpoints['task'])
                endpoint_url = f"{base_endpoint}?task_id={task_id}"
            else:
                raise ValueError("No status endpoint found in agent card")
        
        try:
            async with self.session.get(endpoint_url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                if response.status == 200:
                    response_data = await response.json()
                    
                    return A2ATaskResponse(
                        id=response_data.get('id'),
                        result=response_data.get('result'),
                        error=response_data.get('error'),
                        jsonrpc=response_data.get('jsonrpc', '2.0')
                    )
                else:
                    raise Exception(f"Status poll failed: HTTP {response.status}")
                    
        except Exception as e:
            logger.error(f"Error polling task status: {e}")
            raise
    
    async def stream_task_results(self, task: A2ATask, 
                                 endpoint: Optional[str] = None) -> AsyncGenerator[A2ATaskResponse, None]:
        """
        Stream results from a task using Server-Sent Events (SSE)
        
        Args:
            task: The task to stream results for
            endpoint: Optional endpoint for streaming
            
        Yields:
            A2ATaskResponse: Response objects as they arrive
        """
        if not self.agent_card:
            await self.discover_agent()
            
        # Determine streaming endpoint
        if endpoint:
            endpoint_url = urljoin(self.base_url, endpoint)
        else:
            # Find a streaming endpoint in the agent card
            endpoints = self.agent_card.endpoints
            streaming_endpoints = [ep for ep in endpoints.values() if 'stream' in ep.lower() or 'sse' in ep.lower()]
            if streaming_endpoints:
                endpoint_url = urljoin(self.base_url, streaming_endpoints[0])
            else:
                # Fallback to regular task endpoint with streaming capability
                if 'task' in endpoints:
                    endpoint_url = urljoin(self.base_url, endpoints['task'])
                else:
                    raise ValueError("No streaming endpoint found in agent card")
        
        # For streaming, we'll implement basic SSE parsing
        # This would normally be a more sophisticated implementation
        # but it shows the concept
        async with self.session.get(endpoint_url) as response:
            if response.status == 200:
                # Basic streaming support - in real implementation this would
                # properly parse the SSE stream with data chunks
                content = await response.text()
                # Here we'd normally parse the SSE stream but for now we just return the entire content
                parsed_result = json.loads(content)
                yield A2ATaskResponse(
                    id=task.id,
                    result=parsed_result,
                    jsonrpc=task.jsonrpc
                )
            else:
                raise Exception(f"Streaming failed: HTTP {response.status}")
    
    async def close(self):
        """Close the client session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def __aenter__(self):
        """Async context manager entry"""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.close()

# Example usage
async def example_usage():
    """Example of how to use the A2A Client"""
    async with A2AClient("http://example-agent.com") as client:
        # Discover the agent
        agent_card = await client.discover_agent()
        print(f"Discovered agent: {agent_card.name}")
        
        # Send a task
        task = A2ATask(
            id="task_123",
            method="process_data",
            params={"input": "some data"}
        )
        
        try:
            response = await client.send_task(task)
            if response.error:
                print(f"Task failed with error: {response.error}")
            else:
                print(f"Task succeeded: {response.result}")
        except Exception as e:
            print(f"Task failed: {e}")

if __name__ == "__main__":
    # Run the example
    asyncio.run(example_usage())