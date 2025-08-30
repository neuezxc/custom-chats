import { useState, useEffect } from 'react'
import { FiX, FiUser, FiSave, FiRefreshCw } from 'react-icons/fi'
import useChatStore from '../../stores/useChatStore'
import ProfilePictureUpload from './ProfilePictureUpload'

function UserProfileModal() {
  const { 
    currentUser, 
    showUserProfileModal, 
    setShowUserProfileModal, 
    updateUser 
  } = useChatStore()
  
  const [localData, setLocalData] = useState({
    name: '',
    description: '',
    avatar: null
  })
  
  const [validationError, setValidationError] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // Initialize form data when modal opens
  useEffect(() => {
    if (showUserProfileModal) {
      setLocalData({
        name: currentUser.name || '',
        description: currentUser.description || '',
        avatar: currentUser.avatar || null
      })
      setHasUnsavedChanges(false)
    }
  }, [showUserProfileModal, currentUser])
  
  // Track changes
  useEffect(() => {
    const nameChanged = localData.name !== (currentUser.name || '')
    const descriptionChanged = localData.description !== (currentUser.description || '')
    const avatarChanged = localData.avatar !== (currentUser.avatar || null)
    setHasUnsavedChanges(nameChanged || descriptionChanged || avatarChanged)
  }, [localData, currentUser])
  
  const handleAvatarUpload = async (avatarData) => {
    try {
      // Handle both file and URL uploads
      if (avatarData.isUrl) {
        // For URL avatars, store the URL directly
        setLocalData(prev => ({ ...prev, avatar: avatarData.url }))
      } else {
        // For file uploads, convert to base64
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        
        return new Promise((resolve) => {
          img.onload = () => {
            // Compress to 200x200 at 90% quality
            canvas.width = 200
            canvas.height = 200
            ctx.drawImage(img, 0, 0, 200, 200)
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.9)
            setLocalData(prev => ({ ...prev, avatar: compressedDataUrl }))
            resolve()
          }
          img.src = URL.createObjectURL(avatarData)
        })
      }
      setValidationError('')
    } catch (error) {
      setValidationError('Failed to upload avatar')
    }
  }
  
  const handleAvatarRemove = () => {
    setLocalData(prev => ({ ...prev, avatar: null }))
    setValidationError('')
  }
  
  const handleValidationError = (error) => {
    setValidationError(error)
    setTimeout(() => setValidationError(''), 5000) // Clear error after 5 seconds
  }
  
  const handleSave = () => {
    const trimmedName = localData.name.trim()
    const trimmedDescription = localData.description.trim()
    
    updateUser({
      name: trimmedName || 'User',
      description: trimmedDescription || 'A curious person exploring conversations with AI characters.',
      avatar: localData.avatar
    })
    
    setShowUserProfileModal(false)
    setHasUnsavedChanges(false)
  }
  
  const handleReset = () => {
    if (confirm('Reset to default values?')) {
      setLocalData({
        name: 'User',
        description: 'A curious person exploring conversations with AI characters.',
        avatar: null
      })
    }
  }
  
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        return
      }
    }
    setLocalData({
      name: currentUser.name || '',
      description: currentUser.description || '',
      avatar: currentUser.avatar || null
    })
    setHasUnsavedChanges(false)
    setShowUserProfileModal(false)
  }

  if (!showUserProfileModal) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--dark-1)] border border-[var(--grey-0)] rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FiUser size={20} className="text-[var(--primary)]" />
              <div>
                <h2 className="text-lg font-semibold text-white">User Profile</h2>
                <p className="text-sm text-[var(--grey-1)]">Customize your identity in conversations</p>
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
          
          {/* Profile Picture Section */}
          <div className="mb-6">
            <ProfilePictureUpload
              currentAvatar={localData.avatar}
              characterName={localData.name || 'User'}
              onAvatarUpload={handleAvatarUpload}
              onAvatarRemove={handleAvatarRemove}
              onValidationError={handleValidationError}
              disabled={false}
            />
            {validationError && (
              <p className="text-red-400 text-sm mt-2">{validationError}</p>
            )}
          </div>
          
          {/* Name Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={localData.name}
              onChange={(e) => setLocalData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your name"
              className="w-full p-3 bg-[var(--dark-2)] border border-[var(--grey-0)] rounded focus:border-[var(--primary)] outline-none text-white"
            />
            <p className="text-xs text-[var(--grey-1)] mt-1">
              Used as <code className="bg-[var(--dark-2)] px-1 py-0.5 rounded text-[var(--primary-light)]">{'{{user}}'}</code> in system prompts
            </p>
          </div>
          
          {/* Description Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              About You
            </label>
            <textarea
              value={localData.description}
              onChange={(e) => setLocalData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe yourself..."
              rows={4}
              className="w-full p-3 bg-[var(--dark-2)] border border-[var(--grey-0)] rounded focus:border-[var(--primary)] outline-none text-white resize-none"
            />
            <p className="text-xs text-[var(--grey-1)] mt-1">
              Used as <code className="bg-[var(--dark-2)] px-1 py-0.5 rounded text-[var(--primary-light)]">{'{{user_description}}'}</code> in system prompts
            </p>
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

export default UserProfileModal