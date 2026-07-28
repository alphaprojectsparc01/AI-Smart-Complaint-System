import { Droplets, Building2, HeartPulse, Construction, Zap, HelpCircle } from 'lucide-react';

const ICONS = {
  Droplets, Building2, HeartPulse, Construction, Zap,
};

export default function DepartmentIcon({ name, size = 22, color, className = '' }) {
  const Icon = ICONS[name] || HelpCircle;
  return <Icon size={size} color={color} className={className} strokeWidth={2} />;
}
