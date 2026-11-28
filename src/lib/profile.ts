import { apiPatch } from "@/lib/api";

// GET/PATCH /me (wavy-backend feat/customer-profile-otp)
export interface CustomerProfile {
  id: number;
  email: string;
  name: string | null;
  phone: string;
  needs_name: boolean;
}

// sama dengan profileSchema backend: nama 2–80 karakter setelah trim
export const NAME_MIN = 2;
export const NAME_MAX = 80;

export function nameError(name: string): "nameTooShort" | "nameTooLong" | null {
  const n = name.trim();
  if (n.length < NAME_MIN) return "nameTooShort";
  if (n.length > NAME_MAX) return "nameTooLong";
  return null;
}

export const updateProfile = (data: { name: string; phone?: string }) => apiPatch<CustomerProfile>("/me", data);
