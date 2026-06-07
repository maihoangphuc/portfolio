import ExperienceCanvases from "@/components/ExperienceCanvases";
import ExperienceIntro from "@/components/ExperienceIntro";
import ExperienceUi from "@/components/ExperienceUi";
import GretaExperienceRuntime from "@/components/GretaExperienceRuntime";

export default function Home() {
  return (
    <main>
      {/* Crawlable content: the experience renders in WebGL, which search
          engines and screen readers can't read. This mirrors the real subject
          of the page so it's indexable and accessible. */}
      <header className="sr-only">
        <h1>Hoang Phuc — Frontend Developer</h1>
        <p>
          Frontend Developer passionate about technology and crafting intuitive,
          visually appealing user interfaces. I build interactive 3D web
          experiences with Three.js, WebGL, React, and Next.js.
        </p>
      </header>
      <ExperienceCanvases />
      <ExperienceIntro />
      <ExperienceUi />
      <GretaExperienceRuntime />
    </main>
  );
}
