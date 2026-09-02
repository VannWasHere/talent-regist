"use server";

import { redirect } from "next/navigation";

import { checkAdminPassword, endAdminSession, startAdminSession } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!checkAdminPassword(password)) {
    redirect("/admin?error=1");
  }

  await startAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await endAdminSession();
  redirect("/admin");
}
