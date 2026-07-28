import { Check } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

export default function StepIndicator({ current }) {
  const { t } = useLang();
  const steps = [
    { n: 1, label: t('stepCapture') },
    { n: 2, label: t('stepAnalysis') },
    { n: 3, label: t('stepDetails') },
    { n: 4, label: t('stepSubmit') },
  ];

  return (
    <div className="flex items-center justify-between px-1">
      {steps.map((s, i) => (
        <div key={s.n} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold transition ${
                s.n < current
                  ? 'bg-ok-600 text-white'
                  : s.n === current
                  ? 'bg-civic-700 text-white ring-4 ring-civic-100'
                  : 'bg-civic-100 text-civic-500'
              }`}
            >
              {s.n < current ? <Check size={15} /> : s.n}
            </div>
            <span className={`hidden text-center text-[10px] font-medium sm:block ${s.n === current ? 'text-civic-800' : 'text-civic-400'}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`mx-1 h-0.5 flex-1 rounded ${s.n < current ? 'bg-ok-600' : 'bg-civic-100'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
