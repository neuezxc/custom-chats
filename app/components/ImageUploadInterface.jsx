import { useState, useRef } from 'react'
import { FiUpload, FiImage, FiPlus, FiLink, FiCheck } from 'react-icons/fi'

function ImageUploadInterface({ 
  mode, 
  currentImages = [], 
  onImageUpload, 
  onValidationError,
  disabled = false 
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imageSource, setImageSource] = useState('upload') // 'upload' or 'url'
  const [imageUrl, setImageUrl] = useState('')
  const [isValidatingUrl, setIsValidatingUrl] = useState(false)
  const fileInputRef = useRef(null)

  const maxImages = mode === 'default' ? 1 : 5
  const canUploadMore = currentImages.length < maxImages

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!disabled && canUploadMore && imageSource === 'upload') {
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
    
    if (disabled || !canUploadMore || imageSource !== 'upload') return

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
    // Reset file input
    e.target.value = ''
  }

  const handleFiles = async (files) => {
    if (!files.length || disabled) return

    setIsUploading(true)

    try {
      for (const file of files) {
        if (!canUploadMore) {
          onValidationError(`Maximum ${maxImages} images allowed for ${mode} mode`)
          break
        }

        // Basic file validation
        if (!file.type.startsWith('image/')) {
          onValidationError('Please select image files only')
          continue
        }

        // More detailed validation will be done in the parent component
        await onImageUpload(file)
      }
    } catch (error) {
      onValidationError(error.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const validateImageUrl = async (url) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        if (img.width < 200 || img.height < 200) {
          resolve({ valid: false, error: 'Image must be at least 200x200 pixels' })
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
    if (!imageUrl.trim()) {
      onValidationError('Please enter an image URL')
      return
    }

    if (!canUploadMore) {
      onValidationError(`Maximum ${maxImages} images allowed`)
      return
    }

    setIsValidatingUrl(true)
    
    try {
      const validation = await validateImageUrl(imageUrl)
      
      if (!validation.valid) {
        onValidationError(validation.error)
        setIsValidatingUrl(false)
        return
      }

      // Create a mock file object for URL images
      const urlImage = {
        file: null, // No actual file for URLs
        previewUrl: imageUrl,
        filename: imageUrl.split('/').pop() || 'image.jpg',
        size: 0, // Unknown size for URLs, won't count towards storage
        isUrl: true,
        originalUrl: imageUrl,
        width: validation.width,
        height: validation.height
      }

      await onImageUpload(urlImage)
      setImageUrl('')
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
    if (!disabled && canUploadMore && imageSource === 'upload') {
      fileInputRef.current?.click()
    }
  }

  const getUploadText = () => {
    if (mode === 'default') {
      return currentImages.length > 0 
        ? 'Replace Image' 
        : 'Add Image'
    } else {
      return `Add Images (${currentImages.length}/${maxImages})`
    }
  }

  const getDescriptionText = () => {
    if (mode === 'default') {
      return 'Upload one image in any supported format'
    } else {
      const remaining = maxImages - currentImages.length
      const min = Math.max(0, 3 - currentImages.length)
      return remaining > 0 
        ? `Upload ${remaining} more images (minimum ${min} required)`
        : 'Maximum images reached'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">{getUploadText()}</h4>
        <span className="text-xs text-[var(--grey-2)]">
          {mode === 'default' ? '1 image max' : `${currentImages.length}/5 images`}
        </span>
      </div>

      {/* Image Source Selector */}
      {canUploadMore && (
        <div className="flex gap-2 p-1 bg-[var(--dark-3)] rounded-lg">
          <button
            onClick={() => setImageSource('upload')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              imageSource === 'upload'
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--grey-1)] hover:text-white hover:bg-[var(--dark-2)]'
            }`}
          >
            <FiUpload size={16} />
            Upload File
          </button>
          <button
            onClick={() => setImageSource('url')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              imageSource === 'url'
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--grey-1)] hover:text-white hover:bg-[var(--dark-2)]'
            }`}
          >
            <FiLink size={16} />
            Image URL
          </button>
        </div>
      )}

      {/* Upload Interface */}
      {imageSource === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${isDragOver 
              ? 'border-[var(--primary)] bg-[var(--primary)]/10' 
              : canUploadMore 
                ? 'border-[var(--grey-0)] hover:border-[var(--primary)]/50 hover:bg-[var(--dark-1)]'
                : 'border-[var(--grey-0)] bg-[var(--dark-1)] opacity-50 cursor-not-allowed'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            multiple={mode === 'multiple'}
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || !canUploadMore}
          />

          <div className="flex flex-col items-center gap-3">
            {isUploading ? (
              <>
                <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-[var(--grey-1)]">Uploading...</span>
              </>
            ) : (
              <>
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${canUploadMore 
                    ? 'bg-[var(--primary)]/20 text-[var(--primary)]' 
                    : 'bg-[var(--grey-0)] text-[var(--grey-2)]'
                  }
                `}>
                  {mode === 'default' ? (
                    <FiImage size={24} />
                  ) : (
                    <FiPlus size={24} />
                  )}
                </div>
                
                <div>
                  <p className={`text-sm font-medium ${canUploadMore ? 'text-white' : 'text-[var(--grey-2)]'}`}>
                    {canUploadMore ? 'Drag & Drop Images' : 'Upload Complete'}
                  </p>
                  <p className="text-xs text-[var(--grey-1)] mt-1">
                    {canUploadMore ? 'or click to browse' : getDescriptionText()}
                  </p>
                </div>

                {canUploadMore && (
                  <button
                    type="button"
                    className="mt-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                    disabled={disabled}
                  >
                    <FiUpload size={14} />
                    Choose Files
                  </button>
                )}
              </>
            )}
          </div>

          {/* File Format Info */}
          <div className="mt-4 text-xs text-[var(--grey-2)]">
            <p>Supported formats: JPG, PNG, GIF, WebP</p>
            <p>Maximum file size: 5MB per image</p>
            {mode === 'multiple' && <p>Total size limit: 25MB</p>}
          </div>
        </div>
      )}

      {/* URL Input Interface */}
      {imageSource === 'url' && canUploadMore && (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://example.com/image.jpg"
              className="w-full p-3 pr-12 bg-[var(--dark-2)] border border-[var(--grey-0)] rounded-lg text-white placeholder-[var(--grey-2)] focus:border-[var(--primary)] outline-none transition-colors"
              disabled={disabled || isValidatingUrl}
            />
            <button
              onClick={handleUrlSubmit}
              disabled={disabled || isValidatingUrl || !imageUrl.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90 disabled:bg-[var(--grey-0)] disabled:text-[var(--grey-2)] text-white rounded-md transition-colors"
            >
              {isValidatingUrl ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiCheck size={16} />
              )}
            </button>
          </div>
          
          <div className="bg-[var(--dark-1)] p-3 rounded-lg border border-[var(--grey-0)]">
            <div className="text-xs text-[var(--grey-2)] space-y-1">
              <p>💡 <strong className="text-[var(--primary-light)]">No Storage Used:</strong> URL images don't count toward your storage limit</p>
              <p>• Enter a direct link to an image file</p>
              <p>• Image must be at least 200x200 pixels</p>
              <p>• Supported formats: JPG, PNG, GIF, WebP</p>
              <p>• Must be publicly accessible (no login required)</p>
            </div>
          </div>
        </div>
      )}

      {/* Additional Info for Multiple Mode */}
      {mode === 'multiple' && (
        <div className="bg-[var(--dark-1)] p-3 rounded-lg border border-[var(--grey-0)]">
          <p className="text-xs text-[var(--grey-1)] leading-relaxed">
            <strong className="text-white">Multiple Images Mode:</strong> Create a character gallery with 3-5 images. 
            These will be displayed in a carousel format, allowing users to view different expressions, outfits, or scenes.
          </p>
        </div>
      )}
    </div>
  )
}

export default ImageUploadInterface