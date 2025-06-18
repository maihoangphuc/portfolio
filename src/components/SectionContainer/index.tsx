import { Box, BoxProps, Typography } from "@mui/material";
import clsx from "clsx";
import { ReactNode } from "react";

interface SectionContainerProps extends BoxProps {
  children: ReactNode;
  sectionId?: string;
  title?: string;
  titleDescription?: string;
  showWave?: {
    top?: boolean;
    bottom?: boolean;
  };
  className?: string;
  classChildren?: string;
  component?: React.ElementType;
}

const SectionContainer = ({
  children,
  sectionId,
  showWave = { top: true, bottom: true },
  className,
  classChildren,
  title,
  titleDescription,
  component = "section",
}: SectionContainerProps) => {
  return (
    <Box
      id={sectionId}
      component={component}
      className={clsx(
        "!relative",
        (showWave.top || showWave.bottom) &&
          "dark:!bg-dark-wave-bg !bg-light-wave-bg"
      )}
    >
      {showWave.top && (
        <Box
          sx={{
            position: "absolute",
            top: "-100px",
            left: 0,
            width: "100%",
            height: "100px",
            clipPath:
              "polygon(0% 100%, 0% 100%, 25% 80%, 50% 100%, 75% 80%, 100% 100%, 100% 100%)",
            zIndex: 1,
          }}
          className="dark:!bg-dark-wave-bg !bg-light-wave-bg"
        />
      )}

      <Box
        className={clsx(
          "!px-4 md:!px-10",
          className,
          showWave.top && "!mt-6",
          showWave.bottom && "!mb-6"
        )}
      >
        <Box className="!pt-6 !h-fit !flex !flex-col !items-center !justify-center">
          {titleDescription && (
            <Typography
              variant="subtitle1"
              className="!text-secondary !font-regular"
            >
              {titleDescription}
            </Typography>
          )}
          {title && (
            <Typography variant="h5" className="!text-primary !font-bold">
              {title}
            </Typography>
          )}
        </Box>
        <Box
          className={clsx(
            "!h-fit !flex-1 !flex !items-center !justify-center",
            classChildren
          )}
        >
          {children}
        </Box>
      </Box>

      {showWave.bottom && (
        <Box
          sx={{
            position: "absolute",
            bottom: "-100px",
            left: 0,
            width: "100%",
            height: "100px",
            clipPath:
              "polygon(0% 0%, 0% 0%, 25% 20%, 50% 0%, 75% 20%, 100% 0%, 100% 0%)",
            zIndex: 1,
          }}
          className="dark:!bg-dark-wave-bg !bg-light-wave-bg"
        />
      )}
    </Box>
  );
};

export default SectionContainer;
