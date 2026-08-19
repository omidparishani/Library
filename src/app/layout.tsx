import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppSettingsProvider } from "@/components/AppSettingsProvider";
import DueDateNotifier from "@/components/DueDateNotifier";

export const metadata: Metadata = {
  title: "کتابخانه حسین | Hossein's Reading Library",
  description: "تاریخچه کتاب‌های خوانده شده توسط حسین - یک اپ کودکانه و شاد",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body
        className="min-h-full flex flex-col font-sans bg-background text-foreground transition-colors duration-300"
        style={{ fontFamily: "Vazirmatn, Tahoma, system-ui, sans-serif" }}
      >
        <ThemeProvider>
          <AppSettingsProvider>
            {children}
            <DueDateNotifier />
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  borderRadius: "16px",
                  background: "var(--card)",
                  color: "var(--foreground)",
                  fontFamily: "Vazirmatn, system-ui, sans-serif",
                  fontSize: "15px",
                  padding: "12px 20px",
                },
              }}
            />
          </AppSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
