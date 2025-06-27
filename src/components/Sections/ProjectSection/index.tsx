"use client";

import ProjectCard from "@/components/ProjectCard";
import SectionContainer from "@/components/SectionContainer";
import { projects } from "@/mockdata";
import { useKeenSlider } from "keen-slider/react";
import clsx from "clsx";

const ProjectSection = () => {
  const [ref] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: "free-snap",
    rubberband: false,
    breakpoints: {
      "(max-width: 480px)": {
        slides: { origin: "auto", perView: 1.5, spacing: 15 },
        vertical: true,
      },
      "(min-width: 480px)": {
        slides: { origin: "auto", perView: 1.5, spacing: 15 },
      },
      "(min-width: 768px)": {
        slides: { origin: "auto", perView: 2.5, spacing: 15 },
      },
      "(min-width: 1024px)": {
        slides: { origin: "center", perView: 3.5, spacing: 15 },
      },
    },
  });

  return (
    <SectionContainer
      sectionId="project"
      title="Projects"
      titleDescription="What I've Built"
      showWave={{ top: true, bottom: true }}
      className="!flex !flex-col !min-h-[600px]"
      classChildren="!py-12"
    >
      <div
        ref={ref}
        className={clsx(
          "keen-slider h-[350px] scrollbar-none xs:!h-full !cursor-grab active:!cursor-grabbing",
          "[mask-image:linear-gradient(180deg,black_10%,black_90%,transparent)]",
          "[-webkit-mask-image:linear-gradient(180deg,black_10%,black_90%,transparent)]",
          "xs:[mask-image:linear-gradient(90deg,black_10%,black_90%,transparent)]",
          "xs:[-webkit-mask-image:linear-gradient(90deg,black_10%,black_90%,transparent)]",
          "md:[mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]",
          "md:[-webkit-mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]"
        )}
      >
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </SectionContainer>
  );
};

export default ProjectSection;
