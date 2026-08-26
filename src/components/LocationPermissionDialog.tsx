import React from "react";
import { MapPin, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface LocationDialogProps {
  open?: boolean;
  onAllow?: () => void;
  onDeny?: () => void;
  onRequestPermission?: () => void;
}

export function LocationPermissionDialog({ open, onAllow, onDeny, onRequestPermission }: LocationDialogProps) {
  if (open === false) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl border border-border">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MapPin className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-center text-lg font-semibold text-foreground">Enable Location Services</h3>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          KrushiMitra needs your location to provide real-time hyper-local weather reports for your farm.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="w-full" onClick={onDeny}>
            Use Default
          </Button>
          <Button className="w-full" onClick={onAllow || onRequestPermission}>
            Allow Location
          </Button>
        </div>
      </div>
    </div>
  );
}

export function LocationDeniedBanner({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-amber-600 dark:text-amber-400">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <span className="text-xs font-medium">Location access denied. Showing default Pune weather.</span>
      </div>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry} className="text-xs">
          Enable GPS
        </Button>
      )}
    </div>
  );
}

export function LocationLoadingOverlay() {
  return (
    <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      <span>Acquiring farm location...</span>
    </div>
  );
}
