// app/reset-password/page.tsx (SERVER component)
import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
