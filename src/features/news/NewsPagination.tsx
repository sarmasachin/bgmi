"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { newsListPagePath, newsPageSlotCount, visibleNewsPages } from "@/src/lib/newsListPage";

type Props = {
  currentPage: number;
  totalPages: number;
  basePath: string;
};

export function NewsPagination({ currentPage, totalPages, basePath }: Props) {
  const navRef = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const items = visibleNewsPages(currentPage, totalPages, newsPageSlotCount(width));

  return (
    <nav
      ref={navRef}
      className="news-pagination-row"
      aria-label="News pages"
      data-ready={width > 0 ? "true" : "false"}
    >
      {currentPage > 1 ? (
        <Link className="news-page-edge" href={newsListPagePath(basePath, currentPage - 1)}>
          Back
        </Link>
      ) : (
        <span className="news-page-edge" aria-disabled="true">
          Back
        </span>
      )}
      <div className="news-page-nums">
        {items.map((item, index) =>
          item === "gap" ? (
            <span key={`gap-${index}`} className="news-page-gap" aria-hidden="true">
              …
            </span>
          ) : item === currentPage ? (
            <span key={item} className="news-page-current" aria-current="page">
              {item}
            </span>
          ) : (
            <Link key={item} className="news-page-num" href={newsListPagePath(basePath, item)}>
              {item}
            </Link>
          ),
        )}
      </div>
      {currentPage < totalPages ? (
        <Link className="news-page-edge" href={newsListPagePath(basePath, currentPage + 1)}>
          Next
        </Link>
      ) : (
        <span className="news-page-edge" aria-disabled="true">
          Next
        </span>
      )}
    </nav>
  );
}
