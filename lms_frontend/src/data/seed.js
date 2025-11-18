//
// Local demo seed data for LMS frontend
// Shapes are normalized to match existing services expectations.
// learning_paths(id, title, description, thumbnail)
// courses(id, path_id, title, difficulty, duration, thumbnail)
// lessons(id, course_id, title, duration, order, video_url?) - synthesized for demo
//

// PUBLIC_INTERFACE
export const learningPaths = [
  {
    id: 1,
    title: "Frontend Development",
    description:
      "Learn modern frontend engineering with HTML, CSS, JavaScript, and frameworks.",
    thumbnail:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Backend Development",
    description:
      "Build robust server-side applications, APIs, and services with databases.",
    thumbnail:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Data Science",
    description:
      "Analyze data, build models, and extract insights using Python and libraries.",
    thumbnail:
      "https://images.unsplash.com/photo-1517153295259-74f6205fa0c4?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Cloud & DevOps",
    description:
      "Learn cloud platforms, IaC, containers, CI/CD, and operational excellence.",
    thumbnail:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Cybersecurity",
    description:
      "Secure systems, perform risk assessments, and learn defensive strategies.",
    thumbnail:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981d?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "Mobile Development",
    description:
      "Create native and cross-platform mobile apps with modern tooling.",
    thumbnail:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: 7,
    title: "Product Management",
    description:
      "Learn product discovery, delivery, roadmapping, and stakeholder management.",
    thumbnail:
      "https://images.unsplash.com/photo-1529336953121-ad035fdfed11?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: 8,
    title: "UX/UI Design",
    description:
      "Design user-centered experiences with research, prototyping, and design systems.",
    thumbnail:
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: 9,
    title: "AI/ML Engineering",
    description:
      "Engineer machine learning systems and integrate AI into products.",
    thumbnail:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: 10,
    title: "Project Management",
    description:
      "Master frameworks like Agile and Scrum to lead successful projects.",
    thumbnail:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80&auto=format&fit=crop",
  },
];

// Difficulty levels for reference
// PUBLIC_INTERFACE
export const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];

// Skill tags for reference
// PUBLIC_INTERFACE
export const skillTags = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Node.js",
  "Express",
  "SQL",
  "NoSQL",
  "Python",
  "Pandas",
  "NumPy",
  "ML",
  "Docker",
  "Kubernetes",
  "AWS",
  "Security",
  "iOS",
  "Android",
  "Figma",
  "UX",
];

// Seed courses grouped by path
// PUBLIC_INTERFACE
export const courses = [
  // Frontend Development
  {
    id: 101,
    path_id: 1,
    title: "HTML & CSS Fundamentals",
    difficulty: "Beginner",
    duration: 6,
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: 102,
    path_id: 1,
    title: "Modern JavaScript Essentials",
    difficulty: "Intermediate",
    duration: 8,
    thumbnail:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: 103,
    path_id: 1,
    title: "React for Professionals",
    difficulty: "Advanced",
    duration: 10,
    thumbnail:
      "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80&auto=format&fit=crop",
  },

  // Backend Development
  {
    id: 201,
    path_id: 2,
    title: "Node.js and Express APIs",
    difficulty: "Beginner",
    duration: 7,
    thumbnail:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: 202,
    path_id: 2,
    title: "Databases: SQL & NoSQL",
    difficulty: "Intermediate",
    duration: 9,
    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: 203,
    path_id: 2,
    title: "Scalable Backend Architectures",
    difficulty: "Advanced",
    duration: 11,
    thumbnail:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=800&q=80&auto=format&fit=crop",
  },

  // Data Science
  {
    id: 301,
    path_id: 3,
    title: "Python for Data Analysis",
    difficulty: "Beginner",
    duration: 6,
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: 302,
    path_id: 3,
    title: "Machine Learning Basics",
    difficulty: "Intermediate",
    duration: 8,
    thumbnail:
      "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: 303,
    path_id: 3,
    title: "Advanced ML Engineering",
    difficulty: "Advanced",
    duration: 12,
    thumbnail:
      "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?w=800&q=80&auto=format&fit=crop",
  },

  // Cloud & DevOps
  {
    id: 401,
    path_id: 4,
    title: "Docker & Containers",
    difficulty: "Beginner",
    duration: 5,
    thumbnail:
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: 402,
    path_id: 4,
    title: "Kubernetes Fundamentals",
    difficulty: "Intermediate",
    duration: 8,
    thumbnail:
      "https://images.unsplash.com/photo-1584999734482-0361aecad844?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: 403,
    path_id: 4,
    title: "AWS for DevOps",
    difficulty: "Advanced",
    duration: 10,
    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80&auto=format&fit=crop",
  },
];

// Example modules for course 102 to synthesize lessons
const modulesForCourse102 = [
  { id: "m102-1", course_id: 102, title: "JS Syntax & Operators", order: 1 },
  { id: "m102-2", course_id: 102, title: "Functions & Scope", order: 2 },
  { id: "m102-3", course_id: 102, title: "Async Programming", order: 3 },
  { id: "m102-4", course_id: 102, title: "ES Modules", order: 4 },
];

// PUBLIC_INTERFACE
export const lessons = (() => {
  // For demo: create specific lessons for course 102 from modules
  const course102Lessons = modulesForCourse102.map((m, idx) => ({
    id: `l-102-${idx + 1}`,
    course_id: 102,
    title: m.title,
    duration: 20 + idx * 5,
    order: m.order,
    video_url: null,
  }));

  // For all other courses, create 3 placeholder lessons each
  const otherCourses = courses.filter((c) => c.id !== 102);
  const placeholderLessons = otherCourses.flatMap((c) => {
    return [1, 2, 3].map((n) => ({
      id: `l-${c.id}-${n}`,
      course_id: c.id,
      title: `${c.title}: Lesson ${n}`,
      duration: 15 + n * 3,
      order: n,
      video_url: null,
    }));
  });

  return [...course102Lessons, ...placeholderLessons];
})();
