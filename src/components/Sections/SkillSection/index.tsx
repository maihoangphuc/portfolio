"use client";

import MacbookFrame from "@/components/MacbookFrame";
import SectionContainer from "@/components/SectionContainer";
import SkillTabs from "@/components/SkillTabs";
import { Theme } from "@/constants";
import { useThemeContext } from "@/context/AppThemeContext";
import { Videos } from "@/videos";
import { Box } from "@mui/material";

const SkillSection = () => {
  const { mode } = useThemeContext();

  return (
    <SectionContainer
      sectionId="skill"
      title="Skills"
      titleDescription="What Skill I Have"
      showWave={{ top: false, bottom: false }}
      className="!flex !flex-col !min-h-[600px]"
      classChildren="!py-12 md:!py-0"
    >
      <Box className="!flex !flex-col md:!flex-row !gap-12 md:!gap-8 !items-center !justify-center !h-full lg:!h-[300px] !w-full md:!w-[100%] lg:!w-[80%] !mx-auto">
        <Box className="!w-full md:!w-[40%] !h-full !flex !items-center !justify-center ">
          <MacbookFrame
            videoUrl={mode === Theme.DARK ? Videos.itDark : Videos.itLight}
            className="!size-[60%] sm:!size-[40%] md:!size-[90%] lg:!size-[80%] xl:!size-[70%]"
          />
        </Box>
        <Box className="!w-full xs:!w-[70%] md:!w-[40%] !h-full !overflow-y-auto">
          <SkillTabs />
        </Box>
      </Box>
    </SectionContainer>
  );
};

export default SkillSection;
