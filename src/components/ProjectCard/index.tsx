"use client";

import { Project } from "@/types/contact";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Typography,
} from "@mui/material";
import { FaGithub } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Card
      className="group !rounded-md !w-full h-full"
      sx={{
        backgroundColor: "transparent",
        backgroundImage: "none",
        boxShadow: "none",
        border: "1px solid transparent",
        transition: "border-color 0.2s ease",
        "&:hover": {
          borderColor: "var(--color-light-primary)",
          "@media (prefers-color-scheme: dark)": {
            borderColor: "var(--color-dark-primary)",
          },
        },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent className="!p-4 flex flex-col flex-1">
        <div className="flex-1">
          <Typography
            variant="h6"
            component="div"
            gutterBottom
            className="!text-light-primary dark:!text-dark-primary !font-semibold !text-lg md:!text-xl !mb-2 !truncate !line-clamp-2"
          >
            {project.name}
          </Typography>
          <Typography
            variant="body2"
            className="!font-medium !text-light-secondary dark:!text-dark-secondary !text-sm !mb-3 !line-clamp-2"
          >
            {project.description}
          </Typography>

          <Box className="!flex !flex-wrap !gap-2">
            {project.technologies.map((tech: string) => (
              <Chip
                key={tech}
                label={tech}
                size="small"
                className="!rounded-md !bg-light-primary dark:!bg-dark-primary hover:!bg-light-primary/80 dark:hover:!bg-dark-primary/80 !cursor-pointer !text-white dark:!text-black !font-semibold !border-none [transition:none]"
                onClick={() => {}}
                clickable={false}
              />
            ))}
          </Box>
        </div>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <IconButton
            size="small"
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="!text-light-primary/90 dark:!text-dark-primary/90 hover:!text-light-primary dark:hover:!text-dark-primary"
          >
            <FaGithub size={20} />
          </IconButton>
          <IconButton
            size="small"
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Live Demo"
            className="!text-light-primary/90 dark:!text-dark-primary/90 hover:!text-light-primary dark:hover:!text-dark-primary"
          >
            <FiExternalLink size={20} />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
