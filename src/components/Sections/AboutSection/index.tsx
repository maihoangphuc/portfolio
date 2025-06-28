"use client";

import SectionContainer from "@/components/SectionContainer";
import AnimatedTimeline from "@/components/Timeline/AnimatedTimeline";

const AboutSection = () => {
  return (
    <SectionContainer
      sectionId="about"
      titleDescription="Get To Know"
      title="About"
      showWave={{ top: true, bottom: true }}
      className="!flex !flex-col !min-h-[600px]"
      classChildren="!py-16"
    >
      <AnimatedTimeline />
    </SectionContainer>
  );
};

export default AboutSection;
