import { useState, useRef } from 'react'
import { FiUpload, FiLink, FiCheck, FiTrash2, FiUser } from 'react-icons/fi'

function ProfilePictureUpload({ 
  currentAvatar = null,
  characterName = '',
  onAvatarUpload,
  onAvatarRemove,
  onValidationError,
  disabled = false 
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [avatarSource, setAvatarSource] = useState('upload') // 'upload' or 'url'
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isValidatingUrl, setIsValidatingUrl] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!disabled && avatarSource === 'upload') {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled || avatarSource !== 'upload') return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFiles([files[0]]) // Only take the first file for avatar
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      handleFiles([files[0]]) // Only take the first file for avatar
    }
    // Reset file input
    e.target.value = ''
  }

  const handleFiles = async (files) => {
    if (!files.length || disabled) return

    setIsUploading(true)

    try {
      const file = files[0]
      
      // Basic file validation
      if (!file.type.startsWith('image/')) {
        onValidationError('Please select an image file only')
        setIsUploading(false)
        return
      }

      // File size validation (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        onValidationError('Avatar image must be smaller than 5MB')
        setIsUploading(false)
        return
      }

      await onAvatarUpload(file)
    } catch (error) {
      onValidationError(error.message || 'Failed to upload avatar')
    } finally {
      setIsUploading(false)
    }
  }

  const validateImageUrl = async (url) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        if (img.width < 100 || img.height < 100) {
          resolve({ valid: false, error: 'Avatar image must be at least 100x100 pixels' })
        } else {
          resolve({ valid: true, width: img.width, height: img.height })
        }
      }
      img.onerror = () => {
        resolve({ valid: false, error: 'Invalid image URL or image could not be loaded' })
      }
      img.src = url
    })
  }

  const handleUrlSubmit = async () => {
    if (!avatarUrl.trim()) {
      onValidationError('Please enter an image URL')
      return
    }

    setIsValidatingUrl(true)
    
    try {
      const validation = await validateImageUrl(avatarUrl)
      
      if (!validation.valid) {
        onValidationError(validation.error)
        setIsValidatingUrl(false)
        return
      }

      // Create URL avatar data
      const urlAvatarData = {
        isUrl: true,
        url: avatarUrl,
        width: validation.width,
        height: validation.height
      }

      await onAvatarUpload(urlAvatarData)
      setAvatarUrl('')
    } catch (error) {
      onValidationError(error.message)
    } finally {
      setIsValidatingUrl(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUrlSubmit()
    }
  }

  const openFileDialog = () => {
    if (!disabled && avatarSource === 'upload') {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">Profile Picture</h4>
        <span className="text-xs text-[var(--grey-2)]">
          Recommended: Square image, 300x300px+ for best quality
        </span>
      </div>

      {/* Current Avatar Display */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-40 h-40 rounded-lg overflow-hidden bg-[var(--dark-1)] border-2 border-[var(--grey-0)] flex-shrink-0 flex items-center justify-center shadow-lg">
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt={characterName || 'Character avatar'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 flex items-center justify-center text-white font-semibold text-2xl">
              {characterName?.charAt(0)?.toUpperCase() || <FiUser size={32} />}
            </div>
          )}
        </div>
        
        {/* Remove Button (if avatar exists) */}
        {currentAvatar && (
          <button
            type="button"
            onClick={onAvatarRemove}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2 font-medium"
            disabled={disabled}
          >
            <FiTrash2 size={16} />
            Remove Avatar
          </button>
        )}
      </div>

      {/* Upload Method Selector */}
      {!currentAvatar && (
        <>
          <div className="flex gap-2 p-1 bg-[var(--dark-3)] rounded-lg">
            <button
              onClick={() => setAvatarSource('upload')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                avatarSource === 'upload'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--grey-1)] hover:text-white hover:bg-[var(--dark-2)]'
              }`}
            >
              <FiUpload size={16} />
              Upload File
            </button>
            <button
              onClick={() => setAvatarSource('url')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                avatarSource === 'url'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--grey-1)] hover:text-white hover:bg-[var(--dark-2)]'
              }`}
            >
              <FiLink size={16} />
              Image URL
            </button>
          </div>

          {/* Upload Interface */}
          {avatarSource === 'upload' ? (
            /* File Upload */
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                  : 'border-[var(--grey-0)] hover:border-[var(--grey-1)]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 bg-[var(--grey-0)] rounded-full flex items-center justify-center">
                  <FiUpload size={20} className="text-[var(--grey-1)]" />
                </div>
                <div>
                  <p className="text-white font-medium">
                    {isUploading ? 'Processing...' : 'Drop avatar image here or click to browse'}
                  </p>
                  <p className="text-sm text-[var(--grey-1)] mt-1">
                    Supports JPG, PNG, GIF, WebP • Max 5MB
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* URL Input */
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 p-3 bg-[var(--dark-1)] border border-[var(--grey-0)] rounded-lg text-white placeholder-[var(--grey-2)] focus:border-[var(--primary)] outline-none transition-colors"
                  placeholder="https://example.com/avatar.jpg"
                  disabled={disabled || isValidatingUrl}
                />
                <button
                  onClick={handleUrlSubmit}
                  disabled={disabled || !avatarUrl.trim() || isValidatingUrl}
                  className="px-4 py-3 bg-[var(--primary)] hover:bg-[var(--primary)]/90 disabled:bg-[var(--grey-0)] disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isValidatingUrl ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FiCheck size={16} />
                  )}
                </button>
              </div>
              <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="w-4 h-4 bg-blue-400 rounded-full flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full m-1"></div>
                </div>
                <div className="text-xs text-blue-300">
                  <p className="font-medium mb-1">URL Avatar Benefits:</p>
                  <ul className="space-y-0.5 text-blue-200">
                    <li>• No storage space used</li>
                    <li>• High quality preserved</li>
                    <li>• Always up-to-date if URL changes</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </>
      )}
    </div>
  )
}

export default ProfilePictureUpload