import {
  AppRouteRenderer,
  useAppRouter,
  AppRouteRegistrar,
} from "@/components/pc/drives";
import React, { useEffect, useState } from "react";
import HomeUI from "./ui/Home";
import { InventoryItem, SettingToggle, StatBar } from "./ui/ui_components";
import CharacterUI from "./ui/Character";
import SettingsUI from "./ui/Settings";

// Color constants
const lightBlue = '#2563eb'
const weirdBlue = '#3a6ea5'
const lightRed = '#dc2626'
const darkBlue = '#0a246a'



interface UserProfileProps {
  userId: string;
}

// Example components
const Home: React.FC = () => {

  return (
    <HomeUI/>
  );
};

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  console.log("Profile entered");
  return (
    <div className="p-6">
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {userId[0].toUpperCase()}
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-white">Player #{userId}</h1>
            <p className="text-blue-400">Elite Warrior</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsPanel />
          <InventoryPanel />
        </div>
      </div>
    </div>
  );
};

const Settings: React.FC = () => {
  return (
 <SettingsUI/>
  );
};

const Character: React.FC = () => {
  return (
   <CharacterUI/>
  );
};






const StatsPanel = () => (
  <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/30">
    <h2 className="text-xl font-bold text-white mb-4">Combat Stats</h2>
    <div className="space-y-3">
      <StatBar label="Attack" value={75} />
      <StatBar label="Defense" value={60} />
      <StatBar label="Speed" value={85} />
    </div>
  </div>
);



const InventoryPanel = () => (
  <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/30">
    <h2 className="text-xl font-bold text-white mb-4">Equipment</h2>
    <div className="grid grid-cols-2 gap-2">
      <InventoryItem name="Dragon Sword" rarity="Legendary" />
      <InventoryItem name="Shadow Armor" rarity="Epic" />
    </div>
  </div>
);


const RealmClashGame = () => {
  const { navigate, back } = useAppRouter();
  const [activeTab, setActiveTab] = useState('/');

  const routes = [
    { path: "/", component: Home },
    { path: "/user/:userId", component: UserProfile },
    { path: "/settings", component: Settings },
    { path: "/character", component: Character },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
      setActiveTab('/');
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  const handleTabClick = (path: string) => {
    navigate(path);
    setActiveTab(path);
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
      <div className="w-full rounded-lg overflow-hidden shadow-2xl border border-gray-700/50">
        {/* Window Header with gradient */}
        <div 
          className="relative"
          style={{ 
            background: `linear-gradient(to right, ${weirdBlue}, ${darkBlue})`,
          }}
        >
          {/* Navigation Bar */}
          <div className="flex items-center justify-between px-4">
            {/* Tabs container */}
            <div className="flex gap-1 flex-1">
              <TabButton
                onClick={() => handleTabClick("/")}
                label="Home"
                icon="🏰"
                isActive={activeTab === '/'}
              />
               <TabButton
                onClick={() => handleTabClick("/game")}
                label="Game"
                icon=""
                isActive={activeTab === '/game'}
              />
               <TabButton
                onClick={() => handleTabClick("/character")}
                label="Character"
                icon=""
                isActive={activeTab === '/character'}
              />
              <TabButton
                onClick={() => handleTabClick("/user/1323")}
                label="Profile"
                icon="👤"
                isActive={activeTab === '/user/1323'}
              />
              <TabButton
                onClick={() => handleTabClick("/settings")}
                label="Settings"
                icon="⚙️"
                isActive={activeTab === '/settings'}
              />
            </div>
            
            {/* Back button aligned with tabs */}
            <button
              onClick={back}
              className="px-4 py-2 my-2 rounded bg-gradient-to-r from-lightRed/80 to-red-700/80 
                       text-white hover:from-lightRed hover:to-red-700 transition-all
                       border border-red-700/30 shadow-lg hover:shadow-red-500/20
                       flex items-center gap-2"
              style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              <span>←</span>
              <span>Back</span>
            </button>
          </div>

          {/* Accent line under tabs */}
          <div 
            className="h-1 w-full"
            style={{
              background: `linear-gradient(to right, ${lightRed}, ${weirdBlue}, ${darkBlue})`
            }}
          />
        </div>

        {/* Content Area with enhanced gradient */}
        <div 
          style={{
            background: `
              linear-gradient(to bottom right, 
                rgba(37, 99, 235, 0.1),
                rgba(220, 38, 38, 0.05),
                rgba(30, 58, 138, 0.1)
              ),
              linear-gradient(to bottom, #111827, #1f2937)
            `
          }}
        >
          <AppRouteRegistrar routes={routes} />
          <AppRouteRenderer />
        </div>
      </div>
    </div>
  );
};

// Enhanced Tab Button Component
const TabButton: React.FC<{
  onClick: () => void;
  label: string;
  icon: string;
  isActive: boolean;
}> = ({ onClick, label, icon, isActive }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 text-white rounded-t-lg transition-all
      flex items-center gap-2 relative group
      ${isActive ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'hover:bg-gray-800/30'}
    `}
    style={{ 
      background: isActive 
        ? `linear-gradient(to bottom, ${darkBlue}, ${darkBlue})`
        : `linear-gradient(to bottom, ${darkBlue}99, ${darkBlue}66)`,
      boxShadow: isActive ? 'inset 0 1px 0 0 rgba(255,255,255,0.1)' : 'none'
    }}
  >
    <span className="text-lg">{icon}</span>
    {label}
    <div 
      className={`
        absolute bottom-0 left-0 right-0 h-1
        transform transition-transform origin-left
        ${isActive ? 'scale-x-100 bg-gradient-to-r from-lightRed to-blue-500' : 'scale-x-0 bg-blue-400'}
      `}
    />
  </button>
);

export default RealmClashGame;