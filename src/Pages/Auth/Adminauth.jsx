import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../Context/AdminAuthContext";

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Both fields are required.");
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/admin/insights");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">

        {/* Wordmark */}
        <div className="mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-1">
            SafeMum AI
          </p>
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
            Admin portal
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs text-gray-400 mb-2 tracking-wide"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@safemum.ai"
              className="w-full border-b border-gray-300 pb-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs text-gray-400 mb-2 tracking-wide"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border-b border-gray-300 pb-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 pt-1">{error}</p>
          )}

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-900 text-white text-sm font-medium tracking-wide rounded-lg hover:bg-black disabled:opacity-40 transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        {/* Footer note */}
        <p className="text-xs text-gray-300 text-center mt-10">
          Restricted access · Authorised personnel only
        </p>
      </div>
    </div>
  );
}