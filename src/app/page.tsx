import dynamic from "next/dynamic";
import MainLayout from "@/layouts/MainLayout";
import LoadingState from "@/components/LoadingState";

// Dynamically import sections with loading fallback
const HomeSection = dynamic(() => import("@/components/Sections/HomeSection"), {
  loading: () => <LoadingState />,
  ssr: true,
});

const AboutSection = dynamic(
  () => import("@/components/Sections/AboutSection"),
  {
    loading: () => <LoadingState />,
    ssr: true,
  }
);

const SkillSection = dynamic(
  () => import("@/components/Sections/SkillSection"),
  {
    loading: () => <LoadingState />,
    ssr: true,
  }
);

const ProjectSection = dynamic(
  () => import("@/components/Sections/ProjectSection"),
  {
    loading: () => <LoadingState />,
    ssr: true,
  }
);

const ContactSection = dynamic(
  () => import("@/components/Sections/ContactSection"),
  {
    loading: () => <LoadingState />,
    ssr: true,
  }
);

export default function Home() {
  return (
    <MainLayout>
      <HomeSection />
      <AboutSection />
      <SkillSection />
      <ProjectSection />
      <ContactSection />
    </MainLayout>
  );
}
