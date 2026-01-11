"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, setUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch("/api/user", {
            headers: {
              Authorization: token,
            },
          });

          if (response.ok) {
            const { item: userData } = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem("token");
            router.push("/login");
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
          localStorage.removeItem("token");
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    };

    if (!user) {
      fetchUser();
    }
  }, [setUser, router, user]);

  if (!user) {
    return null;
  }

  return <AppLayout>{children}</AppLayout>;
}
