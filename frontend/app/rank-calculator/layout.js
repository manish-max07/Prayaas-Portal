export const metadata = {
  title: "AVNL Rank Calculator, Answer Key 2026 & Cutoff | CIL MT 2026 Scorecard",
  description:
    "Official AVNL Rank Calculator & CIL MT 2026 Cutoff Tool. Evaluate your AVNL response sheet, check AVNL trade-wise cutoff, AVNL cutoff 2026, AVNL answer key 2026, and estimated AVNL result 2026 rankings.",
  keywords: [
    "AVNL rank calculator",
    "AVNL Answer key 2026",
    "AVNL cutoff",
    "AVNL cutoff 2026",
    "CIL MT 2026 cutoff",
    "AVNL trade wise cutoff",
    "AVNL response sheet",
    "AVNL result 2026",
    "CIL Management Trainee 2026 rank predictor",
    "TCS iON Response sheet score calculator",
    "Digialm response sheet marks calculator",
    "PSU answer key rank predictor",
    "Smart Score Card download",
  ],
  alternates: {
    canonical: "https://prayaas-portal.vercel.app/rank-calculator",
  },
  openGraph: {
    title: "AVNL Rank Calculator, Answer Key 2026 & Cutoff | CIL MT 2026 Scorecard",
    description:
      "Check AVNL cutoff 2026, AVNL trade wise cutoff, CIL MT 2026 cutoff, and evaluate your response sheet for instant All India Rank and Smart Scorecard.",
    url: "https://prayaas-portal.vercel.app/rank-calculator",
    siteName: "Prayaas Portal",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AVNL Rank Calculator & Answer Key 2026 Cutoff | Prayaas Portal",
    description:
      "Calculate your AVNL response sheet score, check AVNL trade wise cutoff & CIL MT 2026 cutoff with All India Ranks.",
  },
};

export default function RankCalculatorLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Prayaas Portal Exam Rank Predictor",
    url: "https://prayaas-portal.vercel.app/rank-calculator",
    applicationCategory: "EducationalApplication",
    operatingSystem: "All",
    description:
      "Online educational tool to calculate examination scores, negative deductions, and category ranks directly from TCS iON and Digialm response sheets.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
