import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { PixelBackground } from "@/components/shared/PixelBackground";
import { AuthProvider } from "@/components/AuthProvider";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { AbortErrorSuppressor } from "@/components/AbortErrorSuppressor";

export const metadata: Metadata = {
  title: "JobBuff (职场外挂) - AI 求职辅助神器",
  description: "一站式 AI 求职辅助工具 —— 读得透、改得快、记得住。深度解析 JD，智能重写简历，模拟面试训练。",
  keywords: "求职, AI, 简历优化, 面试, JD分析, 职场",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <GoogleAnalytics />
        <AbortErrorSuppressor />
        <AuthProvider>
          <PixelBackground />
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 120px)' }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

