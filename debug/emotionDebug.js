/**
 * Debug Script for Emotion Mode Issues
 * This script helps diagnose why images aren't switching in emotion mode
 */

// Add this to browser console to debug emotion mode
function debugEmotionMode() {
  console.log('=== EMOTION MODE DEBUG ===');
  
  // Check if we're in the browser environment
  if (typeof window === 'undefined') {
    console.log('❌ Not in browser environment');
    return;
  }
  
  // Get Zustand store instance
  const store = window.useChatStore?.getState?.() || null;
  if (!store) {
    console.log('❌ Cannot access useChatStore');
    return;
  }
  
  console.log('✅ Store accessible');
  
  // Check current character
  const currentCharacter = store.currentCharacter;
  if (!currentCharacter) {
    console.log('❌ No current character');
    return;
  }
  
  console.log('✅ Current character:', currentCharacter.name);
  console.log('📷 Image gallery mode:', currentCharacter.imageGallery?.mode);
  console.log('🖼️ Number of images:', currentCharacter.imageGallery?.images?.length || 0);
  
  // Check if emotion mode is active
  const isEmotionMode = currentCharacter.imageGallery?.mode === 'emotion';
  console.log('🎭 Emotion mode active:', isEmotionMode);
  
  if (!isEmotionMode) {
    console.log('⚠️ Character is not in emotion mode');
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
  
  console.log('😀 Available emotions:', availableEmotions);
  
  // Check last LLM response
  console.log('💬 Last LLM response:', store.lastLLMResponse);
  
  // Check emotion states
  console.log('🎭 Emotion states:', store.emotionStates);
  
  // Check current character emotion
  const currentEmotion = store.emotionStates?.[currentCharacter.id];
  console.log('😊 Current character emotion:', currentEmotion);
  
  // Try to detect emotion from last response
  if (store.lastLLMResponse) {
    const emotionMatch = store.lastLLMResponse.match(/<Emotion="(.*?)">/i);
    if (emotionMatch) {
      const detectedEmotion = emotionMatch[1].toLowerCase().trim();
      console.log('🔍 Detected emotion from response:', detectedEmotion);
      
      if (availableEmotions.includes(detectedEmotion)) {
        console.log('✅ Emotion is available in images');
      } else {
        console.log('❌ Emotion NOT available in images');
        console.log('💡 Available emotions:', availableEmotions.join(', '));
      }
    } else {
      console.log('❌ No emotion tag found in last response');
    }
  }
  
  // List all images with their detected emotions
  console.log('\n📋 Image Analysis:');
  images.forEach((image, index) => {
    const filename = image.previewUrl?.split("/").pop() || image.filename || 'unknown';
    const emotion = availableEmotions[index] || 'none detected';
    console.log(`  ${index + 1}. ${filename} → ${emotion}`);
  });
  
  console.log('\n=== DEBUG COMPLETE ===');
  
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
  console.log('🔧 Debug function available: window.debugEmotionMode()');
}

export { debugEmotionMode };