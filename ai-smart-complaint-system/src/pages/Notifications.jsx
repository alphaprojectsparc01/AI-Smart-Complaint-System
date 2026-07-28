import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Info, PartyPopper } from 'lucide-react';
import Header from '../components/Header';
import { useLang } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

const ICONS = { success: CheckCircle2, info: Info, welcome: PartyPopper };
const COLORS = { success: '#1F9D55', info: '#2E5AAE', welcome: '#D9631E' };

function timeAgo(iso, lang) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diffMs / 3600000);
  if (hrs < 1) return lang === 'en' ? 'just now' : 'ఇప్పుడే';
  if (hrs < 24) return lang === 'en' ? `${hrs} hours ago` : `${hrs} గంటల క్రితం`;
  const days = Math.floor(hrs / 24);
  return lang === 'en' ? `${days} day${days > 1 ? 's' : ''} ago` : `${days} రోజుల క్రితం`;
}

export default function Notifications() {
  const { t, lang } = useLang();
  const { notifications } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-full pb-10">
      <Header title={t('notifications')} showBack />
      <div className="mx-auto max-w-2xl px-4 pt-4">
        {notifications.length === 0 && (
          <p className="py-10 text-center text-sm text-civic-500">{t('noResults')}</p>
        )}
        <div className="space-y-2.5">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] || Info;
            return (
              <button
                key={n.id}
                onClick={() => n.complaintId && navigate(`/complaint/${n.complaintId}`)}
                className="card flex w-full items-start gap-3 p-4 text-left tap-highlight transition active:scale-[0.99] hover:shadow-md"
              >
                <span className="mt-0.5 grid h-8 w-8 flex-shrink-0 place-items-center rounded-full" style={{ background: `${COLORS[n.type]}1A` }}>
                  <Icon size={16} color={COLORS[n.type]} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-civic-800">{n.message[lang]}</p>
                  <p className="mt-1 text-[11px] text-civic-400">{timeAgo(n.at, lang)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
