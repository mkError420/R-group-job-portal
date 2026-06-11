import React, { useState } from "react";
import { Mail, Lock, Shield, Eye, EyeOff, AlertCircle } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: (token: string, email: string) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("mk.rabbani.cse@gmail.com");
  const [password, setPassword] = useState("portal-admin-123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      // Success
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminEmail", data.email);
      onLoginSuccess(data.token, data.email);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden p-8 animate-fade-in my-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 mb-4">
          <Shield className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-display font-semibold text-slate-900">Admin Gateway</h2>
        <p className="text-sm text-slate-500 mt-1">
          Access the central applicant tracking platform
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm animate-fade-in" id="login-error-msg">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="font-semibold">Authorization Denied</p>
            <p className="opacity-90">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Authorized Email Address
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-slate-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              id="admin-email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all"
              placeholder="e.g. mk.rabbani.cse@gmail.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Secure Admin Passcode
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-slate-400">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              id="admin-password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all"
              placeholder="Enter security key"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          id="admin-login-submit"
          disabled={loading}
          className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2.5 rounded-xl text-sm transition-colors focus:ring-2 focus:ring-indigo-500/25 focus:outline-none"
        >
          {loading ? "Authenticating Session..." : "Secure Sign In"}
        </button>
      </form>

      {/* Security notice and dev helpers */}
      <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50/50 -mx-8 -mb-8 p-6 space-y-3">
        <div className="text-xs text-slate-500 flex items-start gap-2">
          <Shield className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-700">Security Requirement:</span> Only the administrator address <code className="bg-slate-100 px-1 py-0.5 rounded text-neutral-800 font-mono">mk.rabbani.cse@gmail.com</code> is authorized to access the ATS dashboard.
          </div>
        </div>

        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-800">
          <p className="font-semibold mb-1">🔑 Demo Passcode Authorization</p>
          <p>Please use the designated administrator credentials shown below:</p>
          <div className="mt-1 font-mono bg-white/70 p-1.5 rounded border border-amber-200/50 flex flex-col gap-0.5 text-neutral-800">
            <div>Email: <span className="font-semibold">mk.rabbani.cse@gmail.com</span></div>
            <div>Key: <span className="font-semibold">portal-admin-123</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
