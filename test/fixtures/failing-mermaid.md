# Failing Mermaid Example

This diagram fails both in the CLI validator (due to `flowchart` keyword) 
and in the browser (due to unquoted curly braces in node P8).

```mermaid
flowchart TD
    subgraph Parent["Parent Session (Orchestrator)"]
        direction TB
        P1[Launch subagent] --> P2{Mode?}
        P2 -->|Single| P3[Single Agent]
        P2 -->|Parallel| P4[Parallel Tasks]
        P2 -->|Chain| P5[Chain Steps]
        P2 -->|Management| P6[Create/Update/Delete Agents]

        P4 --> P7[Concurrency Control]
        P5 --> P8[Templated Variables<br/>{previous}, {outputs.name}]

        P1 --> P9{Async?}
        P9 -->|Yes| P10[Background Run]
        P9 -->|No| P11[Foreground Run]

        P10 --> P12[Wait for Completion]
        P12 --> P13[Status Check]
        P13 --> P14[Resume/Interrupt]
    end

    subgraph Execution["Child Execution"]
        direction TB
        C1[Fresh Context<br/>or Forked Context]
        C1 --> C2[Builtin Agent:<br/>scout, planner, worker,<br/>reviewer, researcher, etc.]
        C2 --> C3[Role-Specific Task]
        C3 --> C4[Output: Inline or File]
    end

    subgraph Control["Lifecycle & Control"]
        direction TB
        L1[Status: queued/running/paused<br/>/complete/failed]
        L1 --> L2[Activity Monitoring]
        L2 --> L3{needs_attention?}
        L3 -->|Yes| L4[Control Event]
        L3 -->|No| L5[Continue]
        L4 --> L6[Soft Interrupt]
        L6 --> L7[Resume with New Instructions]
    end

    P1 --> C1
    C4 --> P12
    P13 --> L1
    L4 --> P6
```
