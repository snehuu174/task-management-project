"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type FormValues = {
  email: string;
  password: string;
};

export default function Home() {
  const router = useRouter();
  const [formValues, setFormValues] = useState<FormValues>({
    email: "",
    password: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(field: keyof FormValues, value: string) {
    setFormValues((current) => ({ ...current, [field]: value }));
    if (status !== "idle") {
      setStatus("idle");
      setMessage("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "We could not log you in.");
      }

      router.push("/dashboard");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <main className="signup-page">
      <section className="intro-panel" aria-labelledby="page-title">
        <div className="brand-mark" aria-hidden="true">TU</div>
        <p className="eyebrow">Task Users</p>
        <h1 id="page-title">Your work, waiting for you.</h1>
        <p className="intro-copy">
          Pick up where you left off and keep the day moving with a little more clarity.
        </p>
        <div className="signal-list" aria-label="Task Users benefits">
          <span><b>01</b> Keep work visible</span>
          <span><b>02</b> Move with intention</span>
          <span><b>03</b> Finish with clarity</span>
        </div>
      </section>

      <section className="form-panel" aria-labelledby="form-title">
        <div className="form-heading">
          <p className="eyebrow">Welcome back</p>
          <h2 id="form-title">Log in to Task Users</h2>
          <p>Enter your details to return to your workspace.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={formValues.email}
            onChange={(event) => handleChange("email", event.target.value)}
            required
          />

          <div className="password-label">
            <label htmlFor="password">Password</label>
            <button
              type="button"
              className="text-button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            value={formValues.password}
            onChange={(event) => handleChange("password", event.target.value)}
            required
          />

          <button className="submit-button" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Logging in..." : "Log in"}
            <span aria-hidden="true">-&gt;</span>
          </button>

          <p className={`form-message ${status}`} role={status === "error" ? "alert" : "status"}>
            {message || "Your login details stay private and secure."}
          </p>
          <p className="auth-switch">
            New to Task Users? <Link href="/signup">Create an account</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
