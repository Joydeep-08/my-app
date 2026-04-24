export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold mb-4">
        Send Beautiful Surprise Messages 🎁
      </h1>

      <p className="text-gray-600 mb-6">
        Create interactive, emotional surprises for your loved ones.
      </p>

      <a href="/login">
        <button className="bg-green-600 text-white px-6 py-3 rounded-xl">
          Continue ✨
        </button>
      </a>
    </div>
  );
}