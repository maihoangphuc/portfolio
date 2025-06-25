"use client";

import { Images } from "@/media/images";
import { Box, Typography, Button, IconButton } from "@mui/material";
import { HiArrowLongLeft, HiArrowLongRight } from "react-icons/hi2";
import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import { BsMouse } from "react-icons/bs";
import { BsArrowDownShort } from "react-icons/bs";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import SectionContainer from "@/components/SectionContainer";
import { introTexts } from "@/mockdata";
import Social from "@/components/Social";

const HomeSection = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
  const scrollToSection = useScrollToSection();

  const handlePrevText = () => {
    setCurrentTextIndex((prev) =>
      prev === 0 ? introTexts.length - 1 : prev - 1
    );
  };

  const handleNextText = () => {
    setCurrentTextIndex((prev) =>
      prev === introTexts.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <SectionContainer
      sectionId="home"
      showWave={{ top: false, bottom: false }}
      className="!flex !flex-col-reverse md:!flex-row !items-center !justify-center !min-h-[500px] md:!min-h-[600px]"
      classChildren="!flex !flex-col-reverse md:!flex-row !items-center !justify-center"
    >
      <Box
        className={clsx(
          "!min-w-[50%]",
          "!w-full",
          "!h-full",
          "!flex",
          "!flex-col",
          "!justify-center",
          "!text-center",
          "md:!text-left"
        )}
      >
        <Box className="!flex !items-start !justify-start !relative !gap-10">
          <Social />
          <Box>
            <Typography
              key={currentTextIndex}
              component="span"
              className="!text-xl md:!text-3xl !text-secondary !font-bold slogan animate__animated animate__fadeInDown"
            >
              Hi, I&apos;m{" "}
              <Typography
                key={currentTextIndex}
                component="span"
                className="!text-light-primary dark:!text-dark-primary !text-xl md:!text-3xl !font-bold slogan animate__animated animate__fadeInDown"
              >
                Mai Hoang Phuc
              </Typography>
            </Typography>

            <Typography
              component="div"
              className="!text-lg !text-secondary !space-y-3 !mt-2 !mx-auto !w-full xs:!w-[90%] lg:!w-[80%] md:!m-0"
            >
              <Typography
                key={currentTextIndex}
                className="!font-medium !text-secondary animate__animated animate__fadeInUp"
              >
                &lt;Frontend developer/&gt;
              </Typography>

              <Box className="!mt-4">
                <Typography
                  key={currentTextIndex}
                  className="!text-sm xs:!text-base !font-medium !text-light-primary dark:!text-dark-primary animate__animated animate__flash"
                >
                  {introTexts[currentTextIndex]}
                </Typography>

                <Box className="!hidden md:!flex flex-col items-start !mt-4 !gap-4">
                  <Box className="!justify-end !gap-2 !flex">
                    <Button
                      onClick={handlePrevText}
                      size="small"
                      variant="text"
                      aria-label="Previous Text"
                      className="!min-w-0 !w-8 !h-8 !rounded-full !flex !items-center !justify-center !text-2xl hover:!text-light-primary dark:hover:!text-dark-primary !text-secondary !transition-all"
                    >
                      <HiArrowLongLeft />
                    </Button>
                    <Button
                      onClick={handleNextText}
                      size="small"
                      variant="text"
                      aria-label="Next Text"
                      className="!min-w-0 !w-8 !h-8 !rounded-full !flex !items-center !justify-center !text-2xl hover:!text-light-primary dark:hover:!text-dark-primary !text-secondary !transition-all"
                    >
                      <HiArrowLongRight />
                    </Button>
                  </Box>
                  <Box
                    className="!flex !items-center !gap-2 !cursor-pointer group"
                    onClick={() => scrollToSection("about")}
                  >
                    <IconButton
                      disableTouchRipple
                      className="!p-0 !bg-transparent"
                      aria-label="Mouse"
                    >
                      <BsMouse />
                    </IconButton>
                    <Typography className="!font-medium">Sroll down</Typography>
                    <IconButton
                      disableTouchRipple
                      className="!p-0 !bg-transparent group-hover:animate-bounce-arrow"
                      aria-label="Scroll Down"
                    >
                      <BsArrowDownShort />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Typography>
          </Box>
        </Box>
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
        sx={{
          height: {
            xs: "100px",
            md: "100%",
          },
        }}
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
              "!size-[200px]",
              "xs:!size-[270px]",
              "md:!size-[300px]",
              "lg:!size-[400px]",
              "!bg-light-primary dark:!bg-dark-primary",
              "rounded-shape",
              "translate-shape",
              "animate-border"
            )}
          />
        </Box>
        <Box
          className={clsx(
            "!absolute",
            "md:!right-0",
            "md:!-translate-x-1/1",
            "!z-2"
          )}
        >
          <Image
            key={currentTextIndex}
            src={Images.person}
            alt="Person avatar"
            width={32}
            height={32}
            quality={90}
            className="!w-[80px] xs:!w-full !h-full !object-contain animate__animated animate__jackInTheBox"
            sizes="(max-width: 640px) 90px, (max-width: 768px) 95px, (max-width: 1024px) 100px, 135px"
          />
        </Box>
      </Box>
    </SectionContainer>
  );
};

export default HomeSection;
