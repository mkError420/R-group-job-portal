import React, { useState, useRef } from "react";
import { X, Briefcase, MapPin, DollarSign, Calendar, Upload, FileText, CheckCircle2, ChevronRight, AlertCircle, Sparkles } from "lucide-react";
import { Job } from "../types";

interface JobModalProps {
  job: Job;
  onClose: () => void;
  onApplicationSuccess: (applicantName: string, jobTitle: string) => void;
}

export default function JobModal({ job, onClose, onApplicationSuccess }: JobModalProps) {
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  
  // File attachments
  const [cvFile, setCvFile] = useState<{ name: string; data: string } | null>(null);
  const [docFile, setDocFile] = useState<{ name: string; data: string } | null>(null);

  // Status indicators
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [step, setStep] = useState<"details" | "apply">("details");

  const cvInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // File to Base64 converter
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "cv" | "doc") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // limit 10MB
      setErrorMessage("File is too large. Maximum size is 10 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      if (type === "cv") {
        setCvFile({ name: file.name, data: base64Data });
      } else {
        setDocFile({ name: file.name, data: base64Data });
      }
    };
    reader.readAsDataURL(file);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!cvFile) {
      setErrorMessage("Please attach your CV/Resume file to apply.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          applicantName: name,
          applicantEmail: email,
          applicantPhone: phone,
          coverLetter: coverLetter,
          cvFileName: cvFile.name,
          cvFileData: cvFile.data,
          docFileName: docFile?.name || "",
          docFileData: docFile?.data || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Application failed. Please verify submitted form parameters.");
      }

      onApplicationSuccess(name, job.title);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong while submitting your application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header decoration */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-slate-900 leading-tight">
                {step === "details" ? "Job Specification" : "Candidate Application"}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {job.company} • {job.title}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-2 rounded-xl border border-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal content body */}
        <div className="overflow-y-auto p-6 flex-1">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm animate-fade-in" id="apply-error-panel">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Application Issue</p>
                <p className="opacity-90">{errorMessage}</p>
              </div>
            </div>
          )}

          {step === "details" ? (
            <div className="space-y-6 animate-fade-in">
              {/* Job meta box */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-xs font-mono">
                <div className="space-y-1">
                  <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Location</span>
                  <span className="text-slate-800 font-semibold flex items-center gap-1 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    {job.location}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Compensation</span>
                  <span className="text-slate-800 font-semibold flex items-center gap-1 font-sans">
                    <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
                    {job.salaryRange}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Contract Type</span>
                  <span className="text-slate-800 font-semibold flex items-center gap-1 font-sans">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    {job.type}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Experience Required</span>
                  <span className="text-slate-800 font-semibold block font-sans">
                    {job.experienceLevel}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-display font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-3">Role Summary</h4>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {job.description}
                </p>
              </div>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h4 className="font-display font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-3">Key Requirements</h4>
                  <ul className="space-y-2.5">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 shrink-0 flex items-center justify-center text-xs font-mono font-bold mt-0.5">
                          {index + 1}
                        </span>
                        <span className="leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div>
                  <h4 className="font-display font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-3">Core Responsibilities</h4>
                  <ul className="space-y-2.5">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-2" />
                        <span className="leading-relaxed">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            /* Action Application Form */
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all font-sans"
                    placeholder="e.g. Rashedul Islam"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Contact Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all font-sans"
                    placeholder="e.g. rashedul@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all font-mono"
                    placeholder="e.g. +88017XXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Cover Letter Info
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all leading-relaxed font-sans"
                  placeholder="Outline why this role fits your background and aspirations..."
                />
              </div>

              {/* CV upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Upload CV / Resume (PDF) <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => cvInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-indigo-500 hover:bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all h-[130px]"
                  >
                    <input
                      type="file"
                      ref={cvInputRef}
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, "cv")}
                    />
                    
                    {cvFile ? (
                      <div className="text-center">
                        <FileText className="w-8 h-8 text-indigo-500 mx-auto mb-1.5" />
                        <span className="text-xs font-medium text-slate-700 line-clamp-1">{cvFile.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCvFile(null);
                          }}
                          className="text-[10px] text-red-500 hover:underline mt-1 block mx-auto"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                        <span className="text-xs text-slate-500 font-semibold block">Click or Drop CV</span>
                        <span className="text-[10px] text-slate-450 font-mono">PDF, DOCX up to 10MB</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Additional Docs / Certifications (Optional)
                  </label>
                  <div
                    onClick={() => docInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-indigo-500 hover:bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all h-[130px]"
                  >
                    <input
                      type="file"
                      ref={docInputRef}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      onChange={(e) => handleFileChange(e, "doc")}
                    />
                    
                    {docFile ? (
                      <div className="text-center">
                        <FileText className="w-8 h-8 text-indigo-500 mx-auto mb-1.5" />
                        <span className="text-xs font-medium text-slate-700 line-clamp-1">{docFile.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDocFile(null);
                          }}
                          className="text-[10px] text-red-500 hover:underline mt-1 block mx-auto"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                        <span className="text-xs text-slate-500 font-semibold block">Additional Portfolios</span>
                        <span className="text-[10px] text-slate-450 font-mono">PDF, Images up to 10MB</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Modal operations footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between sticky bottom-0 z-10">
          <div>
            {step === "apply" && (
              <button
                type="button"
                onClick={() => setStep("details")}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 focus:outline-none"
              >
                Back to Details
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={submitting}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            >
              Cancel
            </button>
            
            {step === "details" ? (
              <button
                onClick={() => setStep("apply")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md group"
              >
                Apply for position
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || !cvFile}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-semibold px-6 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md"
              >
                {submitting ? "Sending Documents..." : "Submit Application"}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
