import { useState, useEffect, useRef } from 'react';
import { FiX, FiMaximize, FiMinimize, FiRotateCw } from 'react-icons/fi';

function DraggableImagePopup({ isOpen, onClose, imageSrc, altText }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 300, height: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [previousState, setPreviousState] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const popupRef = useRef(null);
  const headerRef = useRef(null);
  const resizeHandleRef = useRef(null);
  const imageRef = useRef(null);

  // Handle open/close animation with smooth bounce
  useEffect(() => {
    let timer;
    if (isOpen) {
      // Immediately show the popup with a quick bounce effect
      setIsVisible(true);
      setIsAnimating(true);
      setScale(0.3);
      setOpacity(0);
      setRotation(10);
      // Add smooth bounce effect with spring physics
      setTimeout(() => {
        setScale(1.1);
        setOpacity(1);
        setRotation(-5);
        setTimeout(() => {
          setScale(1);
          setRotation(0);
          setTimeout(() => {
            setIsAnimating(false);
          }, 100);
        }, 150);
      }, 50);
    } else {
      // Smooth exit animation - scale down and fade out
      setIsAnimating(true);
      setScale(1.05); // Slight zoom first
      setOpacity(1); // Ensure it's fully visible
      
      // Then animate out smoothly
      setTimeout(() => {
        setScale(0.5);
        setOpacity(0);
        setRotation(5);
      }, 30);
      
      // Hide after animation completes
      timer = setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
      }, 350);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Center the popup when it opens
  useEffect(() => {
    if (isOpen && popupRef.current) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Responsive default size
      const defaultWidth = viewportWidth > 768 ? 300 : Math.min(300, viewportWidth - 40);
      const defaultHeight = viewportWidth > 768 ? 300 : Math.min(300, viewportHeight - 100);
      
      // Position the popup near the click point if possible, otherwise center it
      const centerX = (viewportWidth - defaultWidth) / 2;
      const centerY = (viewportHeight - defaultHeight) / 2;
      
      setPosition({
        x: centerX,
        y: centerY
      });
      
      setSize({ width: defaultWidth, height: defaultHeight });
    }
  }, [isOpen]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleMouseDown = (e) => {
    // Check if we're clicking on the resize handle
    if (e.target === resizeHandleRef.current) return;
    
    // Check if we're clicking on the close/maximize buttons
    if (e.target.closest('button')) return;
    
    e.preventDefault();
    
    // If clicking on the header, start dragging
    if (headerRef.current && headerRef.current.contains(e.target)) {
      setIsDragging(true);
      
      const rect = popupRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep within viewport bounds with better constraints
      const popupWidth = popupRef.current.offsetWidth;
      const popupHeight = popupRef.current.offsetHeight;
      const maxX = window.innerWidth - popupWidth;
      const maxY = window.innerHeight - popupHeight;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
    
    if (isResizing) {
      const widthDiff = e.clientX - resizeStart.x;
      const heightDiff = e.clientY - resizeStart.y;
      
      // Clip the size to reasonable bounds
      const newWidth = Math.max(150, Math.min(resizeStart.width + widthDiff, window.innerWidth - 20));
      const newHeight = Math.max(150, Math.min(resizeStart.height + heightDiff, window.innerHeight - 20));
      
      setSize({
        width: newWidth,
        height: newHeight
      });
    }
  };

  const handleMouseUp = () => {
    // Add smooth bounce effect when releasing drag
    if (isDragging) {
      setIsAnimating(true);
      setScale(0.98);
      setTimeout(() => {
        setScale(1);
        setTimeout(() => {
          setIsAnimating(false);
        }, 100);
      }, 100);
    }
    setIsDragging(false);
    setIsResizing(false);
  };

  // Touch events for mobile with improved handling
  const handleTouchStart = (e) => {
    // Prevent dragging when interacting with buttons
    if (e.target.closest('button')) return;
    
    const touch = e.touches[0];
    
    // If touching on the header, start dragging
    if (headerRef.current && headerRef.current.contains(e.target)) {
      const rect = popupRef.current.getBoundingClientRect();
      
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
      
      setIsDragging(true);
    } else if (e.target === resizeHandleRef.current) {
      setResizeStart({
        x: touch.clientX,
        y: touch.clientY,
        width: popupRef.current.offsetWidth,
        height: popupRef.current.offsetHeight
      });
      setIsResizing(true);
    } else {
      // Allow dragging from anywhere on the popup except resize handle and buttons
      if (e.target === resizeHandleRef.current) return;
      
      const rect = popupRef.current.getBoundingClientRect();
      
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
      
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging && !isResizing) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    
    if (isDragging) {
      const newX = touch.clientX - dragOffset.x;
      const newY = touch.clientY - dragOffset.y;
      
      // Keep within viewport bounds
      const popupWidth = popupRef.current.offsetWidth;
      const popupHeight = popupRef.current.offsetHeight;
      const maxX = window.innerWidth - popupWidth;
      const maxY = window.innerHeight - popupHeight;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
    
    if (isResizing) {
      const widthDiff = touch.clientX - resizeStart.x;
      const heightDiff = touch.clientY - resizeStart.y;
      
      // Clip the size to reasonable bounds
      const newWidth = Math.max(150, Math.min(resizeStart.width + widthDiff, window.innerWidth - 20));
      const newHeight = Math.max(150, Math.min(resizeStart.height + heightDiff, window.innerHeight - 20));
      
      setSize({
        width: newWidth,
        height: newHeight
      });
    }
  };

  const handleTouchEnd = () => {
    // Add smooth bounce effect when releasing touch drag
    if (isDragging) {
      setIsAnimating(true);
      setScale(0.98);
      setTimeout(() => {
        setScale(1);
        setTimeout(() => {
          setIsAnimating(false);
        }, 100);
      }, 100);
    }
    setIsDragging(false);
    setIsResizing(false);
  };

  // Add global mouse/touch event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart]);

  const toggleMaximize = () => {
    if (isMaximized) {
      // Restore previous state with smooth transition
      setIsAnimating(true);
      setScale(1.05);
      setTimeout(() => {
        setPosition(previousState.position);
        setSize(previousState.size);
        setScale(0.95);
        setTimeout(() => {
          setScale(1);
          setTimeout(() => {
            setIsAnimating(false);
          }, 100);
        }, 150);
      }, 150);
      setIsMaximized(false);
    } else {
      // Save current state and maximize with smooth transition
      setPreviousState({
        position: { ...position },
        size: { ...size }
      });
      
      setIsAnimating(true);
      setScale(1.05);
      setTimeout(() => {
        setPosition({ x: 10, y: 10 });
        setSize({ 
          width: window.innerWidth - 20, 
          height: window.innerHeight - 20 
        });
        setScale(0.95);
        setTimeout(() => {
          setScale(1);
          setTimeout(() => {
            setIsAnimating(false);
          }, 100);
        }, 150);
      }, 150);
      setIsMaximized(true);
    }
  };

  const rotateImage = () => {
    setRotation(prev => prev + 90);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none"
    >
      <div
        ref={popupRef}
        className="absolute bg-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-2xl border border-[#333] overflow-hidden flex flex-col pointer-events-auto"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          cursor: isDragging ? 'grabbing' : 'default',
          touchAction: isDragging || isResizing ? 'none' : 'auto',
          transform: `rotate(${rotation}deg) scale(${scale})`,
          transition: isDragging || isResizing 
            ? 'none' 
            : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.1s ease-out',
          opacity: opacity,
          boxShadow: isDragging 
            ? '0 20px 40px rgba(0, 0, 0, 0.5)' 
            : '0 10px 30px rgba(0, 0, 0, 0.4)',
          zIndex: 1000
        }}
      >
        {/* Header with glassmorphism effect */}
        <div 
          ref={headerRef}
          className="flex items-center justify-between p-3 bg-[#222]/70 backdrop-blur-sm select-none touch-none border-b border-[#333]"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="flex items-center gap-2 opacity-0">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                rotateImage();
              }}
              className="p-1.5 rounded-full hover:bg-white/10 transition-all duration-200 transform hover:scale-110"
              aria-label="Rotate"
            >
              <FiRotateCw size={16} className="text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMaximize();
              }}
              className="p-1.5 rounded-full hover:bg-white/10 transition-all duration-200 transform hover:scale-110"
              aria-label={isMaximized ? "Minimize" : "Maximize"}
            >
              {isMaximized ? <FiMinimize size={16} className="text-white" /> : <FiMaximize size={16} className="text-white" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 rounded-full hover:bg-white/10 transition-all duration-200 transform hover:scale-110"
              aria-label="Close"
            >
              <FiX size={16} className="text-white" />
            </button>
          </div>
        </div>
        
        {/* Image Container with better styling */}
        <div 
          className="flex-1 p-4 flex items-center justify-center overflow-hidden cursor-move bg-[#111]/50"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              ref={imageRef}
              src={imageSrc}
              alt={altText || 'Character'}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              draggable={false}
              style={{
                transform: `rotate(${-rotation}deg)`,
                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
          </div>
        </div>
        
        {/* Resize Handle with better visibility */}
        <div 
          ref={resizeHandleRef}
          className="w-5 h-5 self-end cursor-se-resize absolute bottom-0 right-0 flex items-end justify-end p-1"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsResizing(true);
            setResizeStart({
              x: e.clientX,
              y: e.clientY,
              width: popupRef.current.offsetWidth,
              height: popupRef.current.offsetHeight
            });
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            const touch = e.touches[0];
            setResizeStart({
              x: touch.clientX,
              y: touch.clientY,
              width: popupRef.current.offsetWidth,
              height: popupRef.current.offsetHeight
            });
            setIsResizing(true);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white/30 hover:text-white/70 transition-colors">
            <path d="M21 3L3 21M21 12L12 21M21 16.5L16.5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default DraggableImagePopup;