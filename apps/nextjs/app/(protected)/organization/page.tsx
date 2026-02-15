import { requireAuth } from "@/adapters/guards/auth.guard";
import { OrganisationDashboard } from "./_components/organisation-dashboard";

export default async function OrganizationPage() {
  const session = await requireAuth();
  return (
    <OrganisationDashboard
      userName={session.user.name}
      userImage={session.user.image}
    />
  );
}
