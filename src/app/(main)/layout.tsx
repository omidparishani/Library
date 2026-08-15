import Header from "@/components/Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {children}
      </main>
      <footer className="text-center py-6 text-sm text-gray-400">
        ساخته شده با ❤️ برای حسین
      </footer>
    </>
  );
}
