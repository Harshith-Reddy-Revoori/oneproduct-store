// web/app/account/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export default async function AccountHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login?callbackUrl=/account");

  return (
    <div>
      <h1>Welcome{session.user?.name ? `, ${session.user.name}` : ""}!</h1>
      <p>Use the sidebar to view your orders.</p>
    </div>
  );
}
