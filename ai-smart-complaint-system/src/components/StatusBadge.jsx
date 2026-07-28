import { useLang } from '../context/LanguageContext';

const STYLES = {
  Pending: { bg: 'bg-warn-100', text: 'text-warn-600', dot: 'bg-warn-600' },
  'In Progress': { bg: 'bg-info-100', text: 'text-info-600', dot: 'bg-info-600' },
  Resolved: { bg: 'bg-ok-100', text: 'text-ok-600', dot: 'bg-ok-600' },
};

const LABELS = {
  Pending: { en: 'Pending', te: 'పెండింగ్‌లో' },
  'In Progress': { en: 'In Progress', te: 'ప్రగతిలో ఉంది' },
  Resolved: { en: 'Resolved', te: 'పరిష్కరించబడింది' },
};

export default function StatusBadge({ status, size = 'md' }) {
  const { lang } = useLang();
  const s = STYLES[status] || STYLES.Pending;
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${s.bg} ${s.text} ${pad}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {LABELS[status]?.[lang] || status}
    </span>
  );
}
