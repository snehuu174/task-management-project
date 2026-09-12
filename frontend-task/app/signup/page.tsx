"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type SignupValues = {
  name: string;
  email: string;
  password: string;
};

export default function SignupPage() {
  const [formValues, setFormValues] = useState<SignupValues>({
    name: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(field: keyof SignupValues, value: string) {
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
      const response = await fetch("/api/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "We could not create your account.");
      }

      setStatus("success");
      setMessage(data.message || "Your account is ready.");
      setFormValues({ name: "", email: "", password: "" });
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
        <h1 id="page-title">Make room for what matters.</h1>
        <p className="intro-copy">
          One calm place for your tasks, ideas, and the people moving them forward.
        </p>
        <div className="signal-list" aria-label="Task Users benefits">
          <span><b>01</b> Keep work visible</span>
          <span><b>02</b> Move with intention</span>
          <span><b>03</b> Finish with clarity</span>
        </div>
      </section>

      <section className="form-panel" aria-labelledby="form-title">
        <div className="form-heading">
          <p className="eyebrow">Start here</p>
          <h2 id="form-title">Create your account</h2>
          <p>Join Task Users and bring your next day into focus.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Yash Sharma"
            autoComplete="name"
            value={formValues.name}
            onChange={(event) => handleChange("name", event.target.value)}
            required
          />

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
            placeholder="At least 8 characters"
            autoComplete="new-password"
            minLength={8}
            value={formValues.password}
            onChange={(event) => handleChange("password", event.target.value)}
            required
          />

          <button className="submit-button" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Creating account..." : "Create account"}
            <span aria-hidden="true">-&gt;</span>
          </button>

          <p className={`form-message ${status}`} role={status === "error" ? "alert" : "status"}>
            {message || "Your details are sent securely to the Task Users API."}
          </p>
          <p className="auth-switch">
            Already have an account? <Link href="/">Log in</Link>
          </p>
        </form>
      </section>
    </main>
  );
}