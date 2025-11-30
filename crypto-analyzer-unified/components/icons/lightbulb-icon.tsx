interface LightbulbIconProps {
  className?: string
}

export function LightbulbIcon({ className }: LightbulbIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 18h6M10 22h4M15 8a5 5 0 1 0-6 4.9V14h2v-1.1A5 5 0 0 0 15 8z" />
    </svg>
  )
}
