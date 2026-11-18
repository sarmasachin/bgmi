"use client";

import type { Gta6PageContent } from "@/src/lib/gta6PageTypes";
import { GtaAdd, GtaBlock, GtaField, GtaRemove } from "./gta6AdminFields";

type Patch = (updater: (page: Gta6PageContent) => Gta6PageContent) => void;

export function AdminGta6MapForm({ page, onPatch }: { page: Gta6PageContent; onPatch: Patch }) {
  const map = page.map;
  return (
    <>
      <GtaBlock title="Map text">
        <GtaField label="Title" value={map.title} onChange={(title) => onPatch((p) => ({ ...p, map: { ...p.map, title } }))} />
        <GtaField label="Lead" value={map.lead} multiline onChange={(lead) => onPatch((p) => ({ ...p, map: { ...p.map, lead } }))} />
        <GtaField label="State name" value={map.stateName} onChange={(stateName) => onPatch((p) => ({ ...p, map: { ...p.map, stateName } }))} />
        <GtaField
          label="State summary"
          value={map.stateSummary}
          multiline
          onChange={(stateSummary) => onPatch((p) => ({ ...p, map: { ...p.map, stateSummary } }))}
        />
        <GtaField
          label="Map disclaimer"
          value={map.disclaimer}
          multiline
          onChange={(disclaimer) => onPatch((p) => ({ ...p, map: { ...p.map, disclaimer } }))}
        />
        <GtaField label="Note" value={map.note} multiline onChange={(note) => onPatch((p) => ({ ...p, map: { ...p.map, note } }))} />
      </GtaBlock>

      <GtaBlock title="Cities and regions">
        {map.places.map((place, index) => (
          <div key={`place-${index}`} style={{ marginBottom: 12 }}>
            <GtaField
              label="Name"
              value={place.name}
              onChange={(name) =>
                onPatch((p) => ({
                  ...p,
                  map: { ...p.map, places: p.map.places.map((item, i) => (i === index ? { ...item, name } : item)) },
                }))
              }
            />
            <GtaField
              label="Type"
              value={place.type}
              onChange={(type) =>
                onPatch((p) => ({
                  ...p,
                  map: { ...p.map, places: p.map.places.map((item, i) => (i === index ? { ...item, type } : item)) },
                }))
              }
            />
            <GtaField
              label="Summary"
              value={place.summary}
              multiline
              onChange={(summary) =>
                onPatch((p) => ({
                  ...p,
                  map: { ...p.map, places: p.map.places.map((item, i) => (i === index ? { ...item, summary } : item)) },
                }))
              }
            />
            <GtaRemove
              onClick={() =>
                onPatch((p) => ({ ...p, map: { ...p.map, places: p.map.places.filter((_, i) => i !== index) } }))
              }
            />
          </div>
        ))}
        <GtaAdd
          label="Add place"
          onClick={() =>
            onPatch((p) => ({
              ...p,
              map: { ...p.map, places: [...p.map.places, { name: "", type: "", summary: "" }] },
            }))
          }
        />
      </GtaBlock>

      <GtaBlock title="Landmarks">
        {map.landmarks.map((spot, index) => (
          <div key={`mark-${index}`} style={{ marginBottom: 12 }}>
            <GtaField
              label="Name"
              value={spot.name}
              onChange={(name) =>
                onPatch((p) => ({
                  ...p,
                  map: {
                    ...p.map,
                    landmarks: p.map.landmarks.map((item, i) => (i === index ? { ...item, name } : item)),
                  },
                }))
              }
            />
            <GtaField
              label="Note"
              value={spot.note}
              multiline
              onChange={(note) =>
                onPatch((p) => ({
                  ...p,
                  map: {
                    ...p.map,
                    landmarks: p.map.landmarks.map((item, i) => (i === index ? { ...item, note } : item)),
                  },
                }))
              }
            />
            <GtaRemove
              onClick={() =>
                onPatch((p) => ({ ...p, map: { ...p.map, landmarks: p.map.landmarks.filter((_, i) => i !== index) } }))
              }
            />
          </div>
        ))}
        <GtaAdd
          label="Add landmark"
          onClick={() =>
            onPatch((p) => ({ ...p, map: { ...p.map, landmarks: [...p.map.landmarks, { name: "", note: "" }] } }))
          }
        />
      </GtaBlock>

      <GtaBlock title="Map pins (x and y are 0–100 on the image)">
        {map.pins.map((pin, index) => (
          <div key={pin.id || `pin-${index}`} style={{ marginBottom: 14 }}>
            <GtaField
              label="Name"
              value={pin.name}
              onChange={(name) =>
                onPatch((p) => ({
                  ...p,
                  map: { ...p.map, pins: p.map.pins.map((item, i) => (i === index ? { ...item, name } : item)) },
                }))
              }
            />
            <GtaField
              label="Type"
              value={pin.type}
              onChange={(type) =>
                onPatch((p) => ({
                  ...p,
                  map: { ...p.map, pins: p.map.pins.map((item, i) => (i === index ? { ...item, type } : item)) },
                }))
              }
            />
            <GtaField
              label="Region"
              value={pin.region}
              onChange={(region) =>
                onPatch((p) => ({
                  ...p,
                  map: { ...p.map, pins: p.map.pins.map((item, i) => (i === index ? { ...item, region } : item)) },
                }))
              }
            />
            <GtaField
              label="Summary"
              value={pin.summary}
              multiline
              onChange={(summary) =>
                onPatch((p) => ({
                  ...p,
                  map: { ...p.map, pins: p.map.pins.map((item, i) => (i === index ? { ...item, summary } : item)) },
                }))
              }
            />
            <GtaField
              label="X"
              value={String(pin.x)}
              onChange={(value) =>
                onPatch((p) => ({
                  ...p,
                  map: {
                    ...p.map,
                    pins: p.map.pins.map((item, i) => (i === index ? { ...item, x: Number(value) } : item)),
                  },
                }))
              }
            />
            <GtaField
              label="Y"
              value={String(pin.y)}
              onChange={(value) =>
                onPatch((p) => ({
                  ...p,
                  map: {
                    ...p.map,
                    pins: p.map.pins.map((item, i) => (i === index ? { ...item, y: Number(value) } : item)),
                  },
                }))
              }
            />
            <GtaRemove
              onClick={() => onPatch((p) => ({ ...p, map: { ...p.map, pins: p.map.pins.filter((_, i) => i !== index) } }))}
            />
          </div>
        ))}
        <GtaAdd
          label="Add pin"
          onClick={() =>
            onPatch((p) => ({
              ...p,
              map: {
                ...p.map,
                pins: [
                  ...p.map.pins,
                  { id: "", name: "", type: "", region: "", summary: "", x: 50, y: 50, zoom: 1 },
                ],
              },
            }))
          }
        />
      </GtaBlock>
    </>
  );
}
