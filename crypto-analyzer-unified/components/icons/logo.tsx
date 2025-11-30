interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M20 4L4 12V28L20 36L36 28V12L20 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M20 20L4 12M20 20L36 12M20 20V36" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="20" cy="20" r="3" fill="currentColor" />
    </svg>
  )
}
