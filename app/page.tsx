"use client";

import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { AIFeaturesSection } from "@/components/landing/ai-features-section";
import { CoreFeaturesSection } from "@/components/landing/core-features-section";
import { InvestmentFocusSection } from "@/components/landing/investment-focus-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <HeroSection />
      <AIFeaturesSection />
      <CoreFeaturesSection />
      <InvestmentFocusSection />
      <HowItWorksSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
