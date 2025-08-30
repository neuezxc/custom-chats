import { FiLoader } from "react-icons/fi";
import useChatStore from "../../stores/useChatStore";

function LoadingMessage() {
  const { currentCharacter } = useChatStore();
  
  return (
    <div id="character-chat" className="flex flex-row gap-3">
      <div
        id="character-icon"
        className="h-[50px] w-[50px] rounded-[var(--border-radius)] bg-[var(--grey-0)] overflow-hidden flex-shrink-0 flex items-center justify-center"
      >
        {currentCharacter.avatar ? (
          <img
            src={currentCharacter.avatar}
            alt={currentCharacter.name}
            className="max-w-full max-h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 rounded-[var(--border-radius)] flex items-center justify-center text-white font-semibold text-lg">
            {currentCharacter.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        )}
      </div>
      <div id="character-bubble" className="flex-1 max-w-[80%]">
        <div className="flex items-center gap-2 text-white/60">
          <FiLoader className="animate-spin" />
          <span className="text-sm">{currentCharacter.name} is typing...</span>
        </div>
      </div>
    </div>
  );
}

export default LoadingMessage;