import {
  ArrowUpLeft, ArrowLeft, Users, ChartNoAxesCombined, Layers3, Activity,
  Target, MessagesSquare, BriefcaseBusiness, Compass, HeartHandshake, Workflow,
  CalendarDays, Check, CircleCheck, Sparkles, ShieldCheck, LayoutDashboard,
  Search, MoreHorizontal, Plus, Bell, MousePointer2, TrendingUp, Mail, Phone,
  MapPin, ChevronDown, X, Menu, ExternalLink, Play, Quote, Globe, type LucideIcon,
} from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  arrow: ArrowUpLeft, left: ArrowLeft, users: Users, chart: ChartNoAxesCombined,
  layers: Layers3, activity: Activity, target: Target, messages: MessagesSquare,
  briefcase: BriefcaseBusiness, compass: Compass, heart: HeartHandshake, workflow: Workflow,
  calendar: CalendarDays, check: Check, circlecheck: CircleCheck, sparkles: Sparkles,
  shield: ShieldCheck, dashboard: LayoutDashboard, search: Search, more: MoreHorizontal,
  plus: Plus, bell: Bell, cursor: MousePointer2, trend: TrendingUp, mail: Mail,
  phone: Phone, map: MapPin, down: ChevronDown, close: X, menu: Menu, external: ExternalLink,
  play: Play, quote: Quote, globe: Globe,
};
export function Icon({ name, size = 20, className = '' }: { name?: string | null; size?: number; className?: string }) {
  const Component = icons[name || ''] || Layers3;
  return <Component size={size} strokeWidth={1.6} className={className} aria-hidden="true" />;
}
