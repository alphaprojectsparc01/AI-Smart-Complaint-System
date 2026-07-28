import { Shield, Ambulance, Flame, HeartHandshake, AlertTriangle, Baby } from 'lucide-react';
import Header from '../components/Header';
import { useLang } from '../context/LanguageContext';

const SERVICES = [
  { key: 'police', label: { en: 'Police', te: 'పోలీసు' }, number: '112', icon: Shield, color: '#2E5AAE', bg: '#E7EDF7' },
  { key: 'ambulance', label: { en: 'Ambulance', te: 'అంబులెన్స్' }, number: '108', icon: Ambulance, color: '#D14343', bg: '#FBE2E2' },
  { key: 'fire', label: { en: 'Fire', te: 'అగ్నిమాపక' }, number: '101', icon: Flame, color: '#D9631E', bg: '#FBE7D8' },
  { key: 'women', label: { en: 'Women Helpline', te: 'మహిళా సహాయవాణి' }, number: '181', icon: HeartHandshake, color: '#8B5CF6', bg: '#EFE9FD' },
  { key: 'disaster', label: { en: 'Disaster Management', te: 'విపత్తు నిర్వహణ' }, number: '1078', icon: AlertTriangle, color: '#C98A16', bg: '#FCEFD3' },
  { key: 'child', label: { en: 'Child Helpline', te: 'బాలల సహాయవాణి' }, number: '1098', icon: Baby, color: '#1F9D55', bg: '#E1F6E9' },
];

export default function SOS() {
  const { t, lang } = useLang();

  return (
    <div className="min-h-full pb-10">
      <Header  />
      <div className="mx-auto max-w-3xl px-4 pt-5">
        <h1 className="font-display text-lg font-bold text-civic-900">{t('emergencyServices')}</h1>
        <p className="mt-1 text-xs text-civic-500">{t('callHint')}</p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <a
                key={s.key}
                href={`tel:${s.number}`}
                className="card flex flex-col items-center gap-2 p-5 text-center tap-highlight transition active:scale-95 hover:shadow-md"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full" style={{ background: s.bg }}>
                  <Icon size={22} color={s.color} />
                </span>
                <span className="text-xs font-semibold text-civic-800">{s.label[lang]}</span>
                <span className="font-mono text-lg font-bold" style={{ color: s.color }}>{s.number}</span>
              </a>
            );
          })}
        </div>

        <p className="mt-6 text-center text-[11px] text-civic-400">
          {lang === 'en'
            ? 'Tapping a number opens your phone dialer with it pre-filled — nothing is dialed automatically.'
            : 'నంబర్‌ను నొక్కితే మీ ఫోన్ డయలర్‌లో అది ముందుగా నింపబడుతుంది — స్వయంచాలకంగా డయల్ చేయబడదు.'}
        </p>
      </div>
    </div>
  );
}
