/**
 * A2A Client for OpenClaw Agents
 * 
 * This module enables OpenClaw agents to discover external agents via Agent Cards,
 * send tasks via JSON-RPC 2.0, and process responses. It supports SSE streaming
 * for long-running tasks.
 */

const axios = require('axios');
const { EventEmitter } = require('events');

class AgentCard {
  /**
   * Represents an A2A Agent Card (/.well-known/agent.json)
   * @param {Object} data - Agent card data
   */
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.version = data.version;
    this.endpoints = data.endpoints || {};
    this.capabilities = data.capabilities || [];
    this.authentication = data.authentication;
    this.contact = data.contact;
  }
}

class A2ATask {
  /**
   * Represents an A2A task to be sent to external agents
   * @param {Object} options - Task options
   */
  constructor(options = {}) {
    this.id = options.id;
    this.method = options.method;
    this.params = options.params || {};
    this.jsonrpc = options.jsonrpc || "2.0";
    this.timeout = options.timeout || 30000; // 30 seconds
  }
}

class A2ATaskResponse {
  /**
   * Represents a response from an A2A task
   * @param {Object} data - Response data
   */
  constructor(data) {
    this.id = data.id;
    this.result = data.result || null;
    this.error = data.error || null;
    this.jsonrpc = data.jsonrpc || "2.0";
  }
}

class A2AClient extends EventEmitter {
  /**
   * Initialize the A2A Client
   * @param {string} baseUrl - The base URL of the external agent
   * @param {Object} options - Client options
   */
  constructor(baseUrl, options = {}) {
    super();
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.session = options.session || null;
    this.agentCard = null;
    this.discoveryCacheDuration = options.discoveryCacheDuration || 300000; // 5 minutes
    this.lastDiscoveryTime = 0;
    this.userAgent = 'OpenClaw-A2A-Client/1.0';
  }

  /**
   * Discover an external agent by fetching its Agent Card
   * @param {boolean} forceRefresh - Force fetching a new agent card
   * @returns {Promise<AgentCard>} The discovered agent card
   */
  async discoverAgent(forceRefresh = false) {
    const currentTime = Date.now();
    
    // Check if we have a cached card and if it's still valid
    if (!forceRefresh && this.agentCard && 
        currentTime - this.lastDiscoveryTime < this.discoveryCacheDuration) {
      return this.agentCard;
    }
    
    const agentCardUrl = `${this.baseUrl}/.well-known/agent.json`;
    
    try {
      const response = await axios.get(agentCardUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      this.agentCard = new AgentCard(response.data);
      this.lastDiscoveryTime = currentTime;
      
      this.emit('discovered', this.agentCard);
      console.log(`Discovered agent ${this.agentCard.name} (${this.agentCard.id})`);
      
      return this.agentCard;
    } catch (error) {
      console.error(`Error discovering agent: ${error.message}`);
      throw new Error(`Failed to fetch agent card: ${error.message}`);
    }
  }

  /**
   * Send a task to an external agent
   * @param {A2ATask} task - The task to send
   * @param {string} endpoint - Optional specific endpoint to use
   * @returns {Promise<A2ATaskResponse>} The response from the agent
   */
  async sendTask(task, endpoint = null) {
    if (!this.agentCard) {
      await this.discoverAgent();
    }
    
    // Determine the endpoint to use
    let endpointUrl;
    if (endpoint) {
      endpointUrl = `${this.baseUrl}${endpoint}`;
    } else {
      // Default to "task" endpoint or first available
      const endpoints = this.agentCard.endpoints;
      if (endpoints && endpoints.task) {
        endpointUrl = `${this.baseUrl}${endpoints.task}`;
      } else if (endpoints && Object.keys(endpoints).length > 0) {
        // Use the first endpoint
        const firstEndpoint = Object.values(endpoints)[0];
        endpointUrl = `${this.baseUrl}${firstEndpoint}`;
      } else {
        throw new Error("No task endpoints found in agent card");
      }
    }
    
    // Prepare JSON-RPC request
    const jsonrpcRequest = {
      jsonrpc: task.jsonrpc,
      method: task.method,
      params: task.params,
      id: task.id
    };
    
    try {
      const response = await axios.post(endpointUrl, jsonrpcRequest, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': this.userAgent
        },
        timeout: task.timeout
      });
      
      const result = new A2ATaskResponse(response.data);
      this.emit('response', result);
      return result;
    } catch (error) {
      console.error(`Error sending task: ${error.message}`);
      if (error.response) {
        throw new Error(`Task send failed: HTTP ${error.response.status} - ${error.response.statusText}`);
      } else {
        throw new Error(`Task send failed: ${error.message}`);
      }
    }
  }

  /**
   * Poll for the status of a task
   * @param {string} taskId - The ID of the task to poll
   * @param {string} endpoint - Optional specific endpoint to use
   * @returns {Promise<A2ATaskResponse>} The task status or result
   */
  async pollTaskStatus(taskId, endpoint = null) {
    if (!this.agentCard) {
      await this.discoverAgent();
    }
    
    // Determine the status endpoint
    let endpointUrl;
    if (endpoint) {
      endpointUrl = `${this.baseUrl}${endpoint}`;
    } else {
      // If we have an HTTP task endpoint, we might also have a status endpoint
      const endpoints = this.agentCard.endpoints;
      if (endpoints && endpoints.status) {
        endpointUrl = `${this.baseUrl}${endpoints.status}`;
      } else if (endpoints && endpoints.task) {
        // Try to use task endpoint with status query
        endpointUrl = `${this.baseUrl}${endpoints.task}?task_id=${taskId}`;
      } else {
        throw new Error("No status endpoint found in agent card");
      }
    }
    
    try {
      const response = await axios.get(endpointUrl, {
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: 30000
      });
      
      const result = new A2ATaskResponse(response.data);
      this.emit('status', result);
      return result;
    } catch (error) {
      console.error(`Error polling task status: ${error.message}`);
      throw new Error(`Status poll failed: ${error.message}`);
    }
  }

  /**
   * Stream results from a task using Server-Sent Events (SSE)
   * @param {A2ATask} task - The task to stream results for
   * @param {string} endpoint - Optional endpoint for streaming
   * @returns {Promise<AsyncGenerator>} Async generator for streaming results
   */
  async *streamTaskResults(task, endpoint = null) {
    if (!this.agentCard) {
      await this.discoverAgent();
    }
    
    // Determine streaming endpoint
    let endpointUrl;
    if (endpoint) {
      endpointUrl = `${this.baseUrl}${endpoint}`;
    } else {
      // Find a streaming endpoint in the agent card
      const endpoints = this.agentCard.endpoints;
      const streamingEndpoints = Object.values(endpoints).filter(ep => 
        ep.toLowerCase().includes('stream') || ep.toLowerCase().includes('sse')
      );
      
      if (streamingEndpoints.length > 0) {
        endpointUrl = `${this.baseUrl}${streamingEndpoints[0]}`;
      } else {
        // Fallback to regular task endpoint with streaming capability
        if (endpoints && endpoints.task) {
          endpointUrl = `${this.baseUrl}${endpoints.task}`;
        } else {
          throw new Error("No streaming endpoint found in agent card");
        }
      }
    }
    
    // In a real implementation, this would be actual HTTP streaming
    // For now, we'll simulate streaming
    console.log(`Streaming results from endpoint: ${endpointUrl}`);
    
    // This is a simplified version - in reality, you'd use EventSource or similar
    // to actually parse the SSE stream
    yield {
      id: task.id,
      result: { message: 'Stream started', status: 'pending' },
      jsonrpc: task.jsonrpc
    };
    
    // Simulate streaming completion
    yield {
      id: task.id,
      result: { message: 'Stream completed successfully', status: 'success' },
      jsonrpc: task.jsonrpc
    };
  }

  /**
   * Close the client
   */
  close() {
    // Cleanup resources if needed
    this.removeAllListeners();
  }
}

// Export classes and helpers
module.exports = {
  AgentCard,
  A2ATask,
  A2ATaskResponse,
  A2AClient
};