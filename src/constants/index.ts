import { SkillTab } from "@/types/skill";
import {
  FiLinkedin,
  FiMail,
  FiGithub,
  FiMessageSquare,
  FiPhone,
} from "react-icons/fi";

export const Theme = {
  DARK: "dark",
  LIGHT: "light",
  SYSTEM: "system",
};

export const menuItems = [
  { text: "Home", href: "#home" },
  { text: "About", href: "#about" },
  { text: "Skill", href: "#skill" },
  { text: "Project", href: "#project" },
  { text: "Contact", href: "#contact" },
];

export const socialLinks = [
  {
    icon: FiLinkedin,
    href: "https://www.linkedin.com/in/maihoangphuc",
    target: "_blank",
  },
  {
    icon: FiMail,
    href: "mailto:maihoangphuc9x@gmail.com",
  },
  {
    icon: FiGithub,
    href: "https://github.com/maihoangphuc",
    target: "_blank",
  },
];

export const contacts = [
  {
    icon: FiMail,
    title: "Email",
    subtitle: "Send Email",
    href: "mailto:maihoangphuc9x@gmail.com",
    isPrimary: false,
  },
  {
    icon: FiMessageSquare,
    title: "Messenger",
    subtitle: "Send Message",
    href: "https://m.me/maihoangphuc9x",
    isPrimary: false,
  },
  {
    icon: FiPhone,
    title: "Phone",
    subtitle: "Call Me",
    href: "tel:+84347023283",
    isPrimary: false,
  },
];

export const projects = [
  {
    year: "Present",
    title: "Website profile",
    subtitle: "(Personal Project)",
    description: "self-introduction website",
  },
  {
    year: "2022",
    title: "Deep Virtual Try On With Clothes Transform",
    subtitle: "(Personal Project)",
    description: "an image-based virtual try-on system with deep learning",
  },
  {
    year: "2021",
    title: "3D Simulation of Binh Duong Leadership",
    subtitle: "(Personal Project)",
    description: "simulate Binh Duong leaders in 3D based on",
  },
];

export const SKILL_TABS: SkillTab[] = [
  {
    label: "Frontend",
    skills: [
      "HTML5",
      "CSS3",
      "Javascript",
      "ReactJS",
      "VueJS 3",
      "NextJS",
      "TailwindCSS",
      "Material-UI",
      "Ant Design",
    ],
  },
  {
    label: "Backend",
    skills: ["NodeJS", "AdonisJS", "ExpressJS"],
  },
  {
    label: "Database",
    skills: ["MySQL", "SQL Server", "MongoDB"],
  },
];

export const INTRO_TEXTS = [
  "I am a technology enthusiast, I love web design, it seems to be indispensable in my life",
  "With passion for creating beautiful and user-friendly interfaces, I strive to deliver the best web experiences",
  "I enjoy learning new technologies and applying them to solve real-world problems",
];
