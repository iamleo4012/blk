import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Field Reports — Admin",
  description: "Admin dashboard for the staff field reporting system",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
