import { useState, useEffect } from 'react'
import { FiX, FiSave, FiRefreshCw } from 'react-icons/fi'
import useChatStore from '../../stores/useChatStore'

function DisplaySettingsModal() {
  const { 
    displaySettings, 
    showDisplaySettingsModal, 
    setShowDisplaySettingsModal, 
    updateDisplaySettings 
  } = useChatStore()
  
  const [localSettings, setLocalSettings] = useState({
    primaryColor: '#5373cc',
    primaryLightColor: '#c0d1fc',
    textSize: 'medium'
  })
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // Initialize form data when modal opens
  useEffect(() => {
    if (showDisplaySettingsModal) {
      setLocalSettings({
        primaryColor: displaySettings.primaryColor || '#5373cc',
        primaryLightColor: displaySettings.primaryLightColor || '#c0d1fc',
        textSize: displaySettings.textSize || 'medium'
      })
      setHasUnsavedChanges(false)
    }
  }, [showDisplaySettingsModal, displaySettings])
  
  // Track changes
  useEffect(() => {
    const primaryColorChanged = localSettings.primaryColor !== (displaySettings.primaryColor || '#5373cc')
    const primaryLightColorChanged = localSettings.primaryLightColor !== (displaySettings.primaryLightColor || '#c0d1fc')
    const textSizeChanged = localSettings.textSize !== (displaySettings.textSize || 'medium')
    setHasUnsavedChanges(primaryColorChanged || primaryLightColorChanged || textSizeChanged)
  }, [localSettings, displaySettings])
  
  const handleSave = () => {
    updateDisplaySettings({
      primaryColor: localSettings.primaryColor,
      primaryLightColor: localSettings.primaryLightColor,
      textSize: localSettings.textSize
    })
    
    // Apply the new colors to CSS variables
    document.documentElement.style.setProperty('--primary', localSettings.primaryColor)
    document.documentElement.style.setProperty('--primary-light', localSettings.primaryLightColor)
    
    // Apply text size class to body
    document.body.classList.remove('text-size-small', 'text-size-medium', 'text-size-large')
    document.body.classList.add(`text-size-${localSettings.textSize}`)
    
    setShowDisplaySettingsModal(false)
    setHasUnsavedChanges(false)
  }
  
  const handleReset = () => {
    if (confirm('Reset to default display settings?')) {
      setLocalSettings({
        primaryColor: '#5373cc',
        primaryLightColor: '#c0d1fc',
        textSize: 'medium'
      })
    }
  }
  
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        return
      }
    }
    setLocalSettings({
      primaryColor: displaySettings.primaryColor || '#5373cc',
      primaryLightColor: displaySettings.primaryLightColor || '#c0d1fc',
      textSize: displaySettings.textSize || 'medium'
    })
    setHasUnsavedChanges(false)
    setShowDisplaySettingsModal(false)
  }

  if (!showDisplaySettingsModal) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--dark-1)] border border-[var(--grey-0)] rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Display Settings</h2>
              <p className="text-sm text-[var(--grey-1)]">Customize the look and feel of your chat</p>
            </div>
            <button
              onClick={handleCancel}
              className="text-[var(--grey-1)] hover:text-white transition-colors p-1"
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
          </div>
          
          {/* Primary Color Picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={localSettings.primaryColor}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-12 h-12 border border-[var(--grey-0)] rounded cursor-pointer bg-[var(--dark-2)]"
              />
              <input
                type="text"
                value={localSettings.primaryColor}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="flex-1 p-2 bg-[var(--dark-2)] border border-[var(--grey-0)] rounded focus:border-[var(--primary)] outline-none text-white"
              />
            </div>
          </div>
          
          {/* Primary Light Color Picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Primary Light Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={localSettings.primaryLightColor}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, primaryLightColor: e.target.value }))}
                className="w-12 h-12 border border-[var(--grey-0)] rounded cursor-pointer bg-[var(--dark-2)]"
              />
              <input
                type="text"
                value={localSettings.primaryLightColor}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, primaryLightColor: e.target.value }))}
                className="flex-1 p-2 bg-[var(--dark-2)] border border-[var(--grey-0)] rounded focus:border-[var(--primary)] outline-none text-white"
              />
            </div>
          </div>
          
          {/* Text Size Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-white mb-2">
              Text Size
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, textSize: 'small' }))}
                className={`p-4 rounded border transition-colors ${
                  localSettings.textSize === 'small'
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-[var(--grey-0)] hover:border-[var(--grey-1)]'
                }`}
              >
                <div className="text-sm">Small</div>
              </button>
              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, textSize: 'medium' }))}
                className={`p-4 rounded border transition-colors ${
                  localSettings.textSize === 'medium'
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-[var(--grey-0)] hover:border-[var(--grey-1)]'
                }`}
              >
                <div className="text-base">Medium</div>
              </button>
              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, textSize: 'large' }))}
                className={`p-4 rounded border transition-colors ${
                  localSettings.textSize === 'large'
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-[var(--grey-0)] hover:border-[var(--grey-1)]'
                }`}
              >
                <div className="text-lg">Large</div>
              </button>
            </div>
          </div>
          
          {/* Preview */}
          <div className="mb-6 p-4 bg-[var(--dark-2)] rounded border border-[var(--grey-0)]">
            <h3 className="text-sm font-medium text-white mb-2">Preview</h3>
            <div className="space-y-2">
              <div 
                className="text-white"
                style={{ 
                  fontSize: localSettings.textSize === 'small' ? '0.875rem' : 
                            localSettings.textSize === 'large' ? '1.125rem' : '1rem'
                }}
              >
                This is a preview of your text size settings.
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className="text-[var(--primary-light)]"
                  style={{ color: localSettings.primaryLightColor }}
                >
                  Primary Light Text
                </span>
                <span 
                  className="opacity-40 italic"
                  style={{ opacity: 0.4 }}
                >
                  *Italic Text (40% opacity)*
                </span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 text-[var(--grey-1)] hover:text-white hover:bg-[var(--dark-2)] rounded transition-colors"
            >
              <FiRefreshCw size={16} />
              Reset
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-[var(--dark-2)] text-[var(--grey-1)] rounded hover:bg-[var(--dark-3)] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  hasUnsavedChanges 
                    ? 'bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white' 
                    : 'bg-[var(--dark-2)] text-[var(--grey-2)] cursor-not-allowed'
                }`}
              >
                <FiSave size={16} />
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DisplaySettingsModal