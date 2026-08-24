import type { Metadata, Viewport } from "next";
import { Cairo, Inter } from "next/font/google";
import { getDictionary, getDirection, getLocale } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/site-config";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.nameEn}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: `${siteConfig.name} | ${siteConfig.nameEn}`,
  keywords: [
    "وصلة",
    "Wasla",
    "link in bio",
    "صناع المحتوى",
    "التسويق بالمؤثرين",
    "influencer marketing",
  ],
  openGraph: {
    type: "website",
    locale: "ar",
    alternateLocale: ["en"],
    url: siteConfig.url,
    siteName: `${siteConfig.name} | ${siteConfig.nameEn}`,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f766e" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1b1e" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const dir = getDirection(locale);
  const t = await getDictionary(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${inter.variable} ${cairo.variable} h-full`}
    >
      <body className="flex min-h-full flex-col font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LocaleProvider locale={locale} dir={dir} t={t}>
            {children}
            <Toaster dir={dir} position="top-center" closeButton />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
