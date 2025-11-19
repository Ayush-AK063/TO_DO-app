import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Todo App - Next.js & Supabase",
  description: "A modern todo application built with Next.js and Supabase",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
