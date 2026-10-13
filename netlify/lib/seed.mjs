// Starting content for the résumé editor, transcribed from the original
// résumé PDF (site/assets/resume.pdf). Used until the first save.
export const seedResume = {
  name: 'Azrie Bakri',
  headline: '',
  contact: {
    location: 'Kuala Lumpur, Malaysia',
    phone: '+60147201332',
    email: 'mohamad.azriebakri@gmail.com',
    website: 'https://azriebakri.com',
  },
  sections: [
    {
      id: 'summary',
      type: 'text',
      title: 'Summary',
      body:
        "Full-stack engineer passionate about clean code and product thinking. I'm committed to writing maintainable, well-tested software while keeping customer outcomes at the center of technical decisions. I believe engineering excellence and product success are inseparable—clean architecture enables iteration, and thoughtful technical choices drive business impact.\n\n" +
        "I'm eager to grow at the intersection of engineering and product, learning how to balance technical rigor with strategic thinking to build solutions that truly matter.",
    },
    {
      id: 'skills-now',
      type: 'tags',
      title: "Skills that I'm currently focusing on",
      items: [
        'TypeScript', 'JavaScript', 'React', 'AWS', 'Docker', 'Braid Design', 'CSS', 'HTML',
        'Node JS', 'Cursor', 'LaunchDarkly', 'Buildkite Pipeline', 'DynamoDB', 'DataDog',
        'Clean Code', 'Clean Architecture', 'Testing', 'JEST',
      ],
    },
    {
      id: 'skills-before',
      type: 'tags',
      title: 'Skills from previous work experiences',
      items: [
        'Angular', 'React Native', 'C#', 'ASP.Net', 'D3.js', 'SQL', 'MongoDB', 'JAVA',
        'Tableau', 'Microsoft Power BI', 'Microsoft Azure', 'Splunk',
      ],
    },
    {
      id: 'experience',
      type: 'entries',
      title: 'Work experience',
      items: [
        {
          id: 'seek',
          title: 'Software Engineer, SEEK',
          subtitle: '',
          dates: 'Feb 2022 – Present',
          description: '',
          bullets: [
            "Contribute to backend development and API standardization across SEEK's Asian job platforms (JobStreet.com and JobsDB.com), architecting unified RESTful endpoints that consolidate fragmented job posting and search services across six markets (Philippines, Malaysia, Singapore, Indonesia, Thailand, and Hong Kong), reducing API response times by 40% and enabling seamless cross-platform integration for 10M+ monthly active users",
            "Drove platform unification initiatives aligning technical architecture with SEEK's strategic Asia-Pacific vision, decomposing monolithic systems into microservices that reduced code duplication by 35%, accelerated feature deployment cycles from quarterly to bi-weekly releases, and enabled consistent user experiences across previously siloed regional platforms",
            'Architected and deployed experimentation infrastructure in business-critical job search and application systems, implementing feature flagging frameworks (LaunchDarkly/Optimizely) and gradual rollout strategies that enabled A/B testing of conversion-critical features while maintaining 100% uptime and zero production incidents',
            'Engineered reusable internal libraries and design patterns, including shared authentication modules, API clients, and a data validation framework adopted by 8+ distributed engineering teams',
            'Established comprehensive quality assurance practices, implementing integration test suites, automated end-to-end testing using Cypress/Selenium, and maintaining technical documentation through Confluence',
            'Maintained system reliability through on-call rotation, troubleshooting production incidents, and implementing fixes to minimize downtime',
          ],
          outcome: '',
          projects: [],
        },
        {
          id: 'fmh',
          title: 'Software Engineer, Food Market Hub',
          subtitle: '',
          dates: 'May 2021 – Feb 2022',
          description: '',
          bullets: [
            'Developed full-stack forecasting platform using React Native, Node.js, and MongoDB to deliver AI-powered inventory demand predictions and supply chain analytics, enabling 500+ restaurant clients to optimize procurement decisions and reduce food waste by 20-30%',
            'Led user research initiatives conducting 15+ customer interviews and usability testing sessions to identify critical pain points in inventory management workflows, translating qualitative insights into quantifiable product requirements and feature prioritization frameworks that informed quarterly roadmap planning',
            'Architected feature specifications based on data-driven research findings, designing targeted solutions for both SMB restaurant owners and enterprise food service operators, resulting in 40% improvement in feature adoption rates and increased customer retention',
            'Built automated CI/CD pipeline using GitHub Actions integrated with AWS infrastructure, implementing comprehensive unit and integration test suites that reduced manual QA cycles by 60%, accelerated deployment velocity from weekly to daily releases, and eliminated production incidents caused by regression bugs',
          ],
          outcome: '',
          projects: [],
        },
        {
          id: 'servicerocket',
          title: 'Software Engineer, ServiceRocket',
          subtitle: '',
          dates: 'Oct 2020 – Apr 2021',
          description: '',
          bullets: [
            'Engineered custom Atlassian solutions and client web applications using Java, CoffeeScript, HTML, CSS, and jQuery, developing reusable component libraries and maintaining codebases for 8+ concurrent projects serving enterprise clients across financial services and technology sectors',
            'Implemented a comprehensive cross-browser testing strategy across Chrome, Firefox, Safari, Edge, and mobile platforms (iOS/Android), documenting browser-specific compatibility issues and implementing polyfills and responsive design patterns that achieved 100% feature parity across all supported environments and improved mobile user engagement by 45%',
            'Optimized front-end performance through code refactoring, lazy loading implementation, and asset optimization, reducing average page load times by 30% and improving Lighthouse performance scores from 65 to 90+',
          ],
          outcome: '',
          projects: [],
        },
        {
          id: 'avanade',
          title: 'Senior Analyst, Avanade',
          subtitle: 'Selected work experience',
          dates: 'Jul 2017 – Oct 2020',
          description: '',
          bullets: [],
          outcome: '',
          projects: [
            {
              id: 'myexperts',
              title: 'Petronas – MyExperts',
              subtitle: '',
              dates: 'Jul 2017 – Jan 2018',
              description:
                "Delivered an enterprise-grade platform consolidating PETRONAS's end-to-end service management across six integrated modules, including order management, resource allocation, project tracking, and billing.",
              bullets: [
                'Engineered responsive web features by translating UX wireframes into production-ready code using ASP.NET, C#, HTML, and CSS',
                'Developed and optimized SQL queries for data manipulation, reporting dashboards, and operational analytics',
                'Implemented interactive features using jQuery to enhance user experience across the service lifecycle',
              ],
              outcome:
                'Reduced request-to-deployment time by centralizing workflows, accelerated billing cycles by 30%, and provided real-time visibility into technical projects across upstream, downstream, and corporate divisions serving 1,000+ internal users.',
              projects: [],
            },
            {
              id: 'alphaoil',
              title: 'Petronas – AlphaOil',
              subtitle: '',
              dates: 'Feb 2018 – Jan 2019',
              description:
                "Engineered an end-to-end supply chain visualization dashboard providing real-time insights across Malaysia's petroleum value chain—from crude production to terminal distribution.",
              bullets: [
                'Contributed to architecture and maintained RESTful APIs in Node.js to deliver operational data to front-end visualizations with sub-second response times',
                'Built modular React components and interactive charts for tracking crude availability, production forecasts, terminal inventory, and logistics',
                'Integrated Azure cloud services for scalable data processing and deployment',
                'Collaborated with cross-functional teams to implement grid-to-end integration, connecting upstream production with downstream commercial operations',
              ],
              outcome:
                'Consolidated fragmented data sources into a single source of truth, reduced forecast discrepancies by 25%, improved asset utilization rates, and accelerated strategic decision-making for C-level stakeholders managing multi-billion dollar operations.',
              projects: [],
            },
            {
              id: 'alphawells',
              title: 'Petronas – AlphaWells',
              subtitle: '',
              dates: 'Mar 2019 – Nov 2019',
              description:
                'Built a predictive analytics platform leveraging historical oil well data to optimize drilling designs and reduce operational costs for upstream petroleum engineers.',
              bullets: [
                'Developed custom D3.js data visualizations to surface complex drilling datasets and enable interactive exploration of historical well performance',
                'Created responsive React components with full mobile compatibility, translating UX designs into production-ready features',
                'Integrated MySQL database queries to aggregate and process multi-year drilling records for real-time analytics',
                'Implemented performance benchmarking algorithms to identify optimal well design parameters',
              ],
              outcome:
                'Enabled well engineers to reduce drilling complexity by 15-20% through data-driven design decisions, improved cost forecasting accuracy, and proactively identified schedule risks before execution.',
              projects: [],
            },
          ],
        },
      ],
    },
    {
      id: 'education',
      type: 'entries',
      title: 'Education',
      items: [
        {
          id: 'mmu',
          title: 'Bachelor of Computer Science, Software Engineering',
          subtitle: 'Multimedia University, Cyberjaya',
          dates: 'Jul 2017',
          description: '',
          bullets: [],
          outcome: '',
          projects: [],
        },
      ],
    },
    {
      id: 'languages',
      type: 'list',
      title: 'Languages',
      items: ['English, Bilingual', 'Bahasa Malaysia, Bilingual', 'Chinese (Mandarin), Elementary'],
    },
    {
      id: 'certifications',
      type: 'list',
      title: 'Certifications',
      items: ['Amazon Web Services Cloud Practitioner', 'Microsoft Certified: Azure Fundamentals'],
    },
  ],
};
