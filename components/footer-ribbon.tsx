import { Globe, ShoppingBag, Smartphone, LayoutDashboard, Layers, Workflow, Monitor, PenTool } from 'lucide-react';
import type { ActiveLocale } from '@/lib/i18n/config';
const labels = {
 ar: ['مواقع بهوية واضحة', 'تطبيقات أندرويد', 'تجارب آيفون', 'برامج ويندوز', 'متاجر لمنتجاتك', 'أنظمة تنظّم أعمالك', 'أتمتة تختصر الخطوات', 'واجهات وهوية متناسقة'],
 en: ['Websites with character', 'Android applications', 'iPhone experiences', 'Windows software', 'Stores for your products', 'Systems for your business', 'Automation that simplifies', 'Interfaces & brand identity'],
 nl: ['Websites met karakter', 'Android-applicaties', 'iPhone-ervaringen', 'Windows-software', 'Webshops voor uw producten', 'Systemen voor uw bedrijf', 'Automatisering die vereenvoudigt', 'Interfaces & huisstijl'],
};
const icons = [Globe, Smartphone, Layers, Monitor, ShoppingBag, LayoutDashboard, Workflow, PenTool];
export function FooterRibbon({ locale }: { locale: ActiveLocale }) {
 return <div className="footer-ribbon"><div className="footer-ribbon-track">{[0, 1].map(repeat => <div className="footer-ribbon-group" key={repeat} aria-hidden={repeat === 1}>{labels[locale].map((label, i) => { const Icon = icons[i]; return <span key={label}><Icon size={18} strokeWidth={1.5} aria-hidden="true"/>{label}</span>; })}</div>)}</div></div>;
}
