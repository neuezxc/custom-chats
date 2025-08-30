import { useState, useEffect, useRef } from 'react'
import { FiChevronLeft, FiChevronRight, FiImage } from 'react-icons/fi'
import useChatStore from '../../stores/useChatStore'
import ImagePreviewModal from './ImagePreviewModal'
import { getAvailableEmotions, mapEmotionToImage, getFallbackEmotion } from '../utils/emotionUtils'

function Gallery() {
  const { currentCharacter, lastLLMResponse, getCharacterEmotion, emotionStates } = useChatStore()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [showControls, setShowControls] = useState(false)
  const [emotionImage, setEmotionImage] = useState(null)
  const [currentEmotion, setCurrentEmotion] = useState('neutral')
  const controlsTimeoutRef = useRef(null)
  
  // Cleanup timeout on unmount - MOVED TO TOP TO AVOID HOOKS ORDER VIOLATION
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])
  
  const imageGallery = currentCharacter?.imageGallery
  const hasImages = imageGallery?.images?.length > 0
  const isEmotionMode = imageGallery?.mode === 'emotion'
  
  // Touch gesture threshold for swipe detection
  const minSwipeDistance = 50
  // Controls auto-hide timeout (3 seconds)
  const controlsTimeout = 3000
  
  // Emotion detection and image switching effect
  useEffect(() => {
    if (!isEmotionMode || !hasImages || !currentCharacter) return;
    
    const currentCharacterEmotion = getCharacterEmotion(currentCharacter.id);
    
    console.log('🎭 Emotion debug:', {
      isEmotionMode,
      currentCharacterEmotion,
      characterId: currentCharacter.id,
      lastLLMResponse
    });
    
    if (currentCharacterEmotion) {
      setCurrentEmotion(currentCharacterEmotion);
      
      const availableEmotions = getAvailableEmotions(imageGallery.images);
      console.log('😀 Available emotions:', availableEmotions);
      
      let targetEmotion = currentCharacterEmotion;
      
      // Check if the detected emotion has a corresponding image
      if (!availableEmotions.includes(currentCharacterEmotion)) {
        console.log('❌ Emotion not found, using fallback');
        // Fallback to best available emotion
        targetEmotion = getFallbackEmotion(availableEmotions) || 'neutral';
      }
      
      console.log('🎯 Target emotion:', targetEmotion);
      
      const newEmotionImage = mapEmotionToImage(targetEmotion, imageGallery.images);
      console.log('🖼️ New emotion image:', newEmotionImage);
      
      if (newEmotionImage) {
        setEmotionImage(newEmotionImage);
      }
    } else {
      // Initialize with fallback emotion if no emotion detected yet
      const availableEmotions = getAvailableEmotions(imageGallery.images);
      const fallbackEmotion = getFallbackEmotion(availableEmotions);
      if (fallbackEmotion) {
        const fallbackImage = mapEmotionToImage(fallbackEmotion, imageGallery.images);
        if (fallbackImage) {
          setEmotionImage(fallbackImage);
          setCurrentEmotion(fallbackEmotion);
        }
      }
    }
  }, [isEmotionMode, hasImages, currentCharacter, getCharacterEmotion, imageGallery, lastLLMResponse]);
  
  // Initialize emotion image when switching to emotion mode
  useEffect(() => {
    if (isEmotionMode && hasImages && !emotionImage) {
      const availableEmotions = getAvailableEmotions(imageGallery.images);
      const fallbackEmotion = getFallbackEmotion(availableEmotions);
      if (fallbackEmotion) {
        const fallbackImage = mapEmotionToImage(fallbackEmotion, imageGallery.images);
        if (fallbackImage) {
          setEmotionImage(fallbackImage);
          setCurrentEmotion(fallbackEmotion);
        }
      }
    }
  }, [isEmotionMode, hasImages, emotionImage, imageGallery]);
  
  // Controls visibility management
  const showControlsTemporarily = () => {
    setShowControls(true)
    
    // Clear existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    
    // Set new timeout to hide controls
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, controlsTimeout)
  }

  const hideControls = () => {
    setShowControls(false)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
  }
  
  if (!hasImages) {
    return (
      <div id="gallery" className="aspect-video bg-[var(--dark-1)] rounded-[var(--border-radius)] flex items-center justify-center border-2 border-dashed border-[var(--grey-0)]">
        <div className="text-center">
          <FiImage size={48} className="text-[var(--grey-2)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">{currentCharacter?.name || 'Character'}</h3>
          <p className="text-sm text-[var(--grey-1)] mb-1">No images available</p>
          <p className="text-xs text-[var(--grey-2)]">Add images in the Character Manager</p>
        </div>
      </div>
    )
  }
  
  const currentImage = imageGallery.images[imageGallery.mode === 'multiple' ? currentImageIndex : 0]
  const isMultipleMode = imageGallery.mode === 'multiple' && imageGallery.images.length > 1
  
  // For emotion mode, use emotion image; for other modes, use current/active image
  const displayImage = isEmotionMode 
    ? (emotionImage ? { previewUrl: emotionImage, filename: `emotion-${currentEmotion}` } : currentImage)
    : currentImage
  
  const nextImage = () => {
    if (isMultipleMode) {
      setCurrentImageIndex((prev) => (prev + 1) % imageGallery.images.length)
    }
  }
  
  const previousImage = () => {
    if (isMultipleMode) {
      setCurrentImageIndex((prev) => (prev - 1 + imageGallery.images.length) % imageGallery.images.length)
    }
  }
  
  const goToImage = (index) => {
    if (isMultipleMode) {
      setCurrentImageIndex(index)
    }
  }

  const openPreview = (index = null) => {
    const targetIndex = index !== null ? index : (isMultipleMode ? currentImageIndex : 0)
    setPreviewIndex(targetIndex)
    setShowPreview(true)
  }

  // Touch gesture handlers
  const handleTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      // Reset touch state if incomplete
      resetTouchState()
      return
    }
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if ((isLeftSwipe || isRightSwipe) && isMultipleMode) {
      if (isLeftSwipe) {
        nextImage()
      } else {
        previousImage()
      }
      showControlsTemporarily() // Show controls briefly after swipe
      resetTouchState() // Reset after handling swipe
    }
    
    // Note: For taps (non-swipe), touch state will be reset in handleImageTap
  }

  // Handle tap to show controls or open preview
  const handleImageTap = (e) => {
    // For touch devices - check if it was a swipe
    if (touchStart !== null && touchEnd !== null) {
      const distance = Math.abs(touchStart - touchEnd)
      if (distance >= minSwipeDistance) {
        // It was a swipe, don't open preview
        resetTouchState()
        return
      }
      // It was a tap (small movement) - open preview
      openPreview()
      resetTouchState()
      return
    }
    
    // For mouse clicks (no touch involved) - always open preview
    openPreview()
  }

  // Reset touch state helper
  const resetTouchState = () => {
    setTouchStart(null)
    setTouchEnd(null)
  }
  
  return (
    <>
    <div id="gallery" className="aspect-video relative bg-[var(--dark-0)] rounded-[var(--border-radius)] overflow-hidden group">
      {/* Main Image Display */}
      <div 
        className="w-full h-full relative flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {displayImage?.previewUrl ? (
          <img
            src={displayImage.previewUrl}
            alt={isEmotionMode ? `Character emotion: ${currentEmotion}` : displayImage.filename}
            className="max-w-full max-h-full object-contain cursor-pointer hover:opacity-90 transition-opacity select-none"
            loading="lazy"
            onClick={handleImageTap}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--dark-2)]">
            <FiImage size={48} className="text-[var(--grey-2)]" />
          </div>
        )}
        
        {/* Navigation Arrows for Multiple Mode - Hidden by default, show on tap/hover */}
        {isMultipleMode && !isEmotionMode && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                previousImage()
                showControlsTemporarily()
              }}
              className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all ${
                showControls ? 'opacity-100' : 'opacity-0 sm:group-hover:opacity-100'
              }`}
              aria-label="Previous image"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
                showControlsTemporarily()
              }}
              className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all ${
                showControls ? 'opacity-100' : 'opacity-0 sm:group-hover:opacity-100'
              }`}
              aria-label="Next image"
            >
              <FiChevronRight size={20} />
            </button>
          </>
        )}
      </div>
      
      {/* Thumbnail Strip for Multiple Mode - Hidden by default, show on tap/hover */}
      {isMultipleMode && !isEmotionMode && (
        <div className={`absolute bottom-12 sm:bottom-16 left-2 right-2 sm:left-4 sm:right-4 transition-opacity ${
          showControls ? 'opacity-100' : 'opacity-0 sm:group-hover:opacity-100'
        }`}>
          <div className="flex gap-1 sm:gap-2 justify-center">
            {imageGallery.images.map((image, index) => (
              <button
                key={image.id}
                onClick={(e) => {
                  e.stopPropagation()
                  openPreview(index)
                }}
                className={`w-8 h-8 sm:w-12 sm:h-12 rounded-md overflow-hidden border-2 transition-all flex items-center justify-center bg-[var(--dark-2)] hover:opacity-80 ${
                  index === currentImageIndex
                    ? 'border-white scale-110'
                    : 'border-white/50 hover:border-white/80'
                }`}
              >
                {image.previewUrl ? (
                  <img
                    src={image.previewUrl}
                    alt={image.filename}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--dark-2)] flex items-center justify-center">
                    <FiImage size={16} className="text-[var(--grey-2)]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Dot Indicators for Multiple Mode - Hidden by default, show on tap/hover */}
      {isMultipleMode && !isEmotionMode && (
        <div className={`absolute bottom-2 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2 transition-opacity ${
          showControls ? 'opacity-100' : 'opacity-0 sm:group-hover:opacity-100'
        }`}>
          {imageGallery.images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                goToImage(index)
                showControlsTemporarily()
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Emotion Mode Indicator */}
      {isEmotionMode && emotionImage && (
        <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs font-medium">
          Emotion: {currentEmotion}
        </div>
      )}
    </div>

    {/* Image Preview Modal */}
    <ImagePreviewModal
      isOpen={showPreview}
      onClose={() => setShowPreview(false)}
      images={imageGallery?.images || []}
      initialIndex={previewIndex}
      showNavigation={true}
    />
    </>
  )
}

export default Gallery
