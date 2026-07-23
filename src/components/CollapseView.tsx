/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CollapseSensor } from "../types";
import { COLLAPSE_SENSORS, ZONES } from "../data";
import { Compass, AlertTriangle, ShieldCheck, HelpCircle, Activity, TrendingUp } from "lucide-react";

export default function CollapseView() {
  const sensors = COLLAPSE_SENSORS;

  // Calculators
  const total = sensors.length;
  const normal = sensors.filter((s) => s.status === "NORMAL").length;
  const warning = sensors.filter((s) => s.status === "WARNING").length;
  const danger = sensors.filter((s) => s.status === "DANGER").length;

  const getZoneName = (zoneId: string) => {
    const found = ZONES.find((z) => z.id === zoneId);
    return found ? found.name : zoneId;
  };

  // 🧭 Custom SVG half-dial gauge drawing
  const renderHalfDial = (val: number, maxVal: number) => {
    const r = 24;
    const cx = 32;
    const cy = 32;

    const angleRange = 180; // half circle representation
    const ratio = Math.min(1.0, val / maxVal);
    const activeAngle = ratio * angleRange; // angle of needle in deg

    // Cartesian coordinates trigonometry mapping
    const needleRad = (activeAngle - 180) * (Math.PI / 180);
    const needleX = cx + r * Math.cos(needleRad);
    const needleY = cy + r * Math.sin(needleRad);

    let statusColor = "#00c853"; // Normal
    if (val >= 0.8) statusColor = "#e03030"; // Danger
    else if (val >= 0.4) statusColor = "#d4780a"; // Warning

    return (
      <svg width="64" height="40" className="overflow-visible select-none">
        {/* Guage background arcs */}
        <path
          d="M 8 32 A 24 24 0 0 1 56 32"
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Active progress arc */}
        <path
          d="M 8 32 A 24 24 0 0 1 56 32"
          fill="none"
          stroke={statusColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${activeAngle * 0.418}, 100`} // length mapped to half path
        />
        {/* Indicator Center Anchor */}
        <circle cx={cx} cy={cy} r="3" fill="#fff" />
        {/* Pointer Needle indicator */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  // Multi-inclinometer 24-Hour curves diagram (Bottom SVG)
  const renderDisplacementCurves = () => {
    const W = 620;
    const H = 110;
    const P = 30;

    // Line palettes
    const lineColors = ["#4f46e5", "#a855f7", "#eab308", "#ef4444"];

    return (
      <svg width="100%" height={H} className="overflow-visible select-none">
        {/* Horizontal references */}
        <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="var(--border)" strokeWidth="1" />
        <line x1={P} y1={P} x2={W - P} y2={P} stroke="#e03030" strokeWidth="1" strokeDasharray="3,3" />
        <text x={W - P - 40} y={P - 4} fill="#e03030" fontSize="8" className="font-mono font-bold">
          대피 위험선 (0.50°)
        </text>

        {sensors.map((s, idx) => {
          const points = Array.from({ length: 24 }, (_, i) => {
            const timeOsc = 0.5 + Math.sin(i * 0.4 + idx) * 0.2 + (Math.random() - 0.5) * 0.05;
            const computedVal = s.value * timeOsc;

            const x = P + (i / 23) * (W - P * 2);
            const y = H - P - (computedVal / 1.0) * (H - P * 2); // mapped max limit 1.0°

            return { x, y };
          });

          const pointsStr = points.map((p) => `${p.x},${p.y}`).join(" ");

          return (
            <g key={s.id} className="group">
              <polyline
                points={pointsStr}
                fill="none"
                stroke={lineColors[idx]}
                strokeWidth={s.id === "CS-003" ? "2" : "1.2"} // Bold CS-003 (Danger Inclinometer)
                className="transition-all hover:stroke-white cursor-pointer"
              />
              <circle
                cx={points[23].x}
                cy={points[23].y}
                r="3"
                fill={lineColors[idx]}
              />
            </g>
          );
        })}

        {/* Dynamic labels */}
        <text x={P - 10} y={H - P + 3} fill="var(--text-muted)" fontSize="8" textAnchor="end">0.00°</text>
        <text x={P - 10} y={P + 4} fill="var(--text-muted)" fontSize="8" textAnchor="end">1.00°</text>
      </svg>
    );
  };

  return (
    <div className="space-y-4 page-transition">
      {/* 🧭 Summary banner rows */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-panel border border-border-main p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-dim font-mono block">붕괴 거동 진단센서</span>
            <span className="text-xl font-display font-black text-text-main mt-0.5">{total}개</span>
          </div>
          <Compass className="w-8 h-8 text-cyan opacity-40 animate-spin" style={{ animationDuration: "10s" }} />
        </div>

        <div className="bg-panel border border-border-main p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-dim font-mono block">안심 진동정상</span>
            <span className="text-xl font-display font-black text-green mt-0.5">{normal}개</span>
          </div>
          <ShieldCheck className="w-8 h-8 text-green opacity-40" />
        </div>

        <div className="bg-panel border border-border-main p-4 rounded-xl flex items-center justify-between text-orange">
          <div>
            <span className="text-[10px] text-text-dim font-mono block">일탈 주의계측</span>
            <span className="text-xl font-display font-black text-orange mt-0.5">{warning}개</span>
          </div>
          <AlertTriangle className="w-8 h-8 text-orange opacity-40 animate-bounce" />
        </div>

        <div className="bg-panel border border-border-main p-4 rounded-xl flex items-center justify-between text-red">
          <div>
            <span className="text-[10px] text-text-dim font-mono block">사면 붕괴 위험</span>
            <span className="text-xl font-display font-black text-red mt-0.5 animate-pulse">{danger}개</span>
          </div>
          <AlertTriangle className="w-8 h-8 text-red opacity-40 animate-ping" />
        </div>
      </div>

      {/* Grid containing CS inclinometer cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sensors.map((s) => {
          const isDanger = s.status === "DANGER";
          const ratioRatio = (s.value / s.threshold) * 100;

          let displayColor = "text-green";
          let limitBarColor = "bg-green";
          let flashClass = "";

          if (isDanger) {
            displayColor = "text-red";
            limitBarColor = "bg-red";
            flashClass = "animate-blink font-extrabold";
          } else if (s.status === "WARNING") {
            displayColor = "text-orange animate-pulse";
            limitBarColor = "bg-orange";
          }

          return (
            <div
              key={s.id}
              className="bg-card border border-border-main rounded-xl p-4 flex items-center justify-between hover:border-cyan/50 transition-all shadow-md hover:shadow-cyan/5 gap-4"
            >
              {/* Left textual properties */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-outer px-1.5 py-0.5 rounded text-cyan border border-border-dim font-mono">{s.id}</span>
                  <span className="text-xs font-bold text-text-main">{s.location} 토질 사면계</span>
                </div>
                <p className="text-[11px] text-text-dim">구역: {getZoneName(s.zoneId)}</p>

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-text-dim block font-mono">
                    경도 오차: <span className={`${displayColor} ${flashClass}`}>{s.value}°</span> / 임계한계: {s.threshold}°
                  </span>
                  {/* Linear mini percent bar */}
                  <div className="w-full bg-outer h-1 rounded-full overflow-hidden border border-border-dim">
                    <div
                      style={{ width: `${Math.min(100, ratioRatio)}%` }}
                      className={`h-full ${limitBarColor}`}
                    />
                  </div>
                </div>

                <div className="text-[9px] text-text-dim font-mono">
                  동기 데이터 수신: 금일 {s.lastUpdate}
                </div>
              </div>

              {/* Right graphical Dial Gauge */}
              <div className="flex flex-col items-center shrink-0">
                {renderHalfDial(s.value, s.threshold)}
                <span className="text-[10px] font-mono font-bold text-text-sub mt-1">
                  Displ. Angle
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Displacement historical Curve Panel (SVG lines below) */}
      <div className="bg-panel border border-border-main rounded-xl p-5 space-y-3.5">
        <div className="flex items-center justify-between border-b border-border-main pb-2">
          <div className="flex items-center gap-2">
            <Activity className="text-cyan w-4 h-4 animate-pulse" />
            <h4 className="font-bold text-xs text-text-main">
              남양주 왕숙 흙막이 지반 가속 변위 4채널 합성 추이 그래프 (24H)
            </h4>
          </div>
          <span className="text-[10px] text-text-sub flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-cyan" /> 0.01° 단위 정밀 추적
          </span>
        </div>

        {/* SVGLines graph drawing inside custom dynamic responsive layout */}
        <div className="bg-card/40 border border-border-dim p-3 rounded-lg flex items-center justify-center">
          {renderDisplacementCurves()}
        </div>

        {/* Legend block bar */}
        <div className="flex flex-wrap justify-center gap-4 text-[10px] font-mono text-text-dim">
          <span className="flex items-center gap-1.5 font-bold"><span className="w-2.5 h-2.5 rounded bg-[#4f46e5]"></span> CS-001 (흙막이A-1)</span>
          <span className="flex items-center gap-1.5 font-bold"><span className="w-2.5 h-2.5 rounded bg-[#a855f7]"></span> CS-002 (흙막이A-2)</span>
          <span className="flex items-center gap-1.5 font-bold"><span className="w-2.5 h-2.5 rounded bg-[#eab308]"></span> CS-003 (흙막이B-1: 위험)</span>
          <span className="flex items-center gap-1.5 font-bold"><span className="w-2.5 h-2.5 rounded bg-[#ef4444]"></span> CS-004 (흙막이C-1)</span>
        </div>
      </div>
    </div>
  );
}
