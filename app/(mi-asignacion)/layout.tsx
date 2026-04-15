"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ROLES } from "@/lib/config/roles";

export default function MiAsignacionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[ROLES.DELEGADO, ROLES.JEFE_RECINTO]}>
      {children}
    </ProtectedRoute>
  );
}
