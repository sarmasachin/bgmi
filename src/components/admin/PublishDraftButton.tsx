"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { readApiError } from "@/src/lib/userFacingError";

type Props = {
  id: string;
};

export function PublishDraftButton({ id }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const flash = useAdminFlash();

  async function onPublish() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/news", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "published" }),
      });
      if (!res.ok) {
        flash(await readApiError(res, "Publish failed."));
        return;
      }
      flash("News published.");
      router.refresh();
    } catch {
      flash("Network error. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" className="admin-news-btn admin-news-btn-primary" disabled={loading} onClick={onPublish}>
      {loading ? "Publishing..." : "Publish"}
    </button>
  );
}
