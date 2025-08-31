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
import DisplaySettingsModal from "./components/DisplaySettingsModal";
import DataManagementModal from "./components/DataManagementModal";

import { FiMaximize, FiMinimize } from "react-icons/fi";
import useChatStore from "../stores/useChatStore";

export default function Home() {
  const { expandChats, setExpandChats, initializeConversations, displaySettings } = useChatStore();
  
  // Initialize conversations when page loads
  useEffect(() => {
    initializeConversations();
  }, [initializeConversations]);
  
  // Apply display settings when they change
  useEffect(() => {
    // Apply the colors to CSS variables
    document.documentElement.style.setProperty('--primary', displaySettings.primaryColor || '#5373cc');
    document.documentElement.style.setProperty('--primary-light', displaySettings.primaryLightColor || '#c0d1fc');
    
    // Apply text size class to body
    document.body.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
    document.body.classList.add(`text-size-${displaySettings.textSize || 'medium'}`);
  }, [displaySettings]);
  
  const handleExpand = () => {
    setExpandChats(!expandChats);
  };
  return (
    <div id="main" className="h-[100dvh] w-full py-4">
      <div id="wrapper" className="sm:mx-[200px] md:mx-[500px] lg:mx-[600px] h-full flex flex-col gap-4">
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
      <DisplaySettingsModal />
      <DataManagementModal />
    </div>
  );
}
