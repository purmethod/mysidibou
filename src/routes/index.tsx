import { createFileRoute } from "@tanstack/react-router";

import {
  CleaningSection,
  ContributionSection,
  DonateSection,
  EntranceSection,
  FinaleSection,
  FiveHundredSection,
  FollowSection,
  FooterSection,
  LocalsSection,
  MarqueeSection,
  MissionSection,
  PeopleSection,
  ProblemSection,
  ProgressSection,
  TeamSection,
  TransparencySection,
  UnescoSection,
} from "@/components/site/sections";
import { HeroSection } from "@/components/site/hero";
import { DonatePill, SiteNav } from "@/components/site/nav";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main id="top">
      <SiteNav />
      <HeroSection />
      <MarqueeSection />
      <ProblemSection />
      <MissionSection />
      <PeopleSection />
      <TeamSection />
      <CleaningSection />
      <LocalsSection />
      <EntranceSection />
      <ContributionSection />
      <TransparencySection />
      <ProgressSection />
      <UnescoSection />
      <FiveHundredSection />
      <FollowSection />
      <DonateSection />
      <FinaleSection />
      <FooterSection />
      <DonatePill />
    </main>
  );
}