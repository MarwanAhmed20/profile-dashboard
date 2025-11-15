import React, { useState } from "react";

export default function LoginPage({
  onLoginAsAdmin,
  onLoginAsStudent,
  onGoToSignup,
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (role) => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (role === "admin") {
        await onLoginAsAdmin(username, password);
      } else {
        await onLoginAsStudent(username, password);
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
        <p className="mt-2 text-sm text-slate-400">
          Sign in to your account to continue
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your username"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLogin("admin")}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
            disabled={loading}
          />
        </div>

        <div className="space-y-3 pt-4">
          <button
            onClick={() => handleLogin("admin")}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {loading ? "Signing in..." : "Sign in as Admin"}
          </button>

          <button
            onClick={() => handleLogin("student")}
            disabled={loading}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {loading ? "Signing in..." : "Sign in as Student"}
          </button>
        </div>

        <div className="text-center text-sm text-slate-400 pt-4">
          <p>Demo credentials:</p>
          <p className="mt-1">
            Admin:{" "}
            <span className="text-blue-400">admin / admin123</span>
          </p>
          <p className="mt-1">
            Student:{" "}
            <span className="text-blue-400">john_doe / student123</span>
          </p>
        </div>
      </div>

      <div className="text-center text-sm">
        <span className="text-slate-400">Don't have an account? </span>
        <button
          onClick={onGoToSignup}
          className="text-blue-400 hover:text-blue-300 font-medium"
          disabled={loading}
        >
          Sign up
        </button>
      </div>
    </div>
  );
}
