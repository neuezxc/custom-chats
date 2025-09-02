/**
 * Emotion Mapping Utilities for Gallery Component
 * These functions handle emotion detection and image mapping for the emotion mode feature.
 */

/**
 * Extract emotion from image URL or filename
 * @param {string} url - The image URL or path
 * @returns {string|null} - The detected emotion or null if not found
 */
export function extractEmotion(url) {
  if (!url || typeof url !== 'string') return null;
  
  try {
    const filename = url.split("/").pop().toLowerCase();
    const match = filename.match(/([a-zA-Z0-9]+)(?=\.[a-z]+$)/);
    if (!match) return null;

    // Assume emotion is the last part after '-' if present
    const parts = match[1].split("-");
    return parts[parts.length - 1];
  } catch (error) {
    console.warn('Error extracting emotion from URL:', url, error);
    return null;
  }
}

/**
 * Get all available emotions from a list of images
 * @param {Array} images - Array of image objects with previewUrl property
 * @returns {Array} - Array of unique emotion strings
 */
export function getAvailableEmotions(images) {
  if (!Array.isArray(images)) return [];
  
  try {
    return images
      .map(image => extractEmotion(image.previewUrl))
      .filter(Boolean) // Remove null/undefined values
      .filter((emotion, index, arr) => arr.indexOf(emotion) === index); // Remove duplicates
  } catch (error) {
    console.warn('Error getting available emotions:', error);
    return [];
  }
}

/**
 * Map emotion to appropriate image URL
 * @param {string} emotion - The emotion to find an image for
 * @param {Array} images - Array of image objects
 * @returns {string|null} - The matching image URL or fallback
 */
export function mapEmotionToImage(emotion, images) {
  if (!emotion || !Array.isArray(images) || images.length === 0) {
    return null;
  }
  
  try {
    const targetEmotion = emotion.toLowerCase().trim();
    
    // Emotion mapping for common variations
    const emotionMappings = {
      'anger': 'angry',
      'rage': 'angry', 
      'fury': 'angry',
      'mad': 'angry',
      'sadness': 'sad',
      'sorrow': 'sad',
      'grief': 'sad',
      'happiness': 'happy',
      'joy': 'happy',
      'delight': 'happy',
      'excitement': 'excited',
      'enthusiasm': 'excited',
      'surprise': 'surprised',
      'shock': 'surprised',
      'confusion': 'confused',
      'puzzled': 'confused'
    };
    
    // Check if we need to map the emotion to a different form
    const mappedEmotion = emotionMappings[targetEmotion] || targetEmotion;
    
 
    
    // First, try to find exact match with mapped emotion
    const matchingImage = images.find(image => 
      extractEmotion(image.previewUrl) === mappedEmotion
    );
    
    if (matchingImage) {
 
      return matchingImage.previewUrl;
    }
    
    // If no match with mapped emotion, try original emotion
    if (mappedEmotion !== targetEmotion) {
      const originalMatch = images.find(image => 
        extractEmotion(image.previewUrl) === targetEmotion
      );
      
      if (originalMatch) {
 
        return originalMatch.previewUrl;
      }
    }
    
    // Fallback to neutral
    const neutralImage = images.find(image => 
      extractEmotion(image.previewUrl) === 'neutral'
    );
    
    if (neutralImage) {
 
      return neutralImage.previewUrl;
    }
    
    // Last resort: return first available image
 
    return images[0]?.previewUrl || null;
  } catch (error) {
    console.warn('Error mapping emotion to image:', emotion, error);
    return images[0]?.previewUrl || null;
  }
}

/**
 * Detect emotion tag from LLM response text
 * @param {string} llmResponse - The LLM response text
 * @returns {string|null} - The detected emotion or null
 */
export function detectEmotionFromResponse(llmResponse) {
  if (!llmResponse || typeof llmResponse !== 'string') return null;
  
  try {
    // Look for <Emotion="emotion_name"> pattern
    const emotionMatch = llmResponse.match(/<Emotion="(.*?)">/i);
    if (emotionMatch && emotionMatch[1]) {
      return emotionMatch[1].toLowerCase().trim();
    }
    
    return null;
  } catch (error) {
    console.warn('Error detecting emotion from response:', error);
    return null;
  }
}

/**
 * Remove emotion tags from text for display
 * @param {string} text - Text containing emotion tags
 * @returns {string} - Text with emotion tags removed
 */
export function removeEmotionTags(text) {
  if (!text || typeof text !== 'string') return text;
  
  try {
    return text.replace(/<Emotion=".*?">/gi, '').trim();
  } catch (error) {
    console.warn('Error removing emotion tags:', error);
    return text;
  }
}

/**
 * Validate if emotion exists in available emotions list
 * @param {string} emotion - The emotion to validate
 * @param {Array} availableEmotions - List of available emotions
 * @returns {boolean} - Whether the emotion is available
 */
export function validateEmotion(emotion, availableEmotions) {
  if (!emotion || !Array.isArray(availableEmotions)) return false;
  
  return availableEmotions.includes(emotion.toLowerCase().trim());
}

/**
 * Get the best fallback emotion from available emotions
 * @param {Array} availableEmotions - List of available emotions
 * @returns {string|null} - The best fallback emotion
 */
export function getFallbackEmotion(availableEmotions) {
  if (!Array.isArray(availableEmotions) || availableEmotions.length === 0) {
    return null;
  }
  
  // Prioritize neutral, then happy, then first available
  const fallbackPriority = ['neutral', 'happy', 'normal', 'default'];
  
  for (const fallback of fallbackPriority) {
    if (availableEmotions.includes(fallback)) {
      return fallback;
    }
  }
  
  // Return first available emotion
  return availableEmotions[0];
}