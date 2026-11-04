import Image from 'next/image';
import type { ActiveLocale } from '@/lib/i18n/config';
const copy = {
 ar: { brand: ['هوية تُعرف من أول نظرة.', 'نحوّل شخصية مشروعك إلى لغة بصرية متسقة: من العلامة إلى تفاصيل الواجهة.'], architecture: ['واجهة جميلة، وأساس مترابط.', 'نربط المحتوى وتجربة المستخدم والتطوير في مسار واضح، ليعمل المنتج كوحدة واحدة.'] },
 en: { brand: ['Recognisable from the first glance.', 'We turn your project’s character into a coherent visual language, from its identity to the interface details.'], architecture: ['A clear interface. A connected foundation.', 'Content, user experience and development follow one clear path, so the product works as a whole.'] },
 nl: { brand: ['Herkenbaar vanaf de eerste blik.', 'We vertalen het karakter van uw project naar een samenhangende visuele taal, van identiteit tot interfacedetails.'], architecture: ['Een heldere interface. Een verbonden basis.', 'Inhoud, gebruikservaring en ontwikkeling volgen één duidelijke route, zodat het product als geheel werkt.'] },
};
export function StudioStudy({ locale, kind }: { locale: ActiveLocale; kind: 'brand' | 'architecture' }) {
 const [title, body] = copy[locale][kind];
 return <section className="studio-study-section studio-section"><div className="container-x studio-study-layout"><div><h2 className="studio-heading">{title}</h2><p className="studio-deck mt-6">{body}</p></div><figure><Image src={`/media/service-studies/${kind === 'brand' ? 'b-prism-study' : 'connected-architecture'}.webp`} alt="" width={1200} height={675} sizes="(max-width:767px) 100vw, 50vw" unoptimized/></figure></div></section>;
}
