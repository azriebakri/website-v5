interface Experience {
  company: string;
  position: string;
  period: string;
  description: string;
}

const experiences: Experience[] = [
  {
    company: "Seek",
    position: "Software Engineer",
    period: "2022 – Present",
    description:
      "Worked on internal APIs, Add Ons system, and cross-team features.",
  },
];

export default function ExperienceSection() {
  return (
    <section className="bg-gray-50 py-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-8">Experience</h2>
      <div className="max-w-3xl mx-auto space-y-6">
        {experiences.map((exp, index) => (
          <div key={index}>
            <h3 className="text-xl font-semibold">
              {exp.position} – {exp.company}
            </h3>
            <p className="text-gray-600">{exp.period}</p>
            <p className="text-gray-700 mt-1">{exp.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
