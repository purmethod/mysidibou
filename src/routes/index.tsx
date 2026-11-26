import { createFileRoute } from "@tanstack/react-router";

import {
  ContributionSection,
  FinaleSection,
  FollowSection,
  FooterSection,
  TeamSection,
  TransparencySection,
} from "@/components/site/sections";
import { IntroSection, ParticipateSection, PostsSection, StorySection } from "@/components/site/story";
import { SiteNav } from "@/components/site/nav";
import { ScrollProgress } from "@/components/site/ui";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main id="top">
      <SiteNav />
      <ScrollProgress />
      <IntroSection />
      <StorySection />
      <PostsSection />
      <ParticipateSection />
      <TeamSection />
      <ContributionSection />
      <TransparencySection />
      <FollowSection />
      <FinaleSection />
      <FooterSection />
    </main>
  );
}

