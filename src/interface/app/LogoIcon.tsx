import Svg, { Path } from 'react-native-svg'

export const LogoIcon = ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256" fill="none">
      <Path
        d="M200,36H160.81A44,44,0,0,0,95.19,36H56A20,20,0,0,0,36,56V216a20,20,0,0,0,20,20H200a20,20,0,0,0,20-20V56A20,20,0,0,0,200,36Zm-72-8a20,20,0,0,1,19.6,16H108.4A20,20,0,0,1,128,28ZM196,212H60V60H84V68a12,12,0,0,0,12,12h64a12,12,0,0,0,12-12V60h24Zm-28.49-80.49-56,56a12,12,0,0,1-17,0l-24-24a12,12,0,1,1,17-17L103,162l47.51-47.52a12,12,0,0,1,17,17Z"
        fill={color}
      />
    </Svg>
  )
}
