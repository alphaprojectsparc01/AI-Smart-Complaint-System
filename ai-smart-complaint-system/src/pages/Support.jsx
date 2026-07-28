import React from 'react';
import Header from '../components/Header';
import { useLang } from '../context/LanguageContext';
import { Phone, Mail, Clock, Cpu, Camera, MapPin, Building2 } from 'lucide-react';

export default function Support() {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-[#f9fbff] pb-12 text-slate-800">
      <Header title={t('helpSupport') || 'Help & Support'} showBack />
      
      <div className="mx-auto max-w-xl px-4 pt-5 space-y-4">
        
        {/* Project Explanation / How it Works Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <Cpu size={16} />
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              About Smart AI Complaint System
            </h2>
          </div>
          
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            This application is an intelligent civic resolution pipeline designed to streamline community grievances. Here is exactly how your report moves through the framework:
          </p>

          {/* Core System Milestones */}
          <div className="mt-5 space-y-4 border-l-2 border-slate-100 pl-4 ml-2">
            
            <div className="relative">
              <span className="absolute -left-[25px] top-0.5 grid h-4 w-4 place-items-center rounded-full bg-blue-600 ring-4 ring-blue-50 text-[10px] font-bold text-white">1</span>
              <div className="flex items-start gap-2.5">
                <Camera size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Capture & Upload</h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Citizens upload real-time images of issues like potholes, garbage piles, or leaks.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-[25px] top-0.5 grid h-4 w-4 place-items-center rounded-full bg-blue-600 ring-4 ring-blue-50 text-[10px] font-bold text-white">2</span>
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Geotagging & Telemetry</h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">The interface automatically logs the exact current coordinates and structural details of the incident site.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-[25px] top-0.5 grid h-4 w-4 place-items-center rounded-full bg-blue-600 ring-4 ring-blue-50 text-[10px] font-bold text-white">3</span>
              <div className="flex items-start gap-2.5">
                <Building2 size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Smart AI Distribution</h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">The backend AI classifies the data clusters and instantly routes the request ticket directly to the corresponding organization, department, or field officer to resolve the issues.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Contact and SLA Details Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600 flex-shrink-0"><Phone size={20}/></span>
            <div>
              <p className="text-sm font-bold text-slate-900">Emergency Helpline</p>
              <p className="text-xs font-mono font-bold text-red-600 mt-0.5">112 / 100</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-t border-slate-50 pt-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 flex-shrink-0"><Mail size={20}/></span>
            <div>
              <p className="text-sm font-bold text-slate-900">Grievance Support Email</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">support@civicconnect.gov.in</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-t border-slate-50 pt-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-slate-600 flex-shrink-0"><Clock size={20}/></span>
            <div>
              <p className="text-sm font-bold text-slate-900">Resolution SLA Window</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Standard citizen complaints resolve within 48-72 working hours.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}