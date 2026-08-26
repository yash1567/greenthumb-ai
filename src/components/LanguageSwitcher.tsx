import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === "en" ? "mr" : "en";
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur hover:bg-accent cursor-pointer transition-colors"
      type="button"
    >
      <Globe className="h-4 w-4 text-muted-foreground" />
      <span>{i18n.language === "en" ? "English" : "मराठी"}</span>
    </button>
  );
}
