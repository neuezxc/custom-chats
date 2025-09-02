import { GoogleGenerativeAI } from '@google/generative-ai';

// Import buildSystemPrompt function from store\nfunction buildSystemPrompt(character, triggeredLore = [], customSettings = null) {\n  // We need to access the store state, but we can't import useChatStore directly here\n  // due to circular dependencies, so we'll reconstruct the logic\n  \n  const currentUser = { name: 'User', description: 'A curious person exploring conversations with AI characters.' };\n  \n  // Helper function to format triggered lore entries for {{lore}} placeholder\n  function formatTriggeredLore(triggeredLore, character, currentUser) {\n    if (!triggeredLore || triggeredLore.length === 0) {\n      return '';\n    }\n\n    const processedEntries = triggeredLore.map(entry => {\n      let description = entry.description || '';\n\n      // Replace placeholders in each lore entry\n      description = description.replace(/\\{\\{char\\}\\}/g, character.name || 'Character');\n      description = description.replace(/\\{\\{char_description\\}\\}/g, character.description || 'Character description');\n      description = description.replace(/\\{\\{user\\}\\}/g, currentUser.name || 'User');\n      description = description.replace(/\\{\\{user_description\\}\\}/g, currentUser.description || 'A curious person exploring conversations with AI characters.');\n\n      return `${entry.name}: ${description}`;\n    });\n\n    return processedEntries.join('\\n');\n  }
  
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
        const emotionInstructions = `\n\nEMOTION INSTRUCTIONS: You must always indicate your current emotion at the end of each message using the format <Emotion="emotion_name">. Choose from these available emotions: ${availableEmotions.join(', ')}. If none of these emotions match your current feeling, use <Emotion="neutral">. The emotion tag will be used to update your visual appearance and should not be displayed to the user.`;
        customPrompt += emotionInstructions;
      }
    }
    
    console.log('📋 AIService System Prompt (Custom):', customPrompt);
    return customPrompt;
  }
  
  // Default character-based system prompt
  let systemPrompt = `You are ${character.name}. ${character.description}`;
  
  // Add example dialogue if available
  if (character.exampleDialogue) {
    systemPrompt += `\n\nExample dialogue: ${character.exampleDialogue}`;
  }
  
  // Add triggered lorebook entries
  if (triggeredLore.length > 0) {
    systemPrompt += '\n\nRelevant Context:';
    triggeredLore.forEach(entry => {
      let description = entry.description;
      // Replace placeholders
      description = description.replace(/\{\{char\}\}/g, character.name);
      description = description.replace(/\{\{char_description\}\}/g, character.description);
      description = description.replace(/\{\{user\}\}/g, currentUser.name || 'User');
      description = description.replace(/\{\{user_description\}\}/g, currentUser.description || 'A curious person exploring conversations with AI characters.');
      systemPrompt += `\n- ${entry.name}: ${description}`;
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
      const emotionInstructions = `\n\nEMOTION INSTRUCTIONS: You must always indicate your current emotion at the end of each message using the format <Emotion="emotion_name">. Choose from these available emotions: ${availableEmotions.join(', ')}. If none of these emotions match your current feeling, use <Emotion="neutral">. The emotion tag will be used to update your visual appearance and should not be displayed to the user.`;
      systemPrompt += emotionInstructions;
    }
  }
  
  console.log('📋 AIService System Prompt (Default):', systemPrompt);
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
      } else if (userApiKeys.provider === 'proxy' && userApiKeys.proxy) {
        // Use proxy API
        return await this.generateProxyResponse(messages, character, userApiKeys.proxy, modelId);
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

  async generateProxyResponse(messages, character, proxySettings, modelId) {
    // Build proper system prompt with emotion instructions
    const systemPrompt = buildSystemPrompt(character, [], null);
    
    // Format messages properly for proxy API with correct role assignments
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => {
        let role;
        if (msg.role === 'system') {
          role = 'system';
        } else if (msg.role === 'model' || msg.type === 'character') {
          role = 'assistant'; // Standard for character responses
        } else {
          role = 'user';
        }
        
        return {
          role: role,
          content: msg.content
        };
      })
    ];

    // Prepare headers for the proxy request
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add API key if provided
    if (proxySettings.apiKey) {
      headers['Authorization'] = `Bearer ${proxySettings.apiKey}`;
    }

    const response = await fetch(proxySettings.url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: modelId,
        messages: formattedMessages,
        temperature: 0.8,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Proxy API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract response text - this may vary based on your proxy implementation
    // This is a generic approach that tries common response formats
    let responseText = '';
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      // OpenAI/OpenRouter format
      responseText = data.choices[0].message.content;
    } else if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      // Gemini format
      responseText = data.candidates[0].content.parts[0].text;
    } else if (data.content) {
      // Simple content format
      responseText = data.content;
    } else if (data.text) {
      // Simple text format
      responseText = data.text;
    } else {
      // Try to stringify the entire response as a fallback
      responseText = JSON.stringify(data);
    }
    
    return responseText || 'Sorry, I couldn\'t generate a response.';
  }
}

export default new AIService();