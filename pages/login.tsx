// pages/login.tsx
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setErr("Invalid email or password");
      console.error("Login failed:", res.error);
    } else if (res?.ok) {
      router.push("/cars"); // redirect to home or cars page
    } else {
      setErr("Something went wrong. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", padding: 18 }}>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        {err && <p style={{ color: "red" }}>{err}</p>}
      </form>
      <p style={{ marginTop: 12 }}>
        Don&apos;t have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
}
