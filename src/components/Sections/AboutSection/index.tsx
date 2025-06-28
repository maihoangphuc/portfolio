"use client";

import SectionContainer from "@/components/SectionContainer";
import AnimatedTimeline from "@/components/Timeline/AnimatedTimeline";
import { Box } from "@mui/material";

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
      <Box className="!w-full !max-w-5xl !mx-auto !relative !mt-12">
        <AnimatedTimeline />
      </Box>
    </SectionContainer>
  );
};

export default AboutSection;
