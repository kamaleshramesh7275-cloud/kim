"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export type BodyPartId =
  | "neck"
  | "shoulder"
  | "elbow"
  | "wrist"
  | "back"
  | "hamstring"
  | "knee"
  | "ankle";

export interface BodyPartStatus {
  id: BodyPartId;
  name: string;
  status: "healthy" | "risk" | "injured";
  severity: "low" | "medium" | "high";
  riskScore: number;
  recoveryDays: number;
  exercises: string[];
  recommendation: string;
  visibleOn: "front" | "back" | "both";
}

interface HolographicAvatarProps {
  partStates: Record<BodyPartId, BodyPartStatus>;
  selectedPartId: BodyPartId | null;
  onSelectPart: (partId: BodyPartId) => void;
}

/* ─────────────────────────────────────────────
   Color Legend (medical heatmap standard)
   ───────────────────────────────────────────── */
const STATUS_FILL: Record<string, string> = {
  injured: "url(#grad-injured)",
  risk:    "url(#grad-risk)",
  healthy: "url(#grad-healthy)",
};

const STATUS_STROKE: Record<string, string> = {
  injured: "#ff4d4d",
  risk:    "#ffd700",
  healthy: "#86efac",
};

/* ─────────────────────────────────────────────
   Anatomical Region Definitions
   
   All paths drawn for a 1024×1024 viewBox
   matching the avatar_dark.png dual-view image.
   
   Front (anterior) figure center ≈ x:248
   Back  (posterior) figure center ≈ x:768
   ───────────────────────────────────────────── */

interface RegionDef {
  id: BodyPartId;
  view: "front" | "back";
  label: string;
  d: string;
}

const BX = 520; // x-offset from front→back figure

/* ── FRONT (Anterior) Paths ── */
const FRONT_REGIONS: RegionDef[] = [
  /* Neck — trapezoidal column, skull-base to shoulder-line */
  {
    id: "neck", view: "front", label: "Neck",
    d: `M 234,114
        C 234,110 262,110 262,114
        L 268,150
        Q 268,158 248,158
        Q 228,158 228,150
        Z`,
  },

  /* Left Deltoid (Shoulder) — cap-shaped muscle over shoulder joint */
  {
    id: "shoulder", view: "front", label: "L Shoulder",
    d: `M 196,156
        C 186,148 165,150 158,166
        C 150,182 148,200 152,214
        L 164,220
        L 186,212
        C 192,198 195,180 196,168
        Z`,
  },
  /* Right Deltoid */
  {
    id: "shoulder", view: "front", label: "R Shoulder",
    d: `M 300,156
        C 310,148 331,150 338,166
        C 346,182 348,200 344,214
        L 332,220
        L 310,212
        C 304,198 301,180 300,168
        Z`,
  },

  /* Left Elbow — oval region around joint */
  {
    id: "elbow", view: "front", label: "L Elbow",
    d: `M 132,305
        C 126,315 124,328 126,340
        C 128,352 134,360 142,362
        C 150,362 158,354 160,340
        C 162,328 160,315 156,305
        C 150,296 138,296 132,305
        Z`,
  },
  /* Right Elbow */
  {
    id: "elbow", view: "front", label: "R Elbow",
    d: `M 364,305
        C 370,315 372,328 370,340
        C 368,352 362,360 354,362
        C 346,362 338,354 336,340
        C 334,328 336,315 340,305
        C 346,296 358,296 364,305
        Z`,
  },

  /* Left Wrist — small oval */
  {
    id: "wrist", view: "front", label: "L Wrist",
    d: `M 115,456
        C 110,464 108,476 110,486
        C 112,494 118,500 126,500
        C 134,500 140,494 142,486
        C 144,476 142,464 138,456
        C 134,448 120,448 115,456
        Z`,
  },
  /* Right Wrist */
  {
    id: "wrist", view: "front", label: "R Wrist",
    d: `M 381,456
        C 386,464 388,476 386,486
        C 384,494 378,500 370,500
        C 362,500 356,494 354,486
        C 352,476 354,464 358,456
        C 362,448 376,448 381,456
        Z`,
  },

  /* Left Quadriceps + Patella (front thigh → knee) */
  {
    id: "knee", view: "front", label: "L Quad",
    d: `M 202,468
        C 200,464 212,460 224,460
        L 238,460
        C 242,464 244,472 244,480
        L 246,540
        C 248,580 248,620 246,658
        L 244,685
        C 240,700 234,712 224,718
        L 216,718
        C 208,712 202,700 198,685
        L 196,658
        C 194,620 194,580 196,540
        L 198,480
        C 198,472 200,466 202,468
        Z`,
  },
  /* Right Quadriceps + Patella */
  {
    id: "knee", view: "front", label: "R Quad",
    d: `M 258,460
        L 272,460
        C 284,460 296,464 298,468
        C 300,472 302,480 302,488
        L 304,540
        C 306,580 306,620 304,658
        L 302,685
        C 298,700 292,712 282,718
        L 274,718
        C 264,712 258,700 254,685
        L 252,658
        C 250,620 250,580 252,540
        L 254,488
        C 254,476 256,464 258,460
        Z`,
  },

  /* Left Ankle — lower shin + ankle joint area */
  {
    id: "ankle", view: "front", label: "L Ankle",
    d: `M 214,848
        C 210,858 208,872 210,885
        C 212,898 218,908 226,910
        C 234,910 240,898 242,885
        C 244,872 242,858 238,848
        C 234,838 220,838 214,848
        Z`,
  },
  /* Right Ankle */
  {
    id: "ankle", view: "front", label: "R Ankle",
    d: `M 262,848
        C 258,858 256,872 258,885
        C 260,898 266,908 274,910
        C 282,910 288,898 290,885
        C 292,872 290,858 286,848
        C 282,838 268,838 262,848
        Z`,
  },
];

/* ── BACK (Posterior) Paths ── */
// Helper: offset a path string's x-coordinates by BX
function offsetPath(d: string, ox: number): string {
  // Match all numbers in the path, tracking position to identify x vs y
  // Strategy: parse M, L, C, Q, Z commands and offset x values
  const tokens = d.match(/[MLCQZ]|[-+]?\d+(?:\.\d+)?/gi) || [];
  const result: string[] = [];
  let cmd = "";
  let paramIdx = 0;

  for (const token of tokens) {
    if (/^[MLCQZ]$/i.test(token)) {
      cmd = token.toUpperCase();
      paramIdx = 0;
      result.push(token);
    } else {
      const num = parseFloat(token);
      if (cmd === "Z") {
        result.push(token);
      } else {
        // For M, L: pairs (x,y) → offset every even index (0,2,4…)
        // For C: triples of pairs (x1,y1, x2,y2, x,y) → offset indices 0,2,4
        // For Q: pairs (x1,y1, x,y) → offset indices 0,2
        const isX = paramIdx % 2 === 0;
        result.push(String(isX ? num + ox : num));
        paramIdx++;
      }
    }
  }

  return result.join(" ");
}

const BACK_REGIONS: RegionDef[] = [
  /* Neck */
  {
    id: "neck", view: "back", label: "Neck",
    d: offsetPath(FRONT_REGIONS[0].d, BX),
  },
  /* Left Shoulder */
  {
    id: "shoulder", view: "back", label: "L Shoulder",
    d: offsetPath(FRONT_REGIONS[1].d, BX),
  },
  /* Right Shoulder */
  {
    id: "shoulder", view: "back", label: "R Shoulder",
    d: offsetPath(FRONT_REGIONS[2].d, BX),
  },
  /* Left Elbow */
  {
    id: "elbow", view: "back", label: "L Elbow",
    d: offsetPath(FRONT_REGIONS[3].d, BX),
  },
  /* Right Elbow */
  {
    id: "elbow", view: "back", label: "R Elbow",
    d: offsetPath(FRONT_REGIONS[4].d, BX),
  },
  /* Left Wrist */
  {
    id: "wrist", view: "back", label: "L Wrist",
    d: offsetPath(FRONT_REGIONS[5].d, BX),
  },
  /* Right Wrist */
  {
    id: "wrist", view: "back", label: "R Wrist",
    d: offsetPath(FRONT_REGIONS[6].d, BX),
  },

  /* ── Back-only regions ── */

  /* Upper & Lower Back (Thoracolumbar region) — large area over spine */
  {
    id: "back", view: "back", label: "Back",
    d: `M ${722},192
        C ${730},184 ${806},184 ${814},192
        L ${822},280
        C ${826},330 ${826},385 ${822},430
        L ${814},448
        C ${806},456 ${730},456 ${722},448
        L ${714},430
        C ${710},385 ${710},330 ${714},280
        Z`,
  },

  /* Left Hamstring — entire back-of-thigh muscle */
  {
    id: "hamstring", view: "back", label: "L Hamstring",
    d: `M ${720},472
        C ${718},466 ${730},462 ${742},462
        L ${754},462
        C ${758},466 ${760},474 ${760},482
        L ${762},540
        C ${764},578 ${764},618 ${762},655
        L ${760},682
        C ${756},698 ${750},710 ${742},716
        L ${732},716
        C ${724},710 ${718},698 ${714},682
        L ${712},655
        C ${710},618 ${710},578 ${712},540
        L ${714},482
        C ${714},474 ${716},466 ${720},472
        Z`,
  },
  /* Right Hamstring */
  {
    id: "hamstring", view: "back", label: "R Hamstring",
    d: `M ${776},462
        L ${790},462
        C ${800},462 ${812},466 ${814},472
        C ${816},478 ${818},486 ${818},494
        L ${820},540
        C ${822},578 ${822},618 ${820},655
        L ${818},682
        C ${814},698 ${808},710 ${798},716
        L ${790},716
        C ${780},710 ${774},698 ${770},682
        L ${768},655
        C ${766},618 ${766},578 ${768},540
        L ${770},494
        C ${770},486 ${772},478 ${776},462
        Z`,
  },

  /* Left Ankle (back) */
  {
    id: "ankle", view: "back", label: "L Ankle",
    d: offsetPath(FRONT_REGIONS[9].d, BX),
  },
  /* Right Ankle (back) */
  {
    id: "ankle", view: "back", label: "R Ankle",
    d: offsetPath(FRONT_REGIONS[10].d, BX),
  },
];

const ALL_REGIONS = [...FRONT_REGIONS, ...BACK_REGIONS];

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */
export function HolographicAvatar({
  partStates,
  selectedPartId,
  onSelectPart,
}: HolographicAvatarProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  /* Zoom / Pan handlers */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };
  const handleMouseUp = () => setIsDragging(false);

  const zoomIn = () => setZoom((p) => Math.min(p + 0.25, 3));
  const zoomOut = () =>
    setZoom((p) => {
      const n = Math.max(p - 0.25, 1);
      if (n === 1) setPan({ x: 0, y: 0 });
      return n;
    });
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  /* Status → color */
  const getColor = (id: BodyPartId): string => {
    const s = partStates[id]?.status ?? "healthy";
    return STATUS_FILL[s] ?? STATUS_FILL.healthy;
  };



  return (
    <div
      className="relative w-full h-[620px] rounded-3xl border border-white/5 overflow-hidden select-none"
      style={{ background: "#050508" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* ── Top HUD ── */}
      <div className="absolute top-3 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.22em] text-white/30 uppercase bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          AI Anatomy Scan — Dual View
        </div>
        <div className="flex gap-1.5 pointer-events-auto">
          <button
            onClick={zoomIn}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 transition-all border border-white/5 cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={zoomOut}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 transition-all border border-white/5 cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 transition-all border border-white/5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div
        className={`w-full h-full flex items-center justify-center ${
          zoom > 1 ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      >
        <motion.div
          style={{ scale: zoom, x: pan.x, y: pan.y }}
          className="origin-center"
        >
          <svg
            viewBox="0 0 1024 1024"
            className="w-auto h-[580px]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Premium Thermal Internal Gradients */}
              <radialGradient id="grad-injured" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff4d4d" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#ff0000" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#800000" stopOpacity="0.4" />
              </radialGradient>
              <radialGradient id="grad-risk" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffd700" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#ff8c00" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#993300" stopOpacity="0.35" />
              </radialGradient>
              <radialGradient id="grad-healthy" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a3e635" stopOpacity="0.65" />
                <stop offset="50%" stopColor="#22c55e" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#064e3b" stopOpacity="0.15" />
              </radialGradient>

              {/* Subtle edge-glow filter — only adds a thin luminous border */}
              <filter id="edge-glow-red" x="-8%" y="-8%" width="116%" height="116%">
                <feMorphology operator="dilate" radius="1.5" in="SourceAlpha" result="expanded" />
                <feGaussianBlur in="expanded" stdDeviation="3" result="blurred" />
                <feFlood floodColor="#FF2B2B" floodOpacity="0.5" result="color" />
                <feComposite in="color" in2="blurred" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="edge-glow-orange" x="-8%" y="-8%" width="116%" height="116%">
                <feMorphology operator="dilate" radius="1.2" in="SourceAlpha" result="expanded" />
                <feGaussianBlur in="expanded" stdDeviation="2.5" result="blurred" />
                <feFlood floodColor="#FFA500" floodOpacity="0.45" result="color" />
                <feComposite in="color" in2="blurred" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="edge-glow-green" x="-6%" y="-6%" width="112%" height="112%">
                <feMorphology operator="dilate" radius="1" in="SourceAlpha" result="expanded" />
                <feGaussianBlur in="expanded" stdDeviation="2" result="blurred" />
                <feFlood floodColor="#32CD32" floodOpacity="0.35" result="color" />
                <feComposite in="color" in2="blurred" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Selected-state filter: white outer ring */}
              <filter id="selected-ring" x="-12%" y="-12%" width="124%" height="124%">
                <feMorphology operator="dilate" radius="2.5" in="SourceAlpha" result="expanded" />
                <feGaussianBlur in="expanded" stdDeviation="4" result="blurred" />
                <feFlood floodColor="#ffffff" floodOpacity="0.55" result="color" />
                <feComposite in="color" in2="blurred" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base anatomical X-ray image */}
            <image
              href="/avatar_dark.png"
              x="0" y="0"
              width="1024" height="1024"
              preserveAspectRatio="xMidYMid meet"
            />

            {/* ── Solid-fill anatomical region overlays ── */}
            {ALL_REGIONS.map((region, idx) => {
              const status = partStates[region.id]?.status ?? "healthy";
              const color = getColor(region.id);
              const strokeColor = STATUS_STROKE[status] ?? STATUS_STROKE.healthy;
              const isSelected = selectedPartId === region.id;
              const isHovered = hoveredIdx === idx;

              // Determine edge-glow filter
              const filterMap: Record<string, string> = {
                injured: "url(#edge-glow-red)",
                risk:    "url(#edge-glow-orange)",
                healthy: "url(#edge-glow-green)",
              };
              const filter = isSelected
                ? "url(#selected-ring)"
                : filterMap[status];

              return (
                <path
                  key={`${region.id}-${region.view}-${idx}`}
                  d={region.d}
                  /* Thermal volume fill mapped to muscle bounds */
                  fill={color}
                  fillOpacity={isHovered ? 1 : 0.9}
                  /* Sharp, bright stroke for high-tech definition */
                  stroke={isSelected ? "#ffffff" : strokeColor}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  strokeOpacity={isSelected ? 1 : 0.65}
                  strokeLinejoin="round"
                  /* Subtle edge glow only (not body glow) */
                  filter={filter}
                  /* Interaction */
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPart(region.id);
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="cursor-pointer"
                  style={{
                    transition: "fill-opacity 0.2s ease, stroke-width 0.2s ease",
                    paintOrder: "stroke fill",
                    mixBlendMode: "screen",
                  }}
                />
              );
            })}

            {/* View Labels */}
            <text
              x="248" y="998"
              textAnchor="middle"
              fill="rgba(255,255,255,0.22)"
              fontSize="13" fontWeight="700"
              letterSpacing="5"
              fontFamily="system-ui,sans-serif"
            >
              ANTERIOR
            </text>
            <text
              x="768" y="998"
              textAnchor="middle"
              fill="rgba(255,255,255,0.22)"
              fontSize="13" fontWeight="700"
              letterSpacing="5"
              fontFamily="system-ui,sans-serif"
            >
              POSTERIOR
            </text>

            {/* Divider line between views */}
            <line
              x1="510" y1="28"
              x2="510" y2="985"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
              strokeDasharray="6 8"
            />
          </svg>
        </motion.div>
      </div>

      {/* ── Legend ── */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-3 z-10 bg-black/60 px-4 py-4 rounded-xl backdrop-blur-md border border-white/5">
        <div className="flex flex-col gap-2.5">
          {[
            { c: "#86efac", bg: "radial-gradient(circle, #a3e635 0%, #064e3b 100%)", l: "Healthy" },
            { c: "#ffd700", bg: "radial-gradient(circle, #ffd700 0%, #993300 100%)", l: "High Risk" },
            { c: "#ff4d4d", bg: "radial-gradient(circle, #ff4d4d 0%, #800000 100%)", l: "Injured" },
          ].map(({ c, bg, l }) => (
            <div key={l} className="flex items-center gap-2.5">
              <div
                className="w-3 h-3 rounded-sm border"
                style={{ background: bg, borderColor: c, boxShadow: `0 0 6px ${c}66` }}
              />
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">
                {l}
              </span>
            </div>
          ))}
        </div>
        <div className="text-[9px] text-white/30 font-medium pt-2 mt-1 border-t border-white/10 leading-tight">
          Click body regions<br />to inspect
        </div>
      </div>
    </div>
  );
}
