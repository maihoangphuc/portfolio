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
  const opacity = Math.max(
    0,
    Math.min(1, progress * timelineData.length - index)
  );
  const x = index % 2 === 0 ? -50 : 50;
  const translateX = x * (1 - opacity);

  return (
    <motion.div
      className={`flex items-center mb-16 relative ${
        index % 2 === 0 ? "flex-row" : "flex-row-reverse"
      }`}
      style={{
        top: `${(index * 100) / (timelineData.length + 1)}%`,
        opacity,
      }}
    >
      {/* Content */}
      <motion.div
        style={{
          x: translateX,
        }}
        className="w-5/12"
      >
        <Box className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg`}>
          <Typography variant="h6" className="text-xl font-bold mb-2">
            {item.year}
          </Typography>
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
        className="w-2/12 flex justify-center"
        style={{
          scale: opacity,
        }}
      >
        <Box
          className="w-5 h-5 rounded-full bg-blue-500 relative"
          style={{ zIndex: 2 }}
        />
      </motion.div>

      {/* Empty space for zigzag effect */}
      <Box className="w-5/12" />
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
      <Box
        className="absolute left-1/2 transform -translate-x-1/2 h-[90%] w-1 bg-gray-200 dark:bg-gray-700"
        style={{ zIndex: 0 }}
      />

      {/* Animated progress line */}
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-blue-500 origin-top"
        style={{
          height: "90%",
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
