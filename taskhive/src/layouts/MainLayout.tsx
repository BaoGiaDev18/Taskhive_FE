import Navbar from "../components/Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 w-full">
      {children}
      </main>
    </>
  );
}
