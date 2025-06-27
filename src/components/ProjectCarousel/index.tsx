import { motion, useMotionValue, animate } from "framer-motion";
import { wrap } from "popmotion";
import { useRef, useState, useLayoutEffect, useEffect } from "react";
import ProjectCard from "@/components/ProjectCard";
import { Project } from "@/types/project";

interface ProjectCarouselProps {
  projects: Project[];
}

const ProjectCarousel = ({ projects }: ProjectCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const [itemWidth, setItemWidth] = useState(0);
  const [cloneCount, setCloneCount] = useState(0);
  const [totalWidth, setTotalWidth] = useState(0);

  const measure = () => {
    const container = carouselRef.current!;
    const itemEl = container.querySelector(".project-item") as HTMLElement;
    if (!itemEl) return;

    const style = getComputedStyle(itemEl);
    const w = itemEl.clientWidth;
    const mr = parseFloat(style.marginRight);
    const fullW = w + mr;

    setItemWidth(fullW);
    const visibleW = container.offsetWidth;
    const scrollW = container.scrollWidth;
    const cnt = Math.ceil(visibleW / fullW);
    setCloneCount(cnt);
    setTotalWidth(scrollW / 3);

    x.set(-fullW * cnt);
  };

  useLayoutEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [x]);

  useEffect(() => {
    return x.onChange((latest) => {
      const wrapped = wrap(-totalWidth, 0, latest);
      if (wrapped !== latest) x.set(wrapped);
    });
  }, [x, totalWidth]);

  const before = projects.slice(-cloneCount);
  const after = projects.slice(0, cloneCount);
  const items = [...before, ...projects, ...after];

  return (
    <div className="relative w-full max-w-[1200px] mx-auto overflow-hidden">
      <div className="[mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)] scrollbar-none">
        <motion.div
          ref={carouselRef}
          className="flex gap-5 py-5 cursor-grab active:cursor-grabbing"
          drag="x"
          dragElastic={1}
          dragMomentum={true}
          initial={false}
          style={{ x, width: "fit-content", touchAction: "none" }}
          onDragEnd={() => {
            const currentX = x.get();
            const offset = currentX + totalWidth;
            const idx = Math.round(offset / itemWidth);
            const target = idx * itemWidth - totalWidth;
            animate(x, target, {
              type: "spring",
              stiffness: 400,
              damping: 30,
            });
          }}
        >
          {items.map((project, idx) => (
            <motion.div
              key={`${project.id}-${idx}`}
              className="project-item flex-none w-[300px] sm:w-[350px]"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectCarousel;
