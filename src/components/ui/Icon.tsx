interface IconProps {
  name: string
  className?: string
  style?: React.CSSProperties
}

/** Thin wrapper around FontAwesome icon classes */
export default function Icon({ name, className = '', style }: IconProps) {
  return <i className={`${name}${className ? ` ${className}` : ''}`} style={style} aria-hidden="true" />
}
