import ExperienceCanvases from "@/components/ExperienceCanvases";
import ExperienceIntro from "@/components/ExperienceIntro";
import ExperienceUi from "@/components/ExperienceUi";
import GretaExperienceRuntime from "@/components/GretaExperienceRuntime";

export default function Home() {
  return (
    <main>
      <ExperienceCanvases />
      <ExperienceIntro />
      <ExperienceUi />
      <GretaExperienceRuntime />
    </main>
  );
}
