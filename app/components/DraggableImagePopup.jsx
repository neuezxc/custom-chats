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
  const popupRef = useRef(null);
  const headerRef = useRef(null);
  const resizeHandleRef = useRef(null);
  const imageRef = useRef(null);

  // Handle open/close animation with smooth bounce
  useEffect(() => {
    let timer;
    if (isOpen) {
      // Delay opening by 1 second
      timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
        setScale(0.8);
        setRotation(5);
        // Add smooth bounce effect
        setTimeout(() => {
          setScale(1.1);
          setRotation(-3);
          setTimeout(() => {
            setIsAnimating(false);
            setScale(1);
            setRotation(0);
          }, 300);
        }, 200);
      }, 1000);
    } else {
      setIsAnimating(true);
      setScale(0.8);
      setRotation(5);
      timer = setTimeout(() => {
        setIsVisible(false);
      }, 500);
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
      
      setPosition({
        x: (viewportWidth - defaultWidth) / 2,
        y: (viewportHeight - defaultHeight) / 2
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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
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
      
      const newWidth = Math.max(150, Math.min(resizeStart.width + widthDiff, window.innerWidth - 20));
      const newHeight = Math.max(150, Math.min(resizeStart.height + heightDiff, window.innerHeight - 20));
      
      setSize({
        width: newWidth,
        height: newHeight
      });
    }
  };

  const handleMouseUp = () => {
    // Add bounce effect when releasing drag
    if (isDragging) {
      setIsAnimating(true);
      setScale(0.95);
      setTimeout(() => {
        setIsAnimating(false);
        setScale(1);
      }, 200);
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
      
      const newWidth = Math.max(150, Math.min(resizeStart.width + widthDiff, window.innerWidth - 20));
      const newHeight = Math.max(150, Math.min(resizeStart.height + heightDiff, window.innerHeight - 20));
      
      setSize({
        width: newWidth,
        height: newHeight
      });
    }
  };

  const handleTouchEnd = () => {
    // Add bounce effect when releasing touch drag
    if (isDragging) {
      setIsAnimating(true);
      setScale(0.95);
      setTimeout(() => {
        setIsAnimating(false);
        setScale(1);
      }, 200);
    }
    setIsDragging(false);
    setIsResizing(false);
  };

  // Add global mouse/touch event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart]);

  const toggleMaximize = () => {
    if (isMaximized) {
      // Restore previous state with bounce effect
      setIsAnimating(true);
      setScale(1.05);
      setTimeout(() => {
        setPosition(previousState.position);
        setSize(previousState.size);
        setIsAnimating(false);
        setScale(1);
      }, 300);
      setIsMaximized(false);
    } else {
      // Save current state and maximize with bounce effect
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
        setIsAnimating(false);
        setScale(1);
      }, 300);
      setIsMaximized(true);
    }
  };

  const rotateImage = () => {
    setRotation(prev => prev + 90);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 touch-none"
    >
      <div
        ref={popupRef}
        className="absolute bg-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-2xl border border-[#333] overflow-hidden flex flex-col"
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
            : 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), box-shadow 0.3s ease',
          boxShadow: isDragging 
            ? '0 15px 30px rgba(0, 0, 0, 0.4)' 
            : '0 8px 25px rgba(0, 0, 0, 0.3)',
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
          <div className="flex items-center gap-2">
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
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Rotate"
            >
              <FiRotateCw size={16} className="text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMaximize();
              }}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label={isMaximized ? "Minimize" : "Maximize"}
            >
              {isMaximized ? <FiMinimize size={16} className="text-white" /> : <FiMaximize size={16} className="text-white" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
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
                transition: 'transform 0.3s ease'
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