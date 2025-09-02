/**
 * Debug Script for Emotion Mode Issues
 * This script helps diagnose why images aren't switching in emotion mode
 */

// Add this to browser console to debug emotion mode
function debugEmotionMode() {
 
  
  // Check if we're in the browser environment
  if (typeof window === 'undefined') {
 
    return;
  }
  
  // Get Zustand store instance
  const store = window.useChatStore?.getState?.() || null;
  if (!store) {
 
    return;
  }
  
 
  
  // Check current character
  const currentCharacter = store.currentCharacter;
  if (!currentCharacter) {
 
    return;
  }
  
 
 
 
  
  // Check if emotion mode is active
  const isEmotionMode = currentCharacter.imageGallery?.mode === 'emotion';
 
  
  if (!isEmotionMode) {
 
    return;
  }
  
  // Check available emotions
  const images = currentCharacter.imageGallery?.images || [];
  const availableEmotions = images
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
  
 
  
  // Check last LLM response
 
  
  // Check emotion states
 
  
  // Check current character emotion
  const currentEmotion = store.emotionStates?.[currentCharacter.id];
 
  
  // Try to detect emotion from last response
  if (store.lastLLMResponse) {
    const emotionMatch = store.lastLLMResponse.match(/<Emotion="(.*?)">/i);
    if (emotionMatch) {
      const detectedEmotion = emotionMatch[1].toLowerCase().trim();
 
      
      if (availableEmotions.includes(detectedEmotion)) {
 
      } else {
 
 
      }
    } else {
 
    }
  }
  
  // List all images with their detected emotions
 
  images.forEach((image, index) => {
    const filename = image.previewUrl?.split("/").pop() || image.filename || 'unknown';
    const emotion = availableEmotions[index] || 'none detected';
 
  });
  
 
  
  return {
    isEmotionMode,
    availableEmotions,
    currentEmotion,
    lastResponse: store.lastLLMResponse,
    images: images.length
  };
}

// Auto-attach to window for easy access
if (typeof window !== 'undefined') {
  window.debugEmotionMode = debugEmotionMode;
 
}

export { debugEmotionMode };