import type { Metadata } from "next";
import { HotelProvider } from "./contexts/HotelContext";
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
        <HotelProvider>
          {children}
        </HotelProvider>
      </body>
    </html>
  );
}
