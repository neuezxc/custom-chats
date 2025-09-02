/**
 * System Prompt Emotion Integration Test
 * This demonstrates how the enhanced system prompt includes actual available emotions
 */

// Mock character data with emotion mode images
const mockCharacterWithEmotions = {
  id: 'test-char',
  name: 'Aria',
  description: 'A mysterious sorceress with magical abilities.',
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

// Mock user data
const mockUser = {
  name: 'User',
  description: 'A curious person exploring conversations with AI characters.'
};

// Simulate the buildSystemPrompt function logic
function demonstrateSystemPromptWithEmotions(character, triggeredLore = [], customSettings = null) {
 
  
  // Use custom system prompt if enabled
  if (customSettings?.enabled && customSettings?.content) {
    let customPrompt = customSettings.content;
    
    customPrompt = customPrompt.replace(/\{\{char\}\}/g, character.name);
    customPrompt = customPrompt.replace(/\{\{char_description\}\}/g, character.description);
    customPrompt = customPrompt.replace(/\{\{user\}\}/g, mockUser.name || 'User');
    customPrompt = customPrompt.replace(/\{\{user_description\}\}/g, mockUser.description || 'A curious person exploring conversations with AI characters.');
    
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

// Test 1: Default system prompt with emotions
 
const defaultPrompt = demonstrateSystemPromptWithEmotions(mockCharacterWithEmotions);
 
 

// Test 2: Custom system prompt with emotions
 
const customSettings = {
  enabled: true,
  content: `You are {{char}}, a powerful sorceress. {{char_description}}

Respond in character with detailed magical descriptions and stay true to your mystical personality.

Always describe your actions and magical abilities in detail.`
};

const customPrompt = demonstrateSystemPromptWithEmotions(mockCharacterWithEmotions, [], customSettings);
 
 

// Test 3: Character without emotion mode
 
const regularCharacter = {
  ...mockCharacterWithEmotions,
  imageGallery: {
    mode: 'default',
    images: [{ id: 'img1', previewUrl: 'character.jpg' }]
  }
};

const regularPrompt = demonstrateSystemPromptWithEmotions(regularCharacter);
 
 

// Test 4: Available emotions extraction
 
const availableEmotions = mockCharacterWithEmotions.imageGallery.images
  .map(image => {
    const filename = image.previewUrl.split("/").pop().toLowerCase();
    const match = filename.match(/([a-zA-Z0-9]+)(?=\.[a-z]+$)/);
    if (!match) return null;
    const parts = match[1].split("-");
    return parts[parts.length - 1];
  })
  .filter(Boolean)
  .filter((emotion, index, arr) => arr.indexOf(emotion) === index);

 
 

 
 
 
 
 
 

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.systemPromptTest = {
    demonstrateSystemPromptWithEmotions,
    mockCharacterWithEmotions,
    customSettings
  };
 
}