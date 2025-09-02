# Lore Entry Autofill Feature Plan

This document outlines the plan for implementing an "Autofill" feature for the Lorebook entry creation process, leveraging an LLM (like Qwen via OpenRouter) to reduce user friction.

## 1. Objective

Provide a one-click solution for users to automatically populate the "Entry Name", "Trigger Words", and "Description" fields when adding a new lore entry, based on the context of the current chat.

## 2. Feature Flow

```mermaid
graph TD
    A[User clicks 'Add Entry'] --> B[Display Add Entry Form]
    B --> C[User sees empty form fields]
    C --> D[User clicks 'Autofill' button]
    D --> E[Trigger Autofill Action/Server Function]
    E --> F[Retrieve Chat Context]
    F --> G[Construct LLM Prompt with Context]
    G --> H[Call LLM (e.g., OpenRouter/Qwen)]
    H --> I{LLM Response OK?}
    I -->|Yes| J[Parse LLM JSON Response]
    I -->|No/Error| K[Handle Error/Fallback]
    J --> L[Update Form State with LLM Data]
    K --> L
    L --> M[Form Fields Populate with Suggestions]
    M --> N[User Reviews/Edit Suggestions]
    N --> O[User Clicks 'Save Entry']
    O --> P[Save New Lore Entry]
```

## 3. Detailed Implementation Steps

### 3.1. UI Integration
- Add an "Autofill" button to the "Add Lore Entry" form modal/dialog.
- Position it prominently, e.g., next to the "Save" button.

### 3.2. Context Retrieval
- Determine the scope of chat history to send. This could be:
  - The last N messages.
  - A specific segment if the "Add Entry" action is context-aware (e.g., initiated from a message menu).
- Ensure the context is accessible to the autofill logic (likely a Server Action).

### 3.3. LLM Interaction Logic (Server Action)
- Create a new Server Action (e.g., `autofillLoreEntry`) in the appropriate location (e.g., `app/actions/loreActions.js`).
- This action will:
  a. Receive the chat context.
  b. Construct a prompt for the LLM, instructing it to generate a lore entry in a specific JSON format based on the context.
     **Example Prompt Template:**
     ```
     Based on the following chat conversation, please generate a new lorebook entry that would be relevant and useful to remember.

     Conversation:
     [Insert Chat Context Here]

     Please provide the following in strict JSON format, without any markdown code blocks:
     {
       "entryName": "A concise, descriptive name for the lore entry (e.g., 'The Whispering Woods', 'Captain Ironbeard')",
       "triggerWords": "A comma-separated list of 2-5 key words or short phrases that should trigger this lore entry (e.g., 'whispering woods, haunted forest', 'Ironbeard, Captain')",
       "description": "A clear and informative description of the lore item, ideally 2-4 sentences (e.g., 'A dense forest known for its eerie whispers and strange lights. Locals believe it's haunted by the spirits of lost travelers.')"
     }
     ```
  c. Make an API call to the LLM endpoint (OpenRouter) using the constructed prompt.
  d. Handle the LLM's response:
     - On success: Parse the JSON response. Validate the presence of `entryName`, `triggerWords`, and `description`. Return this data.
     - On failure/error: Return a standardized error object or a fallback set of default values.

### 3.4. Frontend Integration
- In the component managing the "Add Entry" form:
  - Add a state variable (e.g., `isAutofilling`) to manage loading state for the button.
  - Implement an `onClick` handler for the "Autofill" button.
  - This handler will call the `autofillLoreEntry` Server Action.
  - Upon receiving a successful response, update the local state variables for `entryName`, `triggerWords`, and `description` with the LLM-provided data.
  - Handle errors gracefully, perhaps showing a message to the user if autofill fails.

### 3.5. User Workflow
1. User navigates to add a new lore entry.
2. The "Add Entry" form is displayed.
3. User clicks the "Autofill" button.
4. The form fields are populated with AI-generated suggestions.
5. User reviews and edits the suggestions as needed.
6. User saves the entry.

## 4. Considerations
- **Security:** The Server Action should handle API keys securely (e.g., environment variables).

- **Cost/Efficiency:** Consider the cost of LLM calls. Caching or limiting autofill frequency might be relevant in the future.
- **Error Handling:** Robust error handling for network issues, LLM failures, or malformed responses is crucial for a good user experience.
- **Fallback:** Provide a simple fallback mechanism if the LLM fails (e.g., populate fields with generic placeholder text).