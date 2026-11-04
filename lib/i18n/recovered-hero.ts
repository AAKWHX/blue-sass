import type {ActiveLocale} from './config';
// Hero copy recovered from the local archived cinema.ts; no retired sections bundled.
const copy={
 ar:{title:['فكرتك تستحق','تجربة استثنائية.'],intro:'نصمّم ونطوّر المواقع والتطبيقات والأنظمة الذكية. نربط التفاصيل برؤية واحدة، ونحوّلها إلى منتج يمكنك استخدامه وإدارته.',start:'لنبدأ مشروعك',explore:'اكتشف التجربة',closing:'لنصنع ما يأتي بعد.'},
 en:{title:['Your ambition.','An exceptional experience.'],intro:'We design and develop websites, apps and intelligent systems. One connected vision, crafted into a product you can use and manage.',start:'Let’s build your project',explore:'Explore the experience',closing:'Let’s make what comes next.'},
 nl:{title:['Uw ambitie.','Een bijzondere ervaring.'],intro:'Wij ontwerpen en ontwikkelen websites, apps en slimme systemen. Eén samenhangende visie, uitgewerkt tot een product dat u kunt gebruiken en beheren.',start:'Laten we uw project bouwen',explore:'Ontdek de ervaring',closing:'Laten we de volgende stap maken.'}
};export const recoveredHeroCopy=(locale:ActiveLocale)=>copy[locale];
