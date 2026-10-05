"use client";

import { useState } from "react";

/** First paint shows this many. The rest stay in the HTML and open in the same batches. */
export const PUBLIC_COMMENT_BATCH = 20;

export function usePublicCommentReveal(total: number) {
  const [visibleCount, setVisibleCount] = useState(PUBLIC_COMMENT_BATCH);
  return {
    isHidden: (index: number) => index >= visibleCount,
    hasMore: total > visibleCount,
    showMore: () => setVisibleCount((count) => count + PUBLIC_COMMENT_BATCH),
  };
}
