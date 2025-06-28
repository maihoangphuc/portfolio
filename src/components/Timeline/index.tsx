"use client";

import TimelineItem from "@/components/Timeline/TimelineItem";
import { TimelineType } from "@/types/about";
import { Box } from "@mui/material";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";
import { useRef, useState } from "react";

interface TimelineProps {
  timelines: TimelineType[];
}

const Timeline = ({ timelines }: TimelineProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setProgress(latest);
  });

  return (
    <Box ref={containerRef} className="relative min-h-[800px] py-8">
      {/* Remove the mobile line from here since we're handling it per item */}
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-200 dark:bg-gray-700 hidden md:block"
        style={{
          zIndex: 0,
          opacity: progress,
          top: "32px",
          height: "calc(100% - 64px)",
        }}
      />

      {/* Animated progress line (desktop only) */}
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-light-primary dark:bg-dark-primary origin-top hidden md:block"
        style={{
          top: "32px",
          height: "calc(100% - 64px)",
          scaleY,
          zIndex: 1,
        }}
      />

      {/* Timeline items container */}
      <div className="relative pt-8">
        {timelines.map((item, index) => (
          <TimelineItem
            key={item.year}
            item={item}
            index={index}
            progress={progress}
          />
        ))}
      </div>
    </Box>
  );
};

export default Timeline;
