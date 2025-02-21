import React, { useState } from 'react'


export const InventoryItem: React.FC<{ name: string; rarity: string }> = ({ name, rarity }) => (
  <div className="bg-gray-900/50 p-2 rounded border border-gray-700/30">
    <p className="text-white text-sm">{name}</p>
    <p className={`text-xs ${rarity === 'Legendary' ? 'text-yellow-500' : 'text-purple-500'}`}>
      {rarity}
    </p>
  </div>
);

export const SettingToggle: React.FC<{
  label: string;
  defaultOn?: boolean;
  onChange?: (isOn: boolean) => void;
}> = ({ label, defaultOn, onChange }) => {
  const [isOn, setIsOn] = useState(defaultOn);

  const toggleSwitch = () => {
    const newState = !isOn;
    setIsOn(newState);
    onChange?.(newState);
  };

  return (
    <div className="flex items-center justify-between group select-none">
      <span className="text-white">{label}</span>
      <button
        onClick={toggleSwitch}
        className={`
          w-12 h-6 rounded-full p-1 cursor-pointer
          transition-colors duration-200
          ${isOn ? 'bg-blue-600' : 'bg-gray-700'}
          hover:${isOn ? 'bg-blue-500' : 'bg-gray-600'}
        `}
        aria-checked={isOn}
        role="switch"
      >
        <div
          className={`
            w-4 h-4 rounded-full 
            transition-all duration-200 ease-in-out
            ${isOn ? 'translate-x-6 bg-white' : 'translate-x-0 bg-gray-200'}
          `}
        />
      </button>
    </div>
  );
};


export const StatBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-400">{label}</span>
      <span className="text-white">{value}%</span>
    </div>
    <div className="h-2 bg-gray-700 rounded-full">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

// Utility Components
export const StatCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/30">
    <h3 className="text-gray-400 text-sm">{title}</h3>
    <p className="text-2xl font-bold text-white mt-1">{value}</p>
  </div>
);
