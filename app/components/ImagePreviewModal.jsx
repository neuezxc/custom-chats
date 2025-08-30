import { useState, useEffect } from 'react'
import { FiX, FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut } from 'react-icons/fi'

function ImagePreviewModal({ 
  isOpen, 
  onClose, 
  images = [], 
  initialIndex = 0,
  showNavigation = true 
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  // Touch gesture threshold
  const minSwipeDistance = 50

  useEffect(() => {
    setCurrentIndex(initialIndex)
    setZoomLevel(1)
    setPanPosition({ x: 0, y: 0 })
  }, [initialIndex, isOpen])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return
      
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
        case '+':
        case '=':
          zoomIn()
          break
        case '-':
          zoomOut()
          break
        case '0':
          resetZoom()
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, currentIndex])

  const currentImage = images[currentIndex]
  const hasMultipleImages = images.length > 1

  const goToNext = () => {
    if (hasMultipleImages) {
      setCurrentIndex((prev) => (prev + 1) % images.length)
      resetZoom()
    }
  }

  const goToPrevious = () => {
    if (hasMultipleImages) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
      resetZoom()
    }
  }

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev * 1.2, 4))
  }

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev / 1.2, 0.5))
  }

  const resetZoom = () => {
    setZoomLevel(1)
    setPanPosition({ x: 0, y: 0 })
  }

  const handleImageClick = (e) => {
    // Prevent closing when clicking on the image itself
    e.stopPropagation()
  }

  const handleMouseDown = (e) => {
    e.stopPropagation()
    if (zoomLevel > 1) {
      setIsPanning(true)
    }
  }

  const handleMouseMove = (e) => {
    if (isPanning && zoomLevel > 1) {
      setPanPosition(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }))
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  // Touch gesture handlers for mobile
  const handleTouchStart = (e) => {
    e.stopPropagation()
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    e.stopPropagation()
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = (e) => {
    e.stopPropagation()
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && hasMultipleImages) {
      goToNext()
    }
    if (isRightSwipe && hasMultipleImages) {
      goToPrevious()
    }
  }

  if (!isOpen || !currentImage) return null

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
      onClick={(e) => {
        // Only close if the click was directly on the backdrop (not on child elements)
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/50 hover:bg-black/70 text-white p-3 sm:p-3 rounded-full transition-colors z-10 touch-manipulation"
        aria-label="Close preview"
      >
        <FiX size={24} />
      </button>

      {/* Zoom Controls */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex gap-1 sm:gap-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation()
            zoomIn()
          }}
          className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors touch-manipulation"
          aria-label="Zoom in"
        >
          <FiZoomIn size={20} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            zoomOut()
          }}
          className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors touch-manipulation"
          aria-label="Zoom out"
        >
          <FiZoomOut size={20} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            resetZoom()
          }}
          className="bg-black/50 hover:bg-black/70 text-white px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm transition-colors touch-manipulation"
          aria-label="Reset zoom"
        >
          1:1
        </button>
      </div>

      {/* Navigation Arrows */}
      {showNavigation && hasMultipleImages && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors touch-manipulation"
            aria-label="Previous image"
          >
            <FiChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors touch-manipulation"
            aria-label="Next image"
          >
            <FiChevronRight size={24} />
          </button>
        </>
      )}

      {/* Image Counter */}
      {hasMultipleImages && (
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Main Image */}
      <div className="w-full h-full flex items-center justify-center p-4 sm:p-8">
        <img
          src={currentImage.previewUrl}
          alt={currentImage.filename}
          className={`max-w-full max-h-full object-contain transition-transform duration-200 select-none ${
            zoomLevel > 1 ? 'cursor-grab' : 'cursor-zoom-in'
          } ${isPanning ? 'cursor-grabbing' : ''}`}
          style={{
            transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
            transformOrigin: 'center center'
          }}
          onClick={zoomLevel === 1 ? zoomIn : handleImageClick}
          onMouseDown={handleMouseDown}
          draggable={false}
        />
      </div>

      {/* Image Info */}
      <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-black/50 text-white px-2 sm:px-3 py-1 sm:py-2 rounded text-xs max-w-xs">
        <p className="truncate">{currentImage.filename}</p>
        {currentImage.isUrl && (
          <p className="text-blue-300">URL Image</p>
        )}
      </div>
    </div>
  )
}

export default ImagePreviewModal