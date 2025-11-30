interface NetworkIconProps {
  className?: string
}

export function NetworkIcon({ className }: NetworkIconProps) {
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
      <circle cx="12" cy="12" r="2" />
      <path d="M12 2v4m0 12v4M6.34 6.34l2.83 2.83m5.66 5.66l2.83 2.83M2 12h4m12 0h4M6.34 17.66l2.83-2.83m5.66-5.66l2.83-2.83" />
    </svg>
  )
}
