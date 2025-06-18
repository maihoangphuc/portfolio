import { Box, Typography } from "@mui/material";

interface ProjectItemProps {
  year: string;
  title: string;
  subtitle: string;
  description: string;
}

const ProjectItem = ({
  year,
  title,
  subtitle,
  description,
}: ProjectItemProps) => (
  <Box className="flex flex-col md:flex-row gap-4 md:gap-8 relative group sm:items-center md:items-start">
    <Box className="md:min-w-[80px]">
      <Typography className="!text-secondary font-medium text-base md:text-lg sm:text-center md:text-left">
        {year}
      </Typography>
    </Box>
    <Box className="flex flex-col relative sm:items-center md:items-start">
      <Box className="hidden md:block absolute left-0 top-3 w-2 h-2 md:w-3 md:h-3 rounded-full bg-primary z-10" />
      <Box className="hidden md:block absolute left-[5px] top-3 w-[2px] h-full -translate-x-1/2 bg-primary" />
      <Box className="md:pl-8 flex flex-col sm:items-center md:items-start">
        <Typography className="!text-primary font-medium text-lg md:text-xl mb-1 sm:text-center md:text-left">
          {title}
        </Typography>
        <Typography className="!text-light-text-primary dark:!text-dark-text-primary italic text-xs md:text-sm mb-2 sm:text-center md:text-left">
          {subtitle}
        </Typography>
        <Typography className="!text-light-text-primary/80 dark:!text-dark-text-primary/80 text-sm md:text-base sm:text-center md:text-left">
          {description}
        </Typography>
      </Box>
    </Box>
  </Box>
);

export default ProjectItem;
