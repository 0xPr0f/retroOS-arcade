import StartIcon from './pcicons/pciconsshapes.svg'
import XIcon from './pcicons/x.svg'
import React from 'react'
import Image from 'next/image'
import { iconMap, IconType } from '@/app/components/apps/appMap'
const Icon: React.FC<{
  svgSrc?: string | null
  className?: string
  keycon: string
}> = ({ svgSrc, className, keycon = '' }) => {
  return (
    <div className={`${className}`}>
      <Image
        onError={(e) => {
          ;(e.target as HTMLImageElement).src =
            iconMap[keycon!] && (iconMap[keycon!] as IconType).src.length > 1
              ? (iconMap[keycon!] as IconType).src
              : XIcon.src!
        }}
        width={200}
        height={200}
        src={
          svgSrc && svgSrc.length > 1
            ? svgSrc
            : iconMap[keycon!] && (iconMap[keycon!] as IconType).src.length > 1
            ? (iconMap[keycon!] as IconType).src
            : XIcon.src!
        }
        alt={'No icon'}
      />
    </div>
  )
}
export { StartIcon }
export default Icon
