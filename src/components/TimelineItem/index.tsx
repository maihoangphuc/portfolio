import { Box, Typography } from "@mui/material";

interface TimelineItemProps {
  year: string;
  title: string;
  subtitle: string;
}

const TimelineItem = ({ year, title, subtitle }: TimelineItemProps) => (
  <Box className="!flex !flex-col md:!flex-row !gap-6 md:!gap-10 !relative !group sm:!items-center md:!items-start !py-6">
    <Box className="!w-full xs:!w-[200px]">
      <Typography className="!text-secondary !font-medium !text-base md:!text-lg sm:!text-center md:!text-left">
        {year}
      </Typography>
    </Box>
    <Box className="!flex !flex-col !relative sm:!items-center md:!items-start">
      <Box className="!hidden md:!block !absolute !left-0 !top-[-24px] !h-[calc(100%+48px)] !w-[2px] !-translate-x-1/2">
        <Box className="!absolute !inset-0 !bg-gradient-to-b !from-light-primary/30 !via-light-primary/40 !to-light-primary/30 dark:!from-dark-primary/30 dark:!via-dark-primary/40 dark:!to-dark-primary/30" />
      </Box>

      <Box
        className="!hidden md:!block !absolute !left-0 !top-[13px] !-translate-x-1/2 !w-3 !h-3 !rounded-full !bg-light-primary dark:!bg-dark-primary !z-10 !transition-all !duration-300 
        !before:absolute !before:w-5 !before:h-5 !before:-left-1 !before:-top-1 !before:rounded-full !before:bg-gradient-to-r !before:from-emerald-300/40 !before:to-emerald-500/40
        !after:absolute !after:w-4 !after:h-4 !after:rounded-full !after:-left-0.5 !after:-top-0.5 !after:bg-gradient-to-r !after:from-emerald-300/60 !after:to-emerald-500/60
        !group-hover:scale-110 !group-hover:bg-emerald-300"
      />

      <Box className="md:!pl-8 !flex !flex-col sm:!items-center md:!items-start">
        <Typography className="!text-light-primary dark:!text-dark-primary !font-semibold !text-lg md:!text-xl !mb-2 sm:!text-center md:!text-left">
          {title}
        </Typography>
        <Typography className="!text-light-text-primary dark:!text-dark-text-primary !italic !text-sm !mb-3 sm:!text-center md:!text-left">
          {subtitle}
        </Typography>
      </Box>
    </Box>
  </Box>
);

export default TimelineItem;
