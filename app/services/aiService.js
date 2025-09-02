import { GoogleGenerativeAI } from '@google/generative-ai';

// Import buildSystemPrompt function from store
function buildSystemPrompt(character, triggeredLore = [], customSettings = null) {  
  
  // Use custom system prompt if enabled
  if (customSettings?.enabled && customSettings?.content) {
    let customPrompt = customSettings.content;
    
    customPrompt = customPrompt.replace(/\{\{char\}\}/g, character.name);
    customPrompt = customPrompt.replace(/\{\{char_description\}\}/g, character.description);
    customPrompt = customPrompt.replace(/\{\{user\}\}/g, currentUser.name || 'User');
    customPrompt = customPrompt.replace(/\{\{user_description\}\}/g, currentUser.description || 'A curious person exploring conversations with AI characters.');
    
    // Process {{lore}} placeholder with formatted triggered lore
    const loreContent = formatTriggeredLore(triggeredLore, character, currentUser);
    customPrompt = customPrompt.replace(/\{\{lore\}\}/g, loreContent);
    
    // Process {{emotions}} placeholder with emotion instructions
    let emotionContent = '';
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
        emotionContent = `EMOTION INSTRUCTIONS: You must always indicate your current emotion at the end of each message using the format <Emotion="emotion_name">. Choose from these available emotions: ${availableEmotions.join(', ')}. If none of these emotions match your current feeling, use <Emotion="neutral">. The emotion tag will be used to update your visual appearance and should not be displayed to the user.`;

      }
    }
    customPrompt = customPrompt.replace(/\{\{emotions\}\}/g, emotionContent);
    
    // Auto-add emotion instructions if not using placeholder but character has emotion mode
    if (!customSettings.content.includes('{{emotions}}') && character.imageGallery?.mode === 'emotion' && character.imageGallery?.images?.length > 0) {
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
        const emotionInstructions = `  EMOTION INSTRUCTIONS: You must always indicate your current emotion at the end of each message using the format <Emotion="emotion_name">. Choose from these available emotions: ${availableEmotions.join(', ')}. If none of these emotions match your current feeling, use <Emotion="neutral">. The emotion tag will be used to update your visual appearance and should not be displayed to the user.`;
        customPrompt += emotionInstructions;
      }
    }
    
 
    return customPrompt;
  }
  
  // Default character-based system prompt
  let systemPrompt = `You are ${character.name}. ${character.description}`;
  
  // Add example dialogue if available
  if (character.exampleDialogue) {
    systemPrompt += `  Example dialogue: ${character.exampleDialogue}`;
  }
  
  // Add triggered lorebook entries
  if (triggeredLore.length > 0) {
    systemPrompt += '  Relevant Context:';
    triggeredLore.forEach(entry => {
      let description = entry.description;
      // Replace placeholders
      description = description.replace(/\{\{char\}\}/g, character.name);
      description = description.replace(/\{\{char_description\}\}/g, character.description);
      description = description.replace(/\{\{user\}\}/g, currentUser.name || 'User');
      description = description.replace(/\{\{user_description\}\}/g, currentUser.description || 'A curious person exploring conversations with AI characters.');
      systemPrompt += ` - ${entry.name}: ${description}`;
    });
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
      const emotionInstructions = `  EMOTION INSTRUCTIONS: You must always indicate your current emotion at the end of each message using the format <Emotion="emotion_name">. Choose from these available emotions: ${availableEmotions.join(', ')}. If none of these emotions match your current feeling, use <Emotion="neutral">. The emotion tag will be used to update your visual appearance and should not be displayed to the user.`;
      systemPrompt += emotionInstructions;
    }
  }
  
 
  return systemPrompt;
}

class AIService {
  constructor() {
    // Fallback to environment variables if no user keys provided
    this.fallbackOpenRouterKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    this.fallbackGeminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  }

  getGeminiClient(apiKey) {
    const key = apiKey || this.fallbackGeminiKey;
    if (!key || key === 'your_gemini_api_key_here') return null;

    return new GoogleGenerativeAI(key);
  }

  getOpenRouterKey(apiKey) {
    const key = apiKey || this.fallbackOpenRouterKey;
    if (!key || key === 'your_openrouter_api_key_here') return null;
    return key;
  }

  async generateResponse(messages, character, modelId = 'google/gemini-2.5-flash', userApiKeys = {}) {
    try {
      // Determine provider based on model ID
      if (modelId.startsWith('google/')) {
        const geminiClient = this.getGeminiClient(userApiKeys.gemini);
        if (geminiClient) {
          return await this.generateGeminiResponse(messages, character, geminiClient, modelId);
        }
      } else {
        // All other models use OpenRouter
        const openRouterKey = this.getOpenRouterKey(userApiKeys.openrouter);
        if (openRouterKey) {
          return await this.generateOpenRouterResponse(messages, character, openRouterKey, modelId);
        }
      }

      // Fallback response when no API keys are configured
      return `Hi! I'm ${character.name}. To enable AI responses, please click the settings button and add your API keys. You can get a free Gemini key from Google AI Studio!`;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  async generateGeminiResponse(messages, character, geminiClient, modelId = 'google/gemini-2.5-flash') {
    try {
      // Convert model ID to Gemini format (remove google/ prefix)
      const geminiModelName = modelId.replace('google/', '');
      
      // Build proper system prompt with emotion instructions
      const systemPrompt = buildSystemPrompt(character, [], null);
      
      const model = geminiClient.getGenerativeModel({
        model: geminiModelName,
        systemInstruction: systemPrompt
      });

      // Format conversation for Gemini - properly handle role assignments
      const conversationHistory = messages.slice(-10).map(msg => {
        let role;
        if (msg.role === 'system') {
          // Skip system messages as they're handled in systemInstruction
          return null;
        } else if (msg.role === 'model' || msg.type === 'character') {
          role = 'model';
        } else {
          role = 'user';
        }
        
        return {
          role: role,
          parts: [{ text: msg.content }]
        };
      }).filter(Boolean); // Remove null entries

      const chat = model.startChat({
        history: conversationHistory.slice(0, -1), // All but the last message
        generationConfig: {
          temperature: 0.9,
          topP: 0.8,
          maxOutputTokens: 1000,
        }
      });

      // Send the last message
      const lastMessage = conversationHistory[conversationHistory.length - 1];
      const result = await chat.sendMessage(lastMessage.parts[0].text);
      const response = await result.response;

      return response.text() || 'Sorry, I couldn\'t generate a response.';
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate response from Gemini');
    }
  }

  async generateOpenRouterResponse(messages, character, apiKey, modelId) {
    // Build proper system prompt with emotion instructions
    const systemPrompt = buildSystemPrompt(character, [], null);
    
    // Format messages properly for OpenRouter API with correct role assignments
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => {
        let role;
        if (msg.role === 'system') {
          role = 'system';
        } else if (msg.role === 'model' || msg.type === 'character') {
          role = 'assistant'; // OpenRouter uses 'assistant' for character responses
        } else {
          role = 'user';
        }
        
        return {
          role: role,
          content: msg.content
        };
      })
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages: formattedMessages,
        temperature: 0.8,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Enhanced error handling for Gemini API responses
    if (!data.candidates || data.candidates.length === 0) {
      // Check for safety/blocking reasons
      if (data.promptFeedback) {
        throw new Error(`Gemini API blocked the response: ${JSON.stringify(data.promptFeedback)}`);
      }
      
      // Check for error details
      if (data.error) {
        throw new Error(`Gemini API error: ${data.error.message || JSON.stringify(data.error)}`);
      }
      
      // Generic error for unexpected response structure
      throw new Error(`Gemini API returned unexpected response structure: ${JSON.stringify(data)}`);
    }
    
    // Validate candidate structure before accessing
    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error(`Gemini API returned empty content: ${JSON.stringify(candidate)}`);
    }
    
    return candidate.content.parts[0].text;
  }

  // Auto-generate lorebook entries for a character
  async generateLorebookEntries(characterData, apiSettings, userApiKeys = {}) {
    try {
      const prompt = `You are an expert character lorebook creator. Based on the following character information, create 3-5 lorebook entries that would help an AI character roleplay more effectively.
      
Character Name: ${characterData.name}
Character Description: ${characterData.description}
First Message: ${characterData.firstMessage}
Example Dialogue: ${characterData.exampleDialogue}

Please provide lorebook entries in the following JSON format:
[
  {
    "name": "Entry Name",
    "triggers": ["trigger1", "trigger2"],
    "description": "Detailed description of the entry with context",
    "isActive": true
  }
]

Guidelines:
1. Focus on important people, places, items, and concepts mentioned in the character data
2. Include relevant background information that would help the AI understand context
3. Use specific trigger words that might appear in conversations
4. Make entries detailed but concise
5. Return only valid JSON, no other text

Lorebook Entries:`;

      // Use the same provider and model as currently configured
      const modelId = apiSettings.selectedModel;
      
      // Create a simple message structure for the AI service
      const messages = [
        { role: 'user', content: prompt }
      ];

      // Use a minimal character object since we're not roleplaying
      const character = {
        name: characterData.name,
        description: 'Lorebook generator assistant',
        imageGallery: { mode: 'default', images: [] }
      };

      return await this.generateResponse(messages, character, modelId, userApiKeys);
    } catch (error) {
      console.error('Lorebook Generation Error:', error);
      throw new Error('Failed to generate lorebook entries');
    }
  }
}

export default new AIService();