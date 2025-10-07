// pages/signup.tsx
import { useState } from "react";
import { useRouter } from "next/router";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push("/login");
    } else {
      setErr(data.message || "Error creating account");
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", padding: 18 }}>
      <h1>Sign up</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Email"
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
          {loading ? "Creating..." : "Sign up"}
        </button>
        {err && <p style={{ color: "red" }}>{err}</p>}
      </form>
      <p style={{ marginTop: 12 }}>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </div>
  );
}
