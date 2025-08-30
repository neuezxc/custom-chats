this is all the context i gather is this enough cursor ai to follow?



Let's add new mode in our Gallery Components, which is Emotion mode.


the character recent chat outputs emotion tags like <Emotion="Happy">, and the frontend maps them to images to display it to <Gallery> component and any optional enhancements like avoiding repeated emotions.

Add a new "Emotion" mode to the Gallery component. The character's chat output will include an emotion tag like <Emotion="Happy">. The frontend maps that tag to a matching image URL and displays it in the <Gallery> component.



userupload their images using image link, with emotion tags
example:
https://raw.githubusercontent.com/maczxc/risuai-assets/refs/heads/main/Hayeon/v2/hayeon-anger.jpg
https://raw.githubusercontent.com/maczxc/risuai-assets/refs/heads/main/Hayeon/v2/hayeon-sad.jpg
https://raw.githubusercontent.com/maczxc/risuai-assets/refs/heads/main/Hayeon/v2/hayeon-happy.jpg


We have gallery component:

Gallery.jsx
<div id="gallery-emotion">
     ***image should store here*** this is changing when we detect or find a key. in character/llm current chat <Emotion="Happy">
    <img src="https://raw.githubusercontent.com/maczxc/risuai-assets/refs/heads/main/Hayeon/v2/hayeon-anger.jpg"/>
</div>

userchat -> llm response(recent) in "blablablablabla <Emotion="Happy">"
but don't show <Emotion="Happy"> on the chat window, mag act lang yan as key.





















```mermaid
flowchart TD
    A[User types a message] --> B[Click Send button]
    B --> C[Render user message in chat window]
    C --> D[Send message to assistant / getAssistantResponse()]
    D --> E[Assistant returns text with <Emotion="..."> tag]
    E --> F{Check for <Emotion> tag}
    F -- Yes --> G[Extract emotion from tag]
    G --> H[Map emotion to corresponding image]
    H --> I[Render assistant message + emotion image in the Gallery Component]
    F -- No --> J[Render assistant message only]
    I --> K[Wait for next user input]
    J --> K

```


```
#Prompts (Put it to, System Prompt)
*Also create placeholders, for our custom system prompt. {{Emotion}}

After every reply append exactly one emotion tag at the very end in this format (no other text): <Emotion="Label">
Allowed (case-sensitive): Happy, Sad, Agree, Confused, Angry, Surprised, Neutral, Excited, Thoughtful, Playful, Concerned, Calm, Embarrassed, Curious, Frustrated
Rules:
- Choose the single label that best matches the tone; if unsure use Neutral.
- Avoid repeating the same label used in any of your last 3 assistant messages (accuracy > variety).
- If the user explicitly requests a label, use it exactly.
- Never output images/URLs/HTML/metadata in place of the tag — frontend maps tags to images.
- If refusing for safety, still append an appropriate tag (e.g., Concerned, Neutral).
Placement: tag must be at the very end of the message, separated by one space or a single newline.

```