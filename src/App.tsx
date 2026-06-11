import React, { useState, useEffect } from "react";
import { 
  Briefcase, Search, Filter, Shield, Key, Sparkles, Building2, MapPin, 
  CheckCircle, ChevronRight, FileText, ArrowLeft, Mail, Phone, Clock, ListFilter
} from "lucide-react";
import { Job, Category, CompanyGroup } from "./types";
import JobCard from "./components/JobCard";
import JobModal from "./components/JobModal";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  // Navigation: "jobs" | "admin"
  const [activeTab, setActiveTab] = useState<"jobs" | "admin">("jobs");
  
  // Data State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<CompanyGroup[]>([]);
  
  // Interactive Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [eligibilityFilter, setEligibilityFilter] = useState<"All" | "Public" | "Internal">("All");

  // Selected Job for Detail / Apply Modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  // General Notification feedback
  const [successApplyDetails, setSuccessApplyDetails] = useState<{ name: string; title: string } | null>(null);

  // Read list of active openings
  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const response = await fetch("/api/jobs");
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error("Error retrieving job index:", error);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Read list of categories
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error retrieving categories index:", error);
    }
  };

  // Read list of company groups
  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups");
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error("Error retrieving groups index:", error);
    }
  };

  // On mount
  useEffect(() => {
    fetchJobs();
    fetchCategories();
    fetchGroups();

    // Check pre-existing admin session
    const token = localStorage.getItem("adminToken");
    const email = localStorage.getItem("adminEmail");
    if (token && email) {
      // Validate session on backend
      fetch(`/api/admin/validate`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.isValid) {
          setIsAuthenticated(true);
          setAdminToken(token);
          setAdminEmail(email);
          setActiveTab("admin"); // Auto redirect to dashboard
        } else {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminEmail");
        }
      })
      .catch(() => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminEmail");
      });
    }
  }, []);

  // Handle Admin Authorization Success
  const handleAdminLogin = (token: string, email: string) => {
    setIsAuthenticated(true);
    setAdminToken(token);
    setAdminEmail(email);
    setActiveTab("admin");
  };

  // Handle Log out
  const handleAdminLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${adminToken}` }
      });
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    setIsAuthenticated(false);
    setAdminToken("");
    setAdminEmail("");
    setActiveTab("jobs");
  };

  // Job Filtering Calculations
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || job.category === selectedCategory;
    const matchesGroup = selectedGroup === "All" || job.company.toLowerCase() === selectedGroup.toLowerCase();
    const matchesType = selectedType === "All" || job.type === selectedType;
    
    // Eligibility filters (Public vs Internal only)
    if (eligibilityFilter === "Public") {
      return matchesSearch && matchesCategory && matchesGroup && matchesType && !job.isInternalOnly;
    } else if (eligibilityFilter === "Internal") {
      return matchesSearch && matchesCategory && matchesGroup && matchesType && job.isInternalOnly;
    }
    
    return matchesSearch && matchesCategory && matchesGroup && matchesType;
  });

  // Calculate category lists with counts
  const categoriesWithCounts = jobs.reduce((acc, job) => {
    acc[job.category] = (acc[job.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate company groups with counts
  const groupsWithCounts = jobs.reduce((acc, job) => {
    acc[job.company] = (acc[job.company] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 font-sans flex flex-col justify-between">
      
      {/* Dynamic Header Portal Navigation */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 md:px-12 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("jobs")}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h1 className="text-lg font-display font-semibold text-slate-900 tracking-tight leading-none">
                Group Careers Hub
              </h1>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-1 block">
                Apex • Horizon • Vertex Companies
              </span>
            </div>
          </div>

          {/* Navigation link triggers */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab("jobs")}
              className={`text-xs px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === "jobs"
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Browse Careers
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`text-xs px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "admin"
                  ? "bg-indigo-600 text-white shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-850"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              {isAuthenticated ? "ATS Dashboard" : "Admin Gateway"}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        
        {/* Banner Success application notification popup */}
        {successApplyDetails && (
          <div className="mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-emerald-800 text-left animate-fade-in" id="apply-success-notification">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display font-semibold text-emerald-900 text-base">Application Submission Received!</h3>
                <p className="text-xs opacity-90 mt-1 max-w-md">
                  Thank you, <strong className="font-semibold">{successApplyDetails.name}</strong>. Your qualifications and CV sheet were safely transferred. The HR Board for "{successApplyDetails.title}" was alerted.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setSuccessApplyDetails(null)}
                className="bg-emerald-900 text-white hover:bg-emerald-850 text-xs font-semibold px-6 py-2 rounded-xl transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ======================= CAREERS PAGE TAB VIEW ======================= */}
        {activeTab === "jobs" && (
          <div className="space-y-8">
            
            {/* Informational corporate intro banner */}
            <div className="bg-indigo-950 text-white rounded-3xl p-6 md:p-10 relative overflow-hidden flex flex-col justify-between min-h-[160px] text-left">
              <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-indigo-950 to-indigo-950" />
              
              <div className="max-w-2xl space-y-2 z-10">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-extrabold bg-indigo-900 px-3 py-1 rounded-full border border-indigo-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Now Recruiting
                </span>
                <h2 className="text-2xl md:text-4xl font-display font-bold tracking-tight mt-2 leading-tight">
                  Accelerate your career within our Group of Companies.
                </h2>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  Apply internally for transfers or submit external applications to join our high-growth entities: Apex Tech Labs, Horizon Consumer Goods, and Vertex Financial Services. Anyone can browse and apply without creating an account.
                </p>
              </div>
            </div>

            {/* TWO-COLUMN LAYOUT: Careers Left, Sidebar Widgets Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Search & Job Openings (lg:col-span-8 xl:col-span-9) */}
              <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                
                {/* Job search controls panel */}
                <div className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col md:flex-row items-center gap-4 text-left shadow-sm">
                  
                  {/* Query search input */}
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Query job title, subsidiary company, skills or keywords..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Advanced option filters */}
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    
                    {/* Contract type filter */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 font-mono">Type:</span>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium"
                      >
                        <option value="All">All Types</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>

                    {/* Eligibility Filter: public vs internal */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 font-mono">Eligibility:</span>
                      <select
                        value={eligibilityFilter}
                        onChange={(e) => setEligibilityFilter(e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium animate-fade-in"
                      >
                        <option value="All">Anyone Eligibility</option>
                        <option value="Public">Open to Public</option>
                        <option value="Internal">Internal Only</option>
                      </select>
                    </div>

                    {/* Clear options tag */}
                    { (searchQuery || selectedCategory !== "All" || selectedGroup !== "All" || selectedType !== "All" || eligibilityFilter !== "All") && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("All");
                          setSelectedGroup("All");
                          setSelectedType("All");
                          setEligibilityFilter("All");
                        }}
                        className="text-indigo-650 hover:text-indigo-800 text-xs font-semibold underline underline-offset-2 ml-1"
                      >
                        Reset
                      </button>
                    )}

                  </div>
                </div>

                {/* List openings display */}
                <div>
                  {loadingJobs ? (
                    <div className="py-24 text-center text-slate-450 text-sm">
                      <Clock className="w-8 h-8 text-indigo-505 animate-spin mx-auto mb-3" />
                      Synchronizing interactive job board database...
                    </div>
                  ) : filteredJobs.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-450 max-w-xl mx-auto">
                      <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="font-semibold text-slate-800 text-base">No Matching Career Opportunities</p>
                      <p className="text-xs max-w-xs mx-auto mt-2 text-slate-500">
                        We can't find active openings matching your filters. Try scaling back your search queries or selecting different categories.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("All");
                          setSelectedGroup("All");
                          setSelectedType("All");
                          setEligibilityFilter("All");
                        }}
                        className="mt-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4  py-2 rounded-xl transition-all"
                      >
                        Display All Occupancies
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredJobs.map((job) => (
                        <div key={job.id}>
                          <JobCard 
                            job={job} 
                            onViewDetails={(j) => setSelectedJob(j)} 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Widgets System Sidebar (lg:col-span-4 xl:col-span-3) */}
              <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                
                {/* Select category to filter openings section inside right-side widget */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left">
                  <h3 className="font-display font-semibold text-slate-900 text-xs uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <ListFilter className="w-4 h-4 text-indigo-600" />
                    Select category to filter openings
                  </h3>
                  
                  <div className="space-y-1.5 flex flex-col">
                    {/* Total positions category button */}
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className={`w-full text-left p-3 rounded-2xl border text-xs transition-all flex items-center justify-between ${
                        selectedCategory === "All"
                          ? "bg-indigo-50 border-indigo-600 text-black font-semibold"
                          : "bg-white border-slate-200 hover:border-indigo-300 text-slate-700"
                      }`}
                    >
                      <div>
                        <p className={`text-[10px] opacity-80 uppercase tracking-widest font-mono ${
                          selectedCategory === "All" ? "text-slate-800" : "text-slate-500"
                        }`}>Total</p>
                        <p className="text-sm font-display font-bold mt-0.5">All Positions</p>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold ${
                        selectedCategory === "All" ? "bg-indigo-100 text-black" : "bg-slate-100 text-slate-600"
                      }`}>
                        {jobs.length}
                      </span>
                    </button>

                    {/* Backend loaded corporate categories */}
                    {categories.map((cat) => {
                      const count = jobs.filter(j => j.category.toLowerCase() === cat.name.toLowerCase()).length;
                      const isActive = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                      
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.name)}
                          className={`w-full text-left p-3 rounded-2xl border text-xs transition-all flex items-center justify-between ${
                            isActive
                              ? "bg-indigo-50 border-indigo-600 text-black font-semibold"
                              : "bg-white border-slate-200 hover:border-indigo-300 text-slate-755"
                          }`}
                        >
                          <div>
                            <p className={`text-[10px] opacity-85 uppercase tracking-widest font-mono truncate max-w-[130px] ${
                              isActive ? "text-slate-800" : "text-slate-500"
                            }`}>{cat.name}</p>
                            <p className="text-sm font-display font-bold mt-0.5">View Jobs</p>
                          </div>
                          <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold ${
                            isActive ? "bg-indigo-100 text-black" : "bg-slate-100 text-slate-600"
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}

                    {/* Seeding dynamic categories fallback if loading or empty */}
                    {categories.length === 0 && Object.keys(categoriesWithCounts).map((catName) => {
                      const count = categoriesWithCounts[catName];
                      const isActive = selectedCategory === catName;
                      return (
                        <button
                          key={catName}
                          onClick={() => setSelectedCategory(catName)}
                          className={`w-full text-left p-3 rounded-2xl border text-xs transition-all flex items-center justify-between ${
                            isActive
                              ? "bg-indigo-50 border-indigo-600 text-black font-semibold"
                              : "bg-white border-slate-205 hover:border-indigo-305 text-slate-705"
                          }`}
                        >
                          <div>
                            <p className={`text-[10px] opacity-80 uppercase tracking-widest font-mono truncate max-w-[130px] ${
                              isActive ? "text-slate-800" : "text-slate-500"
                            }`}>{catName}</p>
                            <p className="text-sm font-display font-bold mt-0.5">View Jobs</p>
                          </div>
                          <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold ${
                            isActive ? "bg-indigo-100 text-black" : "bg-slate-105 text-slate-600"
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Select corporate group to filter openings */}
                <div id="corporate-groups-filter" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left">
                  <h3 className="font-display font-semibold text-slate-900 text-xs uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    Filter by Corporate Group
                  </h3>
                  
                  <div className="space-y-1.5 flex flex-col">
                    {/* All Groups button */}
                    <button
                      onClick={() => setSelectedGroup("All")}
                      className={`w-full text-left p-3 rounded-2xl border text-xs transition-all flex items-center justify-between ${
                        selectedGroup === "All"
                          ? "bg-emerald-50 border-emerald-605 text-black font-semibold"
                          : "bg-white border-slate-200 hover:border-emerald-300 text-slate-700"
                      }`}
                    >
                      <div>
                        <p className={`text-[10px] opacity-80 uppercase tracking-widest font-mono ${
                          selectedGroup === "All" ? "text-slate-850" : "text-slate-500"
                        }`}>Corporate</p>
                        <p className="text-sm font-display font-bold mt-0.5">All Groups</p>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold ${
                        selectedGroup === "All" ? "bg-emerald-100 text-black" : "bg-slate-100 text-slate-600"
                      }`}>
                        {jobs.length}
                      </span>
                    </button>

                    {/* Backend loaded corporate groups */}
                    {groups.map((grp) => {
                      const count = jobs.filter(j => j.company.toLowerCase() === grp.name.toLowerCase()).length;
                      const isActive = selectedGroup.toLowerCase() === grp.name.toLowerCase();
                      
                      return (
                        <button
                          key={grp.id}
                          onClick={() => setSelectedGroup(grp.name)}
                          className={`w-full text-left p-3 rounded-2xl border text-xs transition-all flex items-center justify-between ${
                            isActive
                              ? "bg-emerald-50 border-emerald-605 text-black font-semibold"
                              : "bg-white border-slate-200 hover:border-emerald-300 text-slate-755"
                          }`}
                        >
                          <div>
                            <p className={`text-[10px] opacity-85 uppercase tracking-widest font-mono truncate max-w-[130px] ${
                              isActive ? "text-slate-850" : "text-slate-500"
                            }`}>{grp.name}</p>
                            <p className="text-sm font-display font-medium mt-0.5 truncate max-w-[150px]">{grp.description || "View Subsidiaries"}</p>
                          </div>
                          <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold ${
                            isActive ? "bg-emerald-100 text-black" : "bg-slate-100 text-slate-600"
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}

                    {/* Dynamic groups fallback if empty / seeding */}
                    {groups.length === 0 && Array.from(new Set(jobs.map(j => j.company))).map((compName: any) => {
                      const compStr = String(compName);
                      const count = jobs.filter(j => j.company.toLowerCase() === compStr.toLowerCase()).length;
                      const isActive = selectedGroup.toLowerCase() === compStr.toLowerCase();
                      return (
                        <button
                          key={compStr}
                          onClick={() => setSelectedGroup(compStr)}
                          className={`w-full text-left p-3 rounded-2xl border text-xs transition-all flex items-center justify-between ${
                            isActive
                              ? "bg-emerald-50 border-emerald-605 text-black font-semibold"
                              : "bg-white border-slate-200 hover:border-emerald-300 text-slate-705"
                          }`}
                        >
                          <div>
                            <p className={`text-[10px] opacity-80 uppercase tracking-widest font-mono truncate max-w-[130px] ${
                              isActive ? "text-slate-850" : "text-slate-500"
                            }`}>{compName}</p>
                            <p className="text-sm font-display font-bold mt-0.5">View Jobs</p>
                          </div>
                          <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold ${
                            isActive ? "bg-emerald-100 text-black" : "bg-slate-105 text-slate-600"
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ======================= ADMIN ATS GATEWAY / DASHBOARD VIEW ======================= */}
        {activeTab === "admin" && (
          <div>
            {isAuthenticated ? (
              <AdminDashboard 
                token={adminToken} 
                onLogout={handleAdminLogout} 
                jobs={jobs}
                onRefreshJobs={fetchJobs}
              />
            ) : (
              <AdminLogin onLoginSuccess={handleAdminLogin} />
            )}
          </div>
        )}

      </main>

      {/* Footer Branding Area */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 Group of Companies Corporate Headquarters Dev. Port. All rights reserved.</p>
          <div className="flex items-center gap-4 font-mono">
            <span>Powered by Node.js</span>
            <span className="text-slate-300">|</span>
            <span>Applicant Tracking Station</span>
          </div>
        </div>
      </footer>

      {/* RENDER MODAL SELECTED JOB OPENING DETAIL & APPLY */}
      {selectedJob && (
        <JobModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApplicationSuccess={(name, title) => {
            setSuccessApplyDetails({ name, title });
            // Refresh dashboard listings if admin is logged in
            if (activeTab === "admin") {
              fetchJobs();
            }
          }}
        />
      )}

    </div>
  );
}
