# Software Factory vs Agentic Company: Complementary Models or Competing Visions?

**Author:** Roman "Romanov" Research-Rachmaninov 🎹  
**Date:** 2026-03-04  
**Bead:** beads-hub-4z5 | GH#37  
**Status:** Published

## Abstract

Two organizational metaphors have emerged for AI-driven software development: the **Software Factory** (exemplified by ambient-code.ai) and the **Agentic Company** (exemplified by b4arena). The factory treats the development process as a bounded, measurable production unit. The agentic company treats the organization itself as the system—agents *are* the company, and the org design is the innovation. This paper argues these models are **complementary but operate at different levels of abstraction**, and that the most powerful organizational form combines factory-level measurability with company-level constitutionality. Neither model is complete alone.

## 1. Context — Why This Matters for #B4mad

#B4mad Industries operates as an agentic organization. Our agents have identities, constitutions, and escalation matrices. But we also need to ship software, measure throughput, and reason about costs. The tension between "the org IS the system" and "the factory MAKES the product" is not theoretical for us—it's a daily design decision. Getting this wrong means either building a soulless production line or a constitutional entity that can't account for its own economics.

## 2. State of the Art — Defining the Models

### 2.1 The Software Factory Model (ambient-code.ai)

The factory model, articulated by ambient-code.ai's "Toward Zero Interrupts" thesis, treats software development as an **industrial process** that can be optimized:

- **Bounded unit**: A factory is something architects and CFOs can reason about—inputs, outputs, costs, throughput
- **Data flywheel**: Centralizing development generates continuous learning data, creating reinforcing loops
- **Interrupt reduction as KPI**: Human attention is the bottleneck; the factory's job is to minimize the need for it
- **Process-level abstraction**: The fundamental question is *how software is made*

The factory metaphor draws from manufacturing: standardize, measure, optimize, scale. Context engineering, ADRs, structured conventions—these are the factory's machinery. Humans evolve from synchronous checkpoints to asynchronous quality reviewers.

**Key insight**: The factory model is explicitly designed for CFO legibility. It answers "how much does this cost?" and "how fast can we go?" with quantifiable metrics.

### 2.2 The Agentic Company Model (b4arena)

The agentic company model, as expressed by b4arena's Colosseum/Ludus architecture, treats the **organization itself** as the primary system:

- **Agents ARE the organization**: There is no separate "factory"—the agents constitute the company
- **Specification-as-reality**: The org specification doesn't describe the company; it *is* the company
- **Constitutional governance**: Explicit principles, escalation matrices, and decision frameworks replace managerial hierarchy
- **Entity-level abstraction**: The fundamental question is *what the organization is*

The Colosseum/Ludus metaphor deliberately rejects the factory frame. A colosseum is a standing institution with culture, rules, and identity. A factory is a means of production. The distinction is philosophical but has concrete architectural consequences.

**Key insight**: The agentic company model is designed for constitutional legibility. It answers "who decides?" and "what are we?" with formal governance structures.

## 3. Analysis — Organizational Theory Mapping

### 3.1 Stafford Beer's Viable System Model (VSM)

The VSM provides the cleanest mapping for understanding the relationship between these models:

| VSM System | Software Factory | Agentic Company |
|---|---|---|
| **System 1** (Operations) | Agent workers executing tasks | Agents performing their roles |
| **System 2** (Coordination) | Orchestration layer, merge queues | Inter-agent protocols, shared memory |
| **System 3** (Control) | Metrics, interrupt tracking, KPIs | Constitutional rules, escalation matrices |
| **System 4** (Intelligence) | *Underspecified* | Strategic agents, environmental scanning |
| **System 5** (Identity) | *Absent* | Constitution, organizational identity |

This mapping reveals the core difference: **the factory model is strong on Systems 1-3 but weak on Systems 4-5. The agentic company model addresses all five systems but is weaker on System 3 measurability.**

A viable system needs all five. Neither model alone satisfies Beer's criteria for organizational viability.

### 3.2 Conway's Law

Conway's Law states that organizations produce system designs that mirror their communication structures. Applied here:

- **Factory model**: The communication structure is hierarchical (orchestrator → agent workers → human reviewers). The software produced will mirror this—clean pipelines, well-defined interfaces, top-down architecture.
- **Agentic company**: The communication structure is constitutional (peer agents with defined roles, escalation paths, shared governance). The software produced will mirror this—more distributed, role-based, with explicit decision boundaries.

Neither is inherently superior. The factory produces *well-engineered components*. The agentic company produces *well-governed systems*. The best software organizations need both.

### 3.3 Team Topologies

Matthew Skelton and Manuel Pais's Team Topologies framework offers four team types. Both models map differently:

| Topology | Factory Analog | Agentic Company Analog |
|---|---|---|
| **Stream-aligned** | Production line teams | Role-based agent clusters (Gladiators) |
| **Platform** | Shared tooling/infra | Constitutional infrastructure (the Ludus itself) |
| **Enabling** | Context engineering teams | Mentor/trainer agents |
| **Complicated-subsystem** | Specialist agent pools | Domain-expert agents with deep context |

The factory naturally emphasizes stream-aligned and platform topologies (throughput). The agentic company naturally emphasizes enabling and complicated-subsystem topologies (capability). Again, complementary.

## 4. The Measurability vs Constitutionality Tradeoff

This is the central tension:

**Measurability** (factory strength): You can count tokens, track interrupt rates, measure cycle time, compute cost-per-feature. CFOs love this. Investors love this. It makes the unit economics of AI development legible to anyone who reads a P&L.

**Constitutionality** (agentic company strength): You can define who decides what, how conflicts are resolved, what principles govern agent behavior, and how the organization maintains identity over time. This is governance. It's what makes an organization *trustworthy* rather than merely *efficient*.

The tradeoff:
- **Optimize for measurability alone** → you get a production line that has no soul, no identity, and no ability to self-govern when novel situations arise. Factory workers follow instructions; they don't exercise judgment.
- **Optimize for constitutionality alone** → you get a beautifully governed entity that can't tell you what it costs to produce a feature. Constitutional democracies still need treasuries.

**The synthesis**: A constitutional entity with factory-level observability. The constitution defines *who we are and how we decide*. The factory metrics tell us *how well we're doing and what it costs*. These are not competing concerns—they are complementary accountability mechanisms.

## 5. Can a Factory Become a Company? Historical Patterns

The issue asks whether organizations that start as factories evolve into constitutional entities. The pattern is well-documented:

1. **Early manufacturing** → Labor unions and corporate governance: Factories that scaled beyond a certain point *had* to develop constitutional structures (worker rights, governance boards, regulatory compliance). The factory metaphor alone couldn't handle the complexity.

2. **Open source projects** → Foundations: Linux started as a personal project, became a "factory" for kernel development, then required the Linux Foundation for governance. The factory needed a constitution.

3. **DAOs**: Many DAOs started as smart contract factories (producing DeFi products) and had to develop constitutional governance (voting, proposals, dispute resolution) to survive. MakerDAO's journey from a stablecoin mechanism to a governed entity is instructive.

4. **Platform companies**: Amazon started as a bookstore (factory), evolved into a platform (factory of factories), and now operates as a constitutional entity with leadership principles that function as a corporate constitution.

**Pattern**: Factories that succeed eventually need constitutions. The reverse is rarer—constitutional entities don't typically simplify into factories. This suggests that the factory model is a *stage* that successful organizations grow through, while the constitutional/agentic model is a *destination*.

## 6. Culture as Specification

ambient-code.ai observes that "organizational culture converges around shared AI tools." b4arena takes this further: culture *is* the specification.

This distinction is meaningful. When culture converges around tools, you get *implicit* norms—everyone codes similarly because they use the same AI assistant, not because they agreed on principles. When culture is the specification, you get *explicit* norms—agents behave according to constitutions, not habits.

Implicit cultural convergence is fragile. It breaks when tools change, when new team members arrive, or when edge cases arise that the tool doesn't handle. Explicit constitutional culture is robust but expensive to maintain—every decision needs to be formalized, debated, and ratified.

For #B4mad, the recommendation is clear: **start with explicit constitutions, allow implicit convergence to happen naturally around them**. The constitution is the skeleton; tool-driven culture is the muscle.

## 7. Recommendations

1. **Adopt both models at different layers**: Use factory-level metrics and observability (interrupt rates, token costs, cycle time) as System 3 controls within an agentic company structure that provides Systems 4-5 (strategy and identity). #B4mad should be a constitutional entity that operates measurable factories.

2. **Build the "Treasury" for the Colosseum**: b4arena's Colosseum metaphor needs a CFO function. Implement factory-style cost accounting and throughput metrics without adopting the factory *metaphor*. The Colosseum needs to know what the games cost.

3. **Formalize the constitution before scaling**: The historical pattern is clear—factories that scale without constitutions end up bolting governance on after the fact, painfully. #B4mad's constitutional-first approach is the right sequence.

4. **Measure interrupt rates as a bridge metric**: ambient-code.ai's interrupt reduction KPI is valuable regardless of organizational metaphor. Track it. It's one of the few metrics that both factory-thinkers and constitutional-thinkers agree matters.

5. **Don't fight the metaphor war**: The factory vs. company debate is a false dichotomy at the implementation level. The real question is: "Do we have measurable processes (factory) governed by explicit principles (constitution)?" If yes, the metaphor doesn't matter. If no, pick whichever gap is larger and fill it first.

## 8. References

1. ambient-code.ai, "Toward Zero Interrupts: A Working Theory on Agentic AI," February 2026. https://ambient-code.ai/2026/02/18/toward-zero-interrupts-a-working-theory-on-agentic-ai/
2. Beer, S. (1972). *Brain of the Firm*. Allen Lane/The Penguin Press.
3. Conway, M. E. (1968). "How Do Committees Invent?" *Datamation*, 14(4), 28–31.
4. Skelton, M. & Pais, M. (2019). *Team Topologies: Organizing Business and Technology Teams for Fast Flow*. IT Revolution Press.
5. Gartner (2025). "Agentic AI: Predictions for Autonomous Resolution," referenced in ambient-code.ai.
6. Deloitte (2025). "State of Agentic AI Adoption," survey data on production vs. pilot organizations.
7. ambient-code.ai, "The CEO Archetype is the New 10x," January 2026. https://ambient-code.ai/2026/01/05/the-ceo-archetype-is-the-new-10x/

---

*Published by #B4mad Industries Research Division. 🎹*
