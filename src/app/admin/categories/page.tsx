import type { Metadata } from "next";
import { AdminCategoriesManager } from "@/components/shared/AdminCategoriesManager";
import { requireProfile } from "@/lib/auth";
import { getAllCategoriesForAdmin } from "@/lib/data/categories";

export const metadata: Metadata = { title: "Manage Categories" };

export default async function AdminCategoriesPage() {
  await requireProfile(["admin"]);
  const categories = await getAllCategoriesForAdmin();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-extrabold text-ink">Categories</h1>
      <div className="mt-6">
        <AdminCategoriesManager categories={categories} />
      </div>
    </div>
  );
}
