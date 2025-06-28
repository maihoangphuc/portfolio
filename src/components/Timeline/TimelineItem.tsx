import { motion } from "framer-motion";
import { Box, Typography } from "@mui/material";
import { TimelineType } from "@/types/about";
import { timelines } from "@/mockdata";
import clsx from "clsx";

interface TimelineItemProps {
  item: TimelineType;
  index: number;
  progress: number;
}

const TimelineItem = ({ item, index, progress }: TimelineItemProps) => {
  // Calculate visibility based on scroll position
  const itemPosition = (index + 0.5) / timelines.length;
  const fadeStart = itemPosition - 0.1;
  const fadeProgress = (progress - fadeStart) / 0.1;
  const visibility = Math.min(Math.max(fadeProgress, 0), 1);

  // Calculate line progress
  const lineStart = itemPosition;
  const lineProgress = (progress - lineStart) / (1 / timelines.length);
  const lineVisibility = Math.min(Math.max(lineProgress, 0), 1);

  const isLastItem = index === timelines.length - 1;
  const x = index % 2 === 0 ? -20 : 20;
  const translateX = x * (1 - visibility);

  return (
    <motion.div
      className={clsx(
        "flex md:items-center relative",
        index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse",
        "flex-col items-center"
      )}
      style={{
        marginBottom: isLastItem ? "0" : "60px",
      }}
    >
      {/* Mobile timeline container */}
      <div className="md:hidden w-full flex flex-col items-center relative">
        {/* Year for mobile */}
        <motion.div
          className="relative z-10 mb-4"
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
            className="text-lg font-bold text-light-secondary dark:text-dark-secondary"
          >
            {item.year}
          </Typography>
        </motion.div>

        {/* Content for mobile */}
        <motion.div
          style={{
            opacity: visibility,
          }}
          className="w-full xs:w-2/3 relative z-10"
          initial={{ opacity: 0 }}
          animate={{
            opacity: visibility,
            transition: {
              duration: 0.5,
              ease: "easeOut",
            },
          }}
        >
          <Box className="p-6 bg-light-bg dark:bg-dark-bg rounded-lg">
            <Typography
              variant="h5"
              className="font-semibold mb-2 text-light-primary dark:text-dark-primary"
            >
              {item.title}
            </Typography>
            <Typography
              variant="body1"
              className="text-light-primary dark:text-dark-primary"
            >
              {item.subtitle}
            </Typography>
          </Box>
        </motion.div>

        {/* Progress line after content - hide for last item */}
        {!isLastItem && (
          <div
            className="absolute w-0.5 bottom-[-60px] z-0 h-16"
            style={{ backgroundColor: "transparent" }}
          >
            <motion.div
              className="absolute w-full bg-light-primary dark:bg-dark-primary"
              style={{
                height: `${lineVisibility * 100}%`,
                top: 0,
                originY: 0,
              }}
              initial={{ scaleY: 0 }}
              animate={{
                scaleY: lineVisibility,
                transition: {
                  duration: 0.5,
                  ease: "easeOut",
                },
              }}
            />
          </div>
        )}
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
        <Box className="p-6 bg-light-bg dark:bg-dark-bg rounded-lg">
          <Typography
            variant="h5"
            className="font-semibold mb-2 text-light-primary dark:text-dark-primary"
          >
            {item.title}
          </Typography>
          <Typography
            variant="body1"
            className="text-light-primary dark:text-dark-primary"
          >
            {item.subtitle}
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
          className="w-3 h-3 rounded-full bg-light-primary dark:bg-dark-primary relative"
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
          className="text-lg font-bold text-light-secondary dark:text-dark-secondary ml-4"
        >
          {item.year}
        </Typography>
      </motion.div>
    </motion.div>
  );
};

export default TimelineItem;
