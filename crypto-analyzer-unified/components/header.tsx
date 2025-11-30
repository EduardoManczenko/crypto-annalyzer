import { Logo } from "./icons/logo"

export function Header() {
  return (
    <header className="flex items-center justify-center gap-4">
      <Logo className="w-10 h-10 text-accent" />
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
        Crypto <span className="text-accent">Annalyzer</span>
      </h1>
    </header>
  )
}
