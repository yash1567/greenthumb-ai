import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, Sprout, CloudSun, Bug, Wheat, ShieldCheck } from "lucide-react";
import heroImg from "@/assets/hero-farm.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KrushiMitra — AI Smart Farming for Modern Growers" },
      { name: "description", content: "Soil analysis, crop recommendations, pest detection and weather — one calm dashboard for your farm." },
      { property: "og:title", content: "KrushiMitra — AI Smart Farming for Modern Growers" },
      { property: "og:description", content: "Soil analysis, crop recommendations, pest detection and weather — one calm dashboard for your farm." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Sprout, title: "Soil Analyzer", text: "Turn pH and NPK into clear, actionable advice." },
  { icon: Wheat, title: "Crop Recommender", text: "Top 3 crops with confidence and yield estimates." },
  { icon: Bug, title: "Pest Detection", text: "Snap a leaf — get diagnosis and treatment in seconds." },
  { icon: CloudSun, title: "Weather Insights", text: "7-day forecasts tuned for your farming window." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2.5 text-primary-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime text-lime-foreground shadow-glow">
              <Leaf className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <span className="font-display text-2xl font-semibold">KrushiMitra</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-primary-foreground/80 md:flex">
            <a href="#features" className="hover:text-primary-foreground">Features</a>
            <a href="#how" className="hover:text-primary-foreground">How it works</a>
            <a href="#trust" className="hover:text-primary-foreground">Why farmers trust us</a>
          </nav>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-lime-foreground shadow-glow transition hover:brightness-105"
          >
            Open dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Terraced green farmland at sunrise"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-background" />

        <div className="relative mx-auto max-w-7xl px-6 pb-32 pt-40 sm:pt-48 lg:pb-40">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl text-primary-foreground"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" /> AI for every farmer
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
              Grow smarter,<br />
              <span className="italic text-lime">season after season.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/85">
              KrushiMitra turns soil readings, weather and a single leaf photo into clear next steps —
              so your fields produce more with less guesswork.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-lime px-7 py-4 text-base font-semibold text-lime-foreground shadow-glow transition hover:scale-[1.02]"
              >
                Try the dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/soil"
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/5 px-7 py-4 text-base font-semibold text-primary-foreground backdrop-blur transition hover:bg-primary-foreground/15"
              >
                Analyze your soil
              </Link>
            </div>

            <dl className="mt-16 grid max-w-2xl grid-cols-3 gap-8 border-t border-primary-foreground/15 pt-8">
              {[
                ["38k+", "Acres analyzed"],
                ["94%", "Avg. recommendation accuracy"],
                ["7 days", "Forward weather window"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-3xl font-semibold text-lime">{v}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-wider text-primary-foreground/70">{l}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-leaf">Capabilities</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Everything your field needs, in one calm place.
          </h2>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group rounded-3xl border border-border bg-card p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-card"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-leaf text-primary-foreground shadow-soft">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-gradient-leaf py-24 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs uppercase tracking-[0.25em] text-lime">How it works</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Three steps from question to harvest plan.
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              ["01", "Tell us your field", "Enter pH, NPK, moisture and season — or import past readings."],
              ["02", "KrushiMitra analyzes", "Our models cross-reference soil, climate and crop history."],
              ["03", "Act with confidence", "Get the best crops, fertilizer plan and pest alerts instantly."],
            ].map(([n, t, d]) => (
              <div key={n} className="rounded-3xl border border-primary-foreground/15 bg-primary-foreground/5 p-8 backdrop-blur">
                <p className="font-display text-5xl font-semibold text-lime">{n}</p>
                <h3 className="mt-4 font-display text-2xl font-semibold">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/80">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / CTA */}
      <section id="trust" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-leaf">Built for farmers</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Plain language. Big buttons. Real results.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              No jargon, no clutter. KrushiMitra is designed for the field — readable in sunlight and
              fast on any phone.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Color-coded alerts you can read at a glance",
                "Works offline-friendly with cached recommendations",
                "Multilingual ready for regional crops",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-foreground">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-leaf" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/dashboard"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-card transition hover:scale-[1.02]"
            >
              Enter your dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-sun opacity-30 blur-3xl" />
            <div className="relative grid grid-cols-2 gap-4">
              {[
                { label: "Soil pH", value: "6.7", tone: "good" },
                { label: "Top crop", value: "Rice 🌾", tone: "leaf" },
                { label: "Forecast", value: "28°C ⛅", tone: "sky" },
                { label: "Pest risk", value: "Low", tone: "good" },
              ].map((c) => (
                <div
                  key={c.label}
                  className="rounded-3xl border border-border bg-card p-6 shadow-card"
                >
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
                  <p className="mt-3 font-display text-3xl font-semibold">{c.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Leaf className="h-4 w-4 text-leaf" /> © 2025 KrushiMitra Agritech
          </div>
          <p className="text-xs text-muted-foreground">Cultivating better seasons with AI.</p>
        </div>
      </footer>
    </div>
  );
}
