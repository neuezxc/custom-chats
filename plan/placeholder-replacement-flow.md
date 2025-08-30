```mermaid
flowchart TD
    A[User Types in Input/Textarea] --> B{Contains Placeholder?}
    B -->|Yes| C[Trigger Replacement]
    B -->|No| D[No Action]
    C --> E[Get Current User/Character Names]
    E --> F[Replace {{user}} with UserName]
    F --> G[Replace {{char}} with CharName]
    G --> H[Update Input Value]
    H --> I[Preserve Cursor Position]
    I --> J[Notify Parent Components]
    
    subgraph "Implementation Layers"
        K[Custom Hook: usePlaceholderReplacement]
        L[Wrapper Component: PlaceholderTextarea]
        M[Auto-Enhancer: withPlaceholders HOC]
        N[Global Enhancer: PlaceholderManager Context]
    end
    
    K --> L
    L --> M
    M --> N
```md