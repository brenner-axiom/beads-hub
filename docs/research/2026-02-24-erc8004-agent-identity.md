# ERC-8004 and #B4mad's Position: Agent Identity Infrastructure on Ethereum

**Author:** Roman "Romanov" Research-Rachmaninov 🎹  
**Date:** 2026-02-24  
**Bead:** beads-hub-cms  
**Status:** Published

---

## Abstract

ERC-8004 ("Trustless Agents") proposes three on-chain registries—Identity, Reputation, and Validation—to give AI agents discoverable identities, verifiable track records, and provable correctness guarantees on Ethereum. This paper analyzes the specification, maps it to #B4mad's existing infrastructure (OpenClaw agent fleet, beads task system, planned DAO governance), and recommends a phased adoption strategy. Our position: **adopt early, adopt selectively**. The Identity Registry is immediately valuable and low-risk. The Reputation and Validation Registries require more maturity but should be tracked closely.

---

## 1. Context — Why This Matters for #B4mad

#B4mad operates a fleet of AI agents (Brenner, Romanov, Parker, Codemonkey, et al.) coordinated through OpenClaw. These agents already:

- **Have identities** — each agent has a name, role, and workspace, but these identities are local to our infrastructure (AGENTS.md files, git repos).
- **Coordinate tasks** — via the beads system (git-backed distributed issue tracker).
- **Expose capabilities** — via MCP skills (OpenClaw skills system).
- **Lack portable identity** — no agent can prove to an external party "I am Romanov, research agent of #B4mad, with X completed tasks."

As we move toward the #B4mad DAO and consider cross-organizational agent collaboration, the question of agent identity becomes critical. ERC-8004 is the first serious, multi-stakeholder attempt at solving this—authored by MetaMask, Ethereum Foundation, Google (A2A team), and Coinbase (x402 team). That authorship alone makes it worth our attention.

The metaphor from the referenced Medium article is apt: MCP is the business card (capability), A2A is the common language, x402 is the payment rail. ERC-8004 is the roof—identity and trust. We already have MCP via OpenClaw skills. We need the roof.

---

## 2. State of the Art — ERC-8004 Specification Analysis

### 2.1 Identity Registry

**What it is:** An ERC-721 (NFT) registry where each agent gets a unique token. The token's URI points to a registration file containing the agent's name, description, service endpoints (MCP, A2A, ENS, DID, email, wallets), and supported trust mechanisms.

**Key properties:**
- **Portable:** Identity survives server shutdowns—it's on-chain.
- **Transferable:** Agent identities can be sold or delegated (NFT mechanics).
- **Flexible endpoints:** Registration file supports arbitrary service types—MCP, A2A, ENS, DID, wallets, web, email.
- **On-chain metadata:** Key-value store for agent metadata, including a verified `agentWallet` (requires EIP-712/ERC-1271 signature proof).
- **Domain verification:** Optional proof that the agent controls its advertised endpoints.

**Globally unique identifier:** `{namespace}:{chainId}:{identityRegistry}` + `agentId` (e.g., `eip155:8453:0x742...` + token #7).

### 2.2 Reputation Registry

**What it is:** A standard interface for posting and querying feedback about agents. Any address can leave feedback (value + optional tags + optional off-chain detail file). Key innovation: the off-chain file can include `proofOfPayment` (x402 receipts), turning reviews into verified transaction feedback.

**Key properties:**
- **On-chain composability:** Core feedback data (value, tags, revocation status) is stored on-chain, queryable by smart contracts.
- **Sybil-aware design:** `getSummary()` requires filtering by `clientAddresses`—acknowledging that unfiltered aggregation is vulnerable to Sybil attacks.
- **Response mechanism:** Anyone can append responses to feedback (spam flagging, refund evidence).
- **Off-chain richness:** Feedback files can reference MCP tools, A2A tasks, OASF skills used.

**Limitation:** The spec explicitly punts on sophisticated aggregation—"more complex reputation aggregation will happen off-chain." This is realistic but means the on-chain data alone isn't sufficient for trust decisions.

### 2.3 Validation Registry

**What it is:** A generic hook system where agents request validation of specific work outputs, and validator contracts respond with pass/fail (0-100 scale). Validators could be stake-secured re-executors, zkML verifiers, or TEE oracles.

**Key properties:**
- **Tiered trust:** Security proportional to value at risk (reputation for pizza, staking for finance, zkML for medical).
- **Progressive validation:** Multiple responses per request (e.g., soft finality → hard finality).
- **Minimal on-chain footprint:** Only hashes and scores stored; evidence is off-chain.

**Limitation:** Incentives and slashing are explicitly out of scope—"managed by the specific validation protocol." This makes the registry a coordination point, not a complete validation system.

---

## 3. Analysis — Mapping to #B4mad Infrastructure

### 3.1 Identity Registry ↔ OpenClaw Agent Fleet

| #B4mad Today | ERC-8004 Equivalent | Gap |
|---|---|---|
| AGENTS.md (name, role, emoji) | Registration file (name, description, image) | Trivial mapping |
| OpenClaw skills (MCP) | `services[].name="MCP"` endpoint | Direct mapping |
| Git workspace repos | No equivalent | Not needed on-chain |
| gopass secrets | `agentWallet` (verified) | Different trust model |
| No external discoverability | NFT-based registry on L2 | **Critical gap** |

**Assessment:** The Identity Registry maps cleanly onto our agent fleet. Each OpenClaw agent (Brenner, Romanov, Parker, etc.) could have an on-chain identity. The registration file format is flexible enough to include our MCP skill endpoints. The NFT ownership model aligns with our DAO plans—the DAO could own the agent NFTs.

### 3.2 Reputation Registry ↔ Beads System

| #B4mad Today | ERC-8004 Equivalent | Gap |
|---|---|---|
| Beads (task tracking, git-backed) | Feedback with tags, off-chain files | Partial overlap |
| `bd close --reason "..."` | `giveFeedback()` with completion signal | Could bridge |
| No external reputation | On-chain feedback from clients | **Critical gap** |
| No proof of work quality | Validation + reputation combined | **Critical gap** |

**Assessment:** Our beads system tracks *what* agents did, but not *how well* they did it. ERC-8004's Reputation Registry adds the quality dimension. A bridge could emit on-chain feedback when beads are closed—e.g., when goern approves a deliverable, a feedback transaction is posted. This creates verifiable track records for our agents.

### 3.3 Validation Registry ↔ Future Needs

For #B4mad's current use cases (research, code, DevOps), the Validation Registry is less immediately relevant—our work products are reviewed by humans (goern). However, as we scale toward autonomous agent-to-agent transactions, validation becomes essential. A Codemonkey agent deploying infrastructure should have its work validated.

### 3.4 DAO Alignment

ERC-8004 aligns well with #B4mad DAO plans:
- **DAO as agent owner:** The DAO smart contract owns agent NFTs, controlling identity lifecycle.
- **Reputation as governance input:** Agent reputation scores could influence DAO voting weights or task allocation.
- **Revenue model:** Agents with strong on-chain reputation become valuable assets the DAO can monetize.

---

## 4. Position — Should #B4mad Adopt ERC-8004?

### 4.1 Pros

1. **First-mover advantage.** ERC-8004 is in Draft status. Early adopters shape the standard and build reputation before the crowd arrives.
2. **Multi-stakeholder backing.** MetaMask + EF + Google + Coinbase is the strongest possible author list. This standard has institutional momentum.
3. **Infrastructure alignment.** We already have MCP (OpenClaw skills), we're building toward A2A, and we use Ethereum. ERC-8004 is the natural next layer.
4. **Technological sovereignty.** On-chain identity is censorship-resistant and portable—aligned with #B4mad's core values.
5. **DAO-native.** NFT-based agent ownership maps directly to DAO governance.
6. **L2 deployment option.** Can deploy on Base, Optimism, or Arbitrum for low gas costs while maintaining Ethereum security.

### 4.2 Cons

1. **Draft status.** The spec may change significantly. Early implementations may need rework.
2. **Sybil vulnerability.** The Reputation Registry's own security considerations acknowledge Sybil attacks. Sophisticated reputation requires off-chain infrastructure.
3. **Gas costs.** Even on L2, every feedback transaction has a cost. For our high-frequency bead completion workflow, this could add up.
4. **Complexity.** Three registries, on-chain + off-chain data, EIP-712 signatures—significant implementation surface.
5. **Adoption uncertainty.** A standard is only as good as its adoption. If the agent ecosystem standardizes on something else, our investment is wasted.
6. **Privacy tension.** On-chain reputation is permanent and public. Agent failure history is forever visible—this could be a liability.

### 4.3 Verdict

**Adopt the Identity Registry now. Monitor and prepare for Reputation and Validation.**

The Identity Registry is low-risk, high-value: it gives our agents portable, verifiable identities at minimal cost. The Reputation and Validation Registries are higher-risk (spec may change, Sybil concerns, gas costs) but strategically important—we should build the internal plumbing to bridge into them when they stabilize.

---

## 5. Recommendations — Phased Implementation

### Phase 1: Identity (Q2 2026) — "Get Our Agents On-Chain"

**Effort:** Low  
**Value:** High  

1. Deploy or use existing ERC-8004 Identity Registry on Base (Coinbase L2—natural fit given Coinbase co-authorship).
2. Register core agents: Brenner (orchestrator), Romanov (research), Parker (publishing), Codemonkey (engineering).
3. Create registration files with MCP skill endpoints pointing to our OpenClaw infrastructure.
4. Set agent wallets for future payment capability.
5. DAO multisig (or goern's wallet initially) as NFT owner.

**Deliverable:** Each #B4mad agent has an on-chain identity resolvable to its capabilities.

### Phase 2: Reputation Bridge (Q3 2026) — "Make Our Track Record Visible"

**Effort:** Medium  
**Value:** Medium-High  

1. Build a bridge from beads → Reputation Registry: when a bead is closed with approval, emit on-chain feedback.
2. Define our tag taxonomy: `tag1` = task type (research, code, deploy, publish), `tag2` = quality tier.
3. Use goern's address as the initial `clientAddress` for feedback—verified human review.
4. Store detailed feedback files on IPFS (bead description, deliverable links, completion notes).

**Deliverable:** External parties can query our agents' on-chain track records.

### Phase 3: Validation & Full DAO Integration (Q4 2026+) — "Trust at Scale"

**Effort:** High  
**Value:** High (at scale)  

1. Implement validation workflows for critical agent operations (infrastructure changes, financial transactions).
2. Transfer agent NFT ownership to the #B4mad DAO contract.
3. Build reputation-weighted task allocation (agents with higher scores get higher-priority beads).
4. Explore running a validator service for other agents' work (revenue opportunity).

**Deliverable:** Fully autonomous, on-chain verifiable agent fleet governed by DAO.

---

## 6. Strategic Considerations

### 6.1 Chain Selection

Base is the recommended deployment chain:
- Erik Reppel (Coinbase/x402) is a co-author → natural ecosystem alignment.
- Low gas costs for frequent feedback transactions.
- Growing agent/DeFi ecosystem.
- Bridge to Ethereum mainnet available for high-value identity operations.

### 6.2 Alternatives Considered

| Alternative | Assessment |
|---|---|
| **W3C DIDs** | Complementary, not competing. ERC-8004 registration files can include DID endpoints. Use both. |
| **Verifiable Credentials (VCs)** | Off-chain, issuer-dependent. Less composable than on-chain reputation. Good for specific attestations. |
| **OASF (Agent Skills Framework)** | Capability description standard. ERC-8004 registration files support OASF endpoints. Complementary. |
| **Custom/proprietary identity** | Against our values. No portability, no composability. Reject. |

### 6.3 Risk Mitigation

- **Spec instability:** Keep Phase 1 minimal. Registration file format is the most stable part.
- **Gas costs:** Batch feedback transactions. Only emit on-chain feedback for significant deliverables, not every bead.
- **Sybil risk:** In Phase 2, use only verified human reviewers (goern) as clientAddresses. Expand carefully.

---

## 7. Conclusion

ERC-8004 is the most credible attempt at agent identity infrastructure we've seen. Its authorship (MetaMask, EF, Google, Coinbase), its design philosophy (pluggable trust, tiered security), and its compatibility with protocols we already use (MCP, A2A) make it a natural fit for #B4mad.

We should not wait for the spec to finalize. The Identity Registry is stable enough to use today. By registering our agents on-chain now, we establish #B4mad as an early mover in the agent identity space—building verifiable reputation while others are still debating whether they need it.

The vision: a #B4mad DAO that owns a fleet of agents with on-chain identities, verifiable track records, and validated work outputs. Agents that external parties can discover, evaluate, and hire—trustlessly. That's not just infrastructure. That's a business model.

---

## References

1. ERC-8004: Trustless Agents [DRAFT]. Marco De Rossi, Davide Crapis, Jordan Ellis, Erik Reppel. August 2025. https://eips.ethereum.org/EIPS/eip-8004
2. Kim, S.J. "Passports Carved on the Blockchain: The Case for Agent Identity." Medium/Hashed, February 2026. https://medium.com/hashed-official/passports-carved-on-the-blockchain-the-case-for-agent-identity-deb4a71521ab
3. ERC-721: Non-Fungible Token Standard. https://eips.ethereum.org/EIPS/eip-721
4. Model Context Protocol (MCP). Anthropic, November 2024. https://modelcontextprotocol.io/
5. Agent-to-Agent Protocol (A2A). Google/Linux Foundation, April 2025. https://github.com/google/A2A
6. x402: HTTP Payment Protocol. Coinbase, 2025. https://www.x402.org/
