import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BSSe Visual Assistant (POC)",
  description: "Canvas-like assistant for TPMs & SAs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="h-14 border-b bg-white flex items-center px-4 justify-between">
          <div className="font-semibold">BSSe Visual Assistant</div>
          <div className="text-sm text-gray-500">POC • Local mocks • No external calls</div>
        </header>
        {children}
      </body>
    </html>
  );
}
