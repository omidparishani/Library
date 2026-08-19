"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";

type AppSettings = {
  theme: string;
  bgType: "gradient" | "image";
  bgId: string;
  bgImage: string | null;
};

type Ctx = {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  loading: boolean;
};

const defaultSettings: AppSettings = {
  theme: "light",
  bgType: "gradient",
  bgId: "default",
  bgImage: null,
};

const GRADIENTS: Record<string, string> = {
  default: "linear-gradient(135deg, #fef9f3 0%, #e8f4f8 50%, #fff5f7 100%)",
  sky: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)",
  mint: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)",
  lavender: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)",
  peach: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)",
  rose: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)",
  dark: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
};

const AppSettingsContext = createContext<Ctx>({
  settings: defaultSettings,
  updateSettings: async () => {},
  loading: true,
});

export function useAppSettings() {
  return useContext(AppSettingsContext);
}

function applyBg(type: string, id: string, image: string | null) {
  if (typeof document === "undefined") return;
  if (type === "image" && image) {
    document.body.style.background = `url(${image}) center/cover no-repeat fixed`;
  } else {
    document.body.style.background = GRADIENTS[id] || GRADIENTS.default;
    document.body.style.backgroundImage = "";
  }
}

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        const next: AppSettings = {
          theme: data.theme || "light",
          bgType: (data.bgType as "gradient" | "image") || "gradient",
          bgId: data.bgId || "default",
          bgImage: data.bgImage || null,
        };
        setSettings(next);
        setTheme(next.theme);
        applyBg(next.bgType, next.bgId, next.bgImage);
      } catch {
        // fallback local
        const localTheme = localStorage.getItem("theme") || "light";
        setTheme(localTheme);
      } finally {
        setLoading(false);
      }
    })();
  }, [setTheme]);

  const updateSettings = useCallback(
    async (partial: Partial<AppSettings>) => {
      const next = { ...settings, ...partial };
      setSettings(next);
      if (partial.theme) setTheme(partial.theme);
      applyBg(next.bgType, next.bgId, next.bgImage);

      try {
        await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            theme: next.theme,
            bgType: next.bgType,
            bgId: next.bgId,
            bgImage: next.bgImage || "",
          }),
        });
      } catch {
        // still applied locally
      }
    },
    [settings, setTheme]
  );

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export { GRADIENTS };
