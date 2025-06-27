"use client";

import SectionContainer from "@/components/SectionContainer";
import ProjectCarousel from "@/components/ProjectCarousel";
import { projects } from "@/mockdata";

const ProjectSection = () => {
  return (
    <SectionContainer
      sectionId="project"
      title="Projects"
      titleDescription="What I've Built"
      showWave={{ top: true, bottom: true }}
      className="!flex !flex-col !min-h-[600px]"
      classChildren="!py-12"
    >
      <ProjectCarousel projects={projects} />
    </SectionContainer>
  );
};

export default ProjectSection;
