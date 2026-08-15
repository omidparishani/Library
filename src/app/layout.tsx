import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "کتابخانه حسین | Hossein's Reading Library",
  description: "تاریخچه کتاب‌های خوانده شده توسط حسین - یک اپ کودکانه و شاد",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: "16px",
              background: "#fff",
              color: "#2d3436",
              fontFamily: "var(--font-vazirmatn)",
              fontSize: "15px",
              padding: "12px 20px",
            },
            success: {
              iconTheme: { primary: "#55efc4", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#ff7675", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
