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
 
  });
}

// Test emotion extraction from URLs
function testEmotionExtraction() {
 
  
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
 
  });
}

// Test available emotions
function testAvailableEmotions() {
 
  
  const availableEmotions = getAvailableEmotions(testImages);
 
 
  
  const expected = ['happy', 'sad', 'angry', 'neutral'];
  const passed = expected.every(emotion => availableEmotions.includes(emotion));
 
}

// Test emotion to image mapping
function testEmotionMapping() {
 
  
  const testEmotions = ['happy', 'sad', 'excited', 'neutral'];
  
  testEmotions.forEach(emotion => {
    const imageUrl = mapEmotionToImage(emotion, testImages);
 
  });
}

// Test emotion tag removal
function testEmotionTagRemoval() {
 
  
  const testTexts = [
    'Hello there! <Emotion="happy"> How are you?',
    'Multiple <Emotion="sad"> tags <Emotion="happy"> in text',
    'No emotion tags here',
    '<Emotion="angry"> At the beginning',
    'At the end <Emotion="neutral">'
  ];
  
  testTexts.forEach((text, index) => {
    const cleaned = removeEmotionTags(text);
 
 
 
  });
}

// Test fallback emotion
function testFallbackEmotion() {
 
  
  const availableEmotions = getAvailableEmotions(testImages);
  const fallback = getFallbackEmotion(availableEmotions);
 
 
}

// Run all tests
export function runEmotionTests() {
 
  
  testEmotionDetection();
  testEmotionExtraction();
  testAvailableEmotions();
  testEmotionMapping();
  testEmotionTagRemoval();
  testFallbackEmotion();
  
 
}

// Example usage scenarios
export function demonstrateEmotionWorkflow() {
 
  
  // Scenario 1: Character receives LLM response with emotion
  const llmResponse = 'I\'m so excited to see you! <Emotion="happy"> Welcome to our conversation!';
  
 
  
  // Extract emotion
  const detectedEmotion = detectEmotionFromResponse(llmResponse);
 
  
  // Get available emotions from character images
  const availableEmotions = getAvailableEmotions(testImages);
 
  
  // Validate emotion
  const isValid = validateEmotion(detectedEmotion, availableEmotions);
 
  
  // Map to image
  const targetEmotion = isValid ? detectedEmotion : getFallbackEmotion(availableEmotions);
  const imageUrl = mapEmotionToImage(targetEmotion, testImages);
 
 
  
  // Clean text for display
  const displayText = removeEmotionTags(llmResponse);
 
  
 
}

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - attach to global object for manual testing
  window.emotionTests = {
    runEmotionTests,
    demonstrateEmotionWorkflow
  };
 
}