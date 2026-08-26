import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Leaf, ArrowRight, Mail, Lock, User as UserIcon, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import authBg from "@/assets/auth-bg.jpg";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to KrushiMitra — Smart Farming for Indian Growers" },
      { name: "description", content: "Sign in or create your free KrushiMitra account to access AI-powered soil, crop, pest and weather insights." },
      { property: "og:title", content: "Sign in to KrushiMitra" },
      { property: "og:description", content: "Free account for farmers. AI-powered soil, crop, pest and weather insights." },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2, "Tell us your name").max(100),
  farmLocation: z.string().trim().max(120).optional().or(z.literal("")),
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [submitting, setSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [farmLocation, setFarmLocation] = useState("");

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message.includes("Invalid") ? "Invalid email or password" : error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    const parsed = signUpSchema.safeParse({ email, password, fullName, farmLocation });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: parsed.data.fullName,
          farm_location: parsed.data.farmLocation ?? "",
        },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message.includes("registered") ? "This email is already registered" : error.message);
      return;
    }
    toast.success("Account created! Welcome to KrushiMitra 🌱");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: imagery */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={authBg}
          alt="Indian farmer in lush paddy fields at golden hour"
          className="absolute inset-0 h-full w-full object-cover"
          width={1280}
          height={1600}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/85 via-primary/55 to-transparent" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime text-lime-foreground shadow-glow">
              <Leaf className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold leading-none">KrushiMitra</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-primary-foreground/70">Smart Farming</p>
            </div>
          </Link>

          <div className="max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" /> AI for every farmer
            </span>
            <h2 className="mt-6 font-display text-5xl font-semibold leading-[1.05]">
              Your fields,<br />
              <span className="italic text-lime">decoded by AI.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-primary-foreground/85">
              Sign in to track soil health, get personalized crop recommendations, detect pests from a photo, and plan around the weather — all in one calm dashboard.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm text-primary-foreground/80">
            <div><p className="font-display text-2xl font-semibold text-primary-foreground">20+</p><p className="text-xs">Indian crops</p></div>
            <div><p className="font-display text-2xl font-semibold text-primary-foreground">7-day</p><p className="text-xs">forecasts</p></div>
            <div><p className="font-display text-2xl font-semibold text-primary-foreground">98%</p><p className="text-xs">pest accuracy</p></div>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="relative flex items-center justify-center bg-background px-5 py-10 sm:px-10">
        <Link to="/" className="absolute left-5 top-5 flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground sm:left-8 sm:top-8 lg:hidden">
          <Leaf className="h-4 w-4 text-primary" /> KrushiMitra
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {mode === "signin" ? "Welcome back" : "Get started"}
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground">
              {mode === "signin" ? "Sign in to your farm" : "Create your account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Continue where you left off."
                : "Free forever. No credit card needed."}
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 inline-flex w-full rounded-2xl border border-border bg-card p-1 shadow-soft">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                mode === "signin" ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                mode === "signup" ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
            {mode === "signup" && (
              <>
                <Field icon={UserIcon} label="Full name" placeholder="e.g. Ravi Kumar" value={fullName} onChange={setFullName} />
                <Field icon={MapPin} label="Farm location (optional)" placeholder="Village, District" value={farmLocation} onChange={setFarmLocation} />
              </>
            )}
            <Field icon={Mail} type="email" label="Email" placeholder="you@farm.in" value={email} onChange={setEmail} autoComplete="email" />
            <Field icon={Lock} type="password" label="Password" placeholder="At least 6 characters" value={password} onChange={setPassword} autoComplete={mode === "signin" ? "current-password" : "new-password"} />

            <button
              type="submit"
              disabled={submitting}
              className="group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "Sign in" : "Create account"}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to KrushiMitra?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-semibold text-primary hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in instead"}
            </button>
          </p>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing you agree to our friendly use of your soil readings to improve recommendations.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  icon: typeof Mail;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type={type}
          required={!label.includes("optional")}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-border bg-card py-3.5 pl-11 pr-4 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </label>
  );
}
