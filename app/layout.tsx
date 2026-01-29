import type { Metadata } from "next";
import { Providers } from "./providers";
import "@jllt/alize-ui/dist/alize.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Alize App",
  description: "Built with Alize UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
