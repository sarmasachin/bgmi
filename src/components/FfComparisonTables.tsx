"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";

const VS_ROWS: Array<{
  icon: string;
  point: string;
  freefire: string;
  freefireMax: string;
}> = [
  {
    icon: "fa-image",
    point: "Graphics load",
    freefire: "Lighter & smoother",
    freefireMax: "Heavier HD visuals",
  },
  {
    icon: "fa-memory",
    point: "Best RAM",
    freefire: "Works well on 2–6GB",
    freefireMax: "Better on 6GB+",
  },
  {
    icon: "fa-crosshairs",
    point: "Sensitivity feel",
    freefire: "Faster drag response",
    freefireMax: "Needs own tuned values",
  },
  {
    icon: "fa-bullseye",
    point: "Headshot aim",
    freefire: "One-tap / drag friendly",
    freefireMax: "Slightly heavier aim feel",
  },
  {
    icon: "fa-gamepad",
    point: "Best for",
    freefire: "Low & mid-range phones",
    freefireMax: "Strong / gaming phones",
  },
  {
    icon: "fa-calculator",
    point: "Use calculator",
    freefire: "Home Free Fire tool",
    freefireMax: "Free Fire Max page",
  },
];

const RAM_ROWS: Array<{
  icon: string;
  ram: string;
  general: string;
  redDot: string;
  scope2x: string;
  scope4x: string;
  sniper: string;
  freeLook: string;
}> = [
  {
    icon: "fa-mobile-screen",
    ram: "2–3GB",
    general: "100",
    redDot: "95–100",
    scope2x: "100",
    scope4x: "95",
    sniper: "50–60",
    freeLook: "80",
  },
  {
    icon: "fa-tablet-screen-button",
    ram: "4–6GB",
    general: "90–98",
    redDot: "85–90",
    scope2x: "85–95",
    scope4x: "80–85",
    sniper: "45–50",
    freeLook: "75",
  },
  {
    icon: "fa-laptop",
    ram: "8–12GB+",
    general: "80–88",
    redDot: "75–80",
    scope2x: "75–80",
    scope4x: "70–75",
    sniper: "35–40",
    freeLook: "65",
  },
];

export function FfComparisonTables() {
  const pathname = usePathname() ?? "";
  const isHome = pathname === "/" || pathname === "";
  if (!isHome) return null;

  return (
    <section className="ff-compare" aria-labelledby="ff-compare-title">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <h2 id="ff-compare-title" className="ff-compare-title">
        <i className="fa-solid fa-table" aria-hidden /> Free Fire vs FF Max
      </h2>

      <div className="ff-compare-table-wrap">
        <table className="ff-compare-table">
          <thead>
            <tr>
              <th scope="col">
                <i className="fa-solid fa-list" aria-hidden /> Point
              </th>
              <th scope="col">
                <i className="fa-solid fa-fire" aria-hidden /> Free Fire
              </th>
              <th scope="col">
                <i className="fa-solid fa-fire-flame-curved" aria-hidden /> Free Fire Max
              </th>
            </tr>
          </thead>
          <tbody>
            {VS_ROWS.map((row) => (
              <tr key={row.point}>
                <th scope="row">
                  <i className={`fa-solid ${row.icon}`} aria-hidden /> {row.point}
                </th>
                <td>{row.freefire}</td>
                <td>{row.freefireMax}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="ff-compare-cta">
        Playing Max?{" "}
        <Link href={FREE_FIRE_MAX_PATH}>Open Free Fire Max calculator</Link>
      </p>

      <h3 className="ff-compare-subtitle">
        <i className="fa-solid fa-memory" aria-hidden /> RAM-wise Free Fire sensitivity
      </h3>

      <div className="ff-compare-table-wrap ff-compare-table-wrap--scroll">
        <table className="ff-compare-table ff-compare-table--ram">
          <thead>
            <tr>
              <th scope="col">
                <i className="fa-solid fa-memory" aria-hidden /> RAM
              </th>
              <th scope="col">General</th>
              <th scope="col">Red Dot</th>
              <th scope="col">2X</th>
              <th scope="col">4X</th>
              <th scope="col">Sniper</th>
              <th scope="col">Free Look</th>
            </tr>
          </thead>
          <tbody>
            {RAM_ROWS.map((row) => (
              <tr key={row.ram}>
                <th scope="row">
                  <i className={`fa-solid ${row.icon}`} aria-hidden /> {row.ram}
                </th>
                <td>{row.general}</td>
                <td>{row.redDot}</td>
                <td>{row.scope2x}</td>
                <td>{row.scope4x}</td>
                <td>{row.sniper}</td>
                <td>{row.freeLook}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="ff-compare-note">
        <i className="fa-solid fa-circle-info" aria-hidden /> Tip: Lower RAM → keep sensitivity a bit
        higher. High-end phones usually need slightly lower values.
      </p>
    </section>
  );
}
