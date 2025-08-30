import { useState, useEffect } from 'react'
import { FiX, FiEye, FiEyeOff, FiCopy, FiSave, FiSettings, FiInfo } from 'react-icons/fi'
import useChatStore from '../../stores/useChatStore'

// Helper function to generate sample lore content for preview
function generateSampleLore(character) {
  if (!character || !character.lorebook || character.lorebook.length === 0) {
    return '[Dynamic lore will appear here based on trigger words]'
  }
  
  // Get a sample of lore entries for preview
  const sampleEntries = character.lorebook.slice(0, 2).map(entry => {
    let description = entry.description || 'Sample lore description'
    
    // Process placeholders in sample description
    description = description.replace(/\{\{char\}\}/g, character.name || 'Character')
    description = description.replace(/\{\{char_description\}\}/g, character.description || 'Character description')
    description = description.replace(/\{\{user\}\}/g, 'User')
    description = description.replace(/\{\{user_description\}\}/g, 'User description')
    
    return `${entry.name}: ${description}`
  })
  
  if (sampleEntries.length === 0) {
    return '[Dynamic lore will appear here based on trigger words]'
  }
  
  return sampleEntries.join('\n')
}

// Helper function to generate sample emotion instructions for preview
function generateSampleEmotions(character) {
  if (!character || !character.imageGallery || character.imageGallery.mode !== 'emotion' || !character.imageGallery.images || character.imageGallery.images.length === 0) {
    return '[Emotion instructions will appear here when emotion mode is active]'
  }
  
  // Extract emotions from image filenames for preview
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
  
  if (availableEmotions.length === 0) {
    return '[No emotions detected from image filenames]'
  }
  
  return `EMOTION INSTRUCTIONS: You must always indicate your current emotion at the end of each message using the format <Emotion="emotion_name">. Choose from these available emotions: ${availableEmotions.join(', ')}. If none of these emotions match your current feeling, use <Emotion="neutral">. The emotion tag will be used to update your visual appearance and should not be displayed to the user.`
}

function CustomSystemPrompt() {
  const {
    showCustomSystemPrompt,
    setShowCustomSystemPrompt,
    customSystemPrompt,
    updateCustomSystemPrompt,
    currentCharacter,
    currentUser,
    getStorageUsage
  } = useChatStore()
  
  const [localContent, setLocalContent] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showPlaceholderModal, setShowPlaceholderModal] = useState(false)
  const [showLivePreview, setShowLivePreview] = useState(false)
  const [storageError, setStorageError] = useState('')
  
  // Get current storage usage
  const storageUsage = getStorageUsage()
  
  // Initialize local state when modal opens
  useEffect(() => {
    if (showCustomSystemPrompt) {
      setLocalContent(customSystemPrompt.content || '')
      setHasUnsavedChanges(false)
      setStorageError('')
    }
  }, [showCustomSystemPrompt, customSystemPrompt])
  
  const handleSave = async () => {
    const trimmedContent = localContent.trim()
    
    try {
      updateCustomSystemPrompt({
        enabled: trimmedContent !== '',
        content: trimmedContent,
        useStructuredPrompting: false // Always use simple mode
      })
      setHasUnsavedChanges(false)
      setStorageError('')
      setShowCustomSystemPrompt(false)
    } catch (error) {
      setStorageError(error.message)
      // Don't close the modal so user can see the error and try again
    }
  }
  
  const handleCancel = () => {
    if (hasUnsavedChanges && localContent.trim() !== customSystemPrompt.content) {
      if (!confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        return
      }
    }
    setLocalContent(customSystemPrompt.content || '')
    setHasUnsavedChanges(false)
    setShowCustomSystemPrompt(false)
  }
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(localContent)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  const handleClear = () => {
    if (localContent.trim() !== '') {
      if (confirm('Are you sure you want to clear all content?')) {
        setLocalContent('')
        setHasUnsavedChanges(true)
      }
    }
  }
  
  // Calculate estimated size impact
  const estimatedSizeKB = Math.round(new Blob([localContent]).size / 1024)
  const isLargePrompt = estimatedSizeKB > 50 // Warn if over 50KB
  
  // Process placeholders for live preview
  const processedContent = localContent
    .replace(/\{\{char\}\}/g, currentCharacter.name || 'Character')
    .replace(/\{\{char_description\}\}/g, currentCharacter.description || 'Character description')
    .replace(/\{\{user\}\}/g, currentUser.name || 'User')
    .replace(/\{\{user_description\}\}/g, currentUser.description || 'A curious person exploring conversations with AI characters.')
    .replace(/\{\{lore\}\}/g, generateSampleLore(currentCharacter))
    .replace(/\{\{emotions\}\}/g, generateSampleEmotions(currentCharacter))
  
  // Debug logging for placeholder replacement
  useEffect(() => {
    if (showLivePreview && localContent.includes('{{char_description}}')) {
      console.log('=== CustomSystemPrompt Debug ===')
      console.log('Character name:', currentCharacter.name)
      console.log('Character description:', currentCharacter.description)
      console.log('Original content contains char_description:', localContent.includes('{{char_description}}'))
      console.log('Processed content:', processedContent)
      console.log('Character description found in processed content:', processedContent.includes(currentCharacter.description || 'Character description'))
      console.log('================================')
    }
  }, [showLivePreview, localContent, currentCharacter, processedContent])
  
  if (!showCustomSystemPrompt) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--dark-1)] border border-[var(--grey-0)] rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--grey-0)]">
          <div className="flex items-center gap-2 sm:gap-3">
            <FiSettings size={20} className="text-[var(--primary)] flex-shrink-0" />
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">Custom System Prompt</h2>
              <p className="text-xs sm:text-sm text-[var(--grey-1)] hidden sm:block">Override the default character behavior with custom instructions</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-[var(--grey-1)] hover:text-white transition-colors p-1"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden p-4 sm:p-6">
          <div className="h-full flex flex-col space-y-4">
            
            {/* Editor */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-white">System Prompt Content</label>
                <div className="flex gap-1 sm:gap-2">
                  <button
                    onClick={() => setShowLivePreview(!showLivePreview)}
                    className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1 text-xs rounded transition-colors ${showLivePreview ? 'bg-[var(--primary)] text-white' : 'bg-[var(--dark-2)] text-[var(--grey-1)] hover:text-white hover:bg-[var(--dark-3)]'}`}
                    title={showLivePreview ? 'Hide processed preview' : 'Show processed preview'}
                  >
                    {showLivePreview ? <FiEyeOff size={12} /> : <FiEye size={12} />}
                    <span className="hidden sm:inline">{showLivePreview ? 'Raw' : 'Preview'}</span>
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={localContent.trim() === ''}
                    className="px-2 py-1 sm:px-3 sm:py-1 text-xs bg-[var(--dark-2)] text-[var(--grey-1)] rounded hover:bg-[var(--dark-3)] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleCopy}
                    disabled={localContent.trim() === ''}
                    className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${copySuccess ? 'bg-green-600 text-white' : 'bg-[var(--dark-2)] text-[var(--grey-1)] hover:text-white hover:bg-[var(--dark-3)]'}`}
                  >
                    <FiCopy size={12} />
                    <span className="hidden sm:inline">{copySuccess ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              
              {showLivePreview ? (
                <div className="flex-1 min-h-[300px] max-h-[300px] p-4 bg-[var(--dark-3)] border border-[var(--primary)] rounded-lg text-white text-sm leading-relaxed overflow-y-auto whitespace-pre-wrap">
                  {processedContent || 'Enter your custom system prompt above to see the live preview with processed placeholders...'}
                </div>
              ) : (
                <textarea
                  value={localContent}
                  onChange={(e) => {
                    setLocalContent(e.target.value)
                    setHasUnsavedChanges(true)
                  }}
                  placeholder="Enter your custom system prompt here...

Example:
You are {{char}}. {{char_description}} 

{{lore}}

{{emotions}}

Respond in character with detailed descriptions and stay true to your personality.

You can use {{char}} for character name, {{char_description}} for full description, {{user}} for user name, {{user_description}} for user description, {{lore}} for dynamic lore content, and {{emotions}} for emotion instructions."
                  className="flex-1 min-h-[300px] p-4 bg-[var(--dark-2)] border border-[var(--grey-0)] rounded-lg focus:border-[var(--primary)] outline-none text-white resize-none text-sm leading-relaxed"
                />
              )}
              
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mt-3">
                <button
                  onClick={() => setShowPlaceholderModal(true)}
                  className="flex items-center gap-1 text-xs text-[var(--grey-1)] hover:text-white"
                >
                  <FiInfo size={14} />
                  <span>Placeholder tips</span>
                </button>
                <div className="text-xs text-[var(--grey-2)] text-right">
                  <div>
                    {showLivePreview ? `${processedContent.length} processed` : `${localContent.length} characters`}
                    {estimatedSizeKB > 0 && ` (~${estimatedSizeKB}KB)`}
                  </div>
                  {isLargePrompt && (
                    <div className="text-yellow-400 text-xs">
                      ⚠️ Large prompt
                    </div>
                  )}
                  <div className={`mt-1 ${storageUsage.percentage > 80 ? 'text-yellow-400' : storageUsage.percentage > 95 ? 'text-red-400' : 'text-[var(--grey-2)]'}`}>
                    Storage: {storageUsage.mb}MB ({storageUsage.percentage}%)
                  </div>
                </div>
              </div>
              
              {/* Placeholder Tips Modal */}
              {showPlaceholderModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-[var(--dark-1)] border border-[var(--grey-0)] rounded-lg w-full max-w-md">
                    <div className="flex items-center justify-between p-4 border-b border-[var(--grey-0)]">
                      <h3 className="text-lg font-semibold text-white">Placeholder Tips</h3>
                      <button
                        onClick={() => setShowPlaceholderModal(false)}
                        className="text-[var(--grey-1)] hover:text-white transition-colors p-1"
                      >
                        <FiX size={20} />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="text-sm text-[var(--grey-1)] mb-4">
                        Use these placeholders in your custom system prompt to dynamically insert character and user information:
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-[var(--dark-2)] rounded-lg">
                          <div className="font-medium text-white">Character Placeholders</div>
                          <div className="mt-2 text-sm space-y-1">
                            <div><code className="bg-[var(--dark-3)] px-1 rounded">{'{{char}}'}</code> - Character name</div>
                            <div><code className="bg-[var(--dark-3)] px-1 rounded">{'{{char_description}}'}</code> - Character description</div>
                          </div>
                        </div>
                        <div className="p-3 bg-[var(--dark-2)] rounded-lg">
                          <div className="font-medium text-white">User Placeholders</div>
                          <div className="mt-2 text-sm space-y-1">
                            <div><code className="bg-[var(--dark-3)] px-1 rounded">{'{{user}}'}</code> - User name</div>
                            <div><code className="bg-[var(--dark-3)] px-1 rounded">{'{{user_description}}'}</code> - User description</div>
                          </div>
                        </div>
                        <div className="p-3 bg-[var(--dark-2)] rounded-lg">
                          <div className="font-medium text-white">Dynamic Content</div>
                          <div className="mt-2 text-sm space-y-1">
                            <div><code className="bg-[var(--dark-3)] px-1 rounded">{'{{lore}}'}</code> - Dynamic lore content</div>
                            <div><code className="bg-[var(--dark-3)] px-1 rounded">{'{{emotions}}'}</code> - Emotion instructions</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 text-xs text-[var(--grey-1)]">
                        These placeholders will be automatically replaced with actual content when the prompt is used.
                      </div>
                    </div>
                    <div className="p-4 border-t border-[var(--grey-0)]">
                      <button
                        onClick={() => setShowPlaceholderModal(false)}
                        className="w-full px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Storage Error Display */}
              {storageError && (
                <div className="mt-3 p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">
                    ⚠️ {storageError}
                  </p>
                  <p className="text-xs text-[var(--grey-1)] mt-1">
                    Try removing some characters or images to free up space, or shorten your custom prompt.
                  </p>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 sm:px-6 sm:py-2 bg-[var(--dark-2)] text-[var(--grey-1)] rounded-lg hover:bg-[var(--dark-3)] hover:text-white transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors w-full"
              >
                <FiSave size={16} />
                {localContent.trim() === '' ? 'Disable' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomSystemPrompt