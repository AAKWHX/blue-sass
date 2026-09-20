import type { Metadata } from "next";
import { LegalPage } from "@/components/public/legal-page";

export const metadata: Metadata = { title: "Privacy Policy — Blue Sass", description: "How Blue Sass collects, uses, and protects personal information." };

const sections = [
  { title: "Information we collect", paragraphs: ["When you request a quote, create an account, or contact us, we may collect your name, email address, company details, project requirements, and the content of your message.", "If you choose Sign in with Google, Google provides us with your verified email address, name, profile image, and a provider-specific account identifier. We do not receive your Google password and we do not request access to your Google Drive, contacts, or other Google services."] },
  { title: "How we use information", paragraphs: ["We use personal information to authenticate users, operate the client portal, respond to enquiries, prepare proposals, deliver contracted services, prevent abuse, and maintain the security and reliability of the website.", "We do not sell personal information or use Google account data for advertising."] },
  { title: "Cookies and authentication", paragraphs: ["The website uses strictly necessary, secure cookies to maintain authenticated sessions and protect forms against cross-site request forgery. These cookies are required for the client portal to work."] },
  { title: "Storage, sharing, and retention", paragraphs: ["Information is processed using trusted hosting and database providers, including Vercel and Supabase. We share information only with service providers needed to operate the website, when required by law, or with your direction.", "We retain account and project information only as long as necessary for the purposes described here, legal obligations, dispute resolution, and security. You may request deletion of your account data, subject to applicable retention duties."] },
  { title: "Your rights", paragraphs: ["Depending on where you live, you may have rights to access, correct, export, restrict, object to processing, or delete your personal information. You may also revoke the Google connection from your Google Account settings at any time."] },
  { title: "Contact", paragraphs: ["For privacy questions or requests, contact etskar@bluesass.nl. If you are in the European Economic Area, you may also lodge a complaint with your local data protection authority."] },
];

export default function PrivacyPage() {
  return <LegalPage eyebrow="Legal" title="Privacy Policy" updated="21 September 2026" introduction="Blue Sass respects your privacy. This policy explains what information we collect through bluesass.nl, why we use it, and the choices available to you." sections={sections} />;
}
