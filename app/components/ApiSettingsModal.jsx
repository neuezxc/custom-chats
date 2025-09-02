import { useState, useEffect } from 'react'
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi'
import useChatStore from '../../stores/useChatStore'

function ApiSettingsModal() {
  const {
    showApiSettingsModal,
    setShowApiSettingsModal,
    apiSettings,
    updateApiSettings,
    availableModels
  } = useChatStore()
  
  const [localSettings, setLocalSettings] = useState({
    provider: apiSettings.provider || 'gemini',
    geminiApiKey: apiSettings.geminiApiKey || '',
    openrouterApiKey: apiSettings.openrouterApiKey || '',
    proxy: {
      name: apiSettings.proxy?.name || '',
      url: apiSettings.proxy?.url || '',
      apiKey: apiSettings.proxy?.apiKey || ''
    },
    selectedModel: apiSettings.selectedModel || 'gemini-2.5-flash',
    // Advanced settings
    temperature: apiSettings.temperature || 0.7,
    maxTokens: apiSettings.maxTokens || 1000,
    contextSize: apiSettings.contextSize || 10,
    repetitionPenalty: apiSettings.repetitionPenalty || 1.0,
    frequencyPenalty: apiSettings.frequencyPenalty || 0.0,
    presencePenalty: apiSettings.presencePenalty || 0.0,
    topP: apiSettings.topP || 0.95
  })
  
  const [activeTab, setActiveTab] = useState('connection') // 'connection' or 'advanced'
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(null)
  
  useEffect(() => {
    setLocalSettings({
      provider: apiSettings.provider || 'gemini',
      geminiApiKey: apiSettings.geminiApiKey || '',
      openrouterApiKey: apiSettings.openrouterApiKey || '',
      proxy: {
        name: apiSettings.proxy?.name || '',
        url: apiSettings.proxy?.url || '',
        apiKey: apiSettings.proxy?.apiKey || ''
      },
      selectedModel: apiSettings.selectedModel || 'gemini-2.5-flash',
      // Advanced settings
      temperature: apiSettings.temperature || 0.7,
      maxTokens: apiSettings.maxTokens || 1000,
      contextSize: apiSettings.contextSize || 10,
      repetitionPenalty: apiSettings.repetitionPenalty || 1.0,
      frequencyPenalty: apiSettings.frequencyPenalty || 0.0,
      presencePenalty: apiSettings.presencePenalty || 0.0,
      topP: apiSettings.topP || 0.95
    })
  }, [apiSettings])
  
  if (!showApiSettingsModal) return null
  
  const handleSave = () => {
    updateApiSettings(localSettings)
    setShowApiSettingsModal(false)
  }
  
  const handleCancel = () => {
    setLocalSettings({
      provider: apiSettings.provider || 'gemini',
      geminiApiKey: apiSettings.geminiApiKey || '',
      openrouterApiKey: apiSettings.openrouterApiKey || '',
      proxy: {
        name: apiSettings.proxy?.name || '',
        url: apiSettings.proxy?.url || '',
        apiKey: apiSettings.proxy?.apiKey || ''
      },
      selectedModel: apiSettings.selectedModel || 'gemini-2.5-flash',
      // Advanced settings
      temperature: apiSettings.temperature || 0.7,
      maxTokens: apiSettings.maxTokens || 1000,
      contextSize: apiSettings.contextSize || 10,
      repetitionPenalty: apiSettings.repetitionPenalty || 1.0,
      frequencyPenalty: apiSettings.frequencyPenalty || 0.0,
      presencePenalty: apiSettings.presencePenalty || 0.0,
      topP: apiSettings.topP || 0.95
    })
    setShowApiSettingsModal(false)
  }
  
  const testConnection = async () => {
    setTestingConnection(true)
    setConnectionStatus(null)
    
    try {
      let hasApiKey = false;
      if (localSettings.provider === 'gemini') {
        hasApiKey = !!localSettings.geminiApiKey;
      } else if (localSettings.provider === 'openrouter') {
        hasApiKey = !!localSettings.openrouterApiKey;
      } else if (localSettings.provider === 'proxy') {
        hasApiKey = !!localSettings.proxy.url;
      }
      
      if (!hasApiKey) {
        throw new Error('Please enter the required API information')
      }
      
      // Test API connection with a simple request
      if (localSettings.provider === 'gemini') {
        try {
          // Try SDK approach first (as per documentation)
          const { GoogleGenAI } = await import('@google/genai')
          const ai = new GoogleGenAI({ apiKey: localSettings.geminiApiKey })
          await ai.models.generateContent({
            model: localSettings.selectedModel,
            contents: 'Hello'
          })
        } catch (error) {
          // Fallback to REST API for CORS issues
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${localSettings.selectedModel}:generateContent?key=${localSettings.geminiApiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: 'Hello' }]
              }]
            })
          })
          
          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`)
          }
        }
      } else if (localSettings.provider === 'openrouter') {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${localSettings.openrouterApiKey}`
          }
        })
        if (!response.ok) throw new Error('Invalid API key')
      } else if (localSettings.provider === 'proxy') {
        // For proxy, we'll make a simple test request
        const headers = {
          'Content-Type': 'application/json',
        };
        
        // Add API key if provided
        if (localSettings.proxy.apiKey) {
          headers['Authorization'] = `Bearer ${localSettings.proxy.apiKey}`;
        }
        
        // Simple test - this would depend on your proxy implementation
        const testPayload = {
          model: localSettings.selectedModel,
          messages: [{ role: 'user', content: 'Hello' }]
        };
        
        const response = await fetch(localSettings.proxy.url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(testPayload)
        });
        
        if (!response.ok) {
          throw new Error(`Proxy Error: ${response.status}`);
        }
      }
      
      setConnectionStatus('success')
    } catch (error) {
      setConnectionStatus('error')
      console.error('Connection test failed:', error)
    } finally {
      setTestingConnection(false)
    }
  }
  
  const currentModels = availableModels[localSettings.provider] || []
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--dark-1)] border border-[var(--grey-0)] rounded-[var(--border-radius)] w-[90%] max-w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">API Settings</h2>
            <button 
              onClick={handleCancel}
              className="text-[var(--grey-1)] hover:text-white"
            >
              <FiX size={24} />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-[var(--grey-0)] mb-6">
            <button
              onClick={() => setActiveTab('connection')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'connection'
                  ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                  : 'text-[var(--grey-1)] hover:text-white'
              }`}
            >
              Connection
            </button>
            <button
              onClick={() => setActiveTab('parameters')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'parameters'
                  ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                  : 'text-[var(--grey-1)] hover:text-white'
              }`}
            >
              Parameters
            </button>
          </div>
          
          {/* Connection Tab */}
          {activeTab === 'connection' && (
            <>
              {/* Provider Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">API Provider</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLocalSettings({ ...localSettings, provider: 'gemini' })}
                    className={`px-4 py-2 rounded border ${
                      localSettings.provider === 'gemini'
                        ? 'bg-[var(--primary)] border-[var(--primary)]'
                        : 'border-[var(--grey-0)] hover:border-[var(--grey-1)]'
                    }`}
                  >
                    Gemini
                  </button>
                  <button
                    onClick={() => setLocalSettings({ ...localSettings, provider: 'openrouter' })}
                    className={`px-4 py-2 rounded border ${
                      localSettings.provider === 'openrouter'
                        ? 'bg-[var(--primary)] border-[var(--primary)]'
                        : 'border-[var(--grey-0)] hover:border-[var(--grey-1)]'
                    }`}
                  >
                    OpenRouter
                  </button>
                  <button
                    onClick={() => setLocalSettings({ ...localSettings, provider: 'proxy' })}
                    className={`px-4 py-2 rounded border ${
                      localSettings.provider === 'proxy'
                        ? 'bg-[var(--primary)] border-[var(--primary)]'
                        : 'border-[var(--grey-0)] hover:border-[var(--grey-1)]'
                    }`}
                  >
                    Proxy
                  </button>
                </div>
              </div>
              
              {/* API Key Input */}
              <div className="mb-6">
                {localSettings.provider === 'proxy' ? (
                  <>
                    <label className="block text-sm font-medium mb-2">Proxy Name</label>
                    <input
                      type="text"
                      value={localSettings.proxy.name}
                      onChange={(e) => setLocalSettings({ 
                        ...localSettings, 
                        proxy: { ...localSettings.proxy, name: e.target.value }
                      })}
                      placeholder="Enter a name for this proxy"
                      className="w-full p-3 bg-[var(--dark-2)] border border-[var(--grey-0)] rounded focus:border-[var(--primary)] outline-none mb-4"
                    />
                    
                    <label className="block text-sm font-medium mb-2">Proxy URL</label>
                    <input
                      type="text"
                      value={localSettings.proxy.url}
                      onChange={(e) => setLocalSettings({ 
                        ...localSettings, 
                        proxy: { ...localSettings.proxy, url: e.target.value }
                      })}
                      placeholder="Enter the proxy URL (e.g., https://your-colab-proxy.com)"
                      className="w-full p-3 bg-[var(--dark-2)] border border-[var(--grey-0)] rounded focus:border-[var(--primary)] outline-none mb-4"
                    />
                    
                    <label className="block text-sm font-medium mb-2">Proxy API Key (Optional)</label>
                    <input
                      type="password"
                      value={localSettings.proxy.apiKey}
                      onChange={(e) => setLocalSettings({ 
                        ...localSettings, 
                        proxy: { ...localSettings.proxy, apiKey: e.target.value }
                      })}
                      placeholder="Enter API key if required by your proxy"
                      className="w-full p-3 bg-[var(--dark-2)] border border-[var(--grey-0)] rounded focus:border-[var(--primary)] outline-none"
                    />
                  </>
                ) : (
                  <>
                    <label className="block text-sm font-medium mb-2">
                      {localSettings.provider === 'gemini' ? 'Gemini API Key' : 'OpenRouter API Key'}
                    </label>
                    <input
                      type="password"
                      value={localSettings.provider === 'gemini' ? localSettings.geminiApiKey : localSettings.openrouterApiKey}
                      onChange={(e) => {
                        const key = localSettings.provider === 'gemini' ? 'geminiApiKey' : 'openrouterApiKey'
                        setLocalSettings({ ...localSettings, [key]: e.target.value })
                      }}
                      placeholder={`Enter your ${localSettings.provider === 'gemini' ? 'Gemini' : 'OpenRouter'} API key`}
                      className="w-full p-3 bg-[var(--dark-2)] border border-[var(--grey-0)] rounded focus:border-[var(--primary)] outline-none"
                    />
                    <p className="text-xs text-[var(--grey-1)] mt-1">
                      {localSettings.provider === 'gemini' 
                        ? 'Get your API key from Google AI Studio'
                        : 'Get your API key from OpenRouter dashboard'
                      }
                    </p>
                  </>
                )}
              </div>
              
              {/* Model Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Model</label>
                {localSettings.provider === 'proxy' ? (
                  <input
                    type="text"
                    value={localSettings.selectedModel}
                    onChange={(e) => setLocalSettings({ ...localSettings, selectedModel: e.target.value })}
                    placeholder="Enter model name (e.g., gpt-4, claude-3, etc.)"
                    className="w-full p-3 bg-[var(--dark-2)] border border-[var(--grey-0)] rounded focus:border-[var(--primary)] outline-none"
                  />
                ) : (
                  <select
                    value={localSettings.selectedModel}
                    onChange={(e) => setLocalSettings({ ...localSettings, selectedModel: e.target.value })}
                    className="w-full p-3 bg-[var(--dark-2)] border border-[var(--grey-0)] rounded focus:border-[var(--primary)] outline-none"
                  >
                    {currentModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              {/* Test Connection */}
              <div className="mb-6">
                <button
                  onClick={testConnection}
                  disabled={testingConnection || (
                    (localSettings.provider === 'gemini' && !localSettings.geminiApiKey) ||
                    (localSettings.provider === 'openrouter' && !localSettings.openrouterApiKey) ||
                    (localSettings.provider === 'proxy' && !localSettings.proxy.url)
                  )}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--dark-2)] border border-[var(--grey-0)] rounded hover:border-[var(--grey-1)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testingConnection ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </button>
                
                {connectionStatus && (
                  <div className={`flex items-center gap-2 mt-2 text-sm ${
                    connectionStatus === 'success' ? 'text-[var(--status-green)]' : 'text-red-400'
                  }`}>
                    {connectionStatus === 'success' ? <FiCheck /> : <FiAlertCircle />}
                    {connectionStatus === 'success' ? 'Connection successful!' : 'Connection failed. Please check your API key.'}
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* Parameters Tab */}
          {activeTab === 'parameters' && (
            <div className="space-y-6">
              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Temperature: {localSettings.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={localSettings.temperature}
                  onChange={(e) => setLocalSettings({ ...localSettings, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <p className="text-xs text-[var(--grey-1)] mt-1">
                  Controls how creative/random your character is
                </p>
              </div>
              
              {/* Max Tokens */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Tokens: {localSettings.maxTokens}
                </label>
                <input
                  type="range"
                  min="100"
                  max="4000"
                  step="100"
                  value={localSettings.maxTokens}
                  onChange={(e) => setLocalSettings({ ...localSettings, maxTokens: parseInt(e.target.value) })}
                  className="w-full"
                />
                <p className="text-xs text-[var(--grey-1)] mt-1">
                  Controls how much your character can say in one response
                </p>
              </div>
              
              {/* Context Size */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Context Size: {localSettings.contextSize.toLocaleString()} tokens
                </label>
                <input
                  type="range"
                  min="1000"
                  max="128000"
                  step="1000"
                  value={localSettings.contextSize}
                  onChange={(e) => setLocalSettings({ ...localSettings, contextSize: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-[var(--grey-1)] mt-1">
                  <span>1K</span>
                  <span>32K</span>
                  <span>64K</span>
                  <span>128K</span>
                </div>
                <p className="text-xs text-[var(--grey-1)] mt-1">
                  Controls how much conversation history your character remembers
                </p>
              </div>
              
              {/* Collapsible Advanced Settings */}
              <div className="border-t border-[var(--grey-0)] pt-4">
                <details className="group">
                  <summary className="cursor-pointer list-none flex items-center justify-between">
                    <span className="font-medium text-sm">Advanced Settings</span>
                    <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </summary>
                  <div className="mt-4 space-y-6">
                    {/* Provider-specific settings */}
                    {localSettings.provider !== 'gemini' && (
                      <>
                        {/* Repetition Penalty */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Repetition Penalty: {localSettings.repetitionPenalty}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={localSettings.repetitionPenalty}
                            onChange={(e) => setLocalSettings({ ...localSettings, repetitionPenalty: parseFloat(e.target.value) })}
                            className="w-full"
                          />
                          <p className="text-xs text-[var(--grey-1)] mt-1">
                            Prevents your character from repeating phrases
                          </p>
                        </div>
                        
                        {/* Frequency Penalty */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Frequency Penalty: {localSettings.frequencyPenalty}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={localSettings.frequencyPenalty}
                            onChange={(e) => setLocalSettings({ ...localSettings, frequencyPenalty: parseFloat(e.target.value) })}
                            className="w-full"
                          />
                          <p className="text-xs text-[var(--grey-1)] mt-1">
                            Encourages using different words/phrases
                          </p>
                        </div>
                        
                        {/* Presence Penalty */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Presence Penalty: {localSettings.presencePenalty}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={localSettings.presencePenalty}
                            onChange={(e) => setLocalSettings({ ...localSettings, presencePenalty: parseFloat(e.target.value) })}
                            className="w-full"
                          />
                          <p className="text-xs text-[var(--grey-1)] mt-1">
                            Encourages discussing new topics
                          </p>
                        </div>
                      </>
                    )}
                    
                    {/* Top-P */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Top-P: {localSettings.topP}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={localSettings.topP}
                        onChange={(e) => setLocalSettings({ ...localSettings, topP: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <p className="text-xs text-[var(--grey-1)] mt-1">
                        Controls variety in response choices
                      </p>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-[var(--grey-0)] rounded hover:border-[var(--grey-1)]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[var(--primary)] rounded hover:bg-[var(--primary)]/90"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiSettingsModal