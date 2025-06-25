"use client";

import { Theme } from "@/constants";
import { Captions } from "@/media/captions";
import { Box } from "@mui/material";
import clsx from "clsx";

interface MacbookFrameProps {
  videoUrl: string;
  className?: string;
}

const MacbookFrame = ({ videoUrl, className }: MacbookFrameProps) => {
  return (
    <Box className={clsx("!mx-auto ", className)}>
      <Box className="w-full">
        <Box className="relative mx-auto w-[80%] pt-[54%] rounded-[3%_3%_0_0] bg-[#ddd]">
          <Box className="absolute top-[0.3%] bottom-0 left-[0.2%] right-[0.2%] rounded-[2.8%_2.8%_0_0] bg-black">
            <Box className="absolute left-[2%] top-[6%] right-[2%] bottom-[6%] bg-[#444] overflow-hidden">
              <video
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="absolute left-0 top-0 w-full h-full object-cover"
              >
                <track
                  kind="captions"
                  src={
                    videoUrl.includes(Theme.DARK)
                      ? Captions.dark
                      : Captions.light
                  }
                  srcLang="en"
                  label="English"
                  default
                />
              </video>
            </Box>
          </Box>
        </Box>
        <Box className="relative rounded-[1%/2%] bg-gradient-to-tr from-[#ddd] to-[#eee] z-[1] pt-[8%] [clip-path:polygon(10%_0,90%_0,100%_100%,0%_100%)]">
          <Box className="absolute left-1/2 top-[10%] h-[40%] w-[70%] -translate-x-1/2 bg-[#555] [clip-path:polygon(4.5%_0,95.5%_0,100%_100%,0%_100%)]"></Box>
          <Box className="absolute left-1/2 bottom-[7%] h-[35%] w-[30%] -translate-x-1/2 bg-[#aaa] [clip-path:polygon(6%_0,94%_0,100%_100%,0%_100%)]"></Box>
        </Box>
        <Box className="relative -mt-[0.1%] pt-[1.3%] rounded-b-[1%] overflow-hidden bg-gradient-to-r from-[#aaa] via-[#d2d2d2] to-[#aaa]"></Box>
        <Box className="-mt-[0.4%] pt-[1.3%] bg-[rgba(30,30,30,0.7)] shadow-[2px_2px_30px_rgba(0,0,0,5)] dark:bg-[rgba(255,255,255,0.9)] dark:shadow-[2px_2px_30px_rgba(255,255,255,0.8)] rounded-b-[10%]"></Box>
      </Box>
    </Box>
  );
};

export default MacbookFrame;
