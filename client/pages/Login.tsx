import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { DBStatusIndicator } from "@/components/DBStatusIndicator";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("auth_token");
    if (token) {
      navigate("/raw-materials");
    }

    // Check DB status on mount
    checkDBStatus();
    const interval = setInterval(checkDBStatus, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const checkDBStatus = async () => {
    try {
      const response = await fetch("/api/db-status");
      const data = await response.json();
      setDbConnected(data.status === "connected");
    } catch {
      setDbConnected(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!dbConnected) {
      setError("Database not connected. Please try again later.");
      return;
    }

    if (!username.trim() || !password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("username", username);

        // Show success message briefly then navigate
        setTimeout(() => {
          navigate("/raw-materials");
        }, 1000);
      } else {
        setError(data.message || "Invalid username or password");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Header with DB Status */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
        <DBStatusIndicator />
      </div>

      {/* Main login container */}
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Logo/Brand area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white mb-4 shadow-lg">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Hanuram Foods
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Admin Access Portal
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Login successful! Redirecting...
                </span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  {error}
                </span>
              </div>
            )}

            {/* Username field */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading || !dbConnected}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Footer info removed per request */}
      </div>
    </div>
  );
}
