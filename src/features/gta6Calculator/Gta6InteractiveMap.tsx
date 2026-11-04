"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import {
  GTA6_MAP_FILTERS,
  GTA6_MAP_IMAGE,
  GTA6_MAP_PINS,
  pinFilterKind,
  type Gta6MapFilter,
  type Gta6MapPin,
} from "@/src/features/gta6Calculator/gta6-map";
import {
  createGta6LeafletMap,
  type Gta6LeafletHandles,
} from "@/src/features/gta6Calculator/gta6-map-leaflet";
export function Gta6InteractiveMap() {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const handlesRef = useRef<Gta6LeafletHandles | null>(null);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Gta6MapFilter>("all");
  const [activeId, setActiveId] = useState(GTA6_MAP_PINS[3]?.id ?? GTA6_MAP_PINS[0].id);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const active: Gta6MapPin =
    GTA6_MAP_PINS.find((pin) => pin.id === activeId) ?? GTA6_MAP_PINS[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GTA6_MAP_PINS.filter((pin) => {
      if (filter !== "all" && pinFilterKind(pin) !== filter) return false;
      if (!q) return true;
      return (
        pin.name.toLowerCase().includes(q) ||
        pin.type.toLowerCase().includes(q) ||
        pin.region.toLowerCase().includes(q)
      );
    });
  }, [query, filter]);

  const visibleIds = useMemo(() => new Set(filtered.map((pin) => pin.id)), [filtered]);

  useEffect(() => {
    const el = mapElRef.current;
    if (!el) return;
    let cancelled = false;
    let handles: Gta6LeafletHandles | null = null;

    createGta6LeafletMap(el, GTA6_MAP_PINS, {
      activeId,
      onSelect: (id) => setActiveId(id),
    })
      .then((created) => {
        if (cancelled) {
          created.destroy();
          return;
        }
        handles = created;
        handlesRef.current = created;
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(false);
      });

    return () => {
      cancelled = true;
      handles?.destroy();
      handlesRef.current?.destroy();
      handlesRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handlesRef.current?.setActive(activeId);
  }, [activeId]);

  useEffect(() => {
    handlesRef.current?.setVisibleIds(visibleIds);
  }, [visibleIds, ready]);

  // Strip legacy `?pin=` / `#map` so the address bar stays clean.
  useEffect(() => {
    const url = new URL(window.location.href);
    const dirty = url.searchParams.has("pin") || url.hash === "#map" || url.hash === "map";
    if (!dirty) return;
    url.searchParams.delete("pin");
    url.hash = "";
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && fullscreen) setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      handlesRef.current?.map.invalidateSize();
    }, 80);
    return () => window.clearTimeout(t);
  }, [fullscreen]);

  const selectPin = (pin: Gta6MapPin) => {
    setActiveId(pin.id);
    handlesRef.current?.flyToPin(pin);
  };

  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copy page link:", url);
    }
  };

  return (
    <figure className={fullscreen ? "gta6-map-figure is-fullscreen" : "gta6-map-figure"}>
      <div className="gta6-map-toolbar">
        <label className="gta6-map-search">
          <span className="sr-only">Search Leonida places</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search places…"
            autoComplete="off"
            enterKeyHint="search"
          />
        </label>
        <div className="gta6-map-toolbar-actions">
          <button
            type="button"
            className="gta6-map-tool-btn"
            onClick={() => handlesRef.current?.resetView()}
            disabled={!ready}
          >
            Reset view
          </button>
          <button type="button" className="gta6-map-tool-btn" onClick={copyLink} disabled={!ready}>
            {copied ? "Copied" : "Copy link"}
          </button>
          <button
            type="button"
            className="gta6-map-tool-btn"
            onClick={() => setFullscreen((v) => !v)}
          >
            {fullscreen ? "Exit full" : "Fullscreen"}
          </button>
        </div>
      </div>

      <div className="gta6-map-filters" role="tablist" aria-label="Filter places">
        {GTA6_MAP_FILTERS.map((item) => {
          const isOn = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isOn}
              className={isOn ? "gta6-map-filter is-active" : "gta6-map-filter"}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="gta6-map-frame gta6-map-interactive-frame">
        <div
          ref={mapElRef}
          className="gta6-leaflet-root"
          role="application"
          aria-label="Interactive Leonida map"
        />
        {!ready ? <p className="gta6-map-loading">Loading interactive map…</p> : null}
      </div>

      <div className="gta6-map-chips" role="listbox" aria-label="Jump to location">
        {filtered.map((pin) => {
          const isActive = pin.id === active.id;
          return (
            <button
              key={pin.id}
              type="button"
              role="option"
              aria-selected={isActive}
              className={isActive ? "gta6-map-chip is-active" : "gta6-map-chip"}
              onClick={() => selectPin(pin)}
            >
              {pin.name}
            </button>
          );
        })}
        {filtered.length === 0 ? (
          <p className="gta6-map-empty">No places match this filter/search.</p>
        ) : null}
      </div>

      <div className="gta6-map-panel" aria-live="polite">
        <p className="gta6-map-type">{active.type}</p>
        <h3 className="gta6-map-panel-title">{active.name}</h3>
        <p className="gta6-map-region">{active.region}</p>
        <p className="gta6-details-copy">{active.summary}</p>
      </div>

      <figcaption className="gta6-map-caption">
        <span>{GTA6_MAP_IMAGE.disclaimer}</span>
        <span>
          Tip: pinch / double-tap to zoom · drag to pan · use filters to jump places.
        </span>
      </figcaption>
    </figure>
  );
}
