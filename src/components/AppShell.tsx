import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Sprout,
  Wheat,
  Bug,
  CloudSun,
  History,
  Leaf,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/soil", label: "Soil Analyzer", icon: Sprout },
  { to: "/crops", label: "Crop Recommendation", icon: Wheat },
  { to: "/pest", label: "Pest Detection", icon: Bug },
  { to: "/weather", label: "Weather", icon: CloudSun },
  { to: "/history", label: "History", icon: History },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string | null; farm_location: string | null } | null>(null);

  const current = nav.find((n) => pathname.startsWith(n.to))?.label ?? "Dashboard";

  // Auth gate
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  // Load profile
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, farm_location")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [user]);

  const displayName = useMemo(() => {
    return profile?.full_name?.trim() || user?.email?.split("@")[0] || "Farmer";
  }, [profile, user]);

  const initials = useMemo(() => {
    const parts = displayName.split(" ").filter(Boolean);
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "F";
  }, [displayName]);

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-soft">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-lime text-lime-foreground shadow-glow">
            <Leaf className="h-6 w-6" />
          </div>
          <p className="text-sm">Loading KrushiMitra…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center gap-3 px-7">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime text-lime-foreground shadow-glow">
            <Leaf className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display text-xl font-semibold leading-none">KrushiMitra</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-sidebar-foreground/60">
              Smart Farming
            </p>
          </div>
        </div>

        <nav className="px-4 py-2">
          {nav.map((item) => {
            const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`group mb-1 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-4 bottom-6 rounded-3xl bg-sidebar-accent/60 p-5 backdrop-blur">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-lime text-lime-foreground">
            <Sprout className="h-4 w-4" />
          </div>
          <p className="font-display text-base font-semibold">Pro tips</p>
          <p className="mt-1 text-xs leading-relaxed text-sidebar-foreground/70">
            Test your soil every 4 weeks for the most accurate recommendations.
          </p>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between gap-4 px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground lg:hidden"
                aria-label="Toggle menu"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Today</p>
                <h1 className="font-display text-2xl font-semibold text-foreground">{current}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground shadow-soft md:flex">
                <Search className="h-4 w-4" />
                <input
                  className="w-56 bg-transparent outline-none placeholder:text-muted-foreground"
                  placeholder="Search crops, pests, fields…"
                />
              </div>
              <button className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-soft transition hover:bg-accent">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-bad" />
              </button>
              <div className="flex items-center gap-3 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-4 shadow-soft">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-leaf text-sm font-semibold text-primary-foreground">
                  RK
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold leading-tight text-foreground">Ravi Kumar</p>
                  <p className="text-xs leading-tight text-muted-foreground">Nashik farm</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-5 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
