"use client"

import useUserByAuthId from "@/src/hooks/users/useUserByAuthId";
import { useAuth } from "@/src/context/AuthProvider";
import { notFound } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError,
  } = useUserByAuthId(user?.id || "");

  if (isLoadingUser) return null;

  if (userError || !userData) {
    throw new Error("Unauthorized");
  }

  if (userData.is_admin === false) {
    notFound();
    
  }

  return <>{children}</>
}