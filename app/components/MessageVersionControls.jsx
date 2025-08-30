import React from 'react';
import { FiRotateCcw, FiChevronLeft, FiChevronRight, FiLoader, FiRefreshCw } from 'react-icons/fi';

const MessageVersionControls = ({ 
  message, 
  isLatest, 
  isTyping,
  isRegenerating,
  onRegenerate, 
  onVersionChange 
}) => {
  if (!message) return null;

  const hasMultipleVersions = message.versions?.length > 1;
  const currentIndex = message.currentVersionIndex || 1;
  const totalVersions = message.versions?.length || 1;
  
  // Don't show controls if typing
  if (isTyping || message.isTyping) {
    return null;
  }

  // Special handling for error messages
  if (message.isError) {
    return (
      <div className="version-controls flex items-center gap-2 mt-2">
        {/* Error message and retry button */}
        <div className="error-controls flex items-center gap-2 bg-red-900/30 rounded-md px-2 py-1">
          <span className="text-xs text-red-300">
            {message.errorType === 'api_key' && 'API key required'}
            {message.errorType === 'network' && 'Network error'}
            {message.errorType === 'rate_limit' && 'Rate limited'}
            {message.errorType === 'quota' && 'Quota exceeded'}
            {message.errorType === 'timeout' && 'Request timeout'}
            {message.errorType === 'generic' && 'Error occurred'}
          </span>
          
          {isLatest && (
            <button 
              onClick={onRegenerate}
              disabled={isTyping || isRegenerating}
              className="retry-btn p-1 rounded-sm text-red-300 hover:text-white hover:bg-red-500/50 
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              title="Retry"
            >
              <FiRefreshCw size={12} />
              <span className="text-xs">Retry</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="version-controls flex items-center gap-2 mt-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      {/* Version Navigation - only show if there are multiple versions */}
      {hasMultipleVersions && (
        <div className="version-navigation flex items-center gap-1 bg-[var(--grey-0)] rounded-md px-2 py-1">
          <button 
            onClick={() => onVersionChange(-1)}
            disabled={currentIndex <= 1}
            className="nav-btn p-1 rounded-sm text-[var(--grey-1)] hover:text-white hover:bg-[var(--primary)] 
                       transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous version"
          >
            <FiChevronLeft size={12} />
          </button>
          
          <span className="version-indicator text-xs text-[var(--grey-1)] font-mono min-w-[32px] text-center">
            {currentIndex}/{totalVersions}
          </span>
          
          <button 
            onClick={() => onVersionChange(1)}
            disabled={currentIndex >= totalVersions}
            className="nav-btn p-1 rounded-sm text-[var(--grey-1)] hover:text-white hover:bg-[var(--primary)] 
                       transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next version"
          >
            <FiChevronRight size={12} />
          </button>
        </div>
      )}
      
      {/* Regenerate Button - only show for latest messages */}
      {isLatest && (
        <button 
          onClick={onRegenerate}
          disabled={isTyping}
          className="regenerate-btn p-1.5 rounded-md bg-[var(--grey-0)] text-[var(--grey-1)] 
                     hover:bg-[var(--primary)] hover:text-white transition-colors 
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          title={isRegenerating ? "Regenerating..." : "Regenerate response"}
        >
          {isRegenerating ? (
            <>
              <FiLoader className="animate-spin" size={14} />
              <span className="text-xs">Regenerating...</span>
            </>
          ) : (
            <FiRotateCcw size={14} />
          )}
        </button>
      )}
    </div>
  );
};

export default MessageVersionControls;