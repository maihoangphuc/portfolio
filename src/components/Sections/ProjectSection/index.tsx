import SectionContainer from "@/components/SectionContainer";
import { Box } from "@mui/material";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/mockdata";

const ProjectSection = () => {
  return (
    <SectionContainer
      sectionId="project"
      title="Projects"
      titleDescription="What I've Built"
      showWave={{ top: true, bottom: true }}
      className="!flex !flex-col !min-h-[600px]"
      classChildren=" !py-12"
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: { xs: 2, sm: 2.5, md: 3 },
          width: "100%",
          justifyItems: "center",
          maxWidth: "100%",
          mx: "auto",
        }}
      >
        {projects.map((project) => (
          <Box
            key={project.id}
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", sm: "400px" },
            }}
          >
            <ProjectCard project={project} />
          </Box>
        ))}
      </Box>
    </SectionContainer>
  );
};

export default ProjectSection;
