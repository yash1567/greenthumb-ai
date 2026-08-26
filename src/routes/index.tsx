import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getUser, saveUser } from "../lib/auth";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { motion, AnimatePresence } from "framer-motion";

// Using background image asset
import bgImg from "@/assets/auth-bg.jpg";

export const Route = createFileRoute("/")({
  component: ExactAuthPortal,
});

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-3">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const BrandLogo = () => (
  <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-28 sm:h-28 drop-shadow-xl">
    <mask id="cutout">
      <rect width="100" height="100" fill="white" />
      <rect x="0" y="44" width="100" height="12" fill="black" />
    </mask>
    <circle cx="50" cy="50" r="46" fill="#84cc16" mask="url(#cutout)" />
    <circle cx="50" cy="50" r="20" fill="white" />
    <circle cx="50" cy="50" r="46" fill="transparent" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" mask="url(#cutout)" />
  </svg>
);

function ExactAuthPortal() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (getUser()) {
      navigate({ to: "/dashboard" });
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      if (email && password) {
        saveUser({ name: email.split("@")[0], email });
        navigate({ to: "/dashboard" });
      }
    } else {
      if (name && email && password) {
        saveUser({ name, email, farm: "My Farm" });
        navigate({ to: "/dashboard" });
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans text-foreground bg-background">
      
      {/* Left Pane - Abstract Waves */}
      <div className="relative hidden w-[45%] flex-col overflow-hidden lg:flex bg-gradient-leaf">
        {/* The generated background image as a subtle texture */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-20 mix-blend-overlay" 
          style={{ backgroundImage: `url(${bgImg})` }} 
        />
        
        {/* Text and Logo Overlay */}
        <div className="relative z-10 flex h-full flex-col px-12 py-14">
          <h2 className="text-3xl font-medium tracking-wide text-white drop-shadow-md">
            Welcome<br />Back
          </h2>
          
          <div className="flex flex-1 items-center gap-6 mt-10">
            <BrandLogo />
            <div>
              <h1 className="text-6xl font-semibold tracking-tight drop-shadow-md" style={{ letterSpacing: "-0.02em" }}>
                {t('landing.title')}
              </h1>
              <h3 className="mt-2 text-3xl font-medium text-white/90 drop-shadow-sm">
                {t('appshell.smartFarming')}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex w-full flex-col lg:w-[55%] relative bg-muted/20">
        <div className="absolute top-6 right-6 z-20">
          <LanguageSwitcher />
        </div>

        <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-[460px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.98 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-card rounded-[2rem] shadow-2xl shadow-black/5 border border-border/50 p-8 sm:p-10 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-lime via-leaf to-primary" />
                
                <div className="mb-8">
                  <h2 className="text-[32px] font-semibold text-foreground tracking-wide font-display">
                    {isLogin ? t('auth.welcomeBack') : t('auth.createAccountTitle')}
                  </h2>
                  <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed">
                    {isLogin ? t('auth.enterDetails') : t('auth.createAccountDesc')}
                  </p>
                </div>

                {/* Google Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  className="flex w-full items-center justify-center rounded-xl border border-border bg-background py-3.5 text-[15px] font-medium text-foreground transition-colors hover:bg-muted shadow-sm"
                >
                  <GoogleIcon />
                  {isLogin ? "Sign in with Google" : "Sign up with Google"}
                </motion.button>

                {/* Divider */}
                <div className="my-7 flex items-center">
                  <div className="flex-1 border-t border-border"></div>
                  <span className="px-4 text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                    Or {isLogin ? t('nav.signIn') : t('nav.getStarted')} with Email
                  </span>
                  <div className="flex-1 border-t border-border"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1.5">
                      <label className="text-[13px] font-medium text-muted-foreground">{t('auth.fullName')}</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-[14px] text-foreground placeholder-muted-foreground/50 outline-none transition focus:border-lime focus:ring-2 focus:ring-lime/20"
                      />
                    </motion.div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-muted-foreground">{t('auth.email')}</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="farmer@example.com"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-[14px] text-foreground placeholder-muted-foreground/50 outline-none transition focus:border-lime focus:ring-2 focus:ring-lime/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-muted-foreground">{t('auth.password')}</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-[14px] text-foreground placeholder-muted-foreground/50 outline-none transition focus:border-lime focus:ring-2 focus:ring-lime/20"
                    />
                  </div>

                  {isLogin && (
                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border bg-background text-lime focus:ring-0 focus:ring-offset-0 transition-colors group-hover:border-lime"
                        />
                        <span className="text-[13px] text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
                      </label>
                      <a href="#" className="text-[13px] font-medium text-lime hover:text-lime/80 transition-colors">
                        {t('auth.forgotPassword')}
                      </a>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="mt-6 w-full rounded-xl bg-lime py-4 text-[15px] font-semibold text-lime-foreground shadow-glow transition-all hover:brightness-105"
                  >
                    {isLogin ? t('nav.signIn') : t('auth.createAccountBtn')}
                  </motion.button>
                </form>

                <div className="mt-8 text-center border-t border-border/50 pt-6">
                  <p className="text-[13px] text-muted-foreground">
                    {isLogin ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="font-semibold text-lime hover:text-lime/80 transition-colors"
                    >
                      {isLogin ? t('nav.getStarted') : t('nav.signIn')}
                    </button>
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
