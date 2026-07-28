import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Layers, Award, ArrowLeft, Loader2, ClipboardCheck } from 'lucide-react';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import DepartmentIcon from '../components/DepartmentIcon';
import departments from '../data/departments';
import { useLang } from '../context/LanguageContext';
import api from '../utils/api';

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchComplaintDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch raw fresh data straight from your updated MongoDB endpoints
        const response = await api.get(`/api/complaints/${id}`);
        
        if (isMounted) {
          const c = response.data;
          
          // Hardened properties mapping to gracefully tolerate empty objects like ai_result
          const normalized = {
            id: c.complaint_id || c.id || "—",
            issueType: c.title || c.category || "General Issue",
            description: c.description || "",
            departmentId: c.department_id || c.departmentId || "other",
            status: c.status || "Pending",
            photo: c.image_url || c.imageUrl || null,
            address: c.address || "Location details unavailable",
            createdAt: c.created_at || c.createdAt || null,
            // Bulletproof checking against the empty object anomaly:
            confidence: c.ai_result && typeof c.ai_result === 'object' && 'confidence' in c.ai_result
              ? c.ai_result.confidence
              : (c.confidence || null),
            history: c.history || [] // Mount dynamic history audit payloads safely
          };
          
          setComplaint(normalized);
        }
      } catch (err) {
        console.error('Failed to load complaint data from database:', err);
        if (isMounted) {
          setError(err.response?.data?.detail || 'Failed to fetch tracking history.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchComplaintDetail();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fbff]">
        <Header showBack />
        <div className="mx-auto max-w-2xl px-4 pt-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
          <p className="text-xs font-bold tracking-wide uppercase">Loading telemetry data...</p>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-[#f9fbff]">
        <Header showBack />
        <div className="mx-auto max-w-2xl px-4 pt-10 text-center">
          <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 p-4 rounded-xl mb-4">
            {typeof error === 'string' ? error : t('noResults')}
          </p>
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const dept = departments.find((d) => d.id === complaint.departmentId);

  // Standard tracking configurations
  const allStagesBlueprint = [
    { key: 'Pending', labelEn: 'Complaint Submitted', labelTe: 'ఫిర్యాదు సమర్పించబడింది' },
    { key: 'Assigned', labelEn: 'Assigned to Officer', labelTe: 'అధికారికి కేటాయించబడింది' },
    { key: 'In Progress', labelEn: 'In Progress', labelTe: 'ప్రగతిలో ఉంది' },
    { key: 'Resolved', labelEn: 'Resolved', labelTe: 'పరిష్కరించబడింది' }
  ];

  const stageWeights = { 'Pending': 1, 'Assigned': 2, 'In Progress': 3, 'Resolved': 4 };
  const currentStatusWeight = stageWeights[complaint.status] || 1;

  const fullTrackingStages = allStagesBlueprint.map((stageBlueprint) => {
    const actualLog = complaint.history?.find(h => 
      h.status === stageBlueprint.key || 
      h.statusKey === stageBlueprint.key ||
      h.remarks?.toLowerCase().includes(stageBlueprint.key.toLowerCase())
    );

    // If a higher stage is active, consider previous ones complete fallback logic
    const isDone = actualLog ? true : (stageWeights[stageBlueprint.key] <= currentStatusWeight || (complaint.status === 'In Progress' && stageBlueprint.key === 'Assigned'));
    
    let eventTime = actualLog?.created_at || actualLog?.at || null;
    if (!eventTime && stageBlueprint.key === 'Pending') {
      eventTime = complaint.createdAt;
    }

    return {
      done: isDone,
      at: eventTime,
      label: lang === 'en' ? stageBlueprint.labelEn : stageBlueprint.labelTe
    };
  });

  return (
    <div className="min-h-screen bg-[#f9fbff] pb-12 text-slate-800">
      <Header showBack />
      
      <div className="mx-auto max-w-2xl px-4 pt-5 space-y-4">
        {/* Core Details Card Section */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Complaint ID: {complaint.id}
              </h1>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="grid h-5 w-5 place-items-center rounded bg-slate-100">
                  <DepartmentIcon name={dept?.icon} size={12} color={dept?.color || '#475569'} />
                </span>
                <p className="text-sm font-semibold text-slate-700">{complaint.issueType}</p>
              </div>
            </div>
            <div className="flex-shrink-0 ml-3">
              <StatusBadge status={complaint.status} />
            </div>
          </div>

          {complaint.photo && (
            <div className="mt-4 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
              <img 
                src={
                  complaint.photo.startsWith('http')
                    ? complaint.photo
                    : `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api', '')}${
                        complaint.photo.startsWith('/') ? complaint.photo : `/${complaint.photo}`
                      }`
                } 
                alt={complaint.issueType} 
                className="h-64 w-full object-cover" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  const container = e.target.parentNode;
                  if (container) {
                    container.innerHTML = `
                      <div class="flex flex-col items-center justify-center p-8 text-slate-400 text-xs font-semibold bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                        <span>Image failed to stream from network node storage</span>
                      </div>
                    `;
                  }
                }}
              />
            </div>
          )}

          {/* Metadata Grid Info Rows */}
          <dl className="mt-5 divide-y divide-slate-100 text-sm border-t border-slate-100">
            <Row icon={<Layers size={14} className="text-blue-600" />} label={t('department')}>
              {dept?.name[lang] || '—'}
            </Row>
            
            <Row icon={<Calendar size={14} className="text-slate-400" />} label={t('dateSubmitted')}>
              {complaint.createdAt ? new Date(complaint.createdAt).toLocaleString(lang === 'en' ? 'en-US' : 'te-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }) : '—'}
            </Row>
            
            <Row icon={<MapPin size={14} className="text-red-500" />} label={t('location')}>
              <span className="line-clamp-2 block text-slate-600 text-right">{complaint.address}</span>
            </Row>
            
            {complaint.confidence && (
              <Row icon={<Award size={14} className="text-emerald-600" />} label={`AI ${t('confidence')}`}>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 text-xs uppercase tracking-wider">
                  {complaint.confidence}
                </span>
              </Row>
            )}
          </dl>

          {complaint.description && (
            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3.5 text-sm text-slate-600 leading-relaxed">
              {complaint.description}
            </div>
          )}
        </div>

        {/* Dynamic 3-Column Tracking History Progress Stepper */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-950 tracking-tight mb-5">
            {t('trackingHistory')}
          </h2>
          
          <ol className="space-y-0">
            {fullTrackingStages.map((h, i) => {
              const isLast = i === fullTrackingStages.length - 1;
              const nextStepDone = !isLast && fullTrackingStages[i + 1]?.done;
              const isLineActive = h.done && nextStepDone;

              let dotColorClass = 'bg-slate-200 border-slate-300';
              if (h.done) {
                dotColorClass = nextStepDone 
                  ? 'bg-emerald-600 border-emerald-600' 
                  : 'bg-emerald-600 border-emerald-600 ring-4 ring-emerald-600/15'; 
              }

              return (
                <li key={i} className="grid grid-cols-[115px_30px_1fr] items-start gap-1">
                  
                  {/* Column 1: Aligned Timestamp Strings */}
                  <div className="text-[11px] font-semibold text-slate-400 pt-1.5 text-right pr-2 select-none">
                    {h.at ? new Date(h.at).toLocaleString(lang === 'en' ? 'en-US' : 'te-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    }) : '--'}
                  </div>

                  {/* Column 2: Structural Line and Tracking Track Nodes */}
                  <div className="flex flex-col items-center h-full min-h-[68px]">
                    <span className={`h-2.5 w-2.5 rounded-full border mt-2.5 z-10 transition-all ${dotColorClass}`} />
                    {!isLast && (
                      <span 
                        className={`w-[1.5px] flex-1 my-0.5 transition-colors rounded-full ${
                          isLineActive ? 'bg-emerald-600' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </div>
                  
                  {/* Column 3: Custom Text Labels */}
                  <div className="pb-5 pl-1 min-w-0">
                    <p className={`text-sm font-bold tracking-tight pt-0.5 ${h.done ? 'text-slate-800' : 'text-slate-400 font-medium'}`}>
                      {h.label}
                    </p>
                  </div>

                </li>
              );
            })}
          </ol>
        </div>

        {/* =====================================================================
            CONNECTED DYNAMIC AI MATCHMAKING TRACE LOGGER
            ===================================================================== */}
        {complaint.history && complaint.history.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-50 pb-2">
              <ClipboardCheck size={14} className="text-blue-500" /> Triage Audit Telemetry Logs
            </h3>
            <div className="space-y-3 font-semibold text-xs leading-normal">
              {complaint.history.map((log, index) => (
                <div key={index} className="flex gap-3 items-start border-l-2 border-slate-100 pl-4 py-0.5 transition-all hover:border-blue-400">
                  <div className="flex-1">
                    <p className="text-slate-700 font-bold">{log.remarks}</p>
                    <span className="text-[10px] text-slate-400 font-mono font-medium block mt-1">
                      Target Subsystem: <span className="text-blue-600 font-bold">{log.updated_by}</span> • {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function Row({ icon, label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-slate-500 flex items-center gap-2 font-medium">
        {icon}
        <span>{label}</span>
      </dt>
      <dd className="max-w-[65%] text-right font-semibold text-slate-800 text-xs sm:text-sm break-words">
        {children}
      </dd>
    </div>
  );
}