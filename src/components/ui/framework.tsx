"use client";

import {
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  User,
  Briefcase,
  Code,
  Download,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PortfolioWireframe() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform duration-300 ease-in-out
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* Navigation Menu */}
        <nav className="flex-1 p-6 pt-16 md:pt-6">
          <div className="space-y-1">
            <a
              href="#summary"
              className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <User className="w-4 h-4 mr-3" />
              About
            </a>

            <a
              href="#projects"
              className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Briefcase className="w-4 h-4 mr-3" />
              Projects
            </a>

            <a
              href="#skills"
              className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Code className="w-4 h-4 mr-3" />
              Skills
            </a>

            <a
              href="#contact"
              className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Mail className="w-4 h-4 mr-3" />
              Contact
            </a>
          </div>
        </nav>

        {/* Footer Section */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          {/* Social Links */}
          <div className="flex justify-center space-x-4 mb-4">
            <Button size="icon" variant="ghost" asChild>
              <a href="#" aria-label="GitHub">
                <Github className="w-4 h-4" />
              </a>
            </Button>
            <Button size="icon" variant="ghost" asChild>
              <a href="#" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </Button>
            <Button size="icon" variant="ghost" asChild>
              <a href="#" aria-label="Email">
                <Mail className="w-4 h-4" />
              </a>
            </Button>
          </div>

          {/* Download CV Button */}
          <Button className="w-full bg-transparent" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download CV
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto md:ml-0">
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 md:space-y-12">
          {/* Summary Section */}
          <section
            id="summary"
            className="space-y-6 md:space-y-8 pt-16 md:pt-0"
          >
            <div className="text-center space-y-4">
              <h2 className="text-2xl md:text-4xl font-bold">
                Welcome to My Portfolio
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                I'm a passionate full-stack developer with 5+ years of
                experience creating innovative web applications and digital
                solutions.
              </p>
            </div>

            {/* Profile Card */}
            <Card className="overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 md:p-8">
                <div className="flex flex-col items-center gap-6 md:gap-8 md:flex-row">
                  <div className="relative">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-300 dark:bg-gray-600 p-1">
                      <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
                        <User className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-white flex items-center justify-center">
                      <div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full"></div>
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">
                        John Doe
                      </h3>
                      <p className="text-lg md:text-xl text-blue-600 dark:text-blue-400 font-medium mb-4">
                        Full Stack Developer
                      </p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                        <Badge
                          variant="secondary"
                          className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-xs"
                        >
                          📍 San Francisco, CA
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-xs"
                        >
                          ✅ Available for hire
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-xs"
                        >
                          🌍 Remote friendly
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                      <div>
                        <div className="text-xl md:text-2xl font-bold text-gray-700 dark:text-gray-300">
                          5+
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">
                          Years Experience
                        </div>
                      </div>
                      <div>
                        <div className="text-xl md:text-2xl font-bold text-gray-700 dark:text-gray-300">
                          50+
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">
                          Projects Completed
                        </div>
                      </div>
                      <div>
                        <div className="text-xl md:text-2xl font-bold text-gray-700 dark:text-gray-300">
                          15+
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">
                          Happy Clients
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* About Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* About Me Text */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <User className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                    About Me
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    I specialize in modern web technologies including React,
                    Next.js, Node.js, and TypeScript. My passion lies in
                    building scalable applications that solve real-world
                    problems and deliver exceptional user experiences.
                  </p>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    When I'm not coding, you can find me exploring new
                    technologies, contributing to open-source projects, or
                    sharing knowledge through technical writing and mentoring.
                  </p>

                  <div className="pt-4">
                    <h4 className="font-semibold mb-3 text-xs md:text-sm uppercase tracking-wide text-muted-foreground">
                      Core Technologies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        React
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Next.js
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        TypeScript
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Node.js
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Python
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        AWS
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What I Do */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Code className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                    What I Do
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <Code className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm md:text-base">
                          Frontend Development
                        </h4>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Creating responsive, interactive user interfaces with
                          modern frameworks
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm md:text-base">
                          Backend Development
                        </h4>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Building scalable APIs and server-side applications
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm md:text-base">
                          UI/UX Design
                        </h4>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Designing intuitive user experiences and interfaces
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span className="text-muted-foreground">
                        Response Time
                      </span>
                      <span className="font-semibold text-green-600">
                        Within 24 hours
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  <div className="text-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-2">
                      <Code className="w-5 h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="text-lg md:text-2xl font-bold">React</div>
                    <div className="text-xs md:text-sm text-muted-foreground">
                      Expert Level
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-2">
                      <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="text-lg md:text-2xl font-bold">Node.js</div>
                    <div className="text-xs md:text-sm text-muted-foreground">
                      Advanced
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-2">
                      <User className="w-5 h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="text-lg md:text-2xl font-bold">
                      TypeScript
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">
                      Expert Level
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-2">
                      <Mail className="w-5 h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="text-lg md:text-2xl font-bold">AWS</div>
                    <div className="text-xs md:text-sm text-muted-foreground">
                      Intermediate
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Projects Section */}
          <section id="projects" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Featured Projects
              </h2>
              <p className="text-muted-foreground text-sm md:text-base px-4">
                Here are some of my recent projects that showcase my skills and
                experience.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-full h-40 md:h-48 bg-muted rounded-md mb-4 flex items-center justify-center">
                    <Code className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground" />
                  </div>
                  <CardTitle className="flex items-center justify-between text-lg">
                    E-Commerce Platform
                    <div className="flex space-x-2">
                      <Button size="icon" variant="ghost" asChild>
                        <a href="#" aria-label="View on GitHub">
                          <Github className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button size="icon" variant="ghost" asChild>
                        <a href="#" aria-label="Live Demo">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    A full-stack e-commerce solution built with Next.js, Stripe,
                    and PostgreSQL
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="outline" className="text-xs">
                      Next.js
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      TypeScript
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Stripe
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      PostgreSQL
                    </Badge>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Features include user authentication, payment processing,
                    inventory management, and responsive design.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-full h-40 md:h-48 bg-muted rounded-md mb-4 flex items-center justify-center">
                    <Briefcase className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground" />
                  </div>
                  <CardTitle className="flex items-center justify-between text-lg">
                    Task Management App
                    <div className="flex space-x-2">
                      <Button size="icon" variant="ghost" asChild>
                        <a href="#" aria-label="View on GitHub">
                          <Github className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button size="icon" variant="ghost" asChild>
                        <a href="#" aria-label="Live Demo">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    A collaborative project management tool with real-time
                    updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="outline" className="text-xs">
                      React
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Node.js
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Socket.io
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      MongoDB
                    </Badge>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Real-time collaboration, drag-and-drop interface, team
                    management, and progress tracking features.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-full h-40 md:h-48 bg-muted rounded-md mb-4 flex items-center justify-center">
                    <Code className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground" />
                  </div>
                  <CardTitle className="flex items-center justify-between text-lg">
                    Weather Dashboard
                    <div className="flex space-x-2">
                      <Button size="icon" variant="ghost" asChild>
                        <a href="#" aria-label="View on GitHub">
                          <Github className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button size="icon" variant="ghost" asChild>
                        <a href="#" aria-label="Live Demo">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Interactive weather application with data visualization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="outline" className="text-xs">
                      Vue.js
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      D3.js
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      API Integration
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      PWA
                    </Badge>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Features weather forecasts, interactive charts, location
                    search, and offline functionality.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-full h-40 md:h-48 bg-muted rounded-md mb-4 flex items-center justify-center">
                    <Briefcase className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground" />
                  </div>
                  <CardTitle className="flex items-center justify-between text-lg">
                    Blog Platform
                    <div className="flex space-x-2">
                      <Button size="icon" variant="ghost" asChild>
                        <a href="#" aria-label="View on GitHub">
                          <Github className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button size="icon" variant="ghost" asChild>
                        <a href="#" aria-label="Live Demo">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    A modern blogging platform with CMS capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="outline" className="text-xs">
                      Gatsby
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      GraphQL
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Contentful
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Netlify
                    </Badge>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    SEO optimized, fast loading, content management system, and
                    comment functionality.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Skills Section */}
          <section id="skills" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Skills & Technologies
              </h2>
              <p className="text-muted-foreground text-sm md:text-base px-4">
                Technologies and tools I work with regularly.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Frontend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="text-xs">React</Badge>
                    <Badge className="text-xs">Next.js</Badge>
                    <Badge className="text-xs">Vue.js</Badge>
                    <Badge className="text-xs">TypeScript</Badge>
                    <Badge className="text-xs">Tailwind CSS</Badge>
                    <Badge className="text-xs">SASS</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Backend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="text-xs">Node.js</Badge>
                    <Badge className="text-xs">Python</Badge>
                    <Badge className="text-xs">Express</Badge>
                    <Badge className="text-xs">FastAPI</Badge>
                    <Badge className="text-xs">PostgreSQL</Badge>
                    <Badge className="text-xs">MongoDB</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Tools & Others</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="text-xs">Git</Badge>
                    <Badge className="text-xs">Docker</Badge>
                    <Badge className="text-xs">AWS</Badge>
                    <Badge className="text-xs">Vercel</Badge>
                    <Badge className="text-xs">Figma</Badge>
                    <Badge className="text-xs">Jest</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Get In Touch
              </h2>
              <p className="text-muted-foreground text-sm md:text-base px-4">
                I'm always open to discussing new opportunities and interesting
                projects.
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm md:text-base">Email</p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        john.doe@example.com
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Linkedin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm md:text-base">
                        LinkedIn
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        linkedin.com/in/johndoe
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
