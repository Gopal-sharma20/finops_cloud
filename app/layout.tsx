import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TranslationProvider } from "@/components/i18n/translation-provider"
import { SkipLinks } from "@/components/accessibility/skip-links"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CloudOptima - Multi-Cloud FinOps Platform",
  description: "Optimize cloud costs across AWS, Azure, and Google Cloud Platform with intelligent insights, automated recommendations, and executive-level reporting.",
  keywords: "finops, cloud optimization, multi-cloud, cost management, aws, azure, gcp",
  authors: [{ name: "CloudOptima Team" }],
  creator: "CloudOptima",
  publisher: "CloudOptima",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://cloudoptima.com"),
  openGraph: {
    title: "CloudOptima - Multi-Cloud FinOps Platform",
    description: "Optimize cloud costs across AWS, Azure, and Google Cloud Platform with intelligent insights and executive-level reporting.",
    url: "https://cloudoptima.com",
    siteName: "CloudOptima",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CloudOptima Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CloudOptima - Multi-Cloud FinOps Platform",
    description: "Optimize cloud costs across AWS, Azure, and Google Cloud Platform",
    creator: "@cloudoptima",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-token",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={inter.className}>
        <SkipLinks />
        <TranslationProvider>
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </TranslationProvider>
      </body>
    </html>
  )
}