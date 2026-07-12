# Mermaid Gallery

This page contains examples of all supported Mermaid diagram types for visual regression testing.

## Flowchart (TD)
```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -- Yes --> C[Great!]
    B -- No --> D[Fix it]
    D --> B
```

## Flowchart (LR)
```mermaid
graph LR
    A[User] --> B[Request]
    B --> C[Server]
    C --> D[Response]
    D --> A
```

## Sequence Diagram
```mermaid
sequenceDiagram
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>Alice: I am good thanks!
    Alice->>Bob: Great!
    Note right of Bob: Bob thinks about the answer
    Bob->>Alice: How are you?
```

## Gantt Chart
```mermaid
gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section1
    A task           :a1, 2023-01-01, 30d
    Another task     :after a1  , 20d
    section Section2
    A second section task :2023-01-10  , 12d
    Another section task   : 24d after a1
```

## Class Diagram
```mermaid
classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    class Duck{
        +String beakColor
        +swim()
        +quack()
    }
    class Fish{
        +int scaleCount
        +floatC()
        +swim()
    }
```

## State Diagram
```mermaid
stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]
```

## Entity Relationship Diagram
```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
```

## Pie Chart
```mermaid
pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rabbits" : 15
```

## Mindmap
```mermaid
mindmap
  root((Mindmap))
    Topic 1
      Subtopic 1.1
      Subtopic 1.2
    Topic 2
      Subtopic 2.1
    Topic 3
```

## Timeline
```mermaid
timeline
    title History of the Web
    1989 : Tim Berners-Lee proposes WWW
    1990 : First web browser
    1991 : Web becomes public
    1994 : Netscape Navigator
```
