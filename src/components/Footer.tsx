interface FooterProps {
  name?: string;
  year?: number;
}

export default function Footer({
  name = "Glen",
  year = new Date().getFullYear(),
}: FooterProps) {
  return (
    <footer className="py-6 text-center text-sm text-gray-500">
      © {year} {name}. Built with Next.js + Tailwind CSS.
    </footer>
  );
}
