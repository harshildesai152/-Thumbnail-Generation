import Header from "@/components/layout/Header";
import Hero from "@/components/hero/Hero";
import DashboardPreview from "@/components/dashboard-preview/DashboardPreview";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <DashboardPreview />
    </div>
  );
}
