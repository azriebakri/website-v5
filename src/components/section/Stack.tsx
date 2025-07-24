const skills = ["TypeScript", "React", "Next.js", "Tailwind", "Node.js"];

export default function TechStackSection() {
  return (
    <section className="py-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-8">Tech Stack</h2>
      <div className="flex flex-wrap justify-center gap-4">
        {skills.map((skill) => (
          <span
            key={skill}
            className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium"
          >
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}
