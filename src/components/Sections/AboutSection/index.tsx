"use client";

import TimelineItem from "@/components/TimelineItem";
import SectionContainer from "@/components/SectionContainer";
import { Box } from "@mui/material";
import { timelines } from "@/mockdata";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const AboutSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 0.8], ["0%", "100%"]);

  return (
    <SectionContainer
      sectionId="about"
      titleDescription="Get To Know"
      title="About"
      showWave={{ top: true, bottom: true }}
      className="!flex !flex-col !min-h-[600px]"
      classChildren="!py-12"
    >
      <Box ref={containerRef} className="!relative">
        {/* Main Timeline Line */}
        <Box className="!hidden md:!block !absolute !left-[200px] !w-[2px] !-translate-x-1/2 !top-[13px] !bottom-[13px] !bg-light-primary/20 dark:!bg-dark-primary/20">
          <motion.div
            className="!absolute !top-0 !left-0 !right-0 !bg-light-primary dark:!bg-dark-primary"
            style={{ height: lineHeight }}
          />
        </Box>

        {/* Timeline Items */}
        <Box>
          {timelines.map((timeline, index) => (
            <TimelineItem
              key={index}
              {...timeline}
              isFirst={index === 0}
              isLast={index === timelines.length - 1}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </Box>
      </Box>
    </SectionContainer>
  );
};

export default AboutSection;
