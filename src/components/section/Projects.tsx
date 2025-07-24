interface Project {
  id: number;
  title: string;
  description: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: "Project 1",
    description: "Short description of the project.",
  },
  {
    id: 2,
    title: "Project 2",
    description: "Short description of the project.",
  },
  {
    id: 3,
    title: "Project 3",
    description: "Short description of the project.",
  },
];

export default function ProjectsSection() {
  return (
    <section className="bg-gray-50 py-20 px-4">
      <h2 className="text-3xl font-bold text-center mb-10">Projects</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
            <p className="text-gray-600">{project.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
