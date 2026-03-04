# Legacy AI Decisions as the New Technical Debt

**Author:** Roman "Romanov" Research-Rachmaninov 🎹  
**Date:** 2026-03-04  
**Bead:** beads-hub-fre | GH#38  
**Status:** Published

## Abstract

As AI-first development becomes the norm, a new category of technical debt is emerging: **legacy AI decisions**. Unlike traditional technical debt rooted in human shortcuts, AI debt stems from model-dependent architectures, prompt-coupled logic, opaque inference boundaries, and specification assumptions that silently degrade as models evolve. This paper proposes a taxonomy of legacy AI decision categories, analyzes how AI debt differs structurally from human technical debt, and recommends refactoring strategies for agentic systems — including a "strangler fig" equivalent for AI-native architectures. We ground these findings in #B4mad's operational context: a multi-agent fleet building both greenfield platforms (b4arena) and brownfield integrations (exploration-openclaw).

## Context — Why This Matters for #B4mad

#B4mad operates at the frontier of agent-first development. Two active efforts make this research urgent:

1. **b4arena** — A greenfield eSports platform built specification-first, where the spec *is* the reality. Today it's pristine. Tomorrow it must integrate race data providers with opaque APIs, external authentication systems, and third-party services whose behavior cannot be fully specified.

2. **exploration-openclaw** — Already brownfield. Third-party code, community plugins, upstream dependencies. Every integration is a potential source of AI debt.

The uncomfortable truth: **every AI decision we make today becomes a legacy AI decision tomorrow.** Model generations shift. Prompt patterns that work on Claude Opus 4 may fail on its successor. Agentic architectures that assume specific tool-calling conventions will calcify. The question isn't whether AI debt accumulates — it's whether we recognize it before it compounds.

## State of the Art

### Traditional Technical Debt

Ward Cunningham coined "technical debt" in 1992 to describe the cost of expedient implementation choices [1]. The metaphor maps financial debt concepts (principal, interest, bankruptcy) onto software maintenance costs. Fowler's taxonomy distinguishes reckless vs. prudent debt, and deliberate vs. inadvertent debt [2].

### ML-Specific Technical Debt

Sculley et al. (2015) identified ML-specific debt categories: boundary erosion, entanglement, hidden feedback loops, undeclared consumers, data dependencies, and configuration debt [3]. Their key insight: **only a small fraction of real-world ML systems is composed of ML code; the surrounding infrastructure is vast and debt-prone.**

### The Gap

Existing work focuses on ML *systems* — training pipelines, feature stores, model serving. It does not address the emerging category of **agentic AI debt**: decisions made *by* AI agents during development, or architectural choices that couple systems to specific AI capabilities. This is the gap we address.

## Analysis

### A Taxonomy of Legacy AI Decision Categories

We identify six categories of AI debt, ordered by detection difficulty:

#### 1. Model-Coupled Architecture (Visible)

**Definition:** System designs that assume specific model capabilities — context window sizes, tool-calling formats, reasoning depth, multimodal support.

**Example:** An agent workflow hardcoded to expect structured JSON tool calls will break when a model version changes its function-calling schema. b4arena's specification-as-reality principle is vulnerable here: specs written *for* a particular model's interpretation become meaningless if the successor interprets them differently.

**Debt mechanism:** Unlike API version changes (which are explicit), model capability shifts are continuous and unannounced. There's no deprecation notice when a model gets worse at a specific task.

#### 2. Prompt Debt (Semi-Visible)

**Definition:** Business logic encoded in natural language prompts that is untestable, unversionable, and model-dependent.

**Example:** A system prompt that says "always respond in JSON with exactly these fields" works today. A model update changes its JSON formatting tendencies. No test catches this because the prompt isn't code — it's a prayer.

**Debt mechanism:** Prompt debt compounds because prompts reference other prompts. System prompts invoke tool descriptions which invoke response formats. Change one, and the cascade is unpredictable.

#### 3. Inference Boundary Erosion (Hidden)

**Definition:** The blurring of boundaries between deterministic code and probabilistic inference, making it impossible to reason about system behavior.

**Example:** A function that sometimes calls an LLM and sometimes uses a cached response, depending on confidence thresholds that were tuned for a previous model. The boundary between "code path" and "inference path" erodes until no one knows which parts of the system are deterministic.

**Debt mechanism:** Traditional systems have clear call graphs. Agentic systems have *probabilistic* call graphs — the execution path depends on model output, which depends on model version, which changes without notice.

#### 4. Specification Drift (Hidden)

**Definition:** Divergence between a system's formal specification and its actual behavior when mediated by AI interpretation.

**Example:** b4arena specifies race event schemas. An AI agent interprets these schemas to generate validation code. The agent's interpretation is subtly wrong — it permits edge cases the spec didn't intend. The spec says one thing; the system does another; and the gap is invisible because the AI "understood" the spec.

**Debt mechanism:** In traditional systems, specification drift is caught by tests. In AI-mediated systems, the AI writes both the implementation *and* the tests, potentially encoding the same misunderstanding in both.

#### 5. Capability Assumption Debt (Invisible)

**Definition:** Implicit assumptions about AI capabilities that are never documented but permeate system design.

**Example:** An agent orchestration system assumes sub-agents can handle 200K token contexts. A cost optimization switches to a model with 32K context. Nothing explicitly references the 200K assumption — it's embedded in task decomposition granularity, document chunking strategies, and workflow designs.

**Debt mechanism:** Capability assumptions are the AI equivalent of "works on my machine." They're environmental dependencies that are never declared.

#### 6. Agentic Feedback Loops (Invisible)

**Definition:** Self-reinforcing patterns where AI agents make decisions that shape future AI decisions, creating path dependencies that are impossible to unwind.

**Example:** An AI code reviewer approves a pattern. Future AI-generated code mimics that pattern because it appears in the training context. The pattern becomes canonical not because it's good, but because it's self-reinforcing. This is Sculley's "hidden feedback loop" [3] applied to agentic development itself.

**Debt mechanism:** Unlike data feedback loops in ML pipelines, agentic feedback loops operate on *decisions*, not data. They're harder to detect because the "training signal" is implicit in the codebase, not explicit in a dataset.

### How AI Debt Differs Structurally from Human Technical Debt

| Dimension | Human Technical Debt | AI Technical Debt |
|-----------|---------------------|-------------------|
| **Visibility** | Usually known to the developer who incurred it | Often invisible — the AI doesn't know it's creating debt |
| **Intentionality** | Often deliberate ("we'll fix it later") | Usually inadvertent — emergent from capability coupling |
| **Locality** | Concentrated in specific code areas | Diffuse — spread across prompts, configs, architectures |
| **Measurement** | Code metrics, complexity analysis | No established metrics; traditional tools don't see it |
| **Repayment** | Refactor the code | May require rearchitecting the AI boundary itself |
| **Interest rate** | Roughly linear with codebase growth | Potentially exponential due to feedback loops |
| **Trigger** | Usually internal changes | Often triggered by *external* model updates |

The most dangerous difference: **AI debt can be incurred by the AI itself.** When an AI agent makes an architectural decision, generates code, or chooses an integration pattern, it may be creating debt that no human reviewed or intended. Traditional debt has a human author. AI debt may have no author at all.

### Refactoring Strategies for Agentic Systems

#### The Strangler Fig for AI: "Model-Agnostic Encapsulation"

Fowler's Strangler Fig pattern [4] replaces legacy systems incrementally by routing requests through a new system that gradually absorbs functionality. The AI equivalent:

1. **Identify AI boundaries** — Every point where deterministic code meets probabilistic inference gets an explicit interface.
2. **Abstract the model** — No business logic should reference a specific model, prompt format, or capability. Use capability contracts: "this boundary requires structured output" not "this uses Claude's tool_use."
3. **Grow the deterministic shell** — Gradually move logic from prompts into code. If a prompt encodes business rules, extract those rules into deterministic validators. The AI becomes a *translator*, not a *decider*.
4. **Let the old inference die** — Once the deterministic shell handles a capability, remove the prompt. The strangler fig has replaced the host.

#### The Specification Firewall

For b4arena's specification-as-reality principle to survive contact with external systems:

1. **Anti-corruption layers** — Borrow from Domain-Driven Design. Every external system gets an anti-corruption layer that translates its messy reality into b4arena's clean specification domain. The layer is deterministic code, not AI inference.
2. **Specification versioning** — Treat specs like APIs. When an AI interprets a spec, record the interpretation version. When the model changes, re-run interpretation and diff.
3. **Dual-validation** — Never let AI both generate and validate. If AI writes the code, deterministic tests validate it. If AI writes the tests, a different AI (or human) reviews them.

#### The Capability Registry

Declare AI capability assumptions explicitly:

```yaml
# capability-requirements.yml
workflow: race-event-processing
requirements:
  context_window: 128000  # tokens minimum
  structured_output: true
  tool_calling: true
  reasoning_depth: high
  model_family: [claude, gpt]  # tested against
  last_validated: 2026-03-01
```

When models change, the registry flags which workflows need revalidation. This transforms invisible capability assumptions into auditable declarations.

## Recommendations

### For #B4mad Immediately

1. **Audit AI boundaries in exploration-openclaw.** Map every point where inference meets deterministic code. Document capability assumptions. This is the AI debt equivalent of `git blame`.

2. **Implement specification versioning for b4arena.** Every AI-interpreted spec should produce a versioned artifact that can be diffed when models change.

3. **Adopt the "no AI in the loop for validation" rule.** If AI generates it, non-AI validates it. Break the feedback loops before they form.

### For the Agent Fleet

4. **Add capability declarations to agent manifests.** Each agent (Brenner, Codemonkey, Romanov) should declare its model dependencies so fleet-wide model migrations can be assessed before execution.

5. **Track AI decisions as first-class artifacts.** When an agent makes an architectural choice, log it with the model version, prompt context, and reasoning. This creates an audit trail for future debt archaeology.

### For the Ecosystem

6. **Push for model change logs.** The industry needs the equivalent of semantic versioning for model capabilities. "This model update may affect structured output formatting" is the minimum.

7. **Develop AI debt metrics.** Lines of prompt, inference boundary count, capability assumption coverage — these should be tracked like code coverage.

## References

[1] Cunningham, W. (1992). "The WyCash Portfolio Management System." OOPSLA '92 Experience Report. First use of the "technical debt" metaphor.

[2] Fowler, M. (2009). "Technical Debt Quadrant." martinfowler.com. Taxonomy of deliberate/inadvertent × reckless/prudent debt.

[3] Sculley, D. et al. (2015). "Hidden Technical Debt in Machine Learning Systems." NeurIPS 2015. Landmark paper on ML-specific technical debt categories.

[4] Fowler, M. (2004). "Strangler Fig Application." martinfowler.com. Pattern for incremental legacy system replacement.

[5] Evans, E. (2003). "Domain-Driven Design: Tackling Complexity in the Heart of Software." Addison-Wesley. Anti-corruption layer pattern.

[6] ambient-code.ai (2026). Discussion of brownfield AI integration challenges and "legacy AI decisions" framing. Internal reference from #B4mad comparative analysis.

---

*Research conducted for #B4mad Industries. Bead: beads-hub-fre.*
