import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Job, JobApplication, StatusLog, Category, CompanyGroup } from "./src/types";

// Ensure data folder exists
const DATA_DIR = process.env.VERCEL
  ? "/tmp/data"
  : path.join(process.cwd(), "data");

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("Failed to create data directory", e);
}

const JOBS_FILE = path.join(DATA_DIR, "jobs.json");
const APPLICATIONS_FILE = path.join(DATA_DIR, "applications.json");
const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json");
const GROUPS_FILE = path.join(DATA_DIR, "groups.json");

function ensureSeedFile(filePath: string, seedFileName: string, initialData: any) {
  try {
    if (!fs.existsSync(filePath)) {
      const originalPath = path.join(process.cwd(), "data", seedFileName);
      if (fs.existsSync(originalPath)) {
        const originalData = fs.readFileSync(originalPath, "utf-8");
        fs.writeFileSync(filePath, originalData);
      } else {
        fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
      }
    }
  } catch (err) {
    console.error(`Seed copy warning for ${seedFileName}:`, err);
  }
}

const initialCategories: Category[] = [
  { id: "cat-1", name: "Engineering" },
  { id: "cat-2", name: "Marketing" },
  { id: "cat-3", name: "Finance" },
  { id: "cat-4", name: "Operations" },
  { id: "cat-5", name: "Human Resources" },
  { id: "cat-6", name: "Design" }
];

const initialGroups: CompanyGroup[] = [
  { id: "grp-1", name: "Apex Tech Labs", description: "Finest cloud native engineering & digital product architectures." },
  { id: "grp-2", name: "Horizon Consumer Goods", description: "Dynamic retail products category marketing campaigns." },
  { id: "grp-3", name: "Vertex Financial Services", description: "Mutual corporate funding systems & accounts auditing diagnostics." }
];

// Seed jobs
const initialJobs: Job[] = [
  {
    id: "job-1",
    title: "Senior Full-Stack Engineer",
    category: "Engineering",
    company: "Apex Tech Labs",
    location: "Dhaka (Hybrid)",
    type: "Full-time",
    salaryRange: "$1,800 - $2,500 / month",
    experienceLevel: "4-6 Years",
    description: "We are seeking a Senior Full-Stack Engineer to join our core development team inside Apex Tech Labs. You will work extensively on cloud-native applications, optimizing database performance, and building clean React user experiences.",
    requirements: [
      "Proficiency in React, Node.js, and TypeScript.",
      "Experience with relational databases (PostgreSQL/MySQL) and caching stores.",
      "Excellent understanding of system design, performance bottlenecks, and RESTful APIs.",
      "Strong communication and leadership qualities for mentoring junior engineers."
    ],
    responsibilities: [
      "Collaborate with product designers and engineering leads to iterate on features.",
      "Write highly maintainable, optimized, and testable code blocks.",
      "Conduct in-depth code reviews and improve our continuous integration pipeline.",
      "Diagnose and troubleshoot latency hot spots in production systems."
    ],
    isInternalOnly: false,
    datePosted: "2026-06-08"
  },
  {
    id: "job-2",
    title: "Category Marketing Executive",
    category: "Marketing",
    company: "Horizon Consumer Goods",
    location: "Dhaka Office",
    type: "Full-time",
    salaryRange: "$900 - $1,200 / month",
    experienceLevel: "1-3 Years",
    description: "Horizon Consumer Goods is looking for an energetic Marketing Executive to lead our internal and external category-focused brand campaigns. You will coordinate with our creative studio and write clear briefs.",
    requirements: [
      "Bachelor's degree in Marketing, Business, or dynamic field.",
      "Strong analytical abilities for tracking acquisition costs and visual performance.",
      "Splendid copywriting and storyboard rendering skill sets.",
      "Creative thinker with high attention to brand visual harmony."
    ],
    responsibilities: [
      "Supervise retail product category marketing assets from concept to print.",
      "Organize local community outreach and seasonal marketing events.",
      "Track KPIs, user response scores, and compile monthly execution reports."
    ],
    isInternalOnly: false,
    datePosted: "2026-06-09"
  },
  {
    id: "job-3",
    title: "Finance & Accounts Analyst",
    category: "Finance",
    company: "Vertex Financial Services",
    location: "Dhaka Office (Internal Only)",
    type: "Full-time",
    salaryRange: "$1,400 - $1,800 / month",
    experienceLevel: "2-4 Years",
    description: "This position is strictly open for internal transfers within the Vertex Group of Companies. The Finance Analyst will maintain accounts audits, balance sheets, and tax reconciliations.",
    requirements: [
      "Currently serving in any affiliate subsidiary of Vertex Group.",
      "Degree in Finance, Accounting, or certified ACCA/CMA (ongoing candidates acceptable).",
      "Robust mastery over advanced Excel spreadsheets and auditing models.",
      "Impeccable ethical standing and compliance record."
    ],
    responsibilities: [
      "Perform weekly cash-flow audits across Affiliate accounts.",
      "Assess internal transfer pricing models and process monthly salary statements.",
      "Draft analytical forecasts for our venture development vertical."
    ],
    isInternalOnly: true,
    datePosted: "2026-06-05"
  },
  {
    id: "job-4",
    title: "UI/UX Product Designer",
    category: "Design",
    company: "Apex Tech Labs",
    location: "Remote / Hybrid",
    type: "Contract",
    salaryRange: "$1,500 - $2,000 / month",
    experienceLevel: "2+ Years",
    description: "Join our central design crew to shape digital applications of the Apex Group of companies. This contract offers exciting scope to overhaul high-traffic dashboards.",
    requirements: [
      "Outstanding portfolio displaying web products, design tokens, and clean typography.",
      "Advanced mastery of Figma and micro-animation concepts.",
      "Strong understanding of visual contrast, semantic UI rules, and responsive systems.",
      "Ability to translate user flows into low and high fidelity prototypes."
    ],
    responsibilities: [
      "Collaborate with product managers to clarify specs and wireframes.",
      "Establish coherent component designs conforming to company design guidelines.",
      "Provide developer-ready assets and audit frontend implementations for fidelity."
    ],
    isInternalOnly: false,
    datePosted: "2026-06-07"
  },
  {
    id: "job-5",
    title: "Lead Talent Acquisition Partner",
    category: "Human Resources",
    company: "Apex Corporate Headquarters",
    location: "Dhaka Office",
    type: "Full-time",
    salaryRange: "$2,000 - $3,000 / month",
    experienceLevel: "5+ Years",
    description: "We are seeking a Lead Talent Acquisition Partner to join Apex Corporate Headquarters. You will govern recruiting pipelines, shape candidate journeys, and champion internal employee progression opportunities.",
    requirements: [
      "Proven track record in technical recruiter or HR management roles.",
      "Great networking strength within local and international tech ecosystems.",
      "Skilled in modern ATS tools, behavioral interviews, and compensation packages.",
      "Master's or bachelor's degree in HRM or equivalent."
    ],
    responsibilities: [
      "Drive interview and intake coordination with department vertical leads.",
      "Implement internal mobility procedures for transfer applications.",
      "Establish strong university internship programs and campus relations."
    ],
    isInternalOnly: false,
    datePosted: "2026-06-10"
  }
];

// Seed Applications
const initialApplications: JobApplication[] = [
  {
    id: "app-1",
    jobId: "job-1",
    jobTitle: "Senior Full-Stack Engineer",
    jobCompany: "Apex Tech Labs",
    applicantName: "Ayman Rahman",
    applicantEmail: "ayman.rahman@mail.com",
    applicantPhone: "+8801712345678",
    coverLetter: "I'm excited to submit my interest for the Senior Full-Stack role. Having worked in full-stack JavaScript for the last five years, I specialization in modular react builds and high-scale backends. Let me know if my credentials align well!",
    cvFileName: "ayman_rahman_cv.pdf",
    cvFileData: "data:application/pdf;base64,JVBERi0xLjQKJSDi48cl...[Simulated Resume PDF Content]",
    docFileName: "recommendation_letter.pdf",
    docFileData: "data:application/pdf;base64,JVBERi0x...[Simulated Doc Content]",
    appliedAt: "2026-06-08T09:15:30Z",
    status: "Shortlisted",
    statusLogs: [
      {
        id: "l-1",
        status: "Pending",
        updatedAt: "2026-06-08T09:15:30Z",
        updatedBy: "System",
        note: "Application submitted successfully through visitor portal."
      },
      {
        id: "l-2",
        status: "Shortlisted",
        updatedAt: "2026-06-08T14:30:00Z",
        updatedBy: "mk.rabbani.cse@gmail.com",
        note: "Fabulous GitHub and portfolio links. Experience with high-performance architectures matches perfectly. Shortlisting for tech-screen interview."
      }
    ]
  },
  {
    id: "app-2",
    jobId: "job-3",
    jobTitle: "Finance & Accounts Analyst",
    jobCompany: "Vertex Financial Services",
    applicantName: "Nusrat Jahan",
    applicantEmail: "nusrat.vertex@internal.com",
    applicantPhone: "+8801824101112",
    coverLetter: "Greetings! I am currently working as a Junior Accountant within the Vertex Media subsidiary for the last 2 years. I want to transfer to Vertex Financial Services as a Finance Analyst to leverage my continuous progress towards my ACCA certification.",
    cvFileName: "nusrat_jahan_cv.pdf",
    cvFileData: "data:application/pdf;base64,JVBERi0xLjQKJSDi48cl...[Simulated Resume PDF Content]",
    appliedAt: "2026-06-09T10:05:00Z",
    status: "Pending",
    statusLogs: [
      {
        id: "l-3",
        status: "Pending",
        updatedAt: "2026-06-09T10:05:00Z",
        updatedBy: "System (Internal Employee)",
        note: "Internal application logged by employee Nusrat Jahan from Vertex Media."
      }
    ]
  },
  {
    id: "app-3",
    jobId: "job-4",
    jobTitle: "UI/UX Product Designer",
    jobCompany: "Apex Tech Labs",
    applicantName: "Kabir Hossain",
    applicantEmail: "kabir.design@mail.com",
    applicantPhone: "+8801556789012",
    coverLetter: "Hi there! I am a vector-obsessed visual artist and interface architect. I specialize in complete layout rhythm, micro-interactions using motion libraries, and consistent color strategies. Check my Figma prototype cases attached. Cheers!",
    cvFileName: "kabir_hossain_design_cv.pdf",
    cvFileData: "data:application/pdf;base64,JVBERi0xLjQKJSDi48cl...[Simulated Resume PDF Content]",
    appliedAt: "2026-06-10T08:20:10Z",
    status: "Rejected",
    statusLogs: [
      {
        id: "l-4",
        status: "Pending",
        updatedAt: "2026-06-10T08:20:10Z",
        updatedBy: "System",
        note: "Application submitted successfully through visitor portal."
      },
      {
        id: "l-5",
        status: "Rejected",
        updatedAt: "2026-06-10T10:15:00Z",
        updatedBy: "mk.rabbani.cse@gmail.com",
        note: "Thank you for applying. Currently looking for candidates with deeper experience designing rich application dashboards. We shall retain your profile for subsequent openings."
      }
    ]
  }
];

// Read from database helper
function loadJobs(): Job[] {
  try {
    ensureSeedFile(JOBS_FILE, "jobs.json", initialJobs);
    if (fs.existsSync(JOBS_FILE)) {
      const data = fs.readFileSync(JOBS_FILE, "utf-8");
      return JSON.parse(data);
    }
    return initialJobs;
  } catch (error) {
    console.error("Error reading jobs file: ", error);
    try {
      const originalPath = path.join(process.cwd(), "data", "jobs.json");
      if (fs.existsSync(originalPath)) {
        return JSON.parse(fs.readFileSync(originalPath, "utf-8"));
      }
    } catch {}
    return initialJobs;
  }
}

function saveJobs(jobs: Job[]) {
  try {
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
  } catch (error) {
    console.error("Error writing jobs file: ", error);
  }
}

function loadApplications(): JobApplication[] {
  try {
    ensureSeedFile(APPLICATIONS_FILE, "applications.json", initialApplications);
    if (fs.existsSync(APPLICATIONS_FILE)) {
      const data = fs.readFileSync(APPLICATIONS_FILE, "utf-8");
      return JSON.parse(data);
    }
    return initialApplications;
  } catch (error) {
    console.error("Error reading applications: ", error);
    try {
      const originalPath = path.join(process.cwd(), "data", "applications.json");
      if (fs.existsSync(originalPath)) {
        return JSON.parse(fs.readFileSync(originalPath, "utf-8"));
      }
    } catch {}
    return initialApplications;
  }
}

function saveApplications(applications: JobApplication[]) {
  try {
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(applications, null, 2));
  } catch (error) {
    console.error("Error writing applications: ", error);
  }
}

function loadCategories(): Category[] {
  try {
    ensureSeedFile(CATEGORIES_FILE, "categories.json", initialCategories);
    if (fs.existsSync(CATEGORIES_FILE)) {
      const data = fs.readFileSync(CATEGORIES_FILE, "utf-8");
      return JSON.parse(data);
    }
    return initialCategories;
  } catch (error) {
    console.error("Error reading categories file: ", error);
    try {
      const originalPath = path.join(process.cwd(), "data", "categories.json");
      if (fs.existsSync(originalPath)) {
        return JSON.parse(fs.readFileSync(originalPath, "utf-8"));
      }
    } catch {}
    return initialCategories;
  }
}

function saveCategories(categories: Category[]) {
  try {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
  } catch (error) {
    console.error("Error writing categories file: ", error);
  }
}

function loadGroups(): CompanyGroup[] {
  try {
    ensureSeedFile(GROUPS_FILE, "groups.json", initialGroups);
    if (fs.existsSync(GROUPS_FILE)) {
      const data = fs.readFileSync(GROUPS_FILE, "utf-8");
      return JSON.parse(data);
    }
    return initialGroups;
  } catch (error) {
    console.error("Error reading groups file: ", error);
    try {
      const originalPath = path.join(process.cwd(), "data", "groups.json");
      if (fs.existsSync(originalPath)) {
        return JSON.parse(fs.readFileSync(originalPath, "utf-8"));
      }
    } catch {}
    return initialGroups;
  }
}

function saveGroups(groups: CompanyGroup[]) {
  try {
    fs.writeFileSync(GROUPS_FILE, JSON.stringify(groups, null, 2));
  } catch (error) {
    console.error("Error writing groups file: ", error);
  }
}

// In-memory sessions store for Admin (Simple secure session tokens)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "mk.rabbani.cse@gmail.com";
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "portal-admin-123"; // Simple secure passcode for authentication
const activeSessions = new Set<string>();

export const app = express();
app.use(express.json({ limit: "50mb" })); // Support large base64 uploads (CV documents)
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Middleware for auth check
  const checkAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access Denied. No authorization token present." });
    }
    const token = authHeader.split(" ")[1];
    if (activeSessions.has(token)) {
      next();
    } else {
      return res.status(403).json({ error: "Session expired or invalid token." });
    }
  };

  // ---------------- API ENDPOINTS ----------------

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // User auth endpoint: Secure sign-in specifically for mk.rabbani.cse@gmail.com
  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and secure passcode are required." });
    }

    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ error: "Unauthorized email address. Only the designated Group Admin can sign in." });
    }

    // Secure authentication check
    if (password === ADMIN_PASSCODE) {
      const sessionToken = "session_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
      activeSessions.add(sessionToken);
      return res.json({
        success: true,
        email: ADMIN_EMAIL,
        token: sessionToken,
        message: "Secure login successful. Welcome admin!"
      });
    } else {
      return res.status(401).json({ error: "Invalid passcode. Please check the security key." });
    }
  });

  // Admin session validation
  app.get("/api/admin/validate", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({ isValid: false });
    }
    const token = authHeader.split(" ")[1];
    if (activeSessions.has(token)) {
      res.json({ isValid: true, email: ADMIN_EMAIL });
    } else {
      res.json({ isValid: false });
    }
  });

  // Admin Logout
  app.post("/api/admin/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      activeSessions.delete(token);
    }
    res.json({ success: true, message: "Logged out successfully" });
  });

  // GET JOBS - public access
  app.get("/api/jobs", (req, res) => {
    const jobs = loadJobs();
    res.json(jobs);
  });

  // GET JOB BY ID - public access
  app.get("/api/jobs/:id", (req, res) => {
    const jobs = loadJobs();
    const job = jobs.find(j => j.id === req.params.id);
    if (job) {
      res.json(job);
    } else {
      res.status(404).json({ error: "Job opening not found." });
    }
  });

  // POST NEW JOB - admin only
  app.post("/api/jobs", checkAdminAuth, (req, res) => {
    try {
      const { title, category, company, location, type, salaryRange, experienceLevel, description, requirements, responsibilities, isInternalOnly } = req.body;
      
      if (!title || !category || !company || !location || !type || !description) {
        return res.status(400).json({ error: "Missing required job outline fields." });
      }

      const jobs = loadJobs();
      const newJob: Job = {
        id: "job-" + Date.now().toString(36),
        title,
        category,
        company,
        location,
        type,
        salaryRange: salaryRange || "Negotiable",
        experienceLevel: experienceLevel || "Not Specified",
        description,
        requirements: Array.isArray(requirements) ? requirements : [],
        responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
        isInternalOnly: !!isInternalOnly,
        datePosted: new Date().toISOString().split("T")[0]
      };

      jobs.unshift(newJob);
      saveJobs(jobs);
      res.status(201).json(newJob);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // DELETE JOB - admin only
  app.delete("/api/jobs/:id", checkAdminAuth, (req, res) => {
    const jobs = loadJobs();
    const filteredJobs = jobs.filter(j => j.id !== req.params.id);
    if (jobs.length === filteredJobs.length) {
      return res.status(404).json({ error: "Job not found." });
    }
    saveJobs(filteredJobs);
    res.json({ success: true, jobId: req.params.id });
  });

  // GET ALL CATEGORIES
  app.get("/api/categories", (req, res) => {
    const categories = loadCategories();
    res.json(categories);
  });

  // POST NEW CATEGORY - admin only
  app.post("/api/categories", checkAdminAuth, (req, res) => {
    try {
      const { name } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Category name is required." });
      }

      const categories = loadCategories();
      // Check for duplicates
      if (categories.some(c => c.name.toLowerCase() === name.trim().toLowerCase())) {
        return res.status(400).json({ error: "Category already exists." });
      }

      const newCategory: Category = {
        id: "cat-" + Date.now().toString(36),
        name: name.trim()
      };

      categories.push(newCategory);
      saveCategories(categories);
      res.status(201).json(newCategory);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // PUT UPDATE CATEGORY - admin only
  app.put("/api/categories/:id", checkAdminAuth, (req, res) => {
    try {
      const { name } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Category name is required." });
      }

      const categories = loadCategories();
      const index = categories.findIndex(c => c.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ error: "Category not found." });
      }

      // Check for duplicates (other than current one)
      if (categories.some((c, idx) => idx !== index && c.name.toLowerCase() === name.trim().toLowerCase())) {
        return res.status(400).json({ error: "Category name already exists." });
      }

      categories[index].name = name.trim();
      saveCategories(categories);
      res.json(categories[index]);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // DELETE CATEGORY - admin only
  app.delete("/api/categories/:id", checkAdminAuth, (req, res) => {
    try {
      const categories = loadCategories();
      const filtered = categories.filter(c => c.id !== req.params.id);
      if (categories.length === filtered.length) {
        return res.status(404).json({ error: "Category not found." });
      }
      saveCategories(filtered);
      res.json({ success: true, categoryId: req.params.id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET ALL GROUPS
  app.get("/api/groups", (req, res) => {
    const groups = loadGroups();
    res.json(groups);
  });

  // POST NEW GROUP - admin only
  app.post("/api/groups", checkAdminAuth, (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Group name is required." });
      }

      const groups = loadGroups();
      // Check for duplicates
      if (groups.some(g => g.name.toLowerCase() === name.trim().toLowerCase())) {
        return res.status(400).json({ error: "A company group with this name already exists." });
      }

      const newGroup: CompanyGroup = {
        id: "grp-" + Date.now().toString(36),
        name: name.trim(),
        description: description ? description.trim() : ""
      };

      groups.push(newGroup);
      saveGroups(groups);
      res.status(201).json(newGroup);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // PUT UPDATE GROUP - admin only
  app.put("/api/groups/:id", checkAdminAuth, (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Group name is required." });
      }

      const groups = loadGroups();
      const index = groups.findIndex(g => g.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ error: "Group not found." });
      }

      // Check for duplicates (other than current one)
      if (groups.some((g, idx) => idx !== index && g.name.toLowerCase() === name.trim().toLowerCase())) {
        return res.status(400).json({ error: "Group name already exists." });
      }

      groups[index].name = name.trim();
      groups[index].description = description ? description.trim() : "";
      saveGroups(groups);
      res.json(groups[index]);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // DELETE GROUP - admin only
  app.delete("/api/groups/:id", checkAdminAuth, (req, res) => {
    try {
      const groups = loadGroups();
      const filtered = groups.filter(g => g.id !== req.params.id);
      if (groups.length === filtered.length) {
        return res.status(404).json({ error: "Group not found." });
      }
      saveGroups(filtered);
      res.json({ success: true, groupId: req.params.id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // APPLY TO A JOB - public access
  app.post("/api/applications", (req, res) => {
    try {
      const {
        jobId,
        applicantName,
        applicantEmail,
        applicantPhone,
        coverLetter,
        cvFileName,
        cvFileData,
        docFileName,
        docFileData
      } = req.body;

      if (!jobId || !applicantName || !applicantEmail || !applicantPhone || !cvFileName || !cvFileData) {
        return res.status(400).json({ error: "Missing mandatory applicant details or CV sheets." });
      }

      const jobs = loadJobs();
      const targetJob = jobs.find(j => j.id === jobId);
      if (!targetJob) {
        return res.status(404).json({ error: "Invalid job identifier." });
      }

      const applications = loadApplications();
      
      const newApplication: JobApplication = {
        id: "app-" + Math.random().toString(36).substring(2) + Date.now().toString(36),
        jobId,
        jobTitle: targetJob.title,
        jobCompany: targetJob.company,
        applicantName,
        applicantEmail,
        applicantPhone,
        coverLetter: coverLetter || "No cover letter submitted.",
        cvFileName,
        cvFileData,
        docFileName,
        docFileData,
        appliedAt: new Date().toISOString(),
        status: "Pending",
        statusLogs: [
          {
            id: "l-" + Date.now().toString(36),
            status: "Pending",
            updatedAt: new Date().toISOString(),
            updatedBy: targetJob.isInternalOnly ? "System (Internal Employee)" : "System (External Applicant)",
            note: `Successfully applied as an initial candidate for ${targetJob.title}.`
          }
        ]
      };

      applications.unshift(newApplication);
      saveApplications(applications);

      res.status(201).json({
        success: true,
        applicationId: newApplication.id,
        message: "Your application was registered successfully!"
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET ALL APPLICATIONS - admin access only
  app.get("/api/applications", checkAdminAuth, (req, res) => {
    const applications = loadApplications();
    res.json(applications);
  });

  // UPDATE APPLICATION STATUS & LOGS - admin access only
  app.patch("/api/applications/:id/status", checkAdminAuth, (req, res) => {
    const { status, note } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Recruiter status update state is missing." });
    }

    const validStatuses = ["Pending", "Shortlisted", "Interviewing", "Approved", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid application state update value." });
    }

    const applications = loadApplications();
    const appIndex = applications.findIndex(a => a.id === req.params.id);

    if (appIndex === -1) {
      return res.status(404).json({ error: "Application file not found." });
    }

    const currentApp = applications[appIndex];
    const newChangeLog: StatusLog = {
      id: "l-" + Math.random().toString(36).substring(2) + Date.now().toString(36),
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: ADMIN_EMAIL,
      note: note || `Review state modified to ${status}.`
    };

    currentApp.status = status;
    currentApp.statusLogs.push(newChangeLog);

    applications[appIndex] = currentApp;
    saveApplications(applications);

    res.json(currentApp);
  });

  // ---------------- VITE MIDDLEWARE / STATIC FILES / PORT LISTENING ----------------
  if (!process.env.VERCEL) {
    const boot = async () => {
      if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        app.use(vite.middlewares);
      } else {
        const distPath = path.join(process.cwd(), "dist");
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
          res.sendFile(path.join(distPath, "index.html"));
        });
      }

      const PORT = 3000;
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Job Portal Full-Stack Engine online at http://0.0.0.0:${PORT}`);
      });
    };
    boot();
  }

export default app;
