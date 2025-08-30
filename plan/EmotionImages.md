

Reference.
```
import { useEffect, useState } from "react";

// Example user-provided images (replace with any URLs)
const userImages = [
  "https://raw.githubusercontent.com/maczxc/risuai-assets/refs/heads/main/Hayeon/v2/hayeon-anger.jpg",
  "https://raw.githubusercontent.com/maczxc/risuai-assets/refs/heads/main/Hayeon/v2/hayeon-sad.jpg",
  "https://raw.githubusercontent.com/maczxc/risuai-assets/refs/heads/main/Hayeon/v2/hayeon-happy.jpg",
  "https://raw.githubusercontent.com/maczxc/risuai-assets/refs/heads/main/Hayeon/v2/hayeon-neutral.jpg",
];

// Function to extract emotion from URL (based on filename)
function extractEmotion(url) {
  const filename = url.split("/").pop().toLowerCase(); // get file name
  const match = filename.match(/([a-zA-Z0-9]+)(?=\.[a-z]+$)/); // get name before extension
  if (!match) return null;

  // We assume emotion is the last part after '-' if present
  const parts = match[1].split("-");
  return parts[parts.length - 1]; 
}

// Dynamically derive available emotions from userImages
const availableEmotions = userImages
  .map((url) => extractEmotion(url))
  .filter(Boolean);

export default function Gallery({ llmResponse }) {
  // Start with neutral if available, otherwise first image
  const neutralImage = userImages.find(
    (url) => extractEmotion(url) === "neutral"
  );
  const [currentImage, setCurrentImage] = useState(neutralImage || userImages[0]);

  useEffect(() => {
    if (!llmResponse) return;

    // Detect <Emotion="..."> in the LLM response
    const match = llmResponse.match(/<Emotion="(.*?)">/);
    if (match) {
      let emotion = match[1].toLowerCase();

      // Fallback to neutral if emotion not available
      if (!availableEmotions.includes(emotion)) {
        emotion = neutralImage ? "neutral" : null;
      }

      // Find the image URL that contains the emotion
      const image = userImages.find((url) => extractEmotion(url) === emotion);

      if (image) setCurrentImage(image);
    }
    // If no emotion detected, keep currentImage as-is
  }, [llmResponse, neutralImage]);

  return (
    <div id="gallery-emotion">
      <img
        src={currentImage}
        alt="Character emotion"
        style={{ width: "200px", height: "200px" }}
      />
    </div>
  );
}

```
Prompt/SystemPrompt

```
You must always indicate the character's emotion in the conversation using a command at the end of the message. The command must be selected from the available list of emotions ({availableEmotion}) and should reflect the character's current feeling. Use the format exactly as: <Emotion="emotion_name">. Only use emotions that exist in the list. If none of the available emotions match, use <Emotion="neutral">. Do not display the <Emotion="..."> tag to the user; it is only for updating the character's gallery.
```



```mermaid
flowchart TD
    A[Start] --> B{LLM response received?}
    B -- No --> C[Keep current image]
    B -- Yes --> D[Extract <Emotion="..."> tag from llmResponse]
    D --> E{Emotion found in tag?}
    E -- No --> C
    E -- Yes --> F[Convert emotion to lowercase]
    F --> G{Emotion available in userImages?}
    G -- No --> H[Use "neutral" if available, otherwise keep current image]
    G -- Yes --> I[Find image URL matching emotion]
    I --> J[Update currentImage state with found URL]
    H --> J
    J --> K[Render <img> with currentImage]
    K --> L[End]
```