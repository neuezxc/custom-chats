import { FiX, FiImage, FiStar, FiLink } from 'react-icons/fi'

function ImagePreviewGrid({ 
  mode, 
  images = [], 
  activeImageIndex = 0, 
  onRemoveImage, 
  onSetActiveImage,
  disabled = false 
}) {
  if (images.length === 0) {
    return null
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return 'URL'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getTotalSize = () => {
    const totalBytes = images.reduce((sum, img) => sum + (img.size || 0), 0)
    const urlCount = images.filter(img => img.isUrl).length
    const fileCount = images.length - urlCount
    
    let result = []
    if (fileCount > 0) result.push(formatFileSize(totalBytes))
    if (urlCount > 0) result.push(`${urlCount} URL${urlCount > 1 ? 's' : ''}`)
    
    return result.join(' + ') || '0 Bytes'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">
          {mode === 'default' ? 'Uploaded Image' : 'Image Gallery'}
        </h4>
        <div className="text-xs text-[var(--grey-2)]">
          {mode === 'multiple' && (
            <span>{images.length} images • Total: {getTotalSize()}</span>
          )}
        </div>
      </div>

      {/* Image Grid */}
      <div className={`
        grid gap-3
        ${mode === 'default' 
          ? 'grid-cols-1' 
          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
        }
      `}>
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`
              relative group rounded-lg overflow-hidden border-2 transition-all
              ${mode === 'multiple' && index === activeImageIndex
                ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/30'
                : 'border-[var(--grey-0)] hover:border-[var(--primary)]/50'
              }
              ${mode === 'multiple' ? 'cursor-pointer' : ''}
            `}
            onClick={() => {
              if (mode === 'multiple' && onSetActiveImage && !disabled) {
                onSetActiveImage(index)
              }
            }}
          >
            {/* Image */}
            <div className={`
              bg-[var(--dark-1)] flex items-center justify-center overflow-hidden
              ${mode === 'default' ? 'aspect-video' : 'aspect-square'}
            `}>
              {image.previewUrl ? (
                <img
                  src={image.previewUrl}
                  alt={image.filename}
                  className="max-w-full max-h-full object-contain"
                  loading="lazy"
                />
              ) : (
                <FiImage size={24} className="text-[var(--grey-2)]" />
              )}
            </div>

            {/* Active Image Indicator for Multiple Mode */}
            {mode === 'multiple' && index === activeImageIndex && (
              <div className="absolute top-2 left-2 bg-[var(--primary)] text-white rounded-full p-1">
                <FiStar size={12} fill="currentColor" />
              </div>
            )}

            {/* URL Indicator */}
            {image.isUrl && (
              <div className="absolute top-2 left-2 bg-blue-500 text-white rounded-full p-1" title="URL Image - No storage used">
                <FiLink size={12} />
              </div>
            )}

            {/* Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (onRemoveImage && !disabled) {
                  onRemoveImage(image.id)
                }
              }}
              disabled={disabled}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove Image"
            >
              <FiX size={12} />
            </button>

            {/* Image Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs text-white truncate font-medium">
                {image.filename}
              </p>
              <p className="text-xs text-gray-300">
                {formatFileSize(image.size)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Multiple Mode Info */}
      {mode === 'multiple' && images.length > 0 && (
        <div className="bg-[var(--dark-1)] p-3 rounded-lg border border-[var(--grey-0)]">
          <div className="flex items-start gap-2">
            <FiStar size={14} className="text-[var(--primary)] mt-0.5 flex-shrink-0" />
            <div className="text-xs text-[var(--grey-1)] leading-relaxed">
              <p className="text-white font-medium mb-1">Active Image: {images[activeImageIndex]?.filename}</p>
              <p>
                This image will be displayed as the main character image in the gallery. 
                Click on any image to set it as active.
              </p>
              {images.length < 3 && (
                <p className="text-yellow-400 mt-1">
                  ⚠️ Minimum 3 images required for multiple mode. Current: {images.length}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Validation Status for Multiple Mode */}
      {mode === 'multiple' && (
        <div className="flex items-center justify-between text-xs">
          <span className={`
            ${images.length >= 3 
              ? 'text-green-400' 
              : 'text-yellow-400'
            }
          `}>
            {images.length >= 3 
              ? `✓ Valid gallery (${images.length} images)` 
              : `Need ${3 - images.length} more images`
            }
          </span>
          <span className="text-[var(--grey-2)]">
            Max: 5 images
          </span>
        </div>
      )}
    </div>
  )
}

export default ImagePreviewGrid