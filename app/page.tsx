export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          Misael
        </h1>

        <p className="text-zinc-400 max-w-xl mx-auto">
          Frontend Developer building clean, modern and high-performance web experiences.
        </p>

        <button className="px-6 py-3 rounded-xl bg-white text-black font-medium hover:opacity-80 transition">
          View Projects
        </button>
      </div>
    </main>
  );
}