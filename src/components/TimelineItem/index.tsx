"use client";

import { Box, Typography } from "@mui/material";
import { motion, MotionValue, useTransform } from "framer-motion";

interface TimelineItemProps {
  year: string;
  title: string;
  subtitle: string;
  isFirst?: boolean;
  isLast?: boolean;
  scrollYProgress: MotionValue<number>;
}

const TimelineItem = ({
  year,
  title,
  subtitle,
  scrollYProgress,
}: TimelineItemProps) => {
  const contentOpacity = useTransform(scrollYProgress, (value) =>
    value > 0.2 ? 1 : 0
  );
  const contentY = useTransform(scrollYProgress, (value) =>
    value > 0.2 ? 0 : 50
  );
  const dotScale = useTransform(scrollYProgress, (value) =>
    value > 0.2 ? 1 : 0
  );

  return (
    <Box className="!flex !flex-col md:!flex-row !gap-6 md:!gap-10 !relative !group sm:!items-center md:!items-start !py-8">
      {/* Year */}
      <motion.div
        className="!w-full xs:!w-[200px]"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <Typography className="!text-light-secondary dark:!text-dark-secondary !font-medium !text-base md:!text-lg sm:!text-center md:!text-left">
          {year}
        </Typography>
      </motion.div>

      {/* Content */}
      <Box className="!flex !flex-col !relative sm:!items-center md:!items-start">
        {/* Dot */}
        <motion.div
          className="!hidden md:!block !absolute !left-0 !top-[13px] !-translate-x-1/2 !w-3 !h-3 !rounded-full !bg-light-primary dark:!bg-dark-primary !z-10 !transition-all !duration-300
          !before:absolute !before:w-5 !before:h-5 !before:-left-1 !before:-top-1 !before:rounded-full !before:bg-gradient-to-r !before:from-emerald-300/40 !before:to-emerald-500/40
          !after:absolute !after:w-4 !after:h-4 !after:rounded-full !after:-left-0.5 !after:-top-0.5 !after:bg-gradient-to-r !after:from-emerald-300/60 !after:to-emerald-500/60
          !group-hover:scale-110 !group-hover:bg-emerald-300"
          style={{ scale: dotScale }}
        />

        {/* Title + Subtitle */}
        <motion.div
          className="md:!pl-8 !flex !flex-col sm:!items-center md:!items-start"
          style={{ opacity: contentOpacity, y: contentY }}
        >
          <Typography className="!text-light-primary dark:!text-dark-primary !font-semibold !text-lg md:!text-xl !mb-2 sm:!text-center md:!text-left">
            {title}
          </Typography>
          <Typography className="!text-light-primary dark:!text-dark-primary !italic !text-sm !mb-3 sm:!text-center md:!text-left">
            {subtitle}
          </Typography>
        </motion.div>
      </Box>
    </Box>
  );
};

export default TimelineItem;
