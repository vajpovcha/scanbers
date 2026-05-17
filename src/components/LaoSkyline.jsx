/**
 * Lao landmarks silhouette — used as a decorative backdrop over the blue hero gradient.
 *
 * Layout (left → right):
 *   1. ທົ່ງໄຫຫິນ (Plain of Jars)        — far left, foreground
 *   2. ວັດພູ (Wat Phou)                  — left-center
 *   3. ພະທາດຫຼວງ (Pha That Luang)        — CENTER (largest, most prominent)
 *   4. ປະຕູໄຊ (Patuxai)                  — right of center
 *   5. Side temple + decorative stupas   — right
 *   6. Layered mountains                 — background depth
 *
 * Rendered in pure white at varying opacities so the colour is dictated by the parent gradient.
 * Parent must be `relative overflow-hidden`.
 */
export default function LaoSkyline({ className = '' }) {
  return (
    <svg
      viewBox="0 0 1200 280"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* ── BACKGROUND: layered mountains ───────────────────── */}
      <path
        d="M0,280 L0,150 Q120,120 240,135 T480,128 T720,132 T960,125 T1200,135 L1200,280 Z"
        fill="white" opacity="0.06"
      />
      <path
        d="M0,280 L0,180 Q150,165 320,180 T640,178 T960,182 T1200,175 L1200,280 Z"
        fill="white" opacity="0.10"
      />

      {/* ── 1. PLAIN OF JARS (ທົ່ງໄຫຫິນ) — far left ─────────── */}
      <g transform="translate(80,280)">
        {/* Background tall jar */}
        <g fill="white" opacity="0.20">
          <path d="M-58,-2 L-60,-44 Q-60,-50 -55,-52 L-37,-52 Q-32,-50 -32,-44 L-30,-2 Z" />
          <ellipse cx="-45" cy="-52" rx="13" ry="3.5" />
          <ellipse cx="-45" cy="-50" rx="8" ry="2" fill="rgba(0,40,104,0.6)" />
        </g>
        {/* Mid jar — tilted slightly */}
        <g fill="white" opacity="0.24" transform="rotate(-6)">
          <path d="M-15,0 L-18,-38 Q-18,-44 -13,-46 L8,-46 Q13,-44 13,-38 L10,0 Z" />
          <ellipse cx="-2.5" cy="-46" rx="15" ry="4" />
          <ellipse cx="-2.5" cy="-44" rx="10" ry="2.3" fill="rgba(0,40,104,0.6)" />
        </g>
        {/* Small upright jar */}
        <g fill="white" opacity="0.22">
          <path d="M25,0 L23,-22 Q23,-27 27,-28 L41,-28 Q45,-27 45,-22 L43,0 Z" />
          <ellipse cx="34" cy="-28" rx="11" ry="3" />
          <ellipse cx="34" cy="-26.5" rx="7" ry="1.6" fill="rgba(0,40,104,0.6)" />
        </g>
        {/* Tiny jar far back */}
        <g fill="white" opacity="0.16">
          <path d="M62,0 L61,-18 Q61,-22 64,-22 L74,-22 Q77,-22 77,-18 L76,0 Z" />
          <ellipse cx="69" cy="-22" rx="8" ry="2.2" />
        </g>
      </g>

      {/* ── 2. WAT PHOU (ວັດພູ) — left center ───────────────── */}
      <g transform="translate(280,280)" fill="white" opacity="0.26">
        {/* Long sandstone base */}
        <rect x="-95" y="-55" width="190" height="55" />
        {/* Stepped pedestal underneath */}
        <rect x="-105" y="-50" width="220" height="5" opacity="0.6" />
        {/* Central pyramidal roof (iconic Wat Phou pointed top) */}
        <path d="M-40,-55 L-30,-72 L0,-130 L30,-72 L40,-55 Z" />
        {/* Decorative ridge below pyramid */}
        <path d="M-45,-55 L-40,-65 L40,-65 L45,-55 Z" opacity="0.8" />
        {/* Side smaller pyramids */}
        <path d="M-80,-55 L-72,-72 L-64,-55 Z" />
        <path d="M64,-55 L72,-72 L80,-55 Z" />
        {/* Door */}
        <rect x="-8" y="-40" width="16" height="40" fill="rgba(0,40,104,0.65)" />
        {/* Windows */}
        <rect x="-65" y="-35" width="6" height="14" fill="rgba(0,40,104,0.5)" />
        <rect x="-45" y="-35" width="6" height="14" fill="rgba(0,40,104,0.5)" />
        <rect x="39" y="-35" width="6" height="14" fill="rgba(0,40,104,0.5)" />
        <rect x="59" y="-35" width="6" height="14" fill="rgba(0,40,104,0.5)" />
      </g>

      {/* ── 3. PHA THAT LUANG (ພະທາດຫຼວງ) — CENTER ──────────── */}
      <g transform="translate(600,280)" fill="white" opacity="0.34">
        {/* Outer cloister wall — wide square base */}
        <rect x="-140" y="-32" width="280" height="32" />
        <rect x="-145" y="-37" width="290" height="5" opacity="0.7" />

        {/* Second-tier square base */}
        <rect x="-115" y="-58" width="230" height="26" />

        {/* Ring of small surrounding stupas (32 traditional — render 12 visible) */}
        {[-125, -103, -81, -59, -37, -15, 15, 37, 59, 81, 103, 125].map((x, i) => (
          <g key={i} transform={`translate(${x},-58)`}>
            <rect x="-2.5" y="-12" width="5" height="12" />
            <path d="M-3.5,-12 L0,-22 L3.5,-12 Z" />
            <rect x="-0.6" y="-26" width="1.2" height="4" />
          </g>
        ))}

        {/* Inner platform (mid-level) */}
        <rect x="-75" y="-88" width="150" height="30" />

        {/* Lotus petal base of the bulb */}
        <path d="M-65,-88 L-55,-98 L55,-98 L65,-88 Z" />

        {/* Main stupa bulb — curved sides like a bell/lotus bud */}
        <path d="M-52,-98 Q-50,-118 -38,-128 Q-25,-138 0,-138 Q25,-138 38,-128 Q50,-118 52,-98 Z" />

        {/* Decorative collar above bulb */}
        <rect x="-22" y="-145" width="44" height="7" />
        <path d="M-28,-145 L-22,-152 L22,-152 L28,-145 Z" />

        {/* Lotus throne (square decorated section) */}
        <rect x="-17" y="-165" width="34" height="13" />
        <path d="M-20,-165 L-17,-170 L17,-170 L20,-165 Z" />

        {/* Tall stepped spire — 4 tiers narrowing upward */}
        <rect x="-14" y="-185" width="28" height="20" />
        <rect x="-11" y="-202" width="22" height="17" />
        <rect x="-8" y="-216" width="16" height="14" />
        <rect x="-5.5" y="-228" width="11" height="12" />

        {/* Pointed conical top */}
        <path d="M0,-228 L-5,-244 L5,-244 Z" />

        {/* Finial — small disc + spike */}
        <rect x="-1" y="-258" width="2" height="14" />
        <circle cx="0" cy="-260" r="3" />
        <rect x="-0.5" y="-268" width="1" height="8" />
      </g>

      {/* ── 4. PATUXAI (ປະຕູໄຊ) — right of center ──────────── */}
      <g transform="translate(870,280)" fill="white" opacity="0.30">
        {/* Wide base platform */}
        <rect x="-75" y="-15" width="150" height="15" />

        {/* Lower body */}
        <rect x="-65" y="-65" width="130" height="50" />

        {/* Mid body with arched opening */}
        <rect x="-65" y="-115" width="130" height="50" />
        {/* Central arch opening */}
        <path d="M-25,-65 L-25,-95 Q-25,-110 0,-110 Q25,-110 25,-95 L25,-65 Z" fill="rgba(0,40,104,0.6)" />

        {/* Horizontal decorative bands */}
        <rect x="-65" y="-68" width="130" height="3" opacity="0.5" />
        <rect x="-72" y="-120" width="144" height="5" opacity="0.8" />

        {/* Upper body (narrower) */}
        <rect x="-55" y="-150" width="110" height="30" />
        {/* Second arch (smaller) */}
        <rect x="-15" y="-145" width="30" height="20" fill="rgba(0,40,104,0.5)" />

        {/* Top platform */}
        <rect x="-62" y="-158" width="124" height="8" opacity="0.85" />

        {/* 4 corner stupa towers (Patuxai's signature) */}
        <g>
          {/* Far left tower */}
          <rect x="-58" y="-180" width="14" height="22" />
          <path d="M-56,-180 L-51,-195 L-46,-180 Z" />
          <rect x="-52" y="-205" width="2" height="10" />
          {/* Inner left tower */}
          <rect x="-32" y="-178" width="10" height="20" />
          <path d="M-30,-178 L-27,-190 L-24,-178 Z" />
          {/* Inner right tower */}
          <rect x="22" y="-178" width="10" height="20" />
          <path d="M24,-178 L27,-190 L30,-178 Z" />
          {/* Far right tower */}
          <rect x="44" y="-180" width="14" height="22" />
          <path d="M46,-180 L51,-195 L56,-180 Z" />
          <rect x="50" y="-205" width="2" height="10" />
        </g>

        {/* Central pyramidal spire (tallest) */}
        <rect x="-12" y="-180" width="24" height="6" />
        <path d="M-12,-180 L0,-215 L12,-180 Z" />
        <rect x="-3" y="-225" width="6" height="10" />
        <path d="M0,-225 L-4,-235 L4,-235 Z" />
        <rect x="-0.6" y="-248" width="1.2" height="13" />
        <circle cx="0" cy="-250" r="2.5" />
      </g>

      {/* ── 5. Side temple — far right ──────────────────────── */}
      <g transform="translate(1080,280)" fill="white" opacity="0.22">
        {/* Body */}
        <rect x="-45" y="-50" width="90" height="50" />
        {/* Multi-tier roof */}
        <path d="M-52,-50 L-32,-65 L32,-65 L52,-50 Z" />
        <path d="M-40,-65 L-22,-78 L22,-78 L40,-65 Z" />
        <path d="M-28,-78 L-14,-90 L14,-90 L28,-78 Z" />
        <path d="M-18,-90 L-8,-100 L8,-100 L18,-90 Z" />
        {/* Finial */}
        <rect x="-1" y="-110" width="2" height="10" />
        <circle cx="0" cy="-113" r="2.5" />
        {/* Door */}
        <rect x="-7" y="-32" width="14" height="32" fill="rgba(0,40,104,0.6)" />
        {/* Side windows */}
        <rect x="-32" y="-30" width="5" height="13" fill="rgba(0,40,104,0.5)" />
        <rect x="27" y="-30" width="5" height="13" fill="rgba(0,40,104,0.5)" />
      </g>

      {/* ── 6. Small decorative jar — far right edge ────────── */}
      <g transform="translate(1170,280)" fill="white" opacity="0.20">
        <path d="M-12,0 L-13,-26 Q-13,-31 -9,-32 L7,-32 Q11,-31 11,-26 L10,0 Z" />
        <ellipse cx="-1" cy="-32" rx="12" ry="3" />
        <ellipse cx="-1" cy="-30" rx="8" ry="1.7" fill="rgba(0,40,104,0.6)" />
      </g>
    </svg>
  )
}
