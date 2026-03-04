# Beads Hub - B4mad Agent Reputation System

This repository contains the infrastructure and documentation for the #B4mad agent fleet's on-chain reputation system, bridging our beads task tracking with ERC-8004.

## Overview

This project implements a bridge between the #B4mad beads task system and the ERC-8004 Reputation Registry. When agents successfully close beads, the system records positive attestations on-chain, creating verifiable track records like:

"Brenner Axiom's fleet has completed X tasks with Y% success rate"

## Key Documents

- **[Reputation Bridge Design](docs/reputation-bridge-design.md)**: Complete technical design for the bridge system
- **[ERC-8004 Summary](docs/erc8004-reputation-system-summary.md)**: Executive summary and implementation plan
- **[ERC-8004 Research](../pages/content/research/2026-02-24-erc8004-agent-identity.md)**: Detailed analysis of ERC-8004 specification
- **[Value Per Token as Governance Metric](docs/research/2026-03-04-value-per-token-governance.md)**: Research on VPT as an organizational governance metric for agent fleets

## System Components

### 1. Beads Task System
Our git-backed distributed task tracker using the [beads CLI](https://github.com/steveyegge/beads)

### 2. ERC-8004 Reputation Registry  
On-chain feedback system for agent reputation (using Ethereum L2 for gas efficiency)

### 3. Bead-to-Chain Bridge
Middleware that listens for successful bead completions and submits attestations

### 4. x402 Payment Proofs
Integration for verifying inter-agent transaction payments

## Quick Start

For development and testing purposes, run the bridge demonstration script:

```bash
./reputation-bridge.sh beads-hub-d5p
```

## Integration

The bridge integrates with the standard beads workflow:

1. Agent completes a task and closes the bead using `close-bead.sh`
2. The bridge detects the successful completion
3. On-chain feedback is submitted to the Reputation Registry
4. Verifiable reputation record is created

## Issues & Tasks

See [beads-hub-d5p](beads-hub-d5p) for the main task related to this work.