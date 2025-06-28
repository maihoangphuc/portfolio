"use client";

import SectionContainer from "@/components/SectionContainer";
import AnimatedTimeline from "@/components/Timeline";
import { timelines } from "@/mockdata";
import { Box } from "@mui/material";
import clsx from "clsx";

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
      <Box className={clsx("!w-full !max-w-3xl")}>
        <AnimatedTimeline timelines={timelines} />
      </Box>
    </SectionContainer>
  );
};

export default AboutSection;
