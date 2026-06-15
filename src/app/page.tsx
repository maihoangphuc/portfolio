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
          Frontend Developer with 3+ years of experience building scalable,
          high-performance web applications with ReactJS, Next.js and Vue 3. I
          craft intuitive, visually appealing user interfaces and interactive 3D
          web experiences with Three.js, WebGL and React.
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
