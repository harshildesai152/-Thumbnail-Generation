'use client';

import Header from "@/components/layout/Header";
import Hero from "@/components/hero/Hero";
import DashboardPreview from "@/components/dashboard-preview/DashboardPreview";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <DashboardPreview />
    </div>
  );
}
