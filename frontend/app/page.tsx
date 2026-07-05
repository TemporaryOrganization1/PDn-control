import { ChecksGrid } from "@/components/marketing/checks-grid";
import { EvidenceSection } from "@/components/marketing/evidence-section";
import { FAQSection } from "@/components/marketing/faq-section";
import { FinalCTA } from "@/components/marketing/final-cta";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { RiskSection } from "@/components/marketing/risk-section";
import { SecuritySection } from "@/components/marketing/security-section";
import { UseCases } from "@/components/marketing/use-cases";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <HowItWorks />
      <ChecksGrid />
      <EvidenceSection />
      <RiskSection />
      <UseCases />
      <SecuritySection />
      <FAQSection />
      <FinalCTA />
    </div>
  );
}
