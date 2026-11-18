"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ADMIN_MENU_GROUPS,
  ADMIN_NAV_ACCESS,
  type AdminNavItem,
} from "@/src/server/rbac/adminNav";
import { canAny, type AdminPermission, type AdminRole } from "@/src/server/rbac/permissions";

type Me = {
  role: AdminRole;
  permissions: AdminPermission[];
};

function isNavItemActive(pathname: string, href: string, search: string) {
  const [rawPath, query = ""] = href.split("?");
  const path = rawPath.replace(/\/$/, "") || "/admin";
  if (path === "/admin") return pathname === "/admin" || pathname === "/admin/";
  const pathOk = pathname === path || pathname.startsWith(`${path}/`);
  if (!pathOk || !query) return pathOk;
  const want = new URLSearchParams(query);
  const have = new URLSearchParams(search);
  for (const [key, value] of want) {
    const current = have.get(key);
    if (current === value) continue;
    if (key === "tab" && value === "home" && !current) continue;
    return false;
  }
  return true;
}

function NavLink({
  item,
  pathname,
  label,
  onNavigate,
  icon,
  search,
}: {
  item: AdminNavItem;
  pathname: string;
  label: string;
  onNavigate: () => void;
  icon?: ReactNode;
  search: string;
}) {
  const isActive = isNavItemActive(pathname, item.href, search);
  return (
    <Link
      href={item.href}
      replace
      prefetch={false}
      className={`admin-nav-link ${isActive ? "is-active" : ""}`}
      onClick={onNavigate}
    >
      {icon ? <span className="admin-nav-icon">{icon}</span> : null}
      <span>{label}</span>
    </Link>
  );
}

export function AdminSidebarNav({
  me,
  pathname,
  onNavigate,
  renderIcon,
}: {
  me: Me;
  pathname: string;
  onNavigate: () => void;
  renderIcon: (icon: string) => ReactNode;
}) {
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const visible = useMemo(
    () => ADMIN_NAV_ACCESS.filter((item) => canAny(me, item.anyOf)),
    [me],
  );
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const current = visible.find((item) => item.menuGroup && isNavItemActive(pathname, item.href, search));
    if (!current?.menuGroup) return;
    setOpen((prev) => ({ ...prev, games: true, [current.menuGroup as string]: true }));
  }, [pathname, search, visible]);

  if (visible.length === 0) {
    return <p style={{ padding: "8px 12px", opacity: 0.7, fontSize: 13 }}>No modules assigned.</p>;
  }

  const seen = new Set<string>();
  let gamesInserted = false;
  const gameOn = visible.some((item) => item.menuGroup && isNavItemActive(pathname, item.href, search));
  const gamesOpen = open.games ?? gameOn;
  const blocks: ReactNode[] = [];
  const gameBlocks: ReactNode[] = [];

  for (const item of visible) {
    if (!item.menuGroup) {
      blocks.push(
        <NavLink
          key={item.href}
          item={item}
          pathname={pathname}
          label={item.label}
          onNavigate={onNavigate}
          icon={renderIcon(item.icon)}
          search={search}
        />,
      );
      continue;
    }
    if (seen.has(item.menuGroup)) continue;
    seen.add(item.menuGroup);
    const group = ADMIN_MENU_GROUPS.find((entry) => entry.id === item.menuGroup);
    const children = visible.filter((entry) => entry.menuGroup === item.menuGroup);
    if (!group || children.length === 0) continue;
    const childActive = children.some((child) => isNavItemActive(pathname, child.href, search));
    const isOpen = open[group.id] ?? childActive;
    if (!gamesInserted) {
      gamesInserted = true;
      blocks.push(
        <div key="games-menu" className={`admin-nav-group ${gamesOpen ? "is-open" : ""} ${gameOn ? "is-current" : ""}`}>
          <button
            type="button"
            className={`admin-nav-link admin-nav-group-btn ${gameOn ? "is-current" : ""}`}
            aria-expanded={gamesOpen}
            onClick={() => setOpen((prev) => ({ ...prev, games: !gamesOpen }))}
          >
            <span className="admin-nav-icon">{renderIcon("gameArticles")}</span>
            <span>Game</span>
            <span className="admin-nav-chevron" aria-hidden>
              ›
            </span>
          </button>
          {gamesOpen ? <div className="admin-nav-sub">{gameBlocks}</div> : null}
        </div>,
      );
    }
    gameBlocks.push(
      <div key={group.id} className={`admin-nav-group ${isOpen ? "is-open" : ""} ${childActive ? "is-current" : ""}`}>
        <button
          type="button"
          className={`admin-nav-link admin-nav-group-btn ${childActive ? "is-current" : ""}`}
          aria-expanded={isOpen}
          onClick={() => setOpen((prev) => ({ ...prev, [group.id]: !isOpen }))}
        >
          <span>{group.label}</span>
          <span className="admin-nav-chevron" aria-hidden>
            ›
          </span>
        </button>
        {isOpen ? (
          <div className="admin-nav-sub">
            {children.map((child) => (
              <NavLink
                key={child.href}
                item={child}
                pathname={pathname}
                label={child.menuLabel || child.label}
                onNavigate={onNavigate}
                search={search}
              />
            ))}
          </div>
        ) : null}
      </div>,
    );
  }

  return <>{blocks}</>;
}
