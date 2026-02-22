export default function Home() {
  return (
    <>
      <main className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="text-center space-y-6 animate-fadeIn">
          <h1 className="text-5xl font-bold tracking-tight">
            Misael
          </h1>

          <p className="text-zinc-400 max-w-xl mx-auto">
            Frontend Developer building clean, modern and high-performance web experiences.
          </p>

          <a
            href="#projects"
            className="inline-block px-6 py-3 rounded-xl bg-white text-black font-medium hover:opacity-80 transition"
          >
            View Projects
          </a>
        </div>
      </main>

      <section
        id="projects"
        className="min-h-screen border-t border-zinc-800 px-6 py-24"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold mb-12">Projects</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition">
              <h3 className="text-xl font-semibold mb-2">E-commerce Platform</h3>
              <p className="text-zinc-400 text-sm">
                Modern online store built with Next.js, Stripe integration and responsive UI.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition">
              <h3 className="text-xl font-semibold mb-2">Portfolio Website</h3>
              <p className="text-zinc-400 text-sm">
                Minimal and performant developer portfolio with modern animations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}