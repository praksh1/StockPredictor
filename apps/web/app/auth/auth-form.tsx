"use client";

import "./auth.css";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { appUrl, createClient } from "../../lib/supabase";

type Mode = "login" | "signup" | "forgot" | "update";
const copy: Record<Mode, { title: string; subtitle: string; submit: string }> = {
  login: { title: "Welcome back", subtitle: "Sign in to follow what matters to your watchlist.", submit: "Sign in" },
  signup: { title: "Start your market brief", subtitle: "Create your account to build a personal watchlist.", submit: "Create account" },
  forgot: { title: "Reset your password", subtitle: "We will email a secure link to reset it.", submit: "Send reset link" },
  update: { title: "Choose a new password", subtitle: "Use at least 12 characters and something unique.", submit: "Save new password" }
};

export default function AuthForm({ mode }: { mode: Mode }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false); const [showPassword, setShowPassword] = useState(false);
  const content = copy[mode];
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null); setNotice(null); setLoading(true);
    try {
      const supabase = createClient();
      if (mode === "login") { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; window.location.assign("/dashboard"); }
      if (mode === "signup") { if (password.length < 12) throw new Error("Please use a password with at least 12 characters."); const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: appUrl("/auth/callback?next=/dashboard") } }); if (error) throw error; setNotice("Check your email to confirm your account. You can sign in after confirmation."); }
      if (mode === "forgot") { const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: appUrl("/update-password") }); if (error) throw error; setNotice("If that email has an account, we sent a password-reset link."); }
      if (mode === "update") { if (password.length < 12) throw new Error("Please use a password with at least 12 characters."); const { error } = await supabase.auth.updateUser({ password }); if (error) throw error; setNotice("Your password has been updated. You can now sign in."); }
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again."); } finally { setLoading(false); }
  }
  const onlyPassword = mode === "update";
  return <main className="auth-shell"><Link className="brand" href="/"><span>MP</span> MarketPulse <b>AI</b></Link><section className="auth-card"><p className="eyebrow">SECURE ACCOUNT</p><h1>{content.title}</h1><p>{content.subtitle}</p><form onSubmit={submit}>{!onlyPassword && <label>Email address<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>}{mode !== "forgot" && <label>{mode === "update" ? "New password" : "Password"}<span className="password-input"><input type={showPassword ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={12} value={password} onChange={(e) => setPassword(e.target.value)} /><button className="password-toggle" type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button></span></label>}{error && <p className="form-message error" role="alert">{error}</p>}{notice && <p className="form-message success" role="status">{notice}</p>}<button className="button" disabled={loading}>{loading ? "Please wait..." : content.submit}</button></form>{mode === "login" && <><Link href="/forgot-password">Forgot password?</Link><p className="auth-switch">New here? <Link href="/signup">Create an account</Link></p></>}{mode === "signup" && <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>}</section><p className="auth-disclaimer">Market intelligence only - not investment advice. Never share your password with anyone.</p></main>;
}
