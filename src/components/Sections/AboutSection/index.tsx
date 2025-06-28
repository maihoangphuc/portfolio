"use client";

import SectionContainer from "@/components/SectionContainer";
import TimelineItem from "@/components/TimelineItem";
import { timelines } from "@/mockdata";
import { Box } from "@mui/material";
import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";

const AboutSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

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
        {/* Main timeline line */}
        <Box className="absolute left-[188px] w-[1px] h-[calc(100%-2rem)] bg-gradient-to-b from-gray-700/30 via-gray-700/50 to-gray-700/30" />

        {/* Progress timeline line */}
        <motion.div
          style={{
            scaleY,
            originY: 0,
          }}
          className="!absolute !left-[188px] !w-[1px] !h-[calc(100%-2rem)] !bg-gradient-to-b !from-blue-500/50 !via-blue-500 !to-blue-500/50"
        />

        <motion.div
          ref={containerRef}
          className="!space-y-2 !relative !py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {timelines.map((timeline, index) => {
            return (
              <TimelineItem
                key={index}
                data={timeline}
                isLast={index === timelines.length - 1}
                scrollYProgress={scrollYProgress}
                index={index}
                total={timelines.length}
              />
            );
          })}
        </motion.div>
      </Box>
    </SectionContainer>
  );
};

export default AboutSection;
