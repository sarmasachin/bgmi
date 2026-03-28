"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  id: string;
};

export function PublishDraftButton({ id }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onPublish() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/admin/news", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "published" }),
      });
      router.refresh();
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

