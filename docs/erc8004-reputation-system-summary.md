# ERC-8004 Reputation System for #B4mad Agents - Summary

## Executive Summary

This project designs and implements a bridge between the #B4mad beads task system and the ERC-8004 Reputation Registry to create trustlessly verifiable track records for our agent fleet. When sub-agents successfully close beads, the system records positive attestations on-chain with proof-of-payment details via x402.

## Key Components

1. **Beads Task System**: Our git-backed task tracking infrastructure
2. **ERC-8004 Reputation Registry**: On-chain feedback system for agent reputation
3. **Bead-to-Chain Bridge**: Middleware that monitors bead completions and submits attestations
4. **x402 Payment Proofs**: Integration for verifiable transaction information

## Research Findings

### ERC-8004 Specification
- **Identity Registry**: ERC-721 NFT-based agent identification
- **Reputation Registry**: Standard interface for feedback signals with on-chain composability
- **Validation Registry**: Generic hooks for independent validation requests and responses

### Feedback Structure (from ERC-8004)
- **Value**: Signed fixed-point integer (int128) with valueDecimals (0-18)
- **Tags**: tag1 and tag2 for categorization (e.g., "code", "excellent")  
- **Endpoint**: URI to off-chain details
- **Feedback URI/Hash**: For verifiable integrity of off-chain files
- **Proof-of-Payment**: Integration point for x402 receipts

## Design Approach

### Bridge Implementation
The bridge will monitor successful bead completions and emit on-chain feedback that:
1. References the completed task (bead ID)
2. Includes task type and quality metrics 
3. Provides verifiable details via off-chain files (stored on IPFS)
4. Optionally includes x402 payment proof information

### Security & Privacy
- Only verified human reviewers (goern) will submit feedback
- Off-chain files contain detailed but public information
- No private data will be submitted on-chain
- Proper hashing/commitment ensures data integrity

## Implementation Plan

### Phase 1: Research & Setup (Completed)
- Analyzed ERC-8004 specification
- Reviewed existing #B4mad infrastructure (beads, agent system)
- Documented integration points

### Phase 2: Design (Completed) 
- Created detailed bridge design document
- Defined feedback file structure
- Identified integration points with existing tools

### Phase 3: Implementation (Next Steps)
1. Deploy ERC-8004 Reputation Registry on Base L2
2. Develop bridge middleware
3. Integrate with existing beads system 
4. Test feedback submission
5. Implement x402 payment proof integration

## Resources Required

1. Base L2 deployment for ERC-8004 contracts
2. IPFS infrastructure for feedback file storage  
3. Integration testing environment
4. Agent wallet configurations with x402 support

## Success Metrics

- Successfully submit feedback for 100+ bead completions
- Demonstrate trustless reputation verification  
- Achieve low-latency feedback submission (under 30s)
- Maintain 99% uptime for the bridge system

## Related Work

- [ERC-8004: Trustless Agents (Draft)](https://eips.ethereum.org/EIPS/eip-8004)
- [Brenner Axiom Research on ERC-8004](../pages/content/research/2026-02-24-erc8004-agent-identity.md)
- [Beads Task System Documentation](SKILL.md)