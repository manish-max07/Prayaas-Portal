import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import LayoutWrapper from "@/components/LayoutWrapper";
import PageViewTracker from "@/components/PageViewTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  metadataBase: new URL("https://prayaaskaro.in"),
  title: {
    default:
      "PrayaasKaro | Free Test Series & Exam Practice with All India Rank Calculator and Latest Exam Updates and news",
    template: "%s | PrayaasKaro",
  },
  description:
    "Official examination portal for CBT practice, TCS iON response sheet evaluation, real-time rank predictions, free test series, and latest exam updates.",
  alternates: {
    canonical: "https://prayaaskaro.in",
  },
  openGraph: {
    title:
      "PrayaasKaro | Free Test Series & Exam Practice with All India Rank Calculator and Latest Exam Updates and news",
    description:
      "Official examination portal for CBT practice, TCS iON response sheet evaluation, real-time rank predictions, and latest exam updates.",
    url: "https://prayaaskaro.in",
    siteName: "PrayaasKaro",
    images: [
      {
        url: "/PrayaasKaroBgremoved.png",
        width: 800,
        height: 600,
        alt: "PrayaasKaro",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "PrayaasKaro | Free Test Series & Exam Practice with All India Rank Calculator and Latest Exam Updates and news",
    description:
      "Official examination portal for CBT practice, TCS iON response sheet evaluation, real-time rank predictions, and latest exam updates.",
    images: ["/PrayaasKaroBgremoved.png"],
  },
  icons: {
    icon: "/PrayaasKaroLogoWithoutText.png",
    shortcut: "/PrayaasKaroLogoWithoutText.png",
    apple: "/PrayaasKaroLogoWithoutText.png",
  },
  verification: {
    google: "google4b8e84a058fc3ad4",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans"
      >
        <AuthProvider>
          <PageViewTracker />
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
