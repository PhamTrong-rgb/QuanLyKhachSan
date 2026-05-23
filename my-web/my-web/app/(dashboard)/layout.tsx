"use client";

import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HotelProvider } from "@/app/contexts/HotelContext";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Protective routing barrier
    const user = localStorage.getItem("userName");
    if (!user) {
      router.push("/login");
    } else {
      // eslint-disable-next-line
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) return null; // Prevents flashing Dashboard before redirect

  return (
    <HotelProvider>
      <div className="flex flex-col h-screen text-[var(--color-text)] bg-[var(--color-background)] overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-4 pr-8 pb-8 overflow-y-auto custom-scroll">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </HotelProvider>
  );
}
