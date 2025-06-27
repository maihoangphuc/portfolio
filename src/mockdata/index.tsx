import { Timeline } from "@/types/about";
import { Contact, SocialLink } from "@/types/contact";
import { MenuItem } from "@/types/home";
import { SkillTab } from "@/types/skill";
import { Project } from "@/types/project";
import {
  FiLinkedin,
  FiMail,
  FiGithub,
  FiMessageSquare,
  FiPhone,
} from "react-icons/fi";

export const menuItems: MenuItem[] = [
  { text: "Home", href: "#home" },
  { text: "About", href: "#about" },
  { text: "Skill", href: "#skill" },
  { text: "Project", href: "#project" },
  { text: "Contact", href: "#contact" },
];

export const socialLinks: SocialLink[] = [
  {
    icon: FiLinkedin,
    href: "https://www.linkedin.com/in/maihoangphuc",
    target: "_blank",
    name: "Linkedin",
  },
  {
    icon: FiMail,
    href: "mailto:maihoangphuc9x@gmail.com",
    name: "Email",
  },
  {
    icon: FiGithub,
    href: "https://github.com/maihoangphuc",
    target: "_blank",
    name: "Github",
  },
];

export const contacts: Contact[] = [
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

export const timelines: Timeline[] = [
  {
    year: "Apr 2024 - Jun 2025",
    title: "IES Company",
    subtitle: "(Frontend Developer Junior)",
  },
  {
    year: "Aug 2023 - Feb 2024",
    title: "Freelancer",
    subtitle: "(Frontend Developer)",
  },
  {
    year: "Sep 2022 - Jun 2023",
    title: "Teso Company",
    subtitle: "(Frontend Developer Fresher)",
  },
  {
    year: "Aug 2017 - Jul 2022",
    title: "Binh Duong University",
    subtitle: "(Software Technology)",
  },
];

export const skillTabs: SkillTab[] = [
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

export const introTexts: string[] = [
  "I am a technology enthusiast, I love web design, it seems to be indispensable in my life",
  "I enjoy learning new technologies and applying them to solve real-world problems",
  "With passion for creating beautiful and user-friendly interfaces, I strive to deliver the best web experiences",
];

export const projects: Project[] = [
  {
    id: 1,
    name: "Weather App",
    description: "Weather app with real-time data and forecast",
    technologies: ["HTML5", "CSS3", "Javascript", "VueJS 3", "TailwindCSS"],
    githubUrl: "https://github.com/maihoangphuc/Weather-VueJS",
    demoUrl: "https://weather-vuejs-henna.vercel.app",
  },
  {
    id: 2,
    name: "Headphones Templates",
    description: "Ecommerce website template for headphones",
    technologies: ["HTML5", "CSS3", "SCSS", "Javascript"],
    githubUrl:
      "https://github.com/maihoangphuc/Headphones-Templates-Javascript",
    demoUrl: "https://headphones-website-template.vercel.app",
  },
  {
    id: 3,
    name: "Calculator App",
    description: "Build a calculator app with basic arithmetic operations",
    technologies: ["HTML5", "CSS3", "TailwindCSS", "React", "Javascript"],
    githubUrl: "https://github.com/maihoangphuc/Calculator-ReactJS",
    demoUrl: "https://calculator-reactjs-six.vercel.app",
  },
  {
    id: 4,
    name: "Music App",
    description: "An application for listening to and playing music",
    technologies: ["HTML5", "CSS3", "Javascript", "VueJS 3", "TailwindCSS"],
    githubUrl: "https://github.com/maihoangphuc/Music-VueJS",
    demoUrl: "https://music-vuejs-gray.vercel.app",
  },
  {
    id: 5,
    name: "Calendar App",
    description: "An application for managing and scheduling events",
    technologies: ["HTML5", "CSS3", "Javascript", "React", "TailwindCSS"],
    githubUrl: "https://github.com/maihoangphuc/Calendar-ReactJS",
    demoUrl: "https://calendar-reactjs.vercel.app",
  },
];
