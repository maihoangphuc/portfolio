"use client";

import { Project } from "@/types/contact";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Stack,
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
          borderColor: "var(--color-primary)",
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
            className="!text-primary !font-semibold !text-lg md:!text-xl !mb-2 !truncate !line-clamp-2"
          >
            {project.name}
          </Typography>
          <Typography
            variant="body2"
            className="!text-light-text-primary/90 dark:!text-dark-text-primary/90 !text-sm !mb-3 !line-clamp-2"
          >
            {project.description}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            sx={{ mb: 3, gap: 1 }}
          >
            {project.technologies.map((tech: string) => (
              <Chip
                key={tech}
                label={tech}
                size="small"
                className="!bg-blue-50 dark:!bg-primary/20 !border-none [transition:none] group-hover:!bg-primary/80 dark:group-hover:!bg-primary"
                onClick={() => {}}
                clickable={false}
              />
            ))}
          </Stack>
        </div>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <IconButton
            size="small"
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              transition: "all 0.2s ease",
              "&:hover": {
                color: "white",
                transform: "translateY(-2px)",
              },
            }}
          >
            <FaGithub size={20} />
          </IconButton>
          <IconButton
            size="small"
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Live Demo"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              transition: "all 0.2s ease",
              "&:hover": {
                color: "white",
                transform: "translateY(-2px)",
              },
            }}
          >
            <FiExternalLink size={20} />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
