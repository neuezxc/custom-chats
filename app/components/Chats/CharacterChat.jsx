import React, { useEffect, useState } from "react";
import useChatStore from "../../../stores/useChatStore";
import { FiRotateCcw, FiLoader } from "react-icons/fi";
import MessageVersionControls from "../MessageVersionControls";
import { detectEmotionFromResponse, removeEmotionTags } from "../../utils/emotionUtils";
import DraggableImagePopup from "../DraggableImagePopup";

function CharacterChat({ message, character, isLatest = false, isRegenerating: isMessageRegenerating = false }) {
  const { 
    currentUser, 
    regenerateLastMessage, 
    regenerateMessageWithVersions,
    changeMessageVersion,
    isTyping,
    isRegenerating,
    updateLastLLMResponse,
    setCharacterEmotion,
    displaySettings
  } = useChatStore();
  
  const [showImagePopup, setShowImagePopup] = useState(false);
  
  // Handle regenerate button click (legacy support)
  const handleRegenerate = async () => {
    if (isTyping || !isLatest || message.isTyping) {
      return;
    }
    // Allow regeneration of error messages
    await regenerateLastMessage();
  };
  
  // Handle version-based regeneration
  const handleRegenerateWithVersions = async () => {
    if (isTyping || isRegenerating || !isLatest || message.isTyping) {
      return;
    }
    // Allow regeneration of error messages
    await regenerateMessageWithVersions(message.id);
  };
  
  // Handle retry for error messages
  const handleRetry = async () => {
    if (isTyping || isRegenerating || !isLatest || !message.isError) {
      return;
    }
    await regenerateMessageWithVersions(message.id);
  };
  
  // Handle version navigation
  const handleVersionChange = (direction) => {
    if (isTyping || isRegenerating) return;
    changeMessageVersion(message.id, direction);
  };
  
  // Emotion detection effect - process character messages for emotion tags
  useEffect(() => {
    if (message && message.type === 'character' && message.content) {
      // Update last LLM response for emotion detection
      updateLastLLMResponse(message.content);
      
      // Detect emotion from the message content
      const detectedEmotion = detectEmotionFromResponse(message.content);
      
 
 
      
      if (detectedEmotion && character) {
 
        setCharacterEmotion(character.id, detectedEmotion);
      }
    }
  }, [message, character, updateLastLLMResponse, setCharacterEmotion]);
  
  if (!message) return null;
  
  // Debug logging for regeneration state
  if (isMessageRegenerating) {
 
  }
  
  // Enhanced function to process all text formatting
  const processTextFormatting = (text) => {
    if (!text || typeof text !== 'string') return '';
    
    // First remove emotion tags (they're used for gallery, not display)
    let processedText = removeEmotionTags(text);
    
    
    // Replace placeholders with actual names
    processedText = processedText.replace(/\{\{char\}\}/g, character.name || 'Character');
    processedText = processedText.replace(/\{\{user\}\}/g, currentUser.name || 'User');
    
    // Process line breaks first
    processedText = processedText.replace(/\n/g, '<br/>');
    
    // Process single asterisks (*text*) - italic with 40% opacity
    processedText = processedText.replace(/\*([^*]+?)\*/g, 
      '<em>$1</em>');
    
    // Process quoted text ("text") - primary light color, normal opacity
    processedText = processedText.replace(/"([^"\n]*?)"/g, 
      '<span class="quoted-text">$1</span>');
    
    return processedText;
  };
  
  return (
    <div id="character-chat" className="flex flex-row gap-3 animate-fade-in group">
      <div
        id="character-icon"
        className="h-[50px] w-[50px] rounded-[var(--border-radius)] bg-[var(--grey-0)] flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative"
        onClick={() => character.avatar && setShowImagePopup(true)}
      >
        {character.avatar ? (
          <img
            src={character.avatar}
            alt={character.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 rounded-[var(--border-radius)] flex items-center justify-center text-white font-semibold text-lg">
            {character.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        )}
      </div>
      
      {/* Draggable Image Popup */}
      {character.avatar && (
        <DraggableImagePopup
          isOpen={showImagePopup}
          onClose={() => setShowImagePopup(false)}
          imageSrc={character.avatar}
          altText={`${character.name} avatar`}
        />
      )}
      
      <div id="character-bubble" className="flex-1 max-w-[80%] relative">
        {message.isTyping ? (
        <div className="flex gap-2 bot-end flex-col opacity-[70%]">
            <div className="flex gap-1 h-[30px] w-[50px] rounded bg-[var(--grey-0)] items-center justify-center">
              <div className="w-2 h-2 bg-[var(--grey-1)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[var(--grey-1)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-[var(--grey-1)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        ) : (
          <>
            {/* Show regeneration loading indicator if this message is being regenerated */}
            {isMessageRegenerating ? (
              <div className="flex items-center gap-2 text-white/60 py-2">
                <FiLoader className="animate-spin" size={16} />
                <span className="text-sm">Regenerating response...</span>
              </div>
            ) : (
              <>
                <div 
                  id="character-text" 
                  className={`prose prose-xs sm:prose-sm max-w-none ${
                    message.isError ? 'text-red-400' : 'text-white'
                  }`}
                  style={{
                    fontSize: displaySettings.textSize === 'small' ? '0.875rem' : 
                             displaySettings.textSize === 'large' ? '1.125rem' : '1rem'
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: processTextFormatting(message.content)
                    }}
                  />
                </div>
                
                {/* Show error indicator for error messages */}
                {message.isError && (
                  <div className="error-indicator flex items-center gap-1 mt-1">
                    <span className="text-xs text-red-400/70">
                      {message.errorType === 'api_key' && 'API key required - check settings'}
                      {message.errorType === 'network' && 'Network error - check connection'}
                      {message.errorType === 'rate_limit' && 'Rate limited - try again later'}
                      {message.errorType === 'quota' && 'Quota exceeded - check billing'}
                      {message.errorType === 'timeout' && 'Request timeout - try again'}
                      {message.errorType === 'generic' && 'Error occurred - try again'}
                    </span>
                  </div>
                )}
                
                {/* Version Controls - shows version navigation and regenerate button */}
                <MessageVersionControls
                  message={message}
                  isLatest={isLatest}
                  isTyping={isTyping || isRegenerating}
                  isRegenerating={isMessageRegenerating}
                  onRegenerate={message.isError ? handleRetry : handleRegenerateWithVersions}
                  onVersionChange={handleVersionChange}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CharacterChat;
