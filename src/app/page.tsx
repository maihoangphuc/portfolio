import AboutSection from "@/components/Sections/AboutSection";
import ContactSection from "@/components/Sections/ContactSection";
import HomeSection from "@/components/Sections/HomeSection";
import ProjectSection from "@/components/Sections/ProjectSection";
import SkillSection from "@/components/Sections/SkillSection";
import MainLayout from "@/layouts/MainLayout";

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
