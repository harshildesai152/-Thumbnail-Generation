import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Thumbnail Generator",
  description: "Generate thumbnails in seconds",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
