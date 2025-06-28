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
  // Calculate visibility based on scroll position
  const itemPosition = (index + 0.5) / timelineData.length;

  // Calculate fade effect
  const fadeStart = itemPosition - 0.1; // Start fading in slightly before the dot
  const fadeProgress = (progress - fadeStart) / 0.1; // Fade over 10% of the scroll
  const visibility = Math.min(Math.max(fadeProgress, 0), 1); // Clamp between 0 and 1

  // Calculate position for content
  const x = index % 2 === 0 ? -20 : 20;
  const translateX = x * (1 - visibility);

  return (
    <motion.div
      className={`flex md:items-center relative 
        ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}
        flex-col items-center
      `}
      style={{
        marginBottom: "60px",
      }}
    >
      {/* Mobile timeline container */}
      <div className="md:hidden w-full flex flex-col items-center relative">
        {/* Vertical line for mobile */}
        <motion.div
          className="absolute w-0.5 bg-gray-300 dark:bg-gray-600"
          style={{
            top: "0",
            height: "100%",
            opacity: visibility,
            zIndex: 0,
          }}
        />

        {/* Year for mobile */}
        <motion.div
          className="bg-white dark:bg-gray-900 relative z-10 mb-4"
          style={{
            opacity: visibility,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: visibility,
            transition: {
              duration: 0.5,
              ease: "easeOut",
            },
          }}
        >
          <Typography
            variant="h6"
            className="text-2xl font-bold text-blue-500 px-4"
          >
            {item.year}
          </Typography>
        </motion.div>

        {/* Content for mobile */}
        <motion.div
          style={{
            opacity: visibility,
          }}
          className="w-full max-w-[500px] px-8 relative z-10"
          initial={{ opacity: 0 }}
          animate={{
            opacity: visibility,
            transition: {
              duration: 0.5,
              ease: "easeOut",
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
      </div>

      {/* Desktop layout */}
      <motion.div
        style={{
          x: translateX,
          opacity: visibility,
        }}
        className="hidden md:block w-[45%]"
        initial={{ opacity: 0, x: translateX }}
        animate={{
          opacity: visibility,
          x: translateX,
          transition: {
            duration: 0.5,
            ease: "easeOut",
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

      {/* Dot - for desktop */}
      <motion.div
        className="hidden md:flex w-[10%] items-center justify-center"
        initial={{ scale: 0 }}
        animate={{
          scale: visibility,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 20,
            restDelta: 0.001,
          },
        }}
      >
        <Box
          className="w-3 h-3 rounded-full bg-blue-500 relative"
          style={{ zIndex: 2 }}
        />
      </motion.div>

      {/* Year for desktop */}
      <motion.div
        className="hidden md:flex w-[45%] items-center"
        style={{
          justifyContent: index % 2 === 0 ? "flex-start" : "flex-end",
          opacity: visibility,
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: visibility,
          transition: {
            duration: 0.5,
            ease: "easeOut",
          },
        }}
      >
        <Typography
          variant="h6"
          className={`text-2xl font-bold text-blue-500 ml-4`}
        >
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
      {/* Background line */}
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-200 dark:bg-gray-700"
        style={{
          zIndex: 0,
          opacity: progress,
          top: "32px",
          height: "calc(100% - 64px)",
        }}
      />

      {/* Animated progress line */}
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-blue-500 origin-top"
        style={{
          top: "32px",
          height: "calc(100% - 64px)",
          scaleY,
          zIndex: 1,
        }}
      />

      {/* Timeline items container */}
      <div className="relative pt-8">
        {timelineData.map((item, index) => (
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

export default AnimatedTimeline;
