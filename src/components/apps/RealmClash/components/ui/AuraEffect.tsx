import React, { ReactNode } from 'react'
type AuraType =
  | 'fire'
  | 'smoke'
  | 'energy'
  | 'shadow'
  | 'silver'
  | 'green'
  | 'gold'
  | 'ice'
  | 'lightning'
  | 'demon'
type AuraRole =
  | 'mage'
  | 'knight'
  | 'god'
  | 'demon'
  | 'human'
  | 'king'
  | 'archer'
interface AuraEffectProps {
  children: ReactNode
  effect?: AuraRole
  type?: AuraType
  intensity?: number
}
const AuraEffect: React.FC<AuraEffectProps> = ({
  children,
  type = 'fire',
  intensity = 1,
  effect,
}) => {
  // Map role -> aura type
  const roleMapping: Record<AuraRole, AuraType> = {
    mage: 'shadow',
    knight: 'fire',
    god: 'silver',
    demon: 'demon',
    human: 'smoke',
    king: 'gold',
    archer: 'green',
  }
  const finalType = effect ? roleMapping[effect] : type
  // Configuration for each aura style
  const auraTypes = {
    fire: {
      gradients: [
        'from-orange-500 to-red-600',
        'from-yellow-400 to-orange-500',
      ],
      filter: 'fire-aura',
      animations: ['flame 2s infinite', 'flame 3s infinite reverse'],
    },
    smoke: {
      gradients: ['from-gray-700 to-gray-900', 'from-gray-800 to-black'],
      filter: 'smoke-aura',
      animations: ['smoke 6s infinite', 'smoke 8s infinite reverse'],
    },
    energy: {
      gradients: ['from-blue-400 to-purple-500', 'from-cyan-300 to-blue-400'],
      filter: 'energy-aura',
      animations: ['energy 3s infinite', 'energy 4s infinite reverse'],
    },
    shadow: {
      gradients: ['from-gray-800 to-black', 'from-gray-900 to-black'],
      filter: 'shadow-aura',
      animations: ['smoke 4s infinite', 'smoke 5s infinite reverse'],
    },
    silver: {
      gradients: ['from-gray-300 to-gray-500', 'from-gray-100 to-gray-300'],
      filter: 'silver-aura',
      animations: ['energy 4s infinite', 'energy 5s infinite reverse'],
    },
    green: {
      gradients: ['from-green-500 to-green-700', 'from-green-400 to-green-600'],
      filter: 'nature-aura',
      animations: ['energy 3s infinite', 'energy 4s infinite reverse'],
    },
    gold: {
      gradients: [
        'from-yellow-500 to-yellow-600',
        'from-yellow-400 to-yellow-500',
      ],
      filter: 'gold-aura',
      animations: ['flame 3s infinite', 'flame 4s infinite reverse'],
    },
    ice: {
      gradients: ['from-blue-300 to-cyan-500', 'from-blue-200 to-cyan-400'],
      filter: 'ice-aura',
      animations: ['ice 3s infinite', 'ice 4s infinite reverse'],
    },
    lightning: {
      gradients: ['from-yellow-300 to-blue-500', 'from-yellow-200 to-blue-400'],
      filter: 'lightning-aura',
      animations: [
        'lightning 0.8s infinite',
        'lightning 1.2s infinite reverse',
      ],
    },
    demon: {
      gradients: ['from-red-600 to-red-800', 'from-red-500 to-red-700'],
      filter: 'demon-aura',
      animations: ['flame 2s infinite', 'flame 3s infinite reverse'],
    },
  } as const
  const { gradients, filter, animations } = auraTypes[finalType]
  return (
    <div className="relative">
      {/* SVG Filters */}
      <svg className="hidden">
        <defs>
          {/* =============== FIRE AURA =============== */}
          <filter id="fire-aura">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.003 * intensity}
              numOctaves={4}
              seed={2}
              result="noise"
            >
              {/* Animate the fractal noise so it shifts/waves over time */}
              <animate
                attributeName="baseFrequency"
                dur="3s"
                values="0.03;0.07;0.03"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={4 * intensity}
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation={0.3 * intensity} result="blur" />
            <feComposite operator="over" in="blur" />
          </filter>
          {/* =============== SMOKE AURA =============== */}
          <filter id="smoke-aura">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.0008 * intensity}
              numOctaves={4}
              seed={1}
              // seed={Math.random() * 100}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="6s"
                values="0.008;0.015;0.008"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={2.5 * intensity}
            />
            <feGaussianBlur stdDeviation={0.4 * intensity} result="blur" />
            <feComposite operator="over" in="blur" />
          </filter>

          {/* =============== ENERGY AURA =============== */}
          <filter id="energy-aura">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.004 * intensity}
              numOctaves={4}
              seed={5}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="4s"
                values="0.04;0.08;0.04"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={3.5 * intensity}
            />
            <feGaussianBlur stdDeviation={0.35 * intensity} result="blur" />
            <feComposite operator="over" in="blur" />
          </filter>

          {/* =============== SHADOW AURA =============== */}
          <filter id="shadow-aura">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.0025 * intensity}
              numOctaves={4}
              seed={Math.random() * 100}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="4s"
                values="0.025;0.05;0.025"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={3.5 * intensity}
            />
            <feGaussianBlur stdDeviation={0.5 * intensity} result="blur" />
            <feComposite operator="over" in="blur" />
          </filter>

          {/* =============== SILVER AURA =============== */}
          <filter id="silver-aura">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.002 * intensity}
              numOctaves={4}
              seed={7}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="4s"
                values="0.02;0.05;0.02"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={2.5 * intensity}
            />
            <feGaussianBlur stdDeviation={0.3 * intensity} result="blur" />
            <feComposite operator="over" in="blur" />
          </filter>

          {/* =============== GREEN (NATURE) AURA =============== */}
          <filter id="nature-aura">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.003 * intensity}
              numOctaves={4}
              seed={3}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="5s"
                values="0.03;0.06;0.03"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={3 * intensity}
            />
            <feGaussianBlur stdDeviation={0.4 * intensity} result="blur" />
            <feComposite operator="over" in="blur" />
          </filter>

          {/* =============== GOLD AURA =============== */}
          <filter id="gold-aura">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.0025 * intensity}
              numOctaves={4}
              seed={6}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="3s"
                values="0.025;0.05;0.025"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={3.5 * intensity}
            />
            <feGaussianBlur stdDeviation={0.4 * intensity} result="blur" />
            <feComposite operator="over" in="blur" />
          </filter>

          {/* =============== ICE AURA =============== */}
          <filter id="ice-aura">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.003 * intensity}
              numOctaves={4}
              seed={4}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="3s"
                values="0.03;0.06;0.03"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={2.8 * intensity}
            />
            <feGaussianBlur stdDeviation={0.35 * intensity} result="blur" />
            <feComposite operator="over" in="blur" />
          </filter>

          {/* =============== LIGHTNING AURA =============== */}
          <filter id="lightning-aura">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.004 * intensity}
              numOctaves={3}
              seed={12}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="1s"
                values="0.04;0.09;0.04"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={4.5 * intensity}
            />
            <feGaussianBlur stdDeviation={0.3 * intensity} result="blur" />
            <feComposite operator="over" in="blur" />
          </filter>

          {/* =============== DEMON AURA =============== */}
          <filter id="demon-aura">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.003 * intensity}
              numOctaves={5}
              seed={8}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="3s"
                values="0.03;0.09;0.03"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={4.5 * intensity}
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation={0.5 * intensity} result="blur" />
            <feComposite operator="over" in="blur" />
          </filter>
        </defs>
      </svg>

      {/* Main container with aura effects */}
      <div className="relative">
        {/* Outer aura layer */}
        <div
          className={`absolute ${
            intensity < 0.5
              ? '-inset-2'
              : intensity < 1
              ? '-inset-3'
              : '-inset-5'
          } rounded-xl opacity-90`}
        >
          <div
            className={`absolute inset-0 rounded-xl bg-gradient-to-r ${gradients[0]} blur-2xl transform-gpu`}
            style={{
              filter: `url(#${filter})`,
              animation: animations[0],
              transform: `scale(${1 + 0.08 * intensity})`,
            }}
          />
          <div
            className={`absolute inset-0 rounded-xl bg-gradient-to-r ${gradients[1]} blur-xl transform-gpu`}
            style={{
              filter: `url(#${filter})`,
              animation: animations[1],
              transform: `scale(${1 + 0.05 * intensity})`,
            }}
          />
        </div>

        {/* Inner content */}
        <div className="relative bg-gray-900/80 rounded-lg p-4 backdrop-blur-sm">
          {children}
        </div>
      </div>

      <style>{`
        /* Make the "flame", "smoke", etc. keyframes more volatile 
           for more dramatic animation effects */

        @keyframes flame {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 0.9;
          }
          25% {
            transform: scale(${1 + 0.05 * intensity}) rotate(${
        -2 * intensity
      }deg);
            opacity: 1;
          }
          50% {
            transform: scale(${1 + 0.08 * intensity}) rotate(${
        2 * intensity
      }deg);
            opacity: 0.95;
          }
          75% {
            transform: scale(${1 + 0.05 * intensity}) rotate(${
        -1 * intensity
      }deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.9;
          }
        }

        @keyframes smoke {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.7;
          }
          25% {
            transform: scale(${1 + 0.05 * intensity}) translate(${
        4 * intensity
      }px, ${-4 * intensity}px);
            opacity: 0.9;
          }
          50% {
            transform: scale(${1 + 0.08 * intensity}) translate(0, ${
        -6 * intensity
      }px);
            opacity: 1;
          }
          75% {
            transform: scale(${1 + 0.05 * intensity}) translate(${
        -4 * intensity
      }px, ${-4 * intensity}px);
            opacity: 0.9;
          }
        }

        @keyframes energy {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.8;
          }
          25% {
            transform: scale(${1 + 0.03 * intensity}) rotate(${
        -1 * intensity
      }deg);
            opacity: 0.9;
          }
          50% {
            transform: scale(${1 + 0.06 * intensity}) rotate(${
        2 * intensity
      }deg);
            opacity: 1;
          }
          75% {
            transform: scale(${1 + 0.03 * intensity}) rotate(${
        -1 * intensity
      }deg);
            opacity: 0.9;
          }
        }

        @keyframes ice {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
          25% {
            transform: scale(${1 + 0.02 * intensity}) rotate(${
        -1 * intensity
      }deg);
            opacity: 0.9;
          }
          50% {
            transform: scale(${1 + 0.05 * intensity}) rotate(${
        1 * intensity
      }deg);
            opacity: 1;
          }
          75% {
            transform: scale(${1 + 0.02 * intensity}) rotate(${
        -1 * intensity
      }deg);
            opacity: 0.9;
          }
        }

        @keyframes lightning {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.7;
          }
          10%,
          90% {
            transform: scale(${1 + 0.25 * intensity});
            opacity: 1;
          }
          15%,
          85% {
            transform: scale(${1 + 0.1 * intensity});
            opacity: 0.8;
          }
          40% {
            transform: scale(${1 + 0.15 * intensity});
            opacity: 0.9;
          }
          60% {
            transform: scale(${1 + 0.2 * intensity});
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
export default AuraEffect
