import { ProjectList } from "@/components/portal/project-list";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
 return <ProjectList locale={(await params).locale} filter="active"/>;
}
