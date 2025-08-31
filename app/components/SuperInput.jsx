import { FiArrowUp, FiUser, FiCode } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import useChatStore from "../../stores/useChatStore";
import ModelSelector from "./ModelSelector"; // Import the new ModelSelector component

function SuperInput() {
  const {
    sendMessage,
    isTyping,
    apiSettings,
    setShowApiSettingsModal,
    setShowCustomSystemPrompt,
    currentCharacter,
    customSystemPrompt,
    displaySettings
  } = useChatStore();

  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  // Check API status
  const hasApiKey = apiSettings.provider === 'gemini'
    ? apiSettings.geminiApiKey
    : apiSettings.openrouterApiKey;

  const statusColor = hasApiKey ? 'var(--status-green)' : 'var(--status-red)';
  const statusTitle = hasApiKey ? 'API configured' : 'No API key configured';

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = async () => {
    if (!message.trim() || isTyping) return;

    if (!hasApiKey) {
      setShowApiSettingsModal(true);
      return;
    }

    const messageToSend = message.trim();
    setMessage("");
    await sendMessage(messageToSend);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      id="textarea"
      className="min-h-[120px] lg:min-h-[140px] flex flex-col rounded-[var(--border-radius)] bg-[var(--dark-1)] border border-[var(--grey-0)]"
    >
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={isTyping}
        className="flex-1 p-4 resize-none min-h-[60px] max-h-[100px] overflow-y-auto bg-transparent outline-none disabled:opacity-50"
        placeholder={hasApiKey ? "Enter to send chat (type / for shortcuts)" : "Configure API key in settings to start chatting"}
        style={{
          fontSize: displaySettings.textSize === 'small' ? '14px' : 
                   displaySettings.textSize === 'large' ? '18px' : '16px'
        }}
      />

      <div className="">
        <div id="wrapper" className="lg:m-2 flex justify-between items-center">
          <div
            id="model-selection-container"
            className="flex flex-row gap-2 items-center cursor-pointer translate-y-[-5px] translate-x-[10px]"
          >
            {/* Use the new ModelSelector component */}
            <ModelSelector />

            {/* Custom System Prompt Quick Access */}
            <button
              onClick={() => setShowCustomSystemPrompt(true)}
              className={`flex items-center gap-1 px-2 h-[30px] rounded text-xs transition-colors ${customSystemPrompt.enabled
                ? 'bg-[var(--dark-1)] border border-[var(--grey-0)] text-white'
                : 'bg-[var(--dark-2)] border border-[var(--grey-0)] text-[var(--grey-1)] hover:text-white hover:border-[var(--grey-1)]'
                }`}
              title={customSystemPrompt.enabled ? 'Custom prompt active - click to edit' : 'Set custom system prompt'}
            >
              <FiCode size={12} />
              <span className="lg:inline hidden">
                {customSystemPrompt.enabled ? 'Custom' : 'Prompt'}
              </span>
            </button>

            <div title={statusTitle} className="hidden">
              <div
                className="h-[10px] w-[10px] rounded-full"
                style={{ backgroundColor: statusColor }}
              ></div>
            </div>
          </div>

          <div id="send-button" className="translate-y-[-10px] translate-x-[-10px]">
            <button
              onClick={handleSend}
              disabled={!message.trim() || isTyping || !hasApiKey}
              className="h-[40px] w-[40px] bg-[var(--primary)] rounded-[var(--border-radius)] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--primary)]/90 transition-colors"
            >
              {isTyping ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiArrowUp className="text-2xl" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperInput