import React from "react";
import { MapPin, DollarSign, Calendar, ChevronRight, Users, Briefcase } from "lucide-react";
import { Job } from "../types";

interface JobCardProps {
  job: Job;
  onViewDetails: (job: Job) => void;
}

export default function JobCard({ job, onViewDetails }: JobCardProps) {
  return (
    <div className="bg-white border border-slate-200/90 hover:border-indigo-500 hover:shadow-lg rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between h-full group relative overflow-hidden">
      
      {/* Decorative vertical bar on hover */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
      
      <div>
        {/* Company & Category Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-display">
            {job.category}
          </span>
          
          <div className="flex items-center gap-2">
            {job.isInternalOnly ? (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                <Users className="w-3 h-3 text-amber-600" />
                Internal Only
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                Open to Public
              </span>
            )}
          </div>
        </div>

        {/* Job Title & Company Name */}
        <h3 className="text-lg font-display font-semibold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {job.title}
        </h3>
        <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1">
          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          {job.company}
        </p>

        {/* Quick parameters */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs text-slate-600 font-mono">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{job.salaryRange}</span>
          </div>

          <div className="flex items-center gap-1.5 min-w-0 col-span-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Posted on {job.datePosted} • {job.type}</span>
          </div>
        </div>

        {/* Short summary snippet */}
        <p className="text-xs text-slate-500 mt-4 line-clamp-2 leading-relaxed">
          {job.description}
        </p>
      </div>

      {/* Primary Action Button */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-mono font-medium text-slate-400">
          Exp: {job.experienceLevel}
        </span>
        <button
          onClick={() => onViewDetails(job)}
          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 group-hover:translate-x-1 transition-all focus:outline-none"
        >
          View & Apply
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
