/**
 * Test file for emotion mode functionality
 * This file demonstrates and tests the emotion detection and mapping features
 */

import { 
  extractEmotion, 
  getAvailableEmotions, 
  mapEmotionToImage, 
  detectEmotionFromResponse, 
  removeEmotionTags,
  validateEmotion,
  getFallbackEmotion
} from '../app/utils/emotionUtils.js';

// Test data - Sample images with emotion names
const testImages = [
  {
    id: 'img1',
    previewUrl: 'https://example.com/character-happy.jpg',
    filename: 'character-happy.jpg'
  },
  {
    id: 'img2', 
    previewUrl: 'https://example.com/character-sad.jpg',
    filename: 'character-sad.jpg'
  },
  {
    id: 'img3',
    previewUrl: 'https://example.com/character-angry.jpg', 
    filename: 'character-angry.jpg'
  },
  {
    id: 'img4',
    previewUrl: 'https://example.com/character-neutral.jpg',
    filename: 'character-neutral.jpg'
  }
];

// Test emotion detection
function testEmotionDetection() {
  console.log('=== Testing Emotion Detection ===');
  
  const testCases = [
    {
      response: 'Hello there! <Emotion="happy"> How are you doing today?',
      expected: 'happy'
    },
    {
      response: 'I feel quite <Emotion="sad"> about what happened.',
      expected: 'sad'
    },
    {
      response: 'That makes me <Emotion="ANGRY"> when people do that!',
      expected: 'angry'
    },
    {
      response: 'Just a normal conversation without emotions.',
      expected: null
    },
    {
      response: '<Emotion="excited"> This is amazing!',
      expected: 'excited'
    }
  ];
  
  testCases.forEach((testCase, index) => {
    const result = detectEmotionFromResponse(testCase.response);
    const passed = result === testCase.expected;
    console.log(`Test ${index + 1}: ${passed ? '✓' : '✗'} Expected: "${testCase.expected}", Got: "${result}"`);
  });
}

// Test emotion extraction from URLs
function testEmotionExtraction() {
  console.log('\n=== Testing Emotion Extraction ===');
  
  const testUrls = [
    'https://example.com/character-happy.jpg',
    'https://example.com/user-sad.png',
    'character-angry.gif',
    'simple-neutral.webp',
    'invalid-file-without-emotion.jpg',
    'not-an-image'
  ];
  
  testUrls.forEach((url, index) => {
    const emotion = extractEmotion(url);
    console.log(`URL ${index + 1}: "${url}" → Emotion: "${emotion}"`);
  });
}

// Test available emotions
function testAvailableEmotions() {
  console.log('\n=== Testing Available Emotions ===');
  
  const availableEmotions = getAvailableEmotions(testImages);
  console.log('Available emotions:', availableEmotions);
  console.log('Expected: ["happy", "sad", "angry", "neutral"]');
  
  const expected = ['happy', 'sad', 'angry', 'neutral'];
  const passed = expected.every(emotion => availableEmotions.includes(emotion));
  console.log(`Test passed: ${passed ? '✓' : '✗'}`);
}

// Test emotion to image mapping
function testEmotionMapping() {
  console.log('\n=== Testing Emotion to Image Mapping ===');
  
  const testEmotions = ['happy', 'sad', 'excited', 'neutral'];
  
  testEmotions.forEach(emotion => {
    const imageUrl = mapEmotionToImage(emotion, testImages);
    console.log(`Emotion "${emotion}" → Image: "${imageUrl}"`);
  });
}

// Test emotion tag removal
function testEmotionTagRemoval() {
  console.log('\n=== Testing Emotion Tag Removal ===');
  
  const testTexts = [
    'Hello there! <Emotion="happy"> How are you?',
    'Multiple <Emotion="sad"> tags <Emotion="happy"> in text',
    'No emotion tags here',
    '<Emotion="angry"> At the beginning',
    'At the end <Emotion="neutral">'
  ];
  
  testTexts.forEach((text, index) => {
    const cleaned = removeEmotionTags(text);
    console.log(`Test ${index + 1}:`);
    console.log(`  Original: "${text}"`);
    console.log(`  Cleaned:  "${cleaned}"`);
  });
}

// Test fallback emotion
function testFallbackEmotion() {
  console.log('\n=== Testing Fallback Emotion ===');
  
  const availableEmotions = getAvailableEmotions(testImages);
  const fallback = getFallbackEmotion(availableEmotions);
  console.log(`Fallback emotion: "${fallback}"`);
  console.log('Should prefer: neutral > happy > normal > default > first available');
}

// Run all tests
export function runEmotionTests() {
  console.log('🧪 Running Emotion Mode Tests...\n');
  
  testEmotionDetection();
  testEmotionExtraction();
  testAvailableEmotions();
  testEmotionMapping();
  testEmotionTagRemoval();
  testFallbackEmotion();
  
  console.log('\n✅ Emotion tests completed!');
}

// Example usage scenarios
export function demonstrateEmotionWorkflow() {
  console.log('\n🎭 Demonstrating Emotion Mode Workflow...\n');
  
  // Scenario 1: Character receives LLM response with emotion
  const llmResponse = 'I\'m so excited to see you! <Emotion="happy"> Welcome to our conversation!';
  
  console.log('1. LLM Response received:', llmResponse);
  
  // Extract emotion
  const detectedEmotion = detectEmotionFromResponse(llmResponse);
  console.log('2. Detected emotion:', detectedEmotion);
  
  // Get available emotions from character images
  const availableEmotions = getAvailableEmotions(testImages);
  console.log('3. Available emotions:', availableEmotions);
  
  // Validate emotion
  const isValid = validateEmotion(detectedEmotion, availableEmotions);
  console.log('4. Emotion is valid:', isValid);
  
  // Map to image
  const targetEmotion = isValid ? detectedEmotion : getFallbackEmotion(availableEmotions);
  const imageUrl = mapEmotionToImage(targetEmotion, testImages);
  console.log('5. Target emotion:', targetEmotion);
  console.log('6. Mapped image URL:', imageUrl);
  
  // Clean text for display
  const displayText = removeEmotionTags(llmResponse);
  console.log('7. Display text:', displayText);
  
  console.log('\n🎉 Workflow completed successfully!');
}

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - attach to global object for manual testing
  window.emotionTests = {
    runEmotionTests,
    demonstrateEmotionWorkflow
  };
  console.log('Emotion tests available: window.emotionTests.runEmotionTests()');
}