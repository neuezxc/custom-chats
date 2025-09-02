/**
 * Debug Script to Test System Prompt Generation
 * This helps verify that the AI is receiving proper emotion instructions
 */

// Simulate character data for testing
const testCharacterWithEmotions = {
  id: 'test-char',
  name: 'Aria',
  description: 'A mysterious and powerful sorceress from the enchanted realm of Ethereal.',
  exampleDialogue: 'User: What kind of magic do you practice?\nAria: *gestures gracefully* I weave the very fabric of reality itself.',
  imageGallery: {
    mode: 'emotion',
    images: [
      { 
        id: 'img1', 
        previewUrl: 'https://example.com/aria-happy.jpg',
        filename: 'aria-happy.jpg'
      },
      { 
        id: 'img2', 
        previewUrl: 'https://example.com/aria-sad.jpg',
        filename: 'aria-sad.jpg'
      },
      { 
        id: 'img3', 
        previewUrl: 'https://example.com/aria-angry.jpg',
        filename: 'aria-angry.jpg'
      },
      { 
        id: 'img4', 
        previewUrl: 'https://example.com/aria-neutral.jpg',
        filename: 'aria-neutral.jpg'
      },
      { 
        id: 'img5', 
        previewUrl: 'https://example.com/aria-excited.jpg',
        filename: 'aria-excited.jpg'
      }
    ]
  }
};

const testCharacterWithoutEmotions = {
  id: 'test-char-2',
  name: 'Alex',
  description: 'A helpful coding assistant.',
  imageGallery: {
    mode: 'default',
    images: [
      { 
        id: 'img1', 
        previewUrl: 'https://example.com/alex-default.jpg',
        filename: 'alex-default.jpg'
      }
    ]
  }
};

// Replicate the buildSystemPrompt logic for testing
function testBuildSystemPrompt(character, triggeredLore = [], customSettings = null) {
  const currentUser = { name: 'User', description: 'A curious person exploring conversations with AI characters.' };
  
  // Use custom system prompt if enabled
  if (customSettings?.enabled && customSettings?.content) {
    let customPrompt = customSettings.content;
    
    customPrompt = customPrompt.replace(/\{\{char\}\}/g, character.name);
    customPrompt = customPrompt.replace(/\{\{char_description\}\}/g, character.description);
    customPrompt = customPrompt.replace(/\{\{user\}\}/g, currentUser.name || 'User');
    customPrompt = customPrompt.replace(/\{\{user_description\}\}/g, currentUser.description || 'A curious person exploring conversations with AI characters.');
    
    // Add emotion instructions if character uses emotion mode
    if (character.imageGallery?.mode === 'emotion' && character.imageGallery?.images?.length > 0) {
      const availableEmotions = character.imageGallery.images
        .map(image => {
          if (!image.previewUrl) return null;
          const filename = image.previewUrl.split("/").pop().toLowerCase();
          const match = filename.match(/([a-zA-Z0-9]+)(?=\.[a-z]+$)/);
          if (!match) return null;
          const parts = match[1].split("-");
          return parts[parts.length - 1];
        })
        .filter(Boolean)
        .filter((emotion, index, arr) => arr.indexOf(emotion) === index);
      
      if (availableEmotions.length > 0) {
        const emotionInstructions = `\n\nEMOTION INSTRUCTIONS: You must always indicate your current emotion at the end of each message using the format <Emotion="emotion_name">. Choose from these available emotions: ${availableEmotions.join(', ')}. If none of these emotions match your current feeling, use <Emotion="neutral">. The emotion tag will be used to update your visual appearance and should not be displayed to the user.`;
        customPrompt += emotionInstructions;
      }
    }
    
    return customPrompt;
  }
  
  // Default character-based system prompt
  let systemPrompt = `You are ${character.name}. ${character.description}`;
  
  // Add example dialogue if available
  if (character.exampleDialogue) {
    systemPrompt += `\n\nExample dialogue: ${character.exampleDialogue}`;
  }
  
  // Add emotion instructions if character uses emotion mode
  if (character.imageGallery?.mode === 'emotion' && character.imageGallery?.images?.length > 0) {
    const availableEmotions = character.imageGallery.images
      .map(image => {
        if (!image.previewUrl) return null;
        const filename = image.previewUrl.split("/").pop().toLowerCase();
        const match = filename.match(/([a-zA-Z0-9]+)(?=\.[a-z]+$)/);
        if (!match) return null;
        const parts = match[1].split("-");
        return parts[parts.length - 1];
      })
      .filter(Boolean)
      .filter((emotion, index, arr) => arr.indexOf(emotion) === index);
    
    if (availableEmotions.length > 0) {
      const emotionInstructions = `\n\nEMOTION INSTRUCTIONS: You must always indicate your current emotion at the end of each message using the format <Emotion="emotion_name">. Choose from these available emotions: ${availableEmotions.join(', ')}. If none of these emotions match your current feeling, use <Emotion="neutral">. The emotion tag will be used to update your visual appearance and should not be displayed to the user.`;
      systemPrompt += emotionInstructions;
    }
  }
  
  return systemPrompt;
}

// Test function
function runSystemPromptTests() {
 
  
  // Test 1: Character with emotion mode
 
 
  const emotionPrompt = testBuildSystemPrompt(testCharacterWithEmotions);
 
 
  
  // Test 2: Character without emotion mode
 
 
  const normalPrompt = testBuildSystemPrompt(testCharacterWithoutEmotions);
 
 
  
  // Test 3: Custom system prompt with emotions
 
 
  const customSettings = {
    enabled: true,
    content: `You are {{char}}, a mystical being. {{char_description}}\n\nRespond with magical flair and deep wisdom.`
  };
  const customPrompt = testBuildSystemPrompt(testCharacterWithEmotions, [], customSettings);
 
 
  
  // Test 4: Extract and display available emotions
 
 
  const availableEmotions = testCharacterWithEmotions.imageGallery.images
    .map(image => {
      const filename = image.previewUrl.split("/").pop().toLowerCase();
      const match = filename.match(/([a-zA-Z0-9]+)(?=\.[a-z]+$)/);
      if (!match) return null;
      const parts = match[1].split("-");
      return parts[parts.length - 1];
    })
    .filter(Boolean)
    .filter((emotion, index, arr) => arr.indexOf(emotion) === index);
  
 
 
  
 
 
 
 
 
  
  return {
    emotionPrompt,
    normalPrompt,
    customPrompt,
    availableEmotions
  };
}

// Browser environment setup
if (typeof window !== 'undefined') {
  window.runSystemPromptTests = runSystemPromptTests;
  window.testCharacters = {
    withEmotions: testCharacterWithEmotions,
    withoutEmotions: testCharacterWithoutEmotions
  };
 
 
 
}

// Auto-run if in Node.js environment
if (typeof module !== 'undefined') {
  module.exports = {
    runSystemPromptTests,
    testBuildSystemPrompt,
    testCharacterWithEmotions,
    testCharacterWithoutEmotions
  };
}