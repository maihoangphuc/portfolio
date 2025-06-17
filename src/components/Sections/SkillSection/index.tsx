import { Images } from "@/images";
import { Box, Typography } from "@mui/material";
import clsx from "clsx";
import Image from "next/image";

const SkillSection = () => {
  return (
    <Box
      id="skill"
      component="section"
      className={clsx(
        "!relative",
        "!w-full",
        "!h-[600px]",
        "!flex",
        "!flex-col-reverse",
        "md:!flex-row",
        "!items-center",
        "!justify-center"
        // "!bg-[red]"
      )}
    >
      <Box
        className={clsx(
          "!min-w-[50%]",
          "!w-full",
          "!px-6",
          "md:!pl-20",
          "!flex",
          "!flex-col",
          "!justify-center",
          "!text-center",
          "md:!text-left"
        )}
      >
        <Typography
          variant="h1"
          className={clsx("!text-4xl", "md:!text-5xl", "!font-bold", "!mb-4")}
        >
          Hi, I&apos;m{" "}
          <Typography
            component="span"
            className={clsx("!text-primary", "!font-bold")}
          >
            Mai Hoang Phuc
          </Typography>
        </Typography>
        <Typography
          component="div"
          className={clsx("!text-lg", "!text-secondary", "!space-y-3")}
        >
          <span
            className={clsx(
              "!inline-block",
              "!bg-primary/10",
              "!px-4",
              "!py-2",
              "!rounded-full",
              "!text-primary"
            )}
          >
            &lt;Frontend developer/&gt;
          </span>
          <p className={clsx("!mt-4", "!leading-relaxed")}>
            I am a technology enthusiast, I love web design, it seems to be
            indispensable in my life
          </p>
        </Typography>
      </Box>

      <Box
        className={clsx(
          "!min-w-[50%]",
          "!w-full",
          "!h-full",
          "!flex-1",
          "!relative",
          "!flex",
          "!items-center",
          "!justify-center"
        )}
      >
        <Box
          className={clsx(
            "!w-full",
            "!flex",
            "!justify-center",
            "md:!absolute",
            "md:!translate-x-0",
            "md:!right-0",
            "!z-1"
          )}
        >
          <Box
            className={clsx(
              "!absolute",
              "md:!right-0",
              "!size-[250px]",
              "md:!size-[300px]",
              "lg:!size-[400px]",
              "!bg-primary",
              "rounded-shape",
              "translate-shape",
              "animate-border"
            )}
          />
        </Box>
        <Box
          className={clsx(
            "!absolute",
            "!left-1/2",
            "md:!left-auto",
            "!-translate-x-1/2",
            "md:!translate-x-0",
            "md:!right-0",
            "!z-2"
          )}
        >
          <Box
            className={clsx(
              "!size-[300px]",
              "md:!size-[350px]",
              "lg:!size-[450px]"
            )}
          >
            <Image
              src={Images.person}
              alt="Person"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SkillSection;
