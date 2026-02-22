export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full backdrop-blur-md bg-zinc-950/70 border-b border-zinc-800 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="font-semibold tracking-tight">Milan</span>

        <div className="flex gap-6 text-sm">
            <a
              href="#projects"
              className="text-zinc-400 no-underline hover:text-white transition"
            >
              Projects
            </a>
            <a
              href="#about"
              className="text-zinc-400 no-underline hover:text-white transition"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-zinc-400 no-underline hover:text-white transition"
            >
              Contact
            </a>
          </div>
      </div>
    </nav>
  );
}