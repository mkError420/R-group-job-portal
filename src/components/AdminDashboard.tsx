import React, { useState, useEffect } from "react";
import { 
  Users, CheckCircle, XCircle, Search, Filter, Download, Briefcase, Plus, LogOut, 
  Trash2, Mail, Phone, Calendar, ArrowRight, ExternalLink, Check, AlertCircle, FileText,
  Clock, ChevronRight, FileSpreadsheet, Building, MapPin, DollarSign, X, ListFilter
} from "lucide-react";
import { Job, JobApplication, StatusLog, Category, CompanyGroup } from "../types";

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
  jobs: Job[];
  onRefreshJobs: () => void;
}

export default function AdminDashboard({ token, onLogout, jobs, onRefreshJobs }: AdminDashboardProps) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Selected Application for detail preview modal/flyout
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  // Create Job Opening State
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobCategory, setNewJobCategory] = useState("Engineering");
  const [newJobCompany, setNewJobCompany] = useState("Apex Tech Labs");
  const [newJobLocation, setNewJobLocation] = useState("Dhaka (Hybrid)");
  const [newJobType, setNewJobType] = useState<"Full-time" | "Part-time" | "Contract" | "Internship">("Full-time");
  const [newJobSalary, setNewJobSalary] = useState("$1,500 - $2,000 / month");
  const [newJobExp, setNewJobExp] = useState("2+ Years");
  const [newJobDesc, setNewJobDesc] = useState("");
  const [newJobReq, setNewJobReq] = useState("");
  const [newJobResp, setNewJobResp] = useState("");
  const [newJobInternal, setNewJobInternal] = useState(false);
  const [postingJob, setPostingJob] = useState(false);

  // Notification feedbacks
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Dynamic Categories CRUD Management State
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingName, setEditingName] = useState("");

  // Dynamic Groups CRUD Management State
  const [groups, setGroups] = useState<CompanyGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDetailDesc, setNewGroupDetailDesc] = useState("");
  const [editingGroup, setEditingGroup] = useState<CompanyGroup | null>(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  const [editingGroupDesc, setEditingGroupDesc] = useState("");

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const response = await fetch("/api/groups");
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/applications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error("HTTP failure retrieval of pipeline assets.");
      }
      const data = await response.json();
      setApplications(data);
      if (selectedApp) {
        const updated = data.find((a: JobApplication) => a.id === selectedApp.id);
        if (updated) setSelectedApp(updated);
      }
    } catch (err: any) {
      setErrorMessage("Could not load applicant listings: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchCategories();
    fetchGroups();
  }, [token]);

  const showToastMsg = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // State application resolution state (Approve/Reject/Interview etc)
  const handleUpdateStatus = async (appId: string, status: 'Pending' | 'Shortlisted' | 'Interviewing' | 'Approved' | 'Rejected') => {
    setSubmittingAction(true);
    try {
      const response = await fetch(`/api/applications/${appId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          note: actionNote.trim() || `Position state transition resolved by admin.`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Could not execute state mutation.");
      }

      const updatedApplication = await response.json();
      
      // Update in local state
      setApplications(prev => prev.map(a => a.id === appId ? updatedApplication : a));
      setSelectedApp(updatedApplication);
      setActionNote("");
      showToastMsg(`Applicant pipeline status resolved to ${status}.`);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Create Job Opening submit
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostingJob(true);
    setErrorMessage(null);

    const requirementsArray = newJobReq.split("\n").map(r => r.trim()).filter(r => r.length > 0);
    const responsibilitiesArray = newJobResp.split("\n").map(r => r.trim()).filter(r => r.length > 0);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newJobTitle,
          category: newJobCategory,
          company: newJobCompany,
          location: newJobLocation,
          type: newJobType,
          salaryRange: newJobSalary,
          experienceLevel: newJobExp,
          description: newJobDesc,
          requirements: requirementsArray,
          responsibilities: responsibilitiesArray,
          isInternalOnly: newJobInternal
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed posting job specification.");
      }

      showToastMsg(`Role "${newJobTitle}" successfully added to careers list!`);
      setShowCreateJob(false);
      onRefreshJobs();

      // Reset form fields
      setNewJobTitle("");
      setNewJobDesc("");
      setNewJobReq("");
      setNewJobResp("");
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setPostingJob(false);
    }
  };

  // Add category handler
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });

      if (response.ok) {
        const added = await response.json();
        setCategories([...categories, added]);
        setNewCategoryName("");
        showToastMsg(`Category "${added.name}" has been registered!`);
        onRefreshJobs();
      } else {
        const err = await response.json();
        alert(err.error || "Failed to create category");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error adding category");
    }
  };

  // Update category handler
  const handleUpdateCategory = async (catId: string) => {
    if (!editingName.trim()) return;

    try {
      const response = await fetch(`/api/categories/${catId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: editingName.trim() })
      });

      if (response.ok) {
        const updated = await response.json();
        setCategories(categories.map(c => c.id === catId ? updated : c));
        setEditingCategory(null);
        setEditingName("");
        showToastMsg(`Category renamed to "${updated.name}" successfully!`);
        onRefreshJobs();
      } else {
        const err = await response.json();
        alert(err.error || "Failed to update category");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error updating category");
    }
  };

  // Delete category handler
  const handleDeleteCategory = async (catId: string, catName: string) => {
    const attachedJobs = jobs.filter(j => j.category.toLowerCase() === catName.toLowerCase());
    const confirmationMsg = attachedJobs.length > 0 
      ? `Warning: There are ${attachedJobs.length} active job opening(s) under "${catName}". Deleting this category might affect their queries. Do you want to proceed?`
      : `Are you sure you want to delete the category "${catName}"?`;

    if (!window.confirm(confirmationMsg)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${catId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        setCategories(categories.filter(c => c.id !== catId));
        showToastMsg(`Category "${catName}" has been deleted.`);
        onRefreshJobs();
      } else {
        const err = await response.json();
        alert(err.error || "Failed to delete category");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error deleting category");
    }
  };

  // Add group handler
  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: newGroupName.trim(),
          description: newGroupDetailDesc.trim()
        })
      });

      if (response.ok) {
        const added = await response.json();
        setGroups([...groups, added]);
        setNewGroupName("");
        setNewGroupDetailDesc("");
        showToastMsg(`Company Group "${added.name}" has been registered!`);
        onRefreshJobs();
      } else {
        const err = await response.json();
        alert(err.error || "Failed to create Company Group");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error adding Company Group");
    }
  };

  // Update group handler
  const handleUpdateGroup = async (groupId: string) => {
    if (!editingGroupName.trim()) return;

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: editingGroupName.trim(),
          description: editingGroupDesc.trim()
        })
      });

      if (response.ok) {
        const updated = await response.json();
        setGroups(groups.map(g => g.id === groupId ? updated : g));
        setEditingGroup(null);
        setEditingGroupName("");
        setEditingGroupDesc("");
        showToastMsg(`Company Group renamed to "${updated.name}" successfully!`);
        onRefreshJobs();
      } else {
        const err = await response.json();
        alert(err.error || "Failed to update Company Group");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error updating Company Group");
    }
  };

  // Delete group handler
  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    const attachedJobs = jobs.filter(j => j.company.toLowerCase() === groupName.toLowerCase());
    const confirmationMsg = attachedJobs.length > 0 
      ? `Warning: There are ${attachedJobs.length} active job opening(s) under "${groupName}". Deleting this group might affect their queries. Do you want to proceed?`
      : `Are you sure you want to delete the Company Group "${groupName}"?`;

    if (!window.confirm(confirmationMsg)) {
      return;
    }

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        setGroups(groups.filter(g => g.id !== groupId));
        showToastMsg(`Company Group "${groupName}" has been deleted.`);
        onRefreshJobs();
      } else {
        const err = await response.json();
        alert(err.error || "Failed to delete Company Group");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error deleting Company Group");
    }
  };

  // Delete Job Opening
  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this job opening? Existing applicants for this job ID will still be visible but the public won't see it.")) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Job deletion transfer error.");
      }

      showToastMsg("Job spec was removed from portal.");
      onRefreshJobs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    if (applications.length === 0) {
      alert("No database application profiles found to export.");
      return;
    }

    // Build header list
    const headers = ["Application ID", "Applicant Name", "Email Address", "Phone", "Target Position", "Company Subsidiary", "Submission Date", "Overall Status", "Cover Letter Summaries"];
    
    const rows = filteredApplications.map(app => [
      app.id,
      `"${app.applicantName.replace(/"/g, '""')}"`,
      app.applicantEmail,
      app.applicantPhone,
      `"${app.jobTitle.replace(/"/g, '""')}"`,
      `"${app.jobCompany.replace(/"/g, '""')}"`,
      new Date(app.appliedAt).toLocaleDateString(),
      app.status,
      `"${app.coverLetter.replace(/"/g, '""').substring(0, 150)}..."`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `group_company_ats_cohort_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToastMsg("Application analytics records exported to CSV spreadsheet!");
  };

  // Helper download simulated CV document file from Base64
  const downloadAttachmentFile = (fileData: string, fileName: string) => {
    try {
      const link = document.createElement("a");
      link.href = fileData;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Could not download simulated attachment file content.");
    }
  };

  // Filtering calculations
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    const matchesCompany = companyFilter === "All" || app.jobCompany === companyFilter;
    const matchesCategory = categoryFilter === "All" || jobs.find(j => j.id === app.jobId)?.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCompany && matchesCategory;
  });

  // Unique lists for filtering
  const companies = Array.from(new Set(jobs.map(j => j.company)));
  const uniqueJobCategories = Array.from(new Set(jobs.map(j => j.category)));

  // Analytics aggregation helper
  const totalApps = applications.length;
  const pendingCount = applications.filter(a => a.status === "Pending").length;
  const shortCount = applications.filter(a => a.status === "Shortlisted").length;
  const approvedCount = applications.filter(a => a.status === "Approved").length;
  const rejectionCount = applications.filter(a => a.status === "Rejected").length;

  return (
    <div className="space-y-6">
      
      {/* Toast Alert Feedback */}
      {successToast && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-650 hover:bg-emerald-700 text-white p-4 rounded-xl border border-emerald-500 shadow-xl flex items-center gap-3 animate-fade-in" id="success-toast">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Admin dashboard header banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
            <span className="text-xs font-mono tracking-widest text-indigo-400 font-semibold uppercase">Admin Terminal</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-white leading-tight">
            Applicant Tracking Dashboard
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            You are authenticated as <span className="text-indigo-300 font-semibold font-mono">mk.rabbani.cse@gmail.com</span>. Configure career profiles, catalog postings, and approve applications.
          </p>
        </div>

        {/* Action button triggers */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => setShowCreateJob(true)}
            id="admin-btn-create-job"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors focus:ring-2 focus:ring-indigo-500/30"
          >
            <Plus className="w-4 h-4" />
            Post New Job
          </button>
          <button
            onClick={handleExportCSV}
            id="admin-btn-export"
            className="bg-slate-805 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors focus:ring-2 focus:ring-slate-500/30"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            Export CSV
          </button>
          <button
            onClick={onLogout}
            id="admin-btn-logout"
            className="bg-red-950/40 hover:bg-red-955 text-red-305 border border-red-900/50 text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors focus:ring-2 focus:ring-red-500/30"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Analytics Counter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">Cohort Applications</div>
          <div className="font-display text-2xl font-bold text-slate-900 mt-1">{totalApps}</div>
          <div className="text-[10px] text-slate-500 mt-2">Active records inside index</div>
        </div>

        <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-5 shadow-sm">
          <div className="text-amber-700 font-mono text-[10px] uppercase tracking-wider">Pending Action</div>
          <div className="font-display text-2xl font-bold text-amber-900 mt-1">{pendingCount}</div>
          <div className="text-[10px] text-amber-600 mt-2">Awaiting HR screening</div>
        </div>

        <div className="bg-indigo-50/50 border border-indigo-200/60 rounded-2xl p-5 shadow-sm">
          <div className="text-indigo-700 font-mono text-[10px] uppercase tracking-wider">Shortlisted</div>
          <div className="font-display text-2xl font-bold text-indigo-900 mt-1">{shortCount}</div>
          <div className="text-[10px] text-indigo-600 mt-2">Prepared for interview</div>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-5 shadow-sm">
          <div className="text-emerald-700 font-mono text-[10px] uppercase tracking-wider">Offers Approved</div>
          <div className="font-display text-2xl font-bold text-emerald-900 mt-1">{approvedCount}</div>
          <div className="text-[10px] text-emerald-600 mt-2">Success target achieved</div>
        </div>

        <div className="bg-slate-50/70 border border-slate-205 rounded-2xl p-5 shadow-sm col-span-2 md:col-span-1">
          <div className="text-slate-500 font-mono text-[10px] uppercase tracking-wider">Reject Rate</div>
          <div className="font-display text-2xl font-bold text-slate-700 mt-1">
            {totalApps > 0 ? Math.round((rejectionCount / totalApps) * 100) : 0}%
          </div>
          <div className="text-[10px] text-slate-500 mt-2">{rejectionCount} application files</div>
        </div>

      </div>

      {/* Main filter & dashboard content partition */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Navigation & Filters bar */}
        <div className="bg-slate-50 border-b border-slate-150 p-4 shrink-0 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="dashboard-search-input"
                placeholder="Search candidate index, email, or targeted job title..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              />
            </div>

            {/* Selector filter array */}
            <div className="flex flex-wrap items-center gap-2">
              
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-xs py-1.5 px-3 rounded-xl focus:ring-indigo-500/20"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Affiliate Company</span>
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-xs py-1.5 px-3 rounded-xl"
                >
                  <option value="All">All Subsidiaries</option>
                  {companies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Category</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-xs py-1.5 px-3 rounded-xl"
                >
                  <option value="All">All Categories</option>
                  {uniqueJobCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

            </div>

          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-800">{filteredApplications.length}</span> index candidates of <span className="font-semibold text-slate-800">{applications.length}</span> total
            </div>
            { (searchTerm || statusFilter !== "All" || companyFilter !== "All" || categoryFilter !== "All") && (
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                  setCompanyFilter("All");
                  setCategoryFilter("All");
                }}
                className="text-indigo-600 hover:underline font-mono"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Screen section (2 columns: left is applications list, right is the detailed inspect panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-150 min-h-[500px]">
          
          {/* LEFT: Cohort Applications list */}
          <div className="lg:col-span-5 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                Retrieving ATS cohort documents...
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs h-full flex flex-col justify-center items-center">
                <Users className="w-10 h-10 text-slate-300 mb-2" />
                No applications query match.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredApplications.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedApp(app);
                      setErrorMessage(null);
                    }}
                    className={`p-4 cursor-pointer text-left transition-colors flex items-center justify-between gap-3 ${
                      selectedApp?.id === app.id ? "bg-indigo-50/50 border-r-4 border-indigo-600" : "hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          app.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                          app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          app.status === 'Shortlisted' ? 'bg-purple-100 text-purple-800' :
                          app.status === 'Interviewing' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {app.status}
                        </span>

                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="font-display font-semibold text-slate-800 text-sm truncate">
                        {app.applicantName}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono truncate">{app.applicantEmail}</p>

                      <div className="mt-2 text-xs text-slate-700 font-medium truncate flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{app.jobTitle}</span>
                        <span className="text-slate-300 font-sans">•</span>
                        <span className="text-slate-500">{app.jobCompany}</span>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${selectedApp?.id === app.id ? 'translate-x-1 text-indigo-600' : 'text-slate-300'}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Selected application dossier details */}
          <div className="lg:col-span-7 bg-slate-50/50 p-6 max-h-[600px] overflow-y-auto">
            {selectedApp ? (
              <div className="space-y-6 animate-fade-in text-left">
                
                {/* Dossier header metadata */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Candidate Folder</span>
                    <h3 className="font-display font-semibold text-slate-900 text-xl mt-0.5">
                      {selectedApp.applicantName}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-1 font-mono">
                      <span>Applied: {new Date(selectedApp.appliedAt).toLocaleString()}</span>
                    </p>
                  </div>

                  <span className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl border ${
                    selectedApp.status === 'Approved' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
                    selectedApp.status === 'Rejected' ? 'bg-red-50 border-red-300 text-red-800' :
                    selectedApp.status === 'Shortlisted' ? 'bg-purple-105 border-purple-305 text-purple-800' :
                    selectedApp.status === 'Interviewing' ? 'bg-blue-50 border-blue-300 text-blue-800' :
                    'bg-amber-50 border-amber-300 text-amber-800'
                  }`}>
                    State: <span className="font-bold">{selectedApp.status}</span>
                  </span>
                </div>

                {/* Candidate contact dossier */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-slate-200 rounded-2xl p-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 uppercase tracking-wider text-[9px] block font-mono">Email Address</span>
                    <a href={`mailto:${selectedApp.applicantEmail}`} className="text-indigo-600 font-semibold flex items-center gap-1.5 hover:underline font-mono">
                      <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      {selectedApp.applicantEmail}
                    </a>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 uppercase tracking-wider text-[9px] block font-mono">Phone Number</span>
                    <a href={`tel:${selectedApp.applicantPhone}`} className="text-slate-800 font-semibold flex items-center gap-1.5 hover:underline font-mono">
                      <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      {selectedApp.applicantPhone}
                    </a>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <span className="text-slate-400 uppercase tracking-wider text-[9px] block font-mono">Target Posting</span>
                    <div className="text-slate-800 font-semibold flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      {selectedApp.jobTitle}
                      <span className="text-slate-305 font-mono">•</span>
                      <span className="text-slate-500 text-[11px] font-normal">{selectedApp.jobCompany}</span>
                    </div>
                  </div>
                </div>

                {/* Cover letter section */}
                <div className="space-y-2">
                  <h4 className="font-display font-semibold text-slate-800 border-b border-slate-100 pb-1 text-sm">Cover Letter Statement</h4>
                  <div className="bg-white border border-slate-200/65 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed whitespace-pre-line font-medium italic">
                    "{selectedApp.coverLetter}"
                  </div>
                </div>

                {/* Attached CV docs downloader */}
                <div className="space-y-2">
                  <h4 className="font-display font-semibold text-slate-800 border-b border-slate-100 pb-1 text-sm">Designated Attachments</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-none hover:shadow-sm transition-shadow">
                      <div className="flex items-center min-w-0 gap-2">
                        <FileText className="w-8 h-8 text-indigo-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-slate-700 truncate">{selectedApp.cvFileName}</p>
                          <p className="text-[9px] text-slate-400 font-mono">Resume Sheets (CV)</p>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadAttachmentFile(selectedApp.cvFileData, selectedApp.cvFileName)}
                        className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-0.5 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        CV
                      </button>
                    </div>

                    {selectedApp.docFileName ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-none hover:shadow-sm transition-shadow">
                        <div className="flex items-center min-w-0 gap-2">
                          <FileText className="w-8 h-8 text-indigo-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-slate-700 truncate">{selectedApp.docFileName}</p>
                            <p className="text-[9px] text-slate-400 font-mono">Additional Doc Info</p>
                          </div>
                        </div>
                        <button
                          onClick={() => downloadAttachmentFile(selectedApp.docFileData!, selectedApp.docFileName!)}
                          className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-0.5 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          Doc
                        </button>
                      </div>
                    ) : (
                      <div className="bg-slate-100/50 border border-dashed border-slate-200 rounded-xl p-3 flex items-center justify-center text-slate-400 text-[10px]">
                        No additional uploads linked.
                      </div>
                    )}

                  </div>
                </div>

                {/* Transition State Actions */}
                <div className="bg-white border border-indigo-100 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-indigo-700">
                      <Clock className="w-4 h-4" />
                      Dossier Actions Panel
                    </h4>
                    <span className="text-[9px] text-slate-400 font-mono">Role: Lead HR Admin</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      HR Decision Note / Internal Log Entry
                    </label>
                    <input
                      type="text"
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      placeholder="e.g. Cleared automated screening. Proceed to technical screen round next week."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500/20 text-slate-800 mb-3"
                    />

                    {/* Operational trigger button strip */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleUpdateStatus(selectedApp.id, "Shortlisted")}
                        disabled={submittingAction}
                        className="bg-purple-100 hover:bg-purple-200 text-purple-850 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors focus:outline-none"
                      >
                        Pipeline Shortlist
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(selectedApp.id, "Interviewing")}
                        disabled={submittingAction}
                        className="bg-blue-105 hover:bg-blue-200 text-blue-850 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors focus:outline-none"
                      >
                        Schedule Interview
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(selectedApp.id, "Approved")}
                        disabled={submittingAction}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 focus:outline-none"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve Candidate
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(selectedApp.id, "Rejected")}
                        disabled={submittingAction}
                        className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 focus:outline-none"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject Application
                      </button>
                    </div>
                  </div>
                </div>

                {/* Application timeline trails */}
                <div className="space-y-3">
                  <h4 className="font-display font-semibold text-slate-800 pb-1 text-sm">Dossier Trail & Notification Logs</h4>
                  
                  <div className="space-y-4 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {selectedApp.statusLogs.map((log) => (
                      <div key={log.id} className="relative text-xs">
                        {/* Dot marker */}
                        <div className={`absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          log.status === 'Approved' ? 'bg-emerald-500' :
                          log.status === 'Rejected' ? 'bg-red-500' :
                          log.status === 'Shortlisted' ? 'bg-purple-500' :
                          log.status === 'Interviewing' ? 'bg-blue-500' :
                          'bg-amber-500'
                        }`} />
                        
                        <div className="flex justify-between items-start gap-4">
                          <span className="font-semibold text-slate-800">
                            Status Set to: <span className="font-display font-bold text-indigo-700">{log.status}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(log.updatedAt).toLocaleDateString()} • {new Date(log.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5 font-mono">Logged by {log.updatedBy}</p>
                        <p className="text-slate-600 mt-1 bg-white border border-slate-150 p-2 rounded-xl italic">
                          "{log.note}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 text-xs h-full flex flex-col justify-center items-center">
                <Users className="w-12 h-12 text-slate-200 mb-3" />
                <p className="font-medium text-slate-600">No application file selected</p>
                <p className="opacity-75 max-w-[280px] mx-auto mt-1">Select an applicant from the candidates index list to examine CV credentials, logs, and issue approval decisions.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ADMIN EDITABLE JOBS OVERVIEW PORTAL */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left">
        <h3 className="font-display font-semibold text-slate-900 text-lg mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          Active Job Openings Management
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(job => (
            <div key={job.id} className="border border-slate-200 rounded-2xl p-4 hover:border-indigo-500 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {job.category}
                  </span>
                  
                  {job.isInternalOnly && (
                    <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase bg-amber-50 text-amber-700 border border-amber-200">
                      Internal
                    </span>
                  )}
                </div>

                <h4 className="font-display font-semibold text-slate-800 text-sm line-clamp-1">{job.title}</h4>
                <p className="text-xs text-slate-500">{job.company} • {job.location}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">Salary: {job.salaryRange.split("/")[0]}</span>
                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold focus:outline-none"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CORP DYNAMIC CATEGORIES MANAGEMENT PORTAL */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left space-y-4">
        <div>
          <h3 className="font-display font-semibold text-slate-900 text-lg flex items-center gap-2">
            <ListFilter className="w-5 h-5 text-indigo-600" />
            Corporate Categories Directory Administration
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Create, update, or remove active job categories. Any edits here instantly update the public filter widgets and recruiter post forms in real-time.
          </p>
        </div>

        {/* Add Category Form Widget */}
        <form onSubmit={handleAddCategory} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 flex flex-col sm:flex-row items-end gap-3 max-w-xl">
          <div className="w-full sm:flex-1 text-left">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
              Add New Job Category Name
            </label>
            <input
              type="text"
              required
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Legal & Compliance, Product Management..."
              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-5 rounded-xl transition-all h-9 flex items-center justify-center gap-1.5 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Register
          </button>
        </form>

        {/* Categories Listing Grid */}
        {loadingCategories ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <Clock className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
            Reading category directory records...
          </div>
        ) : categories.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No corporate categories created. Seeding with system fallback.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const count = jobs.filter(j => j.category.toLowerCase() === cat.name.toLowerCase()).length;
              const isEditing = editingCategory?.id === cat.id;

              return (
                <div key={cat.id} className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-300 transition-all flex flex-col justify-between">
                  {isEditing ? (
                    <div className="space-y-3 w-full text-left">
                      <div>
                        <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                          Edit Category Name
                        </label>
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(null);
                            setEditingName("");
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold py-1 px-2.5 rounded-md"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateCategory(cat.id)}
                          className="bg-indigo-600 hover:bg-indigo-705 text-white text-[10px] font-semibold py-1 px-2.5 rounded-md"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-[9px] font-semibold text-slate-400">
                            ID: {cat.id}
                          </span>
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold font-semibold">
                            {count} jobs
                          </span>
                        </div>
                        <h4 className="font-display font-semibold text-slate-800 text-sm truncate">
                          {cat.name}
                        </h4>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setEditingName(cat.name);
                          }}
                          className="text-indigo-600 hover:text-indigo-850 text-xs font-semibold"
                        >
                          Edit Name
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 text-xs font-semibold transition-colors flex items-center gap-1 focus:outline-none"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CORP DYNAMIC GROUPS MANAGEMENT PORTAL */}
      <div id="admin-groups-management-portal" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left space-y-4">
        <div>
          <h3 className="font-display font-semibold text-slate-900 text-lg flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-600" />
            Corporate Subsidiaries & Company Groups
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Register, edit, or retire corporate subsidiaries and business groups. Any changes defined here will immediately propagate to the careers search filters and "Post New Job" options.
          </p>
        </div>

        {/* Add Group Form Widget */}
        <form onSubmit={handleAddGroup} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 grid grid-cols-1 md:grid-cols-3 gap-3 items-end max-w-4xl">
          <div className="text-left md:col-span-1">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
              Subsidiary/Group Name
            </label>
            <input
              type="text"
              required
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g. Apex Tech Labs, Vertex Financial..."
              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="text-left md:col-span-1">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
              Short Description / Business Line
            </label>
            <input
              type="text"
              value={newGroupDetailDesc}
              onChange={(e) => setNewGroupDetailDesc(e.target.value)}
              placeholder="e.g. Cloud engineering & architectures"
              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-5 rounded-xl transition-all h-9 flex items-center justify-center gap-1.5 shadow-sm shrink-0 md:col-span-1"
          >
            <Plus className="w-4 h-4" />
            Add Group Register
          </button>
        </form>

        {/* Groups Listing Grid */}
        {loadingGroups ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <Clock className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-505" />
            Reading company group records...
          </div>
        ) : groups.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No corporate company groups registered.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {groups.map((grp) => {
              const count = jobs.filter(j => j.company.toLowerCase() === grp.name.toLowerCase()).length;
              const isEditing = editingGroup?.id === grp.id;

              return (
                <div key={grp.id} className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-350 transition-all flex flex-col justify-between">
                  {isEditing ? (
                    <div className="space-y-3 w-full text-left">
                      <div>
                        <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                          Group Name
                        </label>
                        <input
                          type="text"
                          value={editingGroupName}
                          onChange={(e) => setEditingGroupName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                          Line of Business
                        </label>
                        <input
                          type="text"
                          value={editingGroupDesc}
                          onChange={(e) => setEditingGroupDesc(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingGroup(null);
                            setEditingGroupName("");
                            setEditingGroupDesc("");
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold py-1 px-2.5 rounded-md"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateGroup(grp.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold py-1 px-2.5 rounded-md"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-[9px] font-semibold text-slate-400 truncate max-w-[120px]">
                            ID: {grp.id}
                          </span>
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold font-semibold">
                            {count} active postings
                          </span>
                        </div>
                        <h4 className="font-display font-semibold text-slate-800 text-sm truncate">
                          {grp.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {grp.description || "No description provided."}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setEditingGroup(grp);
                            setEditingGroupName(grp.name);
                            setEditingGroupDesc(grp.description || "");
                          }}
                          className="text-indigo-600 hover:text-indigo-850 text-xs font-semibold"
                        >
                          Edit Group
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(grp.id, grp.name)}
                          className="text-red-500 hover:text-red-750 p-1 rounded-md hover:bg-red-50 text-xs font-semibold transition-colors flex items-center gap-1 focus:outline-none"
                        >
                          <Trash2 className="w-3" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE JOB MODAL DIALOG */}
      {showCreateJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-slate-900 leading-tight">Post New Career Position</h3>
                  <p className="text-xs text-slate-500">Add an opening across the group of company subsidiaries</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateJob(false)}
                className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-2 rounded-xl border border-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="overflow-y-auto p-6 space-y-4 flex-1 text-left">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Position Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    placeholder="e.g. Senior Software Architect"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Job Category <span className="text-red-500">*</span>
                  </label>
                   <select
                    value={newJobCategory}
                    onChange={(e) => setNewJobCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                    {categories.length === 0 && (
                      <>
                        <option value="Engineering">Engineering</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Finance">Finance</option>
                        <option value="Operations">Operations</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Design">Design</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Subsidiary Company <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newJobCompany}
                    onChange={(e) => setNewJobCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800"
                  >
                    {groups.map((grp) => (
                      <option key={grp.id} value={grp.name}>{grp.name}</option>
                    ))}
                    {groups.length === 0 && (
                      <>
                        <option value="Apex Tech Labs">Apex Tech Labs</option>
                        <option value="Horizon Consumer Goods">Horizon Consumer Goods</option>
                        <option value="Vertex Financial Services">Vertex Financial Services</option>
                        <option value="Apex Corporate Headquarters">Apex Corporate Headquarters</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Job Location / Mode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newJobLocation}
                    onChange={(e) => setNewJobLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Contract Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newJobType}
                    onChange={(e) => setNewJobType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Salary Range Description
                  </label>
                  <input
                    type="text"
                    value={newJobSalary}
                    onChange={(e) => setNewJobSalary(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Experience Requirement
                  </label>
                  <input
                    type="text"
                    value={newJobExp}
                    onChange={(e) => setNewJobExp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Internal Only Mobilities
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="new-job-internal-chk"
                    checked={newJobInternal}
                    onChange={(e) => setNewJobInternal(e.target.checked)}
                    className="w-4 h-4 text-indigo-650"
                  />
                  <label htmlFor="new-job-internal-chk" className="text-xs text-slate-600 font-medium">
                    This selection is only open to existing group of company employees
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Job Description / Role Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={newJobDesc}
                  onChange={(e) => setNewJobDesc(e.target.value)}
                  placeholder="Detail the target goals, operational requirements, and general team context..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Core Requirements (One instruction per line)
                </label>
                <textarea
                  rows={3}
                  value={newJobReq}
                  onChange={(e) => setNewJobReq(e.target.value)}
                  placeholder="e.g. 5+ years experience in React&#10;Strong communication skills&#10;Certified accountant"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Responsibilities (One duty per line)
                </label>
                <textarea
                  rows={3}
                  value={newJobResp}
                  onChange={(e) => setNewJobResp(e.target.value)}
                  placeholder="e.g. Collaborate with UX designers&#10;Optimize query latency&#10;Conduct code reviews"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 font-mono"
                />
              </div>

            </form>

            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateJob(false)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateJob}
                disabled={postingJob || !newJobTitle || !newJobDesc}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-semibold px-5 py-2 rounded-xl transition-all shadow-md"
              >
                {postingJob ? "Posting Opening..." : "Publish Public Job"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
