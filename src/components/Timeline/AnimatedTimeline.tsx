"use client";

import {
  motion,
  useScroll,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { Box, Typography } from "@mui/material";
import { useRef, useState } from "react";

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

const timelineData: TimelineItem[] = [
  {
    year: "2024",
    title: "Senior Frontend Developer",
    description: "Leading frontend development for enterprise applications",
  },
  {
    year: "2022",
    title: "Frontend Developer",
    description: "Building responsive web applications with React",
  },
  {
    year: "2020",
    title: "Junior Developer",
    description: "Started career in web development",
  },
  {
    year: "2019",
    title: "Junior Developer",
    description: "Started career in web development",
  },
];

const TimelineItem = ({
  item,
  index,
  progress,
}: {
  item: TimelineItem;
  index: number;
  progress: number;
}) => {
  // Calculate thresholds for this item
  const itemThreshold = (index + 1) / (timelineData.length + 1);
  const prevThreshold = index / (timelineData.length + 1);

  // Calculate if the progress has reached this item
  const hasReached = progress >= itemThreshold;
  const isApproaching = progress > prevThreshold && progress <= itemThreshold;

  // Calculate the progress within this item's section
  const sectionProgress = isApproaching
    ? (progress - prevThreshold) / (itemThreshold - prevThreshold)
    : hasReached
    ? 1
    : 0;

  // Calculate content opacity and position based on dot visibility
  const contentOpacity = sectionProgress;
  const x = index % 2 === 0 ? -50 : 50;
  const translateX = x * (1 - contentOpacity);

  return (
    <motion.div
      className={`flex items-center relative ${
        index % 2 === 0 ? "flex-row" : "flex-row-reverse"
      }`}
      style={{
        marginTop: index === 0 ? "0" : "100px",
      }}
    >
      {/* Content */}
      <motion.div
        style={{
          x: translateX,
          opacity: contentOpacity,
        }}
        className="w-[45%]"
        initial={{ opacity: 0, x: translateX }}
        animate={{
          opacity: contentOpacity,
          x: translateX,
          transition: {
            duration: 0.5,
          },
        }}
      >
        <Box className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg`}>
          <Typography variant="h5" className="font-semibold mb-2">
            {item.title}
          </Typography>
          <Typography
            variant="body1"
            className="text-gray-600 dark:text-gray-300"
          >
            {item.description}
          </Typography>
        </Box>
      </motion.div>

      {/* Dot */}
      <motion.div
        className="w-[10%] flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{
          scale: sectionProgress,
          transition: {
            type: "spring",
            stiffness: 200,
            damping: 20,
          },
        }}
      >
        <Box
          className="w-5 h-5 rounded-full bg-blue-500 relative"
          style={{ zIndex: 2 }}
        />
      </motion.div>

      {/* Empty space with Year */}
      <motion.div
        className="w-[45%] flex items-center"
        style={{
          justifyContent: index % 2 === 0 ? "flex-start" : "flex-end",
          opacity: contentOpacity,
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: contentOpacity,
          transition: {
            duration: 0.5,
          },
        }}
      >
        <Typography variant="h6" className={`text-3xl font-bold text-blue-500`}>
          {item.year}
        </Typography>
      </motion.div>
    </motion.div>
  );
};

const AnimatedTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  // Make the animation smoother
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setProgress(latest);
  });

  return (
    <Box ref={containerRef} className="relative min-h-[800px] py-10">
      {/* Background line */}
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gray-200 dark:bg-gray-700"
        style={{
          zIndex: 0,
          opacity: progress,
          transition: "opacity 0.3s ease-in-out",
          top: "50px",
          height: "calc(100% - 100px)",
        }}
      />

      {/* Animated progress line */}
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-blue-500 origin-top"
        style={{
          top: "50px",
          height: "calc(100% - 100px)",
          scaleY,
          zIndex: 1,
        }}
      />

      {/* Timeline items */}
      {timelineData.map((item, index) => (
        <TimelineItem
          key={item.year}
          item={item}
          index={index}
          progress={progress}
        />
      ))}
    </Box>
  );
};

export default AnimatedTimeline;
