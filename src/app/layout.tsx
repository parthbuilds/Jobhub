import type { Metadata } from "next";
import { Inter, Roboto, Open_Sans, Lato, Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-roboto" });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans" });
const lato = Lato({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-lato" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

export const metadata: Metadata = {
  title: "Careers Page Builder",
  description: "Build beautiful careers pages for your company",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${roboto.variable} ${openSans.variable} ${lato.variable} ${montserrat.variable} font-sans antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
