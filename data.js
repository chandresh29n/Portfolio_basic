/* ============================================================
   data.js  —  THE ONLY FILE YOU NEED TO EDIT
   Change the text below, save, and refresh index.html.
   (Or open editor.html, fill the form and download a new data.js.)
   Keep the quotes "..." and commas , exactly as they are.
   ============================================================ */

const PORTFOLIO = {
  siteTitle: "Chandresh N | Aspiring Software Developer",
  siteDescription:
    "Portfolio of Chandresh N, a B.Tech CSE student with web development and UI/UX design internship experience, skilled in Python, HTML, CSS, JavaScript and Figma.",

  name: "Chandresh N",
  title: "Aspiring Software Developer",

  // Lines that type out one after another in the hero section
  roles: [
    "Web Developer",
    "UI/UX Designer",
    "Python Developer",
    "Flutter & Kivy App Builder",
    "B.Tech CSE Student",
  ],

  availability: "Open to remote, part-time internships",

  // 3D background shapes (WebGL). Set to false to turn them off (e.g. for very old phones).
  enable3D: true,
  location: "Tamil Nadu, India",

  email: "chandresh29082008@gmail.com",
  phone: "+91 7598962915",
  showPhone: false, // set to true if you want your phone number visible on the public site

  social: {
    github: "https://github.com/Chandresh29n",
    linkedin: "https://www.linkedin.com/in/chandresh-n-028096426",
  },

  // Files inside the assets/ folder. Replace the files, or change the names here.
  photo: {
    illustrated: "assets/photo-toon.jpg",
    original: "assets/photo-original.jpg",
  },
  resumeFile: "assets/resume.pdf",

  // Optional: paste a Formspree URL (https://formspree.io/f/xxxx) to receive form
  // messages by email. Leave empty to open the visitor's mail app instead.
  formEndpoint: "",

  about: {
    summary:
      "Motivated B.Tech Computer Science and Engineering student at Amrita Vishwa Vidyapeetham with hands-on experience in web development (Rabtech Academy) and UI/UX design (UpStartInterns), plus practical project development. I work with Python, HTML, CSS, JavaScript, responsive web design, REST API integration and GitHub.",
    secondary:
      "I'm familiar with UI/UX principles, wireframing, user flows and interface prototyping in Figma, along with web accessibility and responsive design practices. I'm looking for a remote, part-time internship where I can keep learning from real projects and build user-friendly digital solutions.",
    interests: [
      "Full Stack Web Development",
      "Application Development",
      "Data Analysis",
      "Data Science",
      "API Development",
      "Software Engineering",
    ],
  },

  // Small numbers shown under the hero. Edit freely.
  stats: [
    { value: 6, suffix: "", label: "Projects built" },
    { value: 2, suffix: "", label: "Internships completed" },
    { value: 98, suffix: "%", label: "Best course score" },
    { value: 2030, suffix: "", label: "B.Tech graduation" },
  ],

  skills: [
    {
      group: "Programming",
      icon: "code",
      items: ["Python (Intermediate)", "JavaScript"],
    },
    {
      group: "Web Development",
      icon: "layers",
      items: [
        "HTML5",
        "CSS3",
        "Responsive Web Design",
        "CSS Grid",
        "Flexbox",
        "DOM Manipulation",
        "REST API Integration",
      ],
    },
    {
      group: "UI/UX Design",
      icon: "pen",
      items: [
        "Figma",
        "Wireframing",
        "Prototyping",
        "User Flows",
        "Web Accessibility",
      ],
    },
    {
      group: "App Frameworks",
      icon: "phone",
      items: ["Flutter", "Kivy (Basic)"],
    },
    {
      group: "Tools & Libraries",
      icon: "tool",
      items: [
        "Git",
        "GitHub",
        "VS Code",
        "Android Studio",
        "NumPy",
        "Pandas",
        "MySQL",
      ],
    },
    {
      group: "Core Strengths",
      icon: "bulb",
      items: [
        "Problem Solving",
        "Logical Thinking",
        "Quick Learning",
        "Adaptability",
        "Debugging",
      ],
    },
    {
      group: "Systems & Hardware",
      icon: "cpu",
      items: [
        "Windows installation",
        "Configuration",
        "Troubleshooting",
        "Computer components",
        "RAM & storage",
      ],
    },
  ],

  experience: [
    {
      role: "Full Stack Web Developer Intern",
      company: "Rabtech Academy",
      period: "Nov 2026",
      description:
        "Completed a one-month internship covering semantic HTML5, responsive CSS, JavaScript, REST API integration and interactive dashboard development. Gained practical experience in web development, testing and GitHub-based project submission.",
      tags: ["HTML5", "CSS", "JavaScript", "REST API", "GitHub"],
    },
    {
      role: "UI/UX Design Intern",
      company: "UpStartInterns",
      period: "Nov 2026",
      description:
        "Completed a UI/UX design internship focused on user-centered interface design, wireframing, prototyping and user flow creation using Figma. Developed practical skills in designing intuitive, user-friendly digital experiences.",
      tags: ["Figma", "Wireframing", "Prototyping", "User Flows"],
    },
  ],

  projects: [
    {
      name: "PhoneKart Web",
      stack: ["HTML", "CSS", "JavaScript"],
      description: [
        "Responsive smartphone e-commerce website.",
      ],
      github: "", // paste the repo link, e.g. "https://github.com/Chandrudesi2604/phonekart"
      demo: "",
    },
    {
      name: "PhoneKart Application Design",
      stack: ["Figma", "UI/UX"],
      description: [
        "Mobile and desktop UI/UX design for a smartphone e-commerce experience, from wireframes and user flows to a Figma prototype.",
      ],
      github: "",
      demo: "",
    },
    {
      name: "Industry Dashboard",
      stack: ["HTML", "CSS", "JavaScript", "REST API"],
      description: [
        "Interactive dashboard built during the Rabtech Academy internship using semantic HTML5, responsive CSS and API data.",
      ],
      github: "",
      demo: "",
    },
    {
      name: "Academia Portal",
      stack: ["Web", "HTML", "CSS"],
      description: [
        "Academic portal web project for presenting student and course information.",
      ],
      github: "",
      demo: "",
    },
    {
      name: "College Connect",
      stack: ["Flutter", "JSON"],
      description: [
        "College information app combining announcements and useful links in one place.",
        "JSON-based content management so information can be updated without modifying the app code.",
      ],
      github: "",
      demo: "",
    },
    {
      name: "Student Planner",
      stack: ["Python", "Kivy"],
      description: [
        "Android application for managing student timetables, academic tasks and daily college requirements.",
        "Assignment tracking, class schedules and reminder features.",
      ],
      github: "",
      demo: "",
    },
  ],

  education: [
    {
      degree: "B.Tech, Computer Science and Engineering",
      school: "Amrita Vishwa Vidyapeetham, Nagercoil, Tamil Nadu, India",
      period: "2026 – 2030 (Expected)",
    },
  ],

  certifications: [
    {
      title: "The Joy of Computing Using Python",
      issuer: "NPTEL",
      score: "90%",
    },
    {
      title: "Python Programming (13 Hours)",
      issuer: "Cookies & Cursor",
      score: "98%",
    },
    {
      title: "Python Programming Course",
      issuer: "EXCEL KEYS",
      score: "95%",
    },
    {
      title: "Internship Completion Certificates",
      issuer: "Rabtech Academy · UpStartInterns",
      score: "✓",
    },
  ],

  activities: [
    "Participated in a college-level ideathon.",
    "Participated in designing competitions using web tools.",
  ],
};
