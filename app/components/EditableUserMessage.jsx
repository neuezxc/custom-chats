import { useRef, useEffect } from 'react';

function EditableUserMessage({ content, onChange, onSave, onCancel }) {
  const textareaRef = useRef(null);
  
  useEffect(() => {
    // Auto-focus and position cursor at end
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, []);
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };
  
  // Auto-resize textarea based on content
  const handleChange = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';
    onChange(e.target.value);
  };
  
  useEffect(() => {
    // Initial resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 300) + 'px';
    }
  }, [content]);
  
  return (
    <div className="editable-message w-full">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="edit-textarea w-full min-h-[60px] max-h-[300px] bg-[var(--dark-0)] border border-[var(--primary)] rounded-[var(--border-radius)] text-white p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50"
        placeholder="Type your message..."
      />
      <div className="edit-controls flex gap-2 mt-2 justify-end">
        <button 
          onClick={onSave} 
          className="save-btn bg-[var(--primary)] text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-opacity-80 transition-colors"
        >
          Save
        </button>
        <button 
          onClick={onCancel} 
          className="cancel-btn bg-[var(--grey-0)] text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-opacity-80 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default EditableUserMessage;