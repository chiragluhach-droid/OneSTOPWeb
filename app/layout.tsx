import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "OneSTOP Admin — Manav Rachna University",
  description: "Workflow configuration panel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
