```mermaid
flowchart TD
    A[User Types with Placeholders] --> B[Data Stored with {{user}}/{{char}}]
    B --> C[User Submits Data]
    C --> D[API Call Triggered]
    D --> E[Process Data Before Sending]
    E --> F[Get Current User/Character Names]
    F --> G[Replace {{user}} with UserName]
    G --> H[Replace {{char}} with CharName]
    H --> I[Send Processed Data to API]
    I --> J[API Receives Real Names]
    
    subgraph "Processing Layers"
        K[Data Processor Utility]
        L[API Service Layer]
        M[Store State Access]
    end
    
    K --> L
    L --> M
```