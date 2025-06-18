import ProjectItem from "@/components/ProjectItem";
import SectionContainer from "@/components/SectionContainer";
import { projects } from "@/constants";
import { Box } from "@mui/material";

const AboutSection = () => {
  return (
    <SectionContainer
      sectionId="about"
      titleDescription="Get To Know"
      title="About"
      showWave={{ top: true, bottom: true }}
      className="!flex !flex-col !min-h-[600px]"
    >
      <Box>
        {projects.map((project, index) => (
          <ProjectItem key={index} {...project} />
        ))}
      </Box>
    </SectionContainer>
  );
};

export default AboutSection;
