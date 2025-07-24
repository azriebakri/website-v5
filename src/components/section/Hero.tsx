import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="text-center py-24 px-4">
      <h1 className="text-5xl font-bold">Hi, I&apos;m Glen 👋</h1>
      <p className="mt-4 text-xl text-gray-600">
        Full-stack engineer who loves clean code and solving real problems.
      </p>
      <div className="mt-6 flex justify-center gap-4">
        <Button>View Projects</Button>
        <Button variant="outline">Contact Me</Button>
      </div>
    </section>
  );
}
