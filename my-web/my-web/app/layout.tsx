import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grand Luxe | Quản lý khách sạn",
  description: "Phần mềm quản lý khách sạn cao cấp Grand Luxe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
