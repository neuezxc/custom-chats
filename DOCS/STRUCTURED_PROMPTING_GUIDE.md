# AI Roleplay Prompting Guide

This document outlines a structured approach for creating dynamic and context-aware prompts for AI roleplaying. It utilizes placeholders, a structured XML system prompt, and a dynamic lorebook system to manage information.

## 1. Core Components

### Placeholders
Placeholders are dynamic variables that are automatically replaced with specific names or information during prompt construction.

-   `` `{{char}}` ``: Represents the name of the AI character.
-   `` `{{user}}` ``: Represents the name of the user.

**Usage:** These placeholders can be used within:
-   The character description.
-   The user description.
-   The `description/text` field of a Lorebook entry.

### Prompt Types
The final context sent to the AI is assembled from several distinct pieces of information:
-   **System Prompt:** The main instruction set, formatted in XML, which contains all other components.
-   **Character Description:** Detailed information about the AI character's personality, appearance, and background.
-   **User Description:** Information about the user's character.
-   **Lorebook:** A collection of contextual information that is dynamically inserted into the prompt when triggered.

---

## 2. System Prompt Structure

To ensure the AI can reliably parse different types of information, the system prompt uses a strict XML format.

### Formatting Rules
-   **Use XML:** All contextual information should be enclosed in XML tags.
-   **Use Short Tags:** Prefer concise tag names (e.g., `<rp>` instead of `<roleplay>`) to save space.
-   **Role:** This prompt should be designated for the `system` role.

### XML Schema
Here is the recommended structure for the system prompt:

```xml
<RP>
  <!-- General, high-level instructions for the AI's behavior and personality -->
  <SysP>
    You are an expert roleplayer. Stay in character. Describe actions and emotions in detail.
  </SysP>

  <!-- Container for all informational context about the roleplay -->
  <RP_Info>
    <!-- The character's core description -->
    <CharD>
      {{char}} is a stoic knight with a hidden scar over his left eye...
    </CharD>

    <!-- The user's description -->
    <UserD>
      {{user}} is a cunning rogue searching for a lost artifact...
    </UserD>

    <!-- Dynamic section for triggered lorebook entries -->
    <Lore></Lore>
  </RP_Info>

  <!-- Specific instructions for the current turn or scene -->
  <RP_Instruct>
    Focus on the mysterious atmosphere of the tavern.
  </RP_Instruct>
</RP>
```

---

## 3. The Lorebook System

The Lorebook provides dynamic, context-sensitive information to the AI. Instead of including all world knowledge in every prompt, lore is only injected when relevant keywords appear in the user's input.

### Lorebook Entry Fields

| Field               | Description                                                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **`name`**          | A unique identifier for the lore entry (e.g., "Whispering Tavern").                                                                      |
| **`triggers`**      | A comma-separated list of keywords. If any of these words appear in the user's input, this entry will be activated.                       |
| **`description/text`**| The information to be injected into the `<Lore>` tag of the system prompt. **This field supports placeholders** like `{{char}}` and `{{user}}`. |
| **`isActive`**      | (Optional) A boolean flag (`true`/`false`) to manually enable or disable the entry, regardless of triggers.                               |

### How Lore is Used
The content from triggered lore entries is placed **inside the `<Lore>` tags** within the system prompt. The system dynamically updates this section based on user input and trigger words before sending the full prompt to the AI.

---

## 4. Putting It All Together: A Workflow Example

Let's see how these components work together in a practical scenario.

**1. Initial Setup:**
-   `{{char}}` is "Kaelen".
-   `{{user}}` is "Alex".
-   A Lorebook entry exists:
    -   **name:** `Whispering Tavern Location`
    -   **triggers:** `tavern, inn, bar`
    -   **description/text:** `The Whispering Tavern is a dimly lit, smoky establishment known for its secretive patrons. The bartender, a grizzled man named Elias, is always cleaning a glass. He doesn't trust {{user}} yet.`

**2. User Input:**
The user writes: "Kaelen and I enter the noisy **tavern** to get out of the rain."

**3. Dynamic Prompt Assembly:**
-   The system detects the trigger word "tavern".
-   It activates the "Whispering Tavern Location" lore entry.
-   It takes the `description/text` from the entry and resolves the `{{user}}` placeholder.
-   The resolved text is inserted into the `<Lore>` section of the system prompt.
