import ExperienceCanvases from "@/components/ExperienceCanvases";
import ExperienceIntro from "@/components/ExperienceIntro";
import ExperienceUi from "@/components/ExperienceUi";
import ExperienceModal from "@/components/ExperienceModal";
import GretaExperienceRuntime from "@/components/GretaExperienceRuntime";

export default function Home() {
  return (
    <main>
      {/* Crawlable content: the experience renders in WebGL, which search
          engines and screen readers can't read. This mirrors the real subject
          of the page so it's indexable and accessible. */}
      <header className="sr-only">
        <h1>Mai Hoang Phuc — Frontend Developer</h1>
        <p>
          Frontend Developer with nearly 4 years of experience in React.js and
          Vue.js, building performant admin systems and internal tools while
          leveraging AI-assisted workflows to accelerate delivery.
        </p>
      </header>
      <ExperienceCanvases />
      <ExperienceIntro />
      <ExperienceUi />
      <ExperienceModal />
      <GretaExperienceRuntime />
    </main>
  );
}
