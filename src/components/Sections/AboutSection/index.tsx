import TimelineItem from "@/components/TimelineItem";
import SectionContainer from "@/components/SectionContainer";
import { Box } from "@mui/material";
import { timelines } from "@/mockdata";

const AboutSection = () => {
  return (
    <SectionContainer
      sectionId="about"
      titleDescription="Get To Know"
      title="About"
      showWave={{ top: true, bottom: true }}
      className=" !flex !flex-col !min-h-[600px]"
      classChildren="!py-12"
    >
      <Box>
        {timelines.map((timeline, index) => (
          <TimelineItem key={index} {...timeline} />
        ))}
      </Box>
    </SectionContainer>
  );
};

export default AboutSection;
