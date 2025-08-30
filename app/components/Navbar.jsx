import { FiChevronLeft, FiMenu, FiSettings, FiMessageSquare, FiUser, FiPlus, FiCode, FiUserCheck } from "react-icons/fi";
import { useState } from "react";
import useChatStore from "../../stores/useChatStore";

function Navbar() {
  const { 
    currentCharacter, 
    setShowApiSettingsModal, 
    setShowCharacterManager,
    setShowCustomSystemPrompt,
    setShowUserProfileModal,
    setCharacterManagerMode,
    clearMessages,
    expandChats,
    setExpandChats
  } = useChatStore();
  const [showMenu, setShowMenu] = useState(false);
  
  const handleNewChat = () => {
    clearMessages();
    setShowMenu(false);
  };
  
  const handleUserProfile = () => {
    setShowUserProfileModal(true);
    setShowMenu(false);
  };
  
  const handleApiSettings = () => {
    setShowApiSettingsModal(true);
    setShowMenu(false);
  };
  
  const handleCharacterManager = () => {
    setCharacterManagerMode('list');
    setShowCharacterManager(true);
    setShowMenu(false);
  };
  
  const handleGoBack = () => {
    // Toggle chat expansion to show gallery
    setExpandChats(!expandChats);
  };

  return (
    <div
      id="navbar"
      className="h-[30px] flex flex-row justify-between items-center relative"
    >
      <button onClick={handleGoBack}>
        <FiChevronLeft className="text-[1.3em] translate-x-[-5px]" />
      </button>
      
      <div className="font-medium">
        {currentCharacter.name}
      </div>
      
      <div className="relative ">
        <button onClick={() => setShowMenu(!showMenu)} className="translate-y-[-10px]">
          <div className="flex flex-col gap-1 w-[20px]">
            <div className="h-[2px] bg-white"></div>
            <div className="h-[2px] bg-white"></div>
          </div>
        </button>
        
        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-0 bg-[var(--dark-1)] border border-[var(--grey-0)] rounded-[var(--border-radius)] shadow-lg py-2 w-[220px] z-10">
            <button
              onClick={handleNewChat}
              className="w-full px-4 py-2 text-left hover:bg-[var(--dark-2)] flex items-center gap-3"
            >
              <FiMessageSquare size={16} />
              New Chat
            </button>
            <div className="h-px bg-[var(--grey-0)] my-1" />
            <div className="px-4 py-1 text-xs text-[var(--grey-2)] uppercase tracking-wide">Characters</div>
            <button
              onClick={() => {
                setCharacterManagerMode('list')
                setShowCharacterManager(true)
                setShowMenu(false)
              }}
              className="w-full px-4 py-2 text-left hover:bg-[var(--dark-2)] flex items-center gap-3"
            >
              <FiUser size={16} />
              Manage Characters
            </button>
            <button
              onClick={() => {
                setCharacterManagerMode('create')
                setShowCharacterManager(true)
                setShowMenu(false)
              }}
              className="w-full px-4 py-2 text-left hover:bg-[var(--dark-2)] flex items-center gap-3"
            >
              <FiPlus size={16} />
              Create Character
            </button>
            <div className="h-px bg-[var(--grey-0)] my-1" />
            <div className="px-4 py-1 text-xs text-[var(--grey-2)] uppercase tracking-wide">Profile</div>
            <button
              onClick={handleUserProfile}
              className="w-full px-4 py-2 text-left hover:bg-[var(--dark-2)] flex items-center gap-3"
            >
              <FiUserCheck size={16} />
              User Profile
            </button>
            <div className="h-px bg-[var(--grey-0)] my-1" />
            <div className="px-4 py-1 text-xs text-[var(--grey-2)] uppercase tracking-wide">Customization</div>
            <button
              onClick={() => {
                setShowCustomSystemPrompt(true)
                setShowMenu(false)
              }}
              className="w-full px-4 py-2 text-left hover:bg-[var(--dark-2)] flex items-center gap-3"
            >
              <FiCode size={16} />
              Custom Prompts
            </button>
            <div className="h-px bg-[var(--grey-0)] my-1" />
            <div className="px-4 py-1 text-xs text-[var(--grey-2)] uppercase tracking-wide">Settings</div>
            <button
              onClick={handleApiSettings}
              className="w-full px-4 py-2 text-left hover:bg-[var(--dark-2)] flex items-center gap-3"
            >
              <FiSettings size={16} />
              API Settings
            </button>
          </div>
        )}
        
        {/* Backdrop to close menu */}
        {showMenu && (
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => setShowMenu(false)}
          />
        )}
      </div>
    </div>
  );
}


export default Navbar