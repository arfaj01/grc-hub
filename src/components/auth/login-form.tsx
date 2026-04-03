"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("بيانات الدخول غير صحيحة");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border p-8 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none"
          placeholder="admin@example.com"
          dir="ltr"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">كلمة المرور</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none"
          dir="ltr"
          required
        />
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-brand-teal text-white rounded-xl text-sm font-bold hover:bg-brand-teal-deep transition-colors disabled:opacity-50"
      >
        {loading ? "جاري الدخول..." : "تسجيل الدخول"}
      </button>
    </form>
  );
}
