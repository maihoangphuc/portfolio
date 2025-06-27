export type Project = {
  id: number;
  name: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  demoUrl: string;
};

export type FormContact = {
  name: string;
  email: string;
  message: string;
};
