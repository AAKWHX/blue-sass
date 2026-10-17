import type {ServiceTemplate} from '@/lib/service-templates';
import type {Locale} from '@/lib/i18n/config';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import './template-preview.css';
export function TemplatePreview({template,locale}:{template:ServiceTemplate;locale:Locale}){
 const ar=locale==='ar',nl=locale==='nl';let labels=ar?['الرئيسية','الخدمات','المشاريع','تواصل معنا']:nl?['Home','Diensten','Projecten','Contact']:['Home','Services','Projects','Contact'];
 const mobile=template.service==='android'||template.service==='ios'||(template.service==='design'&&template.variant===1),dashboard=template.service==='erp'||template.service==='windows',store=template.service==='store';
 if(dashboard)labels=ar?['العملاء','الطلبات','المهام','التقارير']:nl?['Klanten','Orders','Taken','Rapporten']:['Customers','Orders','Tasks','Reports'];
 if(template.service==='windows')labels=ar?['المنتجات','المخزون','الحركات','التقارير']:nl?['Producten','Voorraad','Mutaties','Rapporten']:['Products','Inventory','Movements','Reports'];
 if(store)labels=ar?['المنتجات','المجموعات','السلة','الدفع']:nl?['Producten','Collecties','Mandje','Betalen']:['Products','Collections','Cart','Checkout'];
 if(mobile)labels=ar?['استكشاف','الخدمات','حسابي','الدعم']:nl?['Ontdekken','Diensten','Account','Support']:['Explore','Services','Account','Support'];
 const featureNames:Record<string,string[]|undefined>={cms:['إدارة المحتوى','Content management','Contentbeheer'],i18n:['تعدد اللغات','Multiple languages','Meertalig'],auth:['حسابات المستخدمين','User accounts','Gebruikersaccounts'],api:['ربط البيانات','Data integrations','Datakoppelingen'],payments:['الدفع','Payments','Betalingen'],realtime:['تحديث مباشر','Live updates','Live updates'],offline:['عمل دون اتصال','Offline access','Offline toegang'],appstore:['تجهيز المتجر','Store preparation','Winkelvoorbereiding'],dashboard:['لوحة إدارة','Dashboard','Dashboard'],catalog:['كتالوج المنتجات','Product catalog','Productcatalogus'],ai:['مساعد ذكي','AI assistant','AI-assistent'],automation:['أتمتة العمليات','Workflow automation','Procesautomatisering'],identity:['الهوية البصرية','Brand identity','Merkidentiteit'],prototype:['نموذج تفاعلي','Interactive prototype','Interactief prototype']};
 return <div className={`bs-template-art bs-template-${template.service} bs-template-variant-${template.variant}`} data-template={template.id} aria-label={template.name}>
  <div className={`bs-template-window ${mobile?'bs-template-phone':''}`}><div className="bs-template-bar" aria-hidden="true"><i/><i/><i/><span>Blue Sass</span></div>
   <div className="bs-template-nav" aria-hidden="true">{labels.map(label=><span key={label}>{label}</span>)}</div>
   <div className="bs-template-content"><h3>{template.name}</h3><p>{template.features.map(feature=>featureNames[feature]?.[ar?0:nl?2:1]||feature).join(' · ')}</p>
   {template.service==='ai'&&template.variant===1?<div className="bs-template-flow">{(ar?['طلب جديد','مراجعة وربط البيانات','تنفيذ ومتابعة']:nl?['Nieuwe aanvraag','Beoordelen en koppelen','Uitvoeren en volgen']:['New request','Review and integrate','Execute and track']).map(label=><span key={label}>{label}</span>)}</div>:template.service==='ai'?<div className="bs-template-chat"><span>{ar?'كيف يمكننا مساعدتك؟':nl?'Hoe kunnen we helpen?':'How can we help?'}</span><div/><div/><span>{ar?'المعرفة والأتمتة في مكان واحد':nl?'Kennis en automatisering samen':'Knowledge and automation together'}</span></div>:template.service==='design'&&template.variant===0?<div className="bs-template-swatches" aria-hidden="true"><i/><i/><i/><i/></div>:<div className={`bs-template-panels ${dashboard?'bs-template-dashboard':''}`}>{(store?labels.slice(0,3):labels).map((label,i)=><div key={label}><div className={`bs-template-visual bs-template-visual-${i}`} aria-hidden="true"/><strong>{label}</strong><span/><span/></div>)}</div>}
   <Button asChild variant="unstyled" size="auto" className="bs-template-action"><Link style={{color:'#14202d'}} href={`/${locale}/services/${template.service}`}>{ar?'تفاصيل الخدمة':nl?'Bekijk de dienst':'Service details'}</Link></Button></div>
  </div>
 </div>;
}
