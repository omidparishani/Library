"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("خوش اومدی! 🎉");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "رمز اشتباهه");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-sm w-full text-center space-y-6">
        <div className="text-6xl animate-float">📚</div>
        <h1 className="text-2xl font-extrabold text-sky-700">کتابخانه حسین</h1>
        <p className="text-gray-500 text-sm">رمز خانواده رو وارد کن</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="رمز عبور"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-center text-lg"
            autoFocus
          />
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? "صبر کن..." : "ورود 🚪"}
          </button>
        </form>

        <p className="text-xs text-gray-400">
          رمز پیش‌فرض: <code className="bg-gray-100 px-1 rounded">hossein1403</code>
        </p>
      </div>
    </div>
  );
}
