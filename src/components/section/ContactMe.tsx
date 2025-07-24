interface ContactSectionProps {
  email?: string;
}

export default function ContactSection({
  email = "you@example.com",
}: ContactSectionProps) {
  return (
    <section className="py-20 px-4 text-center">
      <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
      <p className="text-lg text-gray-600 mb-6">
        I&apos;m open to freelance work, collaborations, or just a chat.
      </p>
      <a
        href={`mailto:${email}`}
        className="text-blue-600 hover:underline text-lg"
      >
        {email}
      </a>
    </section>
  );
}
