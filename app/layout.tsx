import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import { assetPath } from '@/lib/paths'
import { SpeedInsights } from "@vercel/speed-insights/next";
import './globals.css'
import { hasFeature } from '@/lib/app-feature'
import { headers } from "next/headers";
import { Tracking } from '@/components/logging'
import { headersMap } from '@/lib/server-context'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const rubik = localFont({
  src: [
    {
      path: '../public/fonts/Rubik-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/Rubik-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Rubik-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Rubik-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/Rubik-Black.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-rubik',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: assetPath('/icons/icon-light-32x32.png'),
        media: '(prefers-color-scheme: light)',
      },
      {
        url: assetPath('/icons/icon-dark-32x32.png'),
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: assetPath('/icons/icon.svg'),
        type: 'image/svg+xml',
      },
    ],
    apple: assetPath('/icons/apple-icon.png'),
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default async function RootLayout({
  children,
  header,
}: Readonly<{
  children: React.ReactNode
  header: React.ReactNode
}>) {
  const info = headersMap(await headers());
  const [
    noSpeed,
    noAnalytics,
  ] = await hasFeature(
    "no-speed",
    "no-analitics",
  );
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${rubik.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {header}
        {children}
        {!noAnalytics && <Analytics />}
        {!noSpeed && (
          <SpeedInsights />
        )}
      </body>
      <Tracking info={info} />
    </html>
  )
}
