// Available models from DOCS/LISTS_MODELS.md
export const geminiModels = [
  { id: 'google/gemini-2.5-pro', name: 'Google: Gemini 2.5 Pro', provider: 'gemini' },
  { id: 'google/gemini-2.5-flash', name: 'Google: Gemini 2.5 Flash', provider: 'gemini' },
  { id: 'google/gemini-2.5-flash-lite', name: 'Google: Gemini 2.5 Flash Lite', provider: 'gemini' },
];

export const openrouterModels = [
  { id: 'deepseek/deepseek-chat-v3.1:free', name: 'DeepSeek: DeepSeek V3.1 (free)', provider: 'openrouter' },
  { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek: R1 0528 (free)', provider: 'openrouter' },
  { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek: DeepSeek V3 0324 (free)', provider: 'openrouter' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek: R1 (free)', provider: 'openrouter' },
  { id: 'qwen/qwen3-coder:free', name: 'Qwen: Qwen3 Coder (free)', provider: 'openrouter' },
  { id: 'tngtech/deepseek-r1t2-chimera:free', name: 'TNG: DeepSeek R1T2 Chimera (free)', provider: 'openrouter' },
  { id: 'z-ai/glm-4.5-air:free', name: 'Z.AI: GLM 4.5 Air (free)', provider: 'openrouter' },
  { id: 'tngtech/deepseek-r1t-chimera:free', name: 'TNG: DeepSeek R1T Chimera (free)', provider: 'openrouter' },
  { id: 'moonshotai/kimi-k2:free', name: 'MoonshotAI: Kimi K2 (free)', provider: 'openrouter' },
  { id: 'qwen/qwen3-235b-a22b:free', name: 'Qwen: Qwen3 235B A22B (free)', provider: 'openrouter' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Google: Gemini 2.0 Flash Experimental (free)', provider: 'openrouter' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Meta: Llama 3.3 70B Instruct (free)', provider: 'openrouter' },
  // Paid models
  { id: 'anthropic/claude-3.5-sonnet', name: 'Anthropic: Claude 3.5 Sonnet (paid)', provider: 'openrouter' },
];

// All available models combined
export const allModels = [...geminiModels, ...openrouterModels];

// Helper function to get model display name
export const getModelDisplayName = (modelId) => {
  const model = allModels.find(m => m.id === modelId);
  return model ? model.name : modelId;
};

// Helper function to get models by provider
export const getModelsByProvider = (provider) => {
  if (provider === 'gemini') return geminiModels;
  if (provider === 'openrouter') return openrouterModels;
  return [];
};

// Helper function to get available models based on API keys
export const getAvailableModels = (apiKeys) => {
  return allModels.filter(model => {
    if (model.provider === 'gemini') return apiKeys.gemini;
    if (model.provider === 'openrouter') return apiKeys.openrouter;
    return false;
  });
};