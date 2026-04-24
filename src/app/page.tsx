export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f5f7f4] to-[#e6efe6] text-gray-800">

      {/* NAVBAR */}
      <nav className="max-w-6xl mx-auto flex justify-between items-center px-6 py-6">
        <h1 className="text-xl font-semibold">🎁 Create My Surprise</h1>
        <a
          href="/login"
          className="px-4 py-2 bg-[#9CAF88] text-white rounded-lg"
        >
          Login
        </a>
      </nav>

      {/* HERO */}
      <section className="max-w-4xl mx-auto text-center mt-24 px-6">
        <h1 className="text-5xl font-bold mb-6">
          Create unforgettable <span className="text-[#9CAF88]">surprises</span>
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Send magical, interactive experiences to your loved ones ✨
        </p>

        <div className="flex justify-center gap-4">
          <a
            href="/login"
            className="px-6 py-3 bg-[#9CAF88] text-white rounded-xl shadow"
          >
            Get Started
          </a>

          <button className="px-6 py-3 border rounded-xl">
            View Demo
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 mt-24 px-6 pb-20">
        {[
          "💌 Personal messages",
          "🎈 Interactive surprises",
          "🔗 Shareable links",
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-md text-center"
          >
            <p className="font-medium">{item}</p>
          </div>
        ))}
      </section>

    </main>
  );
}