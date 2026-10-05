import { withExtraLocales } from "@/lib/i18n/extra-locales";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/portal/profile-form";
import { getViewer } from "@/lib/db/access";
import { isLocale } from "@/lib/i18n";

const titles = withExtraLocales({ ar: ["ملفك الشخصي", "حدّث صورتك وبياناتك المستخدمة في مشاريعك."], en: ["Your profile", "Update the photo and details used in your projects."], nl: ["Uw profiel", "Werk uw foto en projectgegevens bij."], de: ["Ihr Profil", "Aktualisieren Sie Foto und Projektdaten."], tr: ["Profiliniz", "Fotoğrafınızı ve proje bilgilerinizi güncelleyin."], fr: ["Votre profil", "Mettez à jour votre photo et vos informations."], es: ["Tu perfil", "Actualiza tu foto y tus datos de proyecto."] } as const);

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) redirect("/en");
  const viewer = await getViewer();
  if (!viewer) redirect(`/${raw}/login?next=/${raw}/portal/profile`);
  const [title, subtitle] = titles[raw];
  return <div className="bg-base"><div className="container-x py-14 sm:py-20"><div className="mb-10"><h1 className="text-4xl font-black text-black sm:text-6xl">{title}</h1><p className="mt-4 text-lg text-ink-low">{subtitle}</p></div><ProfileForm locale={raw} user={viewer}/></div></div>;
}
