import Head from "next/head";
import HeroSection from "@/components/section/Hero";
import AboutSection from "@/components/section/AboutMe";
import ProjectsSection from "@/components/section/Projects";
import TechStackSection from "@/components/section/Stack";
import ExperienceSection from "@/components/section/Experience";
import ContactSection from "@/components/section/ContactMe";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Head>
        <title>Glen&apos;s Portfolio</title>
      </Head>

      <main className="min-h-screen bg-white text-gray-900">
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <TechStackSection />
        <ExperienceSection />
        <ContactSection />
        <Footer />
      </main>
    </>
  );
}
