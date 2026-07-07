import logo from "/logo.jpg";
import { useNavigate } from "react-router-dom";
function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src={logo}
            alt="LeetCompete Logo"
            className="w-32 h-32 rounded-2xl shadow-2xl border-2 border-zinc-700"
          />
        </div>

        <div className="mb-6">
          <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-800 bg-zinc-600 to-white mb-4">
            404
          </h1>
          <h2 className="text-3xl font-bold text-white mb-3">Page Not Found</h2>
          <p className="text-zinc-400 text-lg max-w-md mx-auto">
            Oops! The page you're looking for seems to have wandered off into
            the void.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Go to Home
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 text-zinc-600">
          <p className="text-sm">
            Lost in the code? Let's get you back on track.
          </p>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
