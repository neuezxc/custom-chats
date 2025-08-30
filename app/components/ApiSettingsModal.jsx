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
  
  const [localSettings, setLocalSettings] = useState(apiSettings)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(null)
  
  useEffect(() => {
    setLocalSettings(apiSettings)
  }, [apiSettings])
  
  if (!showApiSettingsModal) return null
  
  const handleSave = () => {
    updateApiSettings(localSettings)
    setShowApiSettingsModal(false)
  }
  
  const handleCancel = () => {
    setLocalSettings(apiSettings)
    setShowApiSettingsModal(false)
  }
  
  const testConnection = async () => {
    setTestingConnection(true)
    setConnectionStatus(null)
    
    try {
      const hasApiKey = localSettings.provider === 'gemini' 
        ? localSettings.geminiApiKey 
        : localSettings.openrouterApiKey
        
      if (!hasApiKey) {
        throw new Error('Please enter an API key')
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
      } else {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${localSettings.openrouterApiKey}`
          }
        })
        if (!response.ok) throw new Error('Invalid API key')
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
            </div>
          </div>
          
          {/* API Key Input */}
          <div className="mb-6">
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
          </div>
          
          {/* Model Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Model</label>
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
          </div>
          
          {/* Test Connection */}
          <div className="mb-6">
            <button
              onClick={testConnection}
              disabled={testingConnection || (!localSettings.geminiApiKey && !localSettings.openrouterApiKey)}
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
          
          
          {/* Actions */}
          <div className="flex gap-3 justify-end">
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