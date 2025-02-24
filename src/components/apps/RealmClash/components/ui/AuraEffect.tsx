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
      animations: ['flame 3s infinite', 'flame 4s infinite reverse'],
    },
    smoke: {
      gradients: ['from-gray-700 to-gray-900', 'from-gray-800 to-black'],
      filter: 'smoke-aura',
      animations: ['smoke 8s infinite', 'smoke 10s infinite reverse'],
    },
    energy: {
      gradients: ['from-blue-400 to-purple-500', 'from-cyan-300 to-blue-400'],
      filter: 'energy-aura',
      animations: ['energy 4s infinite', 'energy 5s infinite reverse'],
    },
    shadow: {
      gradients: ['from-gray-800 to-black', 'from-gray-900 to-black'],
      filter: 'shadow-aura',
      animations: ['smoke 6s infinite', 'smoke 8s infinite reverse'],
    },
    silver: {
      gradients: ['from-gray-300 to-gray-500', 'from-gray-100 to-gray-300'],
      filter: 'silver-aura',
      animations: ['energy 5s infinite', 'energy 6s infinite reverse'],
    },
    green: {
      gradients: ['from-green-500 to-green-700', 'from-green-400 to-green-600'],
      filter: 'nature-aura',
      animations: ['energy 4s infinite', 'energy 5s infinite reverse'],
    },
    gold: {
      gradients: [
        'from-yellow-500 to-yellow-600',
        'from-yellow-400 to-yellow-500',
      ],
      filter: 'gold-aura',
      animations: ['flame 4s infinite', 'flame 5s infinite reverse'],
    },
    ice: {
      gradients: ['from-blue-300 to-cyan-500', 'from-blue-200 to-cyan-400'],
      filter: 'ice-aura',
      animations: ['ice 4s infinite', 'ice 5s infinite reverse'],
    },
    lightning: {
      gradients: ['from-yellow-300 to-blue-500', 'from-yellow-200 to-blue-400'],
      filter: 'lightning-aura',
      animations: ['lightning 1s infinite', 'lightning 1.5s infinite reverse'],
    },
    demon: {
      gradients: ['from-red-600 to-red-800', 'from-red-500 to-red-700'],
      filter: 'demon-aura',
      animations: ['flame 3s infinite', 'flame 4s infinite reverse'],
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
              baseFrequency={0.02 * intensity}
              numOctaves={3}
              seed={2}
              result="noise"
            >
              {/* Animate the fractal noise so it shifts/waves over time */}
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
              scale={30 * intensity}
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation={2 * intensity} result="blur" />
            <feComposite operator="over" in="blur" />
          </filter>

          {/* =============== SMOKE AURA =============== */}
          <filter id="smoke-aura">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.005 * intensity}
              numOctaves={3}
              seed={99}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="8s"
                values="0.005;0.01;0.005"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={15 * intensity}
            />
            <feGaussianBlur stdDeviation={3 * intensity} result="blur" />
            <feComposite operator="over" in="blur" />
          </filter>

          {/* =============== ENERGY AURA =============== */}
          <filter id="energy-aura">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.03 * intensity}
              numOctaves={3}
              seed={5}
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
              scale={25 * intensity}
            />
            <feGaussianBlur stdDeviation={2.5 * intensity} result="blur" />
            <feComposite operator="over" in="blur" />
          </filter>

          {/* =============== SHADOW AURA =============== */}
          <filter id="shadow-aura">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.015 * intensity}
              numOctaves={3}
              seed={10}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="6s"
                values="0.015;0.03;0.015"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={20 * intensity}
            />
            <feGaussianBlur stdDeviation={3 * intensity} result="blur" />
            <feComposite operator="over" in="blur" />
          </filter>

          {/* =============== SILVER AURA =============== */}
          <filter id="silver-aura">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.01 * intensity}
              numOctaves={3}
              seed={7}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="5s"
                values="0.01;0.03;0.01"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={15 * intensity}
            />
            <feGaussianBlur stdDeviation={2 * intensity} result="blur" />
            <feComposite operator="over" in="blur" />
          </filter>

          {/* =============== GREEN (NATURE) AURA =============== */}
          <filter id="nature-aura">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.02 * intensity}
              numOctaves={3}
              seed={3}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="6s"
                values="0.02;0.04;0.02"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={20 * intensity}
            />
            <feGaussianBlur stdDeviation={3 * intensity} result="blur" />
            <feComposite operator="over" in="blur" />
          </filter>

          {/* =============== GOLD AURA =============== */}
          <filter id="gold-aura">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.015 * intensity}
              numOctaves={3}
              seed={6}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="4s"
                values="0.015;0.035;0.015"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={25 * intensity}
            />
            <feGaussianBlur stdDeviation={3 * intensity} result="blur" />
            <feComposite operator="over" in="blur" />
          </filter>

          {/* =============== ICE AURA =============== */}
          <filter id="ice-aura">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.02 * intensity}
              numOctaves={3}
              seed={4}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="4s"
                values="0.02;0.04;0.02"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={18 * intensity}
            />
            <feGaussianBlur stdDeviation={2.5 * intensity} result="blur" />
            <feComposite operator="over" in="blur" />
          </filter>

          {/* =============== LIGHTNING AURA =============== */}
          <filter id="lightning-aura">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.025 * intensity}
              numOctaves={2}
              seed={12}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="1.5s"
                values="0.025;0.06;0.025"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={30 * intensity}
            />
            <feGaussianBlur stdDeviation={2 * intensity} result="blur" />
            <feComposite operator="over" in="blur" />
          </filter>

          {/* =============== DEMON AURA =============== */}
          <filter id="demon-aura">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.02 * intensity}
              numOctaves={4}
              seed={8}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="4s"
                values="0.02;0.07;0.02"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={35 * intensity}
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation={3.5 * intensity} result="blur" />
            <feComposite operator="over" in="blur" />
          </filter>
        </defs>
      </svg>

      {/* Main container with aura effects */}
      <div className="relative">
        {/* Outer aura layer */}
        <div className="absolute -inset-4 rounded-xl opacity-80">
          <div
            className={`absolute inset-0 rounded-xl bg-gradient-to-r ${gradients[0]} blur-2xl transform-gpu`}
            style={{
              filter: `url(#${filter})`,
              animation: animations[0],
              transform: 'scale(1.05)',
            }}
          />
          <div
            className={`absolute inset-0 rounded-xl bg-gradient-to-r ${gradients[1]} blur-xl transform-gpu`}
            style={{
              filter: `url(#${filter})`,
              animation: animations[1],
              transform: 'scale(1.03)',
            }}
          />
        </div>

        {/* Inner content */}
        <div className="relative bg-gray-900/80 rounded-lg p-4 backdrop-blur-sm">
          {children}
        </div>
      </div>

      <style>{`
        /* Make the "flame", "smoke", etc. keyframes more subtle 
           so the fractal noise animation is more visible. 
           You can tweak these to taste. */

        @keyframes flame {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          25% {
            transform: scale(1.02) rotate(-1deg);
            opacity: 0.95;
          }
          50% {
            transform: scale(1.03) rotate(1deg);
            opacity: 0.9;
          }
          75% {
            transform: scale(1.02) rotate(0deg);
            opacity: 0.95;
          }
          100% {
            transform: scale(1) rotate(-1deg);
            opacity: 1;
          }
        }

        @keyframes smoke {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.7;
          }
          25% {
            transform: scale(1.02) translate(2px, -2px);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.03) translate(0, -3px);
            opacity: 0.85;
          }
          75% {
            transform: scale(1.02) translate(-2px, -2px);
            opacity: 0.8;
          }
        }

        @keyframes energy {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.02) rotate(1deg);
            opacity: 1;
          }
        }

        @keyframes ice {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.03);
            opacity: 1;
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
            transform: scale(1.15);
            opacity: 1;
          }
          15%,
          85% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  )
}

export default AuraEffect
