import { StatCard } from './ui_components'
import React, { useRef, useEffect, useMemo, useState } from "react";

const lightBlue = "#2563eb";
const weirdBlue = "#3a6ea5";
const lightRed = "#dc2626";
const darkBlue = "#0a246a";

const Badge: React.FC<{ type: string; color: "red" | "blue" }> = ({
  type = "ranked",
  color,
}) => (
  <span
    className={`px-2 py-1 rounded text-sm font-medium
    ${
      color === "red"
        ? "bg-red-500/20 text-red-400 border border-red-500/30"
        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
    }`}
  >
    {type.charAt(0).toUpperCase() + type.slice(1)}
  </span>
);

interface StatBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  size?: "small" | "medium" | "large";
  animated?: boolean;
  icon?: string;
}

const StatBar: React.FC<StatBarProps> = ({
  label,
  value,
  maxValue,
  color,
  size = "medium",
  animated = true,
  icon,
}) => {
  const percentage = Math.min((value / maxValue) * 100, 100);

  const sizeClasses = {
    small: {
      bar: "h-1.5",
      text: "text-xs",
      padding: "py-0.5",
    },
    medium: {
      bar: "h-2",
      text: "text-sm",
      padding: "py-1",
    },
    large: {
      bar: "h-3",
      text: "text-base",
      padding: "py-1.5",
    },
  };

  return (
    <div className={`${sizeClasses[size].padding}`}>
      {/* Label and Value */}
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-1.5">
          {icon && <span className="text-gray-400">{icon}</span>}
          <span className={`${sizeClasses[size].text} text-gray-400`}>
            {label}
          </span>
        </div>
        <span className={`${sizeClasses[size].text} text-white font-medium`}>
          {value}/{maxValue}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full bg-gray-700/50 rounded-full overflow-hidden">
        {/* Background pulse for low health warning */}
        {percentage < 20 && animated && (
          <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse" />
        )}

        {/* Main bar */}
        <div
          className={`
            ${sizeClasses[size].bar}
            rounded-full
            transition-all duration-500 ease-out
            relative
          `}
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(to right, ${color})`,
          }}
        >
          {/* Shine effect */}
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0" />
          )}
        </div>

        {/* Secondary animation for critical health */}
        {percentage < 20 && animated && (
          <div
            className={`
              absolute inset-0
              ${sizeClasses[size].bar}
              bg-red-500/30
              animate-pulse
            `}
          />
        )}
      </div>
    </div>
  );
};
interface CharacterClass {
  type: "Mage" | "Warrior" | "Assassin" | "Demon";
  primaryColor: string;
  secondaryColor: string;
  auraEffect: string;
}

const classStyles: Record<string, CharacterClass> = {
  Mage: {
    type: "Mage",
    primaryColor: "from-blue-500/80 via-blue-600/50 to-blue-700/80",
    secondaryColor: "from-blue-400 via-blue-500 to-blue-600",
    auraEffect: "magical-aura",
  },
  Warrior: {
    type: "Warrior",
    primaryColor: "from-red-500/80 via-red-600/50 to-red-700/80",
    secondaryColor: "from-red-400 via-red-500 to-red-600",
    auraEffect: "battle-aura",
  },
  Assassin: {
    type: "Assassin",
    primaryColor: "from-purple-500/80 via-purple-600/50 to-purple-700/80",
    secondaryColor: "from-purple-400 via-purple-500 to-purple-600",
    auraEffect: "shadow-aura",
  },
  Demon: {
    type: "Demon",
    primaryColor: "from-rose-500/80 via-rose-600/50 to-rose-700/80",
    secondaryColor: "from-rose-400 via-rose-500 to-rose-600",
    auraEffect: "demon-aura",
  },
};

interface Character {
  characterName: string;
  characterClass: "Mage" | "Warrior" | "Assassin" | "Demon";
  address: string;
  health: number;
  attack: number;
}

interface BattleCardProps {
  character: Character;
  isActive: boolean;
  isAttacking: boolean;
  attackType?: string;
}

const BattleCard: React.FC<BattleCardProps> = ({
  character,
  isActive = false,
  isAttacking = false,
  attackType,
}) => {
  const defaultClass: CharacterClass = {
    type: "Demon", 
    primaryColor: "from-gray-500/80 via-gray-600/50 to-gray-700/80",
    secondaryColor: "from-gray-400 via-gray-500 to-gray-600",
    auraEffect: "battle-aura",
  };

  const classStyle = character?.characterClass
    ? classStyles[character.characterClass]
    : defaultClass;

  return (
    <div
      className={`
        relative w-full max-w-[320px] aspect-[3/4] rounded-2xl
        transition-all duration-500 ease-out
        ${isAttacking ? "scale-110 z-20" : "scale-100 z-10"}
        ${isActive ? "hover:scale-105" : "opacity-90"}
      `}
    >
      {/* Card Background with Character Art */}
      <div
        className={`
          absolute inset-0 rounded-2xl overflow-hidden
          transition-all duration-300
          ${isAttacking ? "shadow-2xl shadow-current" : ""}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="w-full h-full flex items-center justify-center text-[8vw]">
            👤
          </div>
        </div>

        {/* Aura Effects */}
        {isAttacking && (
          <div
            className={`
              absolute inset-0 
              animate-pulse
              bg-gradient-to-br ${classStyle.primaryColor}
              ${attackType === "ultimate" ? "opacity-50" : "opacity-30"}
            `}
          />
        )}

        {/* Card Content */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-white">
                {character?.characterName || "Unknown"}
              </h3>
              <span
                className={`
                  px-2 py-1 rounded-full text-xs
                  bg-gradient-to-r ${classStyle.secondaryColor}
                  text-white font-medium
                `}
              >
                {character?.characterClass || "Unknown"}
              </span>
            </div>
            <p className="text-gray-400 font-mono text-xs truncate">
              {character?.address || "0x..."}
            </p>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <StatBar
              label="HP"
              value={character?.health || 0}
              maxValue={500}
              color={classStyle.secondaryColor}
              size="large"
            />
            <StatBar
              label="ATK"
              value={character?.attack || 0}
              maxValue={100}
              color={classStyle.secondaryColor}
              size="large"
            />
          </div>
        </div>
      </div>

      {/* Active Turn Indicator */}
      {isActive && (
        <div
          className={`
            absolute -inset-px rounded-2xl border-2
            bg-gradient-to-br ${classStyle.primaryColor} opacity-0
            animate-pulse duration-1000
          `}
        />
      )}

      {/* Attack Effects */}
      {isAttacking && (
        <AttackEffect type={attackType} classStyle={classStyle} />
      )}
    </div>
  );
};

const AttackEffect: React.FC<{
  type?: string;
  classStyle: CharacterClass;
}> = ({ type, classStyle }) => {
  if (!type) return null;

  const effects = {
    quick: (
      <div
        className="absolute -right-1/4 top-1/2 -translate-y-1/2
                    w-32 h-32 animate-attack-quick"
      >
        <div
          className={`
          w-full h-full transform rotate-45
          bg-gradient-to-r ${classStyle.secondaryColor}
          animate-slash
        `}
        />
      </div>
    ),
    power: (
      <div
        className="absolute -right-1/2 top-1/2 -translate-y-1/2
                    w-48 h-48 animate-attack-power"
      >
        <div
          className={`
          absolute inset-0 rounded-full
          bg-gradient-to-r ${classStyle.primaryColor}
          animate-pulse-fast
        `}
        />
        <div
          className={`
          absolute inset-4 rounded-full
          bg-gradient-to-r ${classStyle.secondaryColor}
          animate-pulse-delayed
        `}
        />
      </div>
    ),
    ultimate: (
      <div className="absolute inset-0 z-30">
        <div
          className={`
          absolute inset-0 
          bg-gradient-to-r ${classStyle.secondaryColor}
          animate-ultimate-charge
        `}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`
            w-full h-full transform 
            bg-gradient-to-r ${classStyle.primaryColor}
            animate-ultimate-release
          `}
          />
        </div>
      </div>
    ),
  };

  return effects[type as keyof typeof effects] || null;
};

const AttackButton: React.FC<{
  icon: string;
  label: string;
  type: "quick" | "power" | "ultimate";
  powerCost: number;
  onClick: () => void;
  disabled?: boolean;
  containerRef: React.RefObject<HTMLDivElement>; 
}> = ({ icon, label, type, powerCost, onClick, disabled,containerRef }) => {
  const styles = {
    quick: "from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800",
    power: "from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800",
    ultimate: "from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800",
  };

  const [buttonWidth, setButtonWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setButtonWidth(containerRef.current.offsetWidth);
      }
    };

    // Initial measurement
    updateWidth();

    // Setup resize observer
    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Get appropriate text based on available width
  const displayText = useMemo(() => {
    if (buttonWidth >= 200) {
      return label; // Full text for wide buttons
    } else if (buttonWidth >= 150) {
      // Two letters per word for medium buttons
      return label.split(' ')
        .map(word => word.substring(0, 2).toUpperCase())
        .join('');
    } else {
      // Just initials for narrow buttons
      return label.split(' ')
        .map(word => word[0].toUpperCase())
        .join('');
    }
  }, [label, buttonWidth]);

  return (
    <div ref={containerRef} className=" border border-red-500 group relative w-full">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative h-14 w-full px-6 rounded-lg overflow-hidden
          bg-gradient-to-r ${styles[type]}
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-300
        `}
      >
        <div className="relative z-10 flex items-center justify-center gap-3">
          <span className="text-2xl flex-shrink-0">{icon}</span>
          <span className="font-medium whitespace-nowrap">
            {displayText}
          </span>
        </div>

        <div
          className="absolute inset-0 bg-white/10 translate-y-full
                     group-hover:translate-y-0 transition-transform"
        />
      </button>

      <div
        className="absolute -top-12 left-1/2 -translate-x-1/2
                    bg-gray-900 px-3 py-2 rounded-lg
                    text-white text-sm whitespace-nowrap
                    opacity-0 group-hover:opacity-100
                    transition-opacity pointer-events-none
                    border border-gray-700"
      >
        Power Cost: {powerCost} PP
      </div>
    </div>
  );
};


const EndTurnButton: React.FC<{
  onClick: () => void;
  powerPoints: number;
  isPlayerTurn: boolean;
}> = ({ onClick, powerPoints, isPlayerTurn }) => {
  // Check if player has enough points for any move
  const canMakeMove = powerPoints >= 2; // 2 is minimum cost for quick attack

  return (
    <button
      onClick={onClick}
      disabled={!isPlayerTurn || canMakeMove}
      className={`
        px-6 py-3 rounded-lg font-medium
        flex items-center gap-2
        transition-all duration-200
        ${
          isPlayerTurn && !canMakeMove
            ? "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/30 hover:from-blue-500/30 hover:to-blue-600/30 animate-pulse"
            : "bg-gray-700/20 text-gray-500 border border-gray-600/30 cursor-not-allowed"
        }
      `}
    >
      <span>🔄</span>
      <span>End Turn</span>
      {isPlayerTurn && !canMakeMove && (
        <div
          className="absolute -top-8 left 1/2 -translate-x-1/2 
                     text-sm text-gray-400 whitespace-nowrap"
        >
          No moves available
        </div>
      )}
    </button>
  );
};
// Add to your styles.css or equivalent
const styles = `
@keyframes attack-quick {
  0% { transform: translateX(0) translateY(-50%); opacity: 0; }
  50% { transform: translateX(50%) translateY(-50%); opacity: 1; }
  100% { transform: translateX(100%) translateY(-50%); opacity: 0; }
}

@keyframes attack-power {
  0% { transform: scale(0) translateX(0) translateY(-50%); opacity: 0; }
  50% { transform: scale(1.2) translateX(50%) translateY(-50%); opacity: 1; }
  100% { transform: scale(0) translateX(100%) translateY(-50%); opacity: 0; }
}

@keyframes ultimate-charge {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(0); opacity: 0; }
}

@keyframes ultimate-release {
  0% { transform: scaleX(0); opacity: 0; }
  50% { transform: scaleX(1.2); opacity: 1; }
  100% { transform: scaleX(0); opacity: 0; }
}

.animate-attack-quick {
  animation: attack-quick 0.5s ease-out forwards;
}

.animate-attack-power {
  animation: attack-power 0.8s ease-out forwards;
}

.animate-ultimate-charge {
  animation: ultimate-charge 1s ease-in-out forwards;
}

.animate-ultimate-release {
  animation: ultimate-release 1.5s ease-in-out forwards;
}

.animate-pulse-fast {
  animation: pulse 0.5s ease-in-out infinite;
}

.animate-pulse-delayed {
  animation: pulse 0.5s ease-in-out infinite 0.25s;
}

.magical-aura {
  background: radial-gradient(circle at center, 
    rgba(59, 130, 246, 0.5) 0%,
    rgba(37, 99, 235, 0.3) 50%,
    transparent 70%
  );
}

.battle-aura {
  background: radial-gradient(circle at center, 
    rgba(239, 68, 68, 0.5) 0%,
    rgba(220, 38, 38, 0.3) 50%,
    transparent 70%
  );
}

.shadow-aura {
  background: radial-gradient(circle at center, 
    rgba(147, 51, 234, 0.5) 0%,
    rgba(126, 34, 206, 0.3) 50%,
    transparent 70%
  );
}

.demon-aura {
  background: radial-gradient(circle at center, 
    rgba(225, 29, 72, 0.5) 0%,
    rgba(190, 18, 60, 0.3) 50%,
    transparent 70%
  );
}
`;

const BattleGame: React.FC = () => {
  // Mock battle data
  const [playerData] = useState<Character>({
    characterName: "Dragon Knight",
    characterClass: "Demon",
    address: "0xf0e2d...cF0e",
    health: 418,
    attack: 44,
  });

  const [opponentData] = useState<Character>({
    characterName: "Shadow Mage",
    characterClass: "Mage",
    address: "0x1234...5678",
    health: 446,
    attack: 51,
  });

  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackType, setAttackType] = useState<string>();
  const [powerPoints, setPowerPoints] = useState(103);

  const [containerRef] = useState<React.RefObject<HTMLDivElement>>();


  const handleAttack = (type: "quick" | "power" | "ultimate", cost: number) => {
    if (powerPoints < cost) return;

    setIsAttacking(true);
    setAttackType(type);
    setPowerPoints((prev) => prev - cost);

    // Reset attack state after animation
    setTimeout(() => {
      setIsAttacking(false);
      setAttackType(undefined);
     setIsPlayerTurn(false);
    }, 1000);
  };


  return (
    <div className="bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900">
      <div className="h-full w-full">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 shadow-2xl h-full w-full">
          {/* Header Bar */}
          <div
            className="px-4 py-3 border-b border-gray-700/50"
            style={{
              background: `linear-gradient(to right, ${weirdBlue}, ${darkBlue})`,
            }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white">Battle Arena</h1>
                <Badge type="ranked" color="red" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-900/30 px-3 py-1.5 rounded-lg border border-gray-700/30">
                  <span className="text-yellow-500">⚡</span>
                  <span className="text-gray-300 text-sm">Power Points:</span>
                  <span className="text-white font-bold">{powerPoints}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-900/30 px-3 py-1.5 rounded-lg border border-gray-700/30">
                  <span className="text-blue-400">⏱️</span>
                  <span className="text-gray-300 text-sm">Turn Timer:</span>
                  <span className="text-white font-bold">1:30</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Battle Area */}
          <div className="grid grid-cols-[1fr,auto,1fr] gap-6 p-6">
            {/* Player Card */}
            <div className="flex justify-center items-center">
              <BattleCard
                character={playerData}
                isActive={isPlayerTurn}
                isAttacking={isAttacking}
                attackType={attackType}
              />
            </div>

            {/* Center VS Section */}
            <div className="flex flex-col items-center justify-center gap-6">
              <div
                className="text-5xl font-bold bg-gradient-to-br from-red-500/20 to-red-700/20 
                           text-transparent bg-clip-text select-none"
              >
                VS
              </div>
              {/* Turn Indicator */}
              <div className="bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/30 whitespace-nowrap">
                {isPlayerTurn ? (
                  <div className="text-green-400 flex items-center gap-2 text-sm">
                    <span className="animate-pulse">●</span>
                    Your Turn
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">Opponent's Turn</div>
                )}
              </div>
            </div>

            {/* Opponent Card */}
            <div className="flex justify-center items-center">
              <BattleCard
                character={opponentData}
                isActive={!isPlayerTurn}
                isAttacking={false}
                attackType={undefined}
              />
            </div>
          </div>

          {/* Controls Section */}
          <div ref={containerRef} className="border border-red-500 bg-gray-800/30 border-t border-gray-700/50">
            <div className="container mx-auto px-6 py-4">
              <div className="flex justify-between items-center">
                {/* Attack Buttons */}
                <div className="flex gap-3">
                  <AttackButton
                    icon="⚔️"
                    label="Quick Strike"
                    type="quick"
                    powerCost={2}
                    onClick={() => handleAttack("quick", 2)}
                    disabled={!isPlayerTurn || powerPoints < 2}
                    containerRef={containerRef!}
                  />
                  <AttackButton
                    icon="🗡️"
                    label="Power Slash"
                    type="power"
                    powerCost={4}
                    onClick={() => handleAttack("power", 4)}
                    disabled={!isPlayerTurn || powerPoints < 4}
                    containerRef={containerRef!}
                  />
                  <AttackButton
                    icon="⚡"
                    label="Ultimate"
                    type="ultimate"
                    powerCost={8}
                    onClick={() => handleAttack("ultimate", 8)}
                    disabled={!isPlayerTurn || powerPoints < 8}
                    containerRef={containerRef!}
                  />
                  <EndTurnButton
                    onClick={() => {
                      setIsPlayerTurn(false);
                      // Add any other end turn logic here
                    }}
                    powerPoints={powerPoints}
                    isPlayerTurn={isPlayerTurn}
                  />
                </div>

                {/* Surrender Button */}
                <button
                  className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 
                                text-red-400 rounded-lg hover:from-red-500/30 hover:to-red-600/30 
                                transition-colors border border-red-500/30 font-medium text-sm"
                >
                  Surrender Battle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const GamePlayUI: React.FC<{ gameId: string }> = ({ gameId }) => {
  return (
    <div className="p-6">
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
       <BattleGame/>
      </div>
    </div>
  )
}
export default GamePlayUI
