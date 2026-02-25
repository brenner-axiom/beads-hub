# On-Chain Reputation System Bridge Design for #B4mad Agents

## Overview

This document outlines the design for bridging the beads task tracking system to an on-chain reputation system using ERC-8004. The bridge will record positive attestations on-chain when sub-agents successfully close beads, creating a verifiable track record.

## Problem Statement

Our beads system already tracks task completion with detailed git audit trails, but this off-chain tracking isn't trustlessly verifiable by other agents in the ecosystem. We want to bring this track record on-chain to enable:

1. Verifiable reputation scores ("Brenner Axiom's fleet has completed X tasks with Y% success rate")  
2. Trustless discovery and evaluation of agents
3. Integration with cross-agent collaboration ecosystems

## System Architecture

### Components

1. **Beads Task System** - Our current git-backed task tracking 
2. **ERC-8004 Reputation Registry** - On-chain registry for agent feedback
3. **Bead-to-Chain Bridge** - Middleware that monitors bead completions and submits attestations
4. **x402 Payment Proofs** - Proof-of-payment for inter-agent transactions (to be integrated)

### Integration Points

- When a bead is closed with a successful completion (via `close-bead.sh`)
- The bridge will detect the completion and submit feedback to the Reputation Registry
- Feedback includes task completion details, quality metrics, and optional proof-of-payment

## Implementation Plan

### Phase 1: Research and Setup

1. Deploy or use existing ERC-8004 Reputation Registry on an L2 (Base recommended)
2. Identify our agent identities that will be registered on-chain
3. Set up proper wallet configurations for agent ownership
4. Test basic interaction with the Reputation Registry contract

### Phase 2: Bridge Design

1. Create a monitoring system that watches for successfully closed beads
2. When a bead is closed:
   - Extract task completion details from the git audit trail
   - Generate appropriate feedback using ERC-8004 interface
   - Submit the feedback to the Reputation Registry
3. Include relevant task metadata as tags (task type, quality score, etc.)
4. Optionally include proof-of-payment details

### Phase 3: x402 Integration

1. Research x402 payment proof standards
2. Modify bridge to include x402 receipt information in feedback files
3. Validate payment proofs in the feedback structure

## Detailed Bridge Design

### Feedback Structure

When a bead is closed successfully, the bridge should emit feedback with:

1. **Value**: A positive rating (e.g. 100 for successful completion)
2. **ValueDecimals**: 0 (for whole numbers)
3. **Tag1**: Task category (research, code, deployment, publishing, etc.)
4. **Tag2**: Quality tier (e.g., "excellent", "good", "average", "poor")
5. **ClientAddress**: Our goern's wallet (as the verified reviewer)
6. **FeedbackURI**: IPFS hash or HTTP URI pointing to detailed feedback file
7. **FeedbackHash**: Keccak-256 hash of the feedback file

### Feedback File Structure

The feedback file (at FeedbackURI) should include:

```json
{
  "agentRegistry": "eip155:8453:0x...identity-registry-address",
  "agentId": 22,
  "clientAddress": "eip155:1:0x...goern-wallet",
  "createdAt": "2026-02-25T05:43:21Z",
  "value": 100,
  "valueDecimals": 0,
  "tag1": "code",
  "tag2": "excellent",
  "endpoint": "https://github.com/brenner-axiom/beads-hub/issues/beads-hub-d5p",
  "mcp": {
    "tool": "beads-task-completion"
  },
  "a2a": {
    "contextId": "bead-closure",
    "taskId": "beads-hub-d5p"
  },
  "proofOfPayment": {
    "fromAddress": "0x...from-wallet",
    "toAddress": "0x...to-wallet",
    "chainId": "8453",
    "txHash": "0x...transaction-hash"
  }
}
```

### Integration with Close Process

The bridge will integrate with the existing `close-bead.sh` script:
1. The script will detect when the bead is successfully closed
2. It will call the bridge to submit the feedback transaction
3. It will include the transaction hash of both the close and feedback for audit trail

## Security Considerations

1. **Sybil Attacks**: Only verified human reviewers (goern) as clientAddresses
2. **Gas Optimization**: Batch feedback for multiple beads
3. **Data Integrity**: Proper hashing and commitment verification
4. **Privacy**: Only public information should be submitted to the registry
5. **Contract Verification**: Ensure on-chain contracts match expected interfaces

## Implementation Steps

1. Research and prepare ERC-8004 contracts
2. Develop bridge middleware
3. Implement integration with beads system
4. Test feedback submission
5. Validate x402 proof-of-payment integration
6. Deploy and monitor

## Resources Needed

1. Base L2 deployment for ERC-8004 contracts
2. Proper agent wallet configurations for payments
3. IPFS infrastructure for feedback file storage
4. Integration testing environment

## Timeline

- Phase 1 (Research & Setup): 1 week  
- Phase 2 (Bridge Development): 2 weeks
- Phase 3 (x402 Integration & Testing): 1 week
- Total: 4 weeks to complete