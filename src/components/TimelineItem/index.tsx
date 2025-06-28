import { Box } from "@mui/material";
import { motion, MotionValue, useTransform } from "framer-motion";
import { Timeline } from "@/types/about";

interface TimelineItemProps {
  data: Timeline;
  isLast?: boolean;
  scrollYProgress: MotionValue<number>;
  index: number;
  total: number;
}

const TimelineItem = ({
  data,
  isLast = false,
  scrollYProgress,
  index,
  total,
}: TimelineItemProps) => {
  const threshold = index / total;

  const opacity = useTransform(
    scrollYProgress,
    [threshold - 0.15, threshold, threshold + 0.15],
    [0, 1, 1]
  );

  const yPos = useTransform(
    scrollYProgress,
    [threshold - 0.15, threshold],
    [50, 0]
  );

  return (
    <motion.div
      style={{ opacity, y: yPos }}
      className="!flex !items-start !gap-8 !w-full !group !relative"
    >
      {/* Year on the left */}
      <Box className="!w-[180px] !text-right !pt-1">
        <motion.p className="!text-sm !font-medium !text-gray-400 !tracking-wide !font-mono !group-hover:!text-blue-400 !transition-all !duration-300">
          {data.year}
        </motion.p>
      </Box>

      {/* Timeline dot and line */}
      <Box className="!relative !flex !flex-col !items-center !min-h-[80px]">
        <motion.div
          className="!w-4 !h-4 !rounded-full !border-2 !border-blue-500 !bg-background !group-hover:!bg-blue-500 !transition-all !duration-300 !absolute !-translate-x-[8px]"
          style={{
            scale: useTransform(
              scrollYProgress,
              [threshold - 0.15, threshold],
              [0.5, 1]
            ),
          }}
        />
      </Box>

      {/* Content on the right */}
      <Box className={`!flex-1 ${!isLast ? "!pb-8" : ""}`}>
        <motion.div
          className="!p-4 !rounded-lg !bg-gray-900/30 !backdrop-blur-sm !border !border-gray-800/50 !transform-gpu !transition-all !duration-300 !hover:!border-blue-500/30 !hover:!bg-gray-900/50"
          style={{
            x: useTransform(
              scrollYProgress,
              [threshold - 0.15, threshold],
              [30, 0]
            ),
          }}
        >
          <motion.h3 className="!text-lg !font-semibold !text-gray-100 !mb-1 !group-hover:!text-blue-400 !transition-colors !duration-300">
            {data.title}
          </motion.h3>
          <motion.p className="!text-sm !text-gray-400 !font-medium">
            {data.subtitle}
          </motion.p>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default TimelineItem;
