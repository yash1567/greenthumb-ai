import { useEffect, useState } from "react";
import { getUser, logoutUser } from "../lib/auth";
import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
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
} from "lucide-react";

const navItems = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/soil", labelKey: "nav.soilAnalyzer", icon: Sprout },
  { to: "/crops", labelKey: "nav.cropRecommendation", icon: Wheat },
  { to: "/pest", labelKey: "nav.pestDetection", icon: Bug },
  { to: "/weather", labelKey: "nav.weather", icon: CloudSun },
  { to: "/history", labelKey: "nav.history", icon: History },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(() => getUser());
  
  const currentItem = navItems.find((n) => pathname.startsWith(n.to));
  const current = currentItem ? t(currentItem.labelKey) : t("nav.dashboard");

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
            <p className="font-display text-xl font-semibold leading-none">{t('landing.title')}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-sidebar-foreground/60">
              {t('appshell.smartFarming')}
            </p>
          </div>
        </div>

        <nav className="px-4 py-2">
          {navItems.map((item) => {
            const active =
              pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
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
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-4 bottom-6 rounded-3xl bg-sidebar-accent/60 p-5 backdrop-blur">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-lime text-lime-foreground">
            <Sprout className="h-4 w-4" />
          </div>
          <p className="font-display text-base font-semibold">{t('appshell.proTips')}</p>
          <p className="mt-1 text-xs leading-relaxed text-sidebar-foreground/70">
            {t('appshell.tipText')}
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
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t('appshell.today')}</p>
                <h1 className="font-display text-2xl font-semibold text-foreground">{current}</h1>
              </div>
            </div>

            
            <div className="flex items-center gap-3">
  <div className="hidden text-left sm:block">
    <p className="text-sm font-semibold leading-tight text-foreground">
      {user?.name || t('appshell.guestUser')}
    </p>
    <p className="text-xs leading-tight text-muted-foreground">
      {user?.farm || t('appshell.noFarmSelected')}
    </p>
  </div>

  <LanguageSwitcher />

  <button
    onClick={() => {
      logoutUser();
      window.location.href = "/signin";
    }}
    className="rounded-lg bg-red-500 px-3 py-2 text-xs text-white hover:bg-red-600"
  >
    {t('nav.logout')}
  </button>
</div>
</div>
        </header>

        <main className="px-5 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
