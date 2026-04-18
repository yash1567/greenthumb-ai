import { type ReactNode } from "react";

export function StatusBadge({
  status,
  children,
}: {
  status: "good" | "warn" | "bad";
  children: ReactNode;
}) {
  const map = {
    good: "bg-good/15 text-good",
    warn: "bg-warn/20 text-[oklch(0.45_0.12_75)]",
    bad: "bg-bad/15 text-bad",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${map[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "good" ? "bg-good" : status === "warn" ? "bg-warn" : "bg-bad"}`} />
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  hint?: string;
  tone?: "default" | "leaf" | "sun" | "sky";
}) {
  const toneMap = {
    default: "bg-card",
    leaf: "bg-gradient-leaf text-primary-foreground",
    sun: "bg-gradient-sun text-sun-foreground",
    sky: "bg-sky/30 text-sky-foreground",
  } as const;
  const isAccent = tone !== "default";
  return (
    <div className={`group relative overflow-hidden rounded-3xl p-6 shadow-card transition hover:-translate-y-0.5 ${toneMap[tone]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium uppercase tracking-wider ${isAccent ? "opacity-80" : "text-muted-foreground"}`}>
            {label}
          </p>
          <p className="mt-3 font-display text-4xl font-semibold leading-none">
            {value}
            {unit && <span className="ml-1 text-lg opacity-70">{unit}</span>}
          </p>
          {hint && (
            <p className={`mt-2 text-xs ${isAccent ? "opacity-80" : "text-muted-foreground"}`}>{hint}</p>
          )}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isAccent ? "bg-white/20" : "bg-muted"}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-border/60 bg-card p-6 shadow-card sm:p-7 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
