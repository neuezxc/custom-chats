import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import useChatStore from "../../../stores/useChatStore";
import CharacterChat from "./CharacterChat";
import UserChat from "./UserChat";
import LoadingMessage from "../LoadingMessage";

function Index() {
  const { messages, isTyping, isRegenerating, regeneratingMessageId, currentCharacter } = useChatStore();
  const chatEndRef = useRef(null);
  
  // Auto-scroll to bottom when new messages arrive or when regenerating
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isRegenerating]);
  
  return (
    <div id="chats" className="flex-1 overflow-y-auto">
      <div className="mr-4 flex flex-col gap-6 p-2">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[var(--grey-1)] text-center py-20">
            <div>
              <p className="text-lg mb-2">Welcome to Custom Chats!</p>
              <p className="text-sm mb-2">Chat with {currentCharacter.name} powered by AI</p>
              <p className="text-xs opacity-75">Your conversation should load shortly...</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            // Determine if this is the latest character message
            // Only allow regeneration if there's at least one user message before this character message
            let isLatest = false;
            if (message.type === 'character' && 
                index === messages.length - 1 && 
                !isTyping && !isRegenerating) {
              // Check if there are any user messages before this character message
              const hasUserMessageBefore = messages.slice(0, index).some(msg => msg.type === 'user');
              isLatest = hasUserMessageBefore;
            }
            
            // Determine if this is the last user message
            let isLastUserMessage = false;
            if (message.type === 'user') {
              // Find if there are any user messages after this one
              for (let i = index + 1; i < messages.length; i++) {
                if (messages[i].type === 'user') {
                  isLastUserMessage = false;
                  break;
                }
              }
              // If no user messages found after this one, it's the last
              if (isLastUserMessage === false && !messages.slice(index + 1).some(msg => msg.type === 'user')) {
                isLastUserMessage = true;
              }
            }
            
            return message.type === 'user' ? (
              <UserChat 
                key={message.id} 
                message={message} 
                messageIndex={index}
                isLastUserMessage={isLastUserMessage}
              />
            ) : (
              <CharacterChat 
                key={message.id} 
                message={message} 
                character={currentCharacter}
                isLatest={isLatest}
                isRegenerating={regeneratingMessageId === message.id}
              />
            );
          })
        )}
        
        {/* Typing Indicator */}
        {isTyping && (
          <CharacterChat 
            message={{
              content: '',
              isTyping: true,
              sender: currentCharacter.name
            }} 
            character={currentCharacter}
            isRegenerating={false}
          />
        )}
        
        {/* Auto-scroll anchor */}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}

export default Index;
