import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Leaf } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }
  }, [loading, user, navigate]);

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

  return <>{children}</>;
}
