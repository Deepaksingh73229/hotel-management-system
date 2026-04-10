"use client";

import { useAuthStore } from "@/stores/auth.store";
import type { RoleName, PermissionModule, PermissionAction } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// usePermission
//
// Usage in components:
//   const { isAdmin, can, hasRole } = usePermission();
//   if (!can("billing", "delete")) return null;
// ─────────────────────────────────────────────────────────────────────────────

export const usePermission = () => {
    const { hasRole, can, isAdmin } = useAuthStore();

    return {
        /** True if the user has any of the provided roles. */
        hasRole: (...roles: RoleName[]) => hasRole(...roles),

        /** True if the user has the specific module + action permission. */
        can: (module: PermissionModule, action: PermissionAction) => can(module, action),

        /** Shortcut: true if the user is an admin. */
        isAdmin: isAdmin(),
    };
};