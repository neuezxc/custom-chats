"use client";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import SuperInput from "./components/SuperInput";
import Gallery from "./components/Gallery";
import Chats from "./components/Chats/Index";
import ApiSettingsModal from "./components/ApiSettingsModal";
import CharacterManager from "./components/CharacterManager";
import CustomSystemPrompt from "./components/CustomSystemPrompt";
import UserProfileModal from "./components/UserProfileModal";

import { FiMaximize, FiMinimize } from "react-icons/fi";
import useChatStore from "../stores/useChatStore";

export default function Home() {
  const { expandChats, setExpandChats, initializeConversations } = useChatStore();
  
  // Initialize conversations when page loads
  useEffect(() => {
    initializeConversations();
  }, [initializeConversations]);
  
  const handleExpand = () => {
    setExpandChats(!expandChats);
  };
  return (
    <div id="main" className="h-screen w-full py-4">
      <div id="wrapper" className="sm:mx-[200px] md:mx-[500px] lg:mx-[600px] h-full   flex flex-col gap-4">
        <div id="wrapper-content" className="flex-1 mx-[10px] flex flex-col gap-2 h-full">
          <Navbar />
          {expandChats && <Gallery />}
          <div className="flex gap-3 h-[30px] items-center">
            <div className="flex-1 border-t border-l h-[10px] translate-y-[5px] opacity-10"></div>
            <button onClick={handleExpand}>
              {expandChats ? <FiMaximize /> : <FiMinimize />}
            </button>
          </div>
          <Chats />
          <SuperInput />
        </div>
      </div>
      <ApiSettingsModal />
      <CharacterManager />
      <CustomSystemPrompt />
      <UserProfileModal />
    </div>
  );
}
