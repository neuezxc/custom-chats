import { FiUser, FiEdit, FiTrash2 } from "react-icons/fi";
import { useState } from "react";
import useChatStore from "../../../stores/useChatStore";
import EditableUserMessage from "../EditableUserMessage";
import DeleteConfirmationModal from "../DeleteConfirmationModal";

function UserChat({ message, messageIndex, isLastUserMessage }) {
  const { 
    currentUser, 
    currentCharacter, 
    enableMessageEdit, 
    editLastUserMessage, 
    cancelMessageEdit, 
    isTyping, 
    isRegenerating,
    deleteUserMessage 
  } = useChatStore();
  const [editContent, setEditContent] = useState(message.content);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  if (!message) return null;
  
  const handleEdit = () => {
    if (isLastUserMessage && !isTyping && !isRegenerating) {
      enableMessageEdit(message.id);
      setEditContent(message.content);
    }
  };
  
  const handleSave = () => {
    editLastUserMessage(editContent);
  };
  
  const handleCancel = () => {
    cancelMessageEdit(message.id);
    setEditContent(message.content);
  };
  
  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };
  
  const handleConfirmDelete = () => {
    deleteUserMessage(messageIndex);
    setShowDeleteConfirmation(false);
  };
  
  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };
  
  // Enhanced function to process all text formatting
  const processTextFormatting = (text) => {
    if (!text || typeof text !== 'string') return '';
    
    // First escape HTML to prevent injection
    let processedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Replace placeholders with actual names
    processedText = processedText.replace(/\{\{char\}\}/g, currentCharacter.name || 'Character');
    processedText = processedText.replace(/\{\{user\}\}/g, currentUser.name || 'User');
    
    // Process line breaks first
    processedText = processedText.replace(/\n/g, '<br/>');
    
    // Process double asterisks (**text**) - italic with 40% opacity
    processedText = processedText.replace(/\*\*((?:[^*]|\*(?!\*))+?)\*\*/g, 
      '<em>$1</em>');
    
    // Process quoted text ("text") - primary light color, normal opacity
    processedText = processedText.replace(/"([^"\n]*?)"/g, 
      '<span class="quoted-text">"$1"</span>');
    
    return processedText;
  };
  
  return (
    <div id="user-chat" className="flex flex-row-reverse gap-3 animate-fade-in user-chat-container group ">
      <div
        id="user-icon"
        className="h-[50px] w-[50px] flex-shrink-0 rounded-[var(--border-radius)] bg-[var(--grey-0)] overflow-hidden flex items-center justify-center"
      >
        {currentUser.avatar ? (
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 rounded-[var(--border-radius)] flex items-center justify-center text-white font-semibold text-lg">
            {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
      </div>

      <div
        id="user-bubble"
        className="max-w-[80%] self-end  p-3 px-5 rounded-[var(--border-radius)] relative"
      >
        {message.isEditing ? (
          <EditableUserMessage 
            content={editContent}
            onChange={setEditContent}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <>
            <div 
              id="user-text" 
              className="text-start prose prose-sm max-w-none text-white"
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: processTextFormatting(message.content)
                }}
              />
            </div>
            
            {/* Message controls */}
            <div className="flex items-center justify-end mt-2 gap-2">
              {/* Edited indicator */}
              {message.isEdited && (
                <span className="edited-indicator text-xs text-[var(--grey-1)] italic opacity-75">
                  (edited)
                </span>
              )}
              
              {/* Edit button - only show for last user message when not typing */}
              {isLastUserMessage && !isTyping && !isRegenerating && (
                <button
                  onClick={handleEdit}
                  className="edit-btn opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[var(--grey-0)] hover:bg-opacity-80 border-none rounded p-1.5 text-white cursor-pointer"
                  title="Edit message"
                >
                  <FiEdit size={14} />
                </button>
              )}
              
              {/* Delete button - show for any user message when not typing */}
              {!isTyping && !isRegenerating && (
                <button
                  onClick={handleDelete}
                  className="delete-btn opacity-0 group-hover:opacity-100 transition-all duration-200 bg-[var(--grey-0)] hover:bg-red-600 border-none rounded p-1.5 text-white cursor-pointer"
                  title="Delete message"
                >
                  <FiTrash2 size={14} />
                </button>
              )}
            </div>
          </>
        )}
        
        {/* Future: Additional message action buttons */}
        <div id="user-btns" className="hidden">
          {/* Copy, Delete buttons will go here */}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal 
        isOpen={showDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

export default UserChat;
