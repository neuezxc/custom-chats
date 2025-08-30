import { FiImage, FiGrid, FiHeart } from 'react-icons/fi'

function GalleryModeSelector({ selectedMode, onModeChange, disabled = false }) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-white">Gallery Mode</h4>
      
      <div className="space-y-3">
        {/* Default Mode */}
        <label 
          className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
            selectedMode === 'default'
              ? 'border-[var(--primary)] bg-[var(--primary)]/10'
              : 'border-[var(--grey-0)] bg-[var(--dark-1)] hover:border-[var(--primary)]/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="radio"
            name="galleryMode"
            value="default"
            checked={selectedMode === 'default'}
            onChange={(e) => onModeChange(e.target.value)}
            disabled={disabled}
            className="mt-1 w-4 h-4 text-[var(--primary)] bg-[var(--dark-2)] border-[var(--grey-0)] focus:ring-[var(--primary)] focus:ring-2"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FiImage size={16} className="text-[var(--primary)]" />
              <span className="font-medium text-white">Default (Single Image)</span>
            </div>
            <p className="text-sm text-[var(--grey-1)] leading-relaxed">
              Upload one image in any supported format. Perfect for character portraits and simple avatars.
            </p>
            <div className="mt-2 text-xs text-[var(--grey-2)]">
              • Maximum: 1 image
              • File size: Up to 5MB
              • Formats: JPG, PNG, GIF, WebP
            </div>
          </div>
        </label>

        {/* Multiple Images Mode */}
        <label 
          className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
            selectedMode === 'multiple'
              ? 'border-[var(--primary)] bg-[var(--primary)]/10'
              : 'border-[var(--grey-0)] bg-[var(--dark-1)] hover:border-[var(--primary)]/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="radio"
            name="galleryMode"
            value="multiple"
            checked={selectedMode === 'multiple'}
            onChange={(e) => onModeChange(e.target.value)}
            disabled={disabled}
            className="mt-1 w-4 h-4 text-[var(--primary)] bg-[var(--dark-2)] border-[var(--grey-0)] focus:ring-[var(--primary)] focus:ring-2"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FiGrid size={16} className="text-[var(--primary)]" />
              <span className="font-medium text-white">Multiple Images (3-5 Images)</span>
            </div>
            <p className="text-sm text-[var(--grey-1)] leading-relaxed">
              Upload multiple images to create a character gallery. Great for showing different expressions, outfits, or scenes.
            </p>
            <div className="mt-2 text-xs text-[var(--grey-2)]">
              • Range: 3-5 images
              • File size: Up to 5MB each
              • Total size: Up to 25MB
              • Formats: JPG, PNG, GIF, WebP
            </div>
          </div>
        </label>

        {/* Emotion Mode */}
        <label 
          className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
            selectedMode === 'emotion'
              ? 'border-[var(--primary)] bg-[var(--primary)]/10'
              : 'border-[var(--grey-0)] bg-[var(--dark-1)] hover:border-[var(--primary)]/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="radio"
            name="galleryMode"
            value="emotion"
            checked={selectedMode === 'emotion'}
            onChange={(e) => onModeChange(e.target.value)}
            disabled={disabled}
            className="mt-1 w-4 h-4 text-[var(--primary)] bg-[var(--dark-2)] border-[var(--grey-0)] focus:ring-[var(--primary)] focus:ring-2"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FiHeart size={16} className="text-[var(--primary)]" />
              <span className="font-medium text-white">Emotion Mode (Dynamic)</span>
            </div>
            <p className="text-sm text-[var(--grey-1)] leading-relaxed">
              Character images automatically change based on emotions detected in AI responses. Name images with emotions (e.g., happy, sad, angry).
            </p>
            <div className="mt-2 text-xs text-[var(--grey-2)]">
              • Auto-detects: &lt;Emotion="emotion_name"&gt; tags
              • Image naming: character-emotion.jpg
              • Fallback: neutral or current image
              • Compatible with uploaded files and URLs
            </div>
          </div>
        </label>
      </div>
    </div>
  )
}

export default GalleryModeSelector