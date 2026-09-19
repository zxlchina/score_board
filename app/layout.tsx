import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { FloatingBubbles } from "@/components/FloatingBubbles";
import { SiteHeader } from "@/components/SiteHeader";
import { SoundProvider } from "@/components/SoundProvider";
import { getBasePath } from "@/lib/base-path";
import { getThemeConfig } from "@/lib/services/settings";
import { themeCssVarsStyle, themeToCssVars } from "@/lib/theme";

const cartoon = Nunito({
  variable: "--font-cartoon",
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
});

const siteUrl = "https://lichzhang.net/tools/score_board";
const iconPath = `${getBasePath()}/og.png`;
const shareImage = `${siteUrl}/share-v2.jpg`;

export const metadata: Metadata = {
  title: "积分小星球",
  description: "小朋友积分奖励与扣除",
  metadataBase: new URL(`${siteUrl}/`),
  icons: {
    icon: [{ url: iconPath, type: "image/png" }],
    apple: [{ url: iconPath }],
  },
  openGraph: {
    title: "积分小星球",
    description: "小朋友积分奖励与扣除",
    url: `${siteUrl}/`,
    siteName: "积分小星球",
    type: "website",
    images: [
      {
        url: shareImage,
        width: 1024,
        height: 1024,
        alt: "积分小星球",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "积分小星球",
    description: "小朋友积分奖励与扣除",
    images: [shareImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeStyle = themeCssVarsStyle(themeToCssVars(getThemeConfig()));

  return (
    <html lang="zh-CN">
      <body className={`${cartoon.variable} antialiased`} style={themeStyle}>
        <FloatingBubbles />
        <SoundProvider>
          <div className="relative z-10">
            <SiteHeader />
            <main className="mx-auto max-w-lg px-4 pb-12 pt-5">{children}</main>
          </div>
        </SoundProvider>
      </body>
    </html>
  );
}
