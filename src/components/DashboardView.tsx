/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";
import { Zone, SafetyEvent, TbmItem } from "../types";
import { ZONES, HOURLY, MONTHLY, SENSORS } from "../data";
import { MapPin, AlertTriangle, ShieldAlert, Cpu, HardHat, ShieldCheck, Thermometer, CloudSun, Calendar } from "lucide-react";

interface DashboardViewProps {
  currentZoneFilter: string;
  setCurrentZoneFilter: (val: string) => void;
  events: SafetyEvent[];
  navigate: (page: string, params?: any) => void;
  tbmList?: TbmItem[];
  availableZones?: Zone[];
}

export default function DashboardView({
  currentZoneFilter,
  setCurrentZoneFilter,
  events,
  navigate,
  tbmList,
  availableZones
}: DashboardViewProps) {
  const [isSplitMode, setIsSplitMode] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInst = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  const zoneList = availableZones || ZONES;

  useEffect(() => {
    if (leafletInst.current) {
      setTimeout(() => {
        leafletInst.current.invalidateSize();
      }, 150);
    }
  }, [isSplitMode]);

  // Filtered zones based on selector
  const filteredZones = currentZoneFilter === "ALL" 
    ? zoneList 
    : zoneList.filter(z => z.id === currentZoneFilter);

  // Filtered events based on selector
  const filteredEvents = currentZoneFilter === "ALL"
    ? events.filter(e => zoneList.some(z => z.id === e.zoneId))
    : events.filter(e => e.zoneId === currentZoneFilter);

  const formatEventTime = (timeStr: string) => {
    if (!timeStr) return "";
    if (timeStr.includes(" ")) {
      const parts = timeStr.split(" ");
      return parts[parts.length - 1]; // "14:32"
    }
    if (timeStr.includes("오후") || timeStr.includes("오전")) {
      const match = timeStr.match(/(오후|오전)\s*(\d+):(\d+)/);
      if (match) {
        let hr = parseInt(match[2], 10);
        const min = match[3];
        if (match[1] === "오후" && hr < 12) hr += 12;
        if (match[1] === "오전" && hr === 12) hr = 0;
        return `${String(hr).padStart(2, "0")}:${min}`;
      }
    }
    const parts = timeStr.split(":");
    if (parts.length >= 2) {
      return `${parts[0].trim()}:${parts[1].trim()}`;
    }
    return timeStr;
  };

  const filteredActiveEvents = filteredEvents
    .filter(e => e.status === "ACTIVE")
    .slice()
    .sort((a, b) => b.time.localeCompare(a.time) || b.id.localeCompare(a.id));

  // Upper KPI totals:
  const totalWorkers = filteredZones.reduce((sum, z) => sum + z.workers, 0);
  const totalEvents = filteredEvents.filter(e => e.status === "ACTIVE").length;

  const getTbmRateStr = () => {
    const list = tbmList || [
      { id: "t1", zoneId: "z1", date: "2025-05-27", zone: "왕숙1구역", total: 142, completed: 139, rate: 97.9, manager: "김관수", time: "07:30" },
      { id: "t2", zoneId: "z2", date: "2025-05-27", zone: "왕숙2구역", total: 98, completed: 95, rate: 96.9, manager: "이현장", time: "07:45" },
      { id: "t3", zoneId: "z3", date: "2025-05-27", zone: "왕숙3구역", total: 115, completed: 108, rate: 93.9, manager: "최안전", time: "08:00" },
    ];
    if (currentZoneFilter === "ALL") {
      // Find latest TBM for each unique zone to calculate average completion rate of today/latest
      const uniqueZones = Array.from(new Set(list.map(t => t.zoneId)));
      const latestTbmPerZone = uniqueZones.map(zId => {
        const zoneTbms = list.filter(t => t.zoneId === zId);
        return zoneTbms.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))[0];
      }).filter(Boolean);

      if (latestTbmPerZone.length === 0) return "100.0%";
      const sum = latestTbmPerZone.reduce((acc, t) => acc + t.rate, 0);
      return (sum / latestTbmPerZone.length).toFixed(1) + "%";
    } else {
      const zoneTbms = list.filter(t => t.zoneId === currentZoneFilter);
      const latestTbm = zoneTbms.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))[0];
      if (latestTbm) return `${latestTbm.rate.toFixed(1)}%`;
      return "100.0%"; // default fallback
    }
  };
  const tbmRate = getTbmRateStr();

  const avgRisk = filteredZones.length > 0
    ? (filteredZones.reduce((sum, z) => sum + z.risk, 0) / filteredZones.length).toFixed(1)
    : "0.0";

  // Active hazards count in current view
  const activeEvents = events.filter(e => e.status === "ACTIVE");
  const criticalCount = activeEvents.filter(e => e.severity === "CRITICAL").length;
  const highCount = activeEvents.filter(e => e.severity === "HIGH").length;

  const filteredSensors = currentZoneFilter === "ALL" 
    ? SENSORS.filter(s => zoneList.some(z => z.id === s.zoneId))
    : SENSORS.filter(s => s.zoneId === currentZoneFilter);
  const disconnectedSensors = filteredSensors.filter(s => s.status === "OFFLINE").length;

  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    if (!leafletInst.current) {
      // 1. Initialize map
      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false
      }).setView([zoneList[0]?.lat || 37.6478, zoneList[0]?.lng || 127.2156], zoneList.length <= 2 ? 14 : 13);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      leafletInst.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    } else {
      leafletInst.current.invalidateSize();
    }

    // 2. Clear existing and set current markers
    const map = leafletInst.current;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    zoneList.forEach(z => {
      // Color depend of status
      let color = "#00c853"; // 보통
      if (z.status === "위험") color = "#e03030";
      else if (z.status === "주의") color = "#d4780a";

      const isActive = currentZoneFilter === "ALL" || currentZoneFilter === z.id;
      const opacity = isActive ? 1.0 : 0.3;

      const markerHtml = `
        <div style="opacity: ${opacity}; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="
            width: 32px; 
            height: 32px; 
            background: var(--bg-card); 
            border: 2px solid ${color}; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);"
          >
            <span style="color: ${color}; font-size: 10px; font-weight: bold;">${z.name.replace("구역", "")}</span>
          </div>
          <div style="
            background: var(--bg-elevated); 
            color: var(--text-primary); 
            font-size: 9px; 
            padding: 2px 6px; 
            border-radius: 6px; 
            border: 1px solid var(--border-default); 
            margin-top: 4px;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);"
          >
            ${z.company}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-leaflet-icon',
        iconSize: [60, 60],
        iconAnchor: [30, 30]
      });

      const activeEvtsForZone = events.filter(e => e.zoneId === z.id && e.status === "ACTIVE");

      const popupHtml = `
        <div class="p-2 text-xs font-sans text-text-main" style="min-width: 180px;">
          <div class="flex items-center justify-between border-b border-border/50 pb-1.5 mb-2">
            <span class="font-bold text-cyan text-sm">${z.name}</span>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold" style="background: ${color}20; color: ${color}">
              ${z.status}
            </span>
          </div>
          <p class="mb-1"><span class="text-text-sub">시공사:</span> ${z.company}</p>
          <p class="mb-1"><span class="text-text-sub">소장 연락처:</span> ${z.pm} (${z.tel})</p>
          <p class="mb-1"><span class="text-text-sub">출역 작업자:</span> ${z.workers}명</p>
          <p class="border-t border-border/30 pt-1.5 mt-1.5 font-semibold text-[10px] flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full ${activeEvtsForZone.length > 0 ? "bg-red animate-ping" : "bg-green"}"></span>
            미조치 경보: <span class="${activeEvtsForZone.length > 0 ? "text-red font-bold" : "text-green"}">${activeEvtsForZone.length}건</span>
          </p>
        </div>
      `;

      const marker = L.marker([z.lat, z.lng], { icon: customIcon }).addTo(markersGroup);
      marker.bindPopup(popupHtml);

      // Auto zoom/focus if select specific zone
      if (currentZoneFilter === z.id) {
        map.setView([z.lat, z.lng], 15);
        marker.openPopup();
      }
    });

    if (currentZoneFilter === "ALL") {
      map.setView([zoneList[0]?.lat || 37.6478, zoneList[0]?.lng || 127.2156], zoneList.length <= 2 ? 14 : 13);
    }

  }, [currentZoneFilter, events, zoneList]);

  // Hourly Chart SVG computations
  const maxHourlyVal = Math.max(...HOURLY, 1);
  const hourlyBars = HOURLY.map((val, idx) => {
    const barHeight = (val / maxHourlyVal) * 35; // max 35px height
    return (
      <div key={idx} className="flex-1 flex flex-col items-center justify-end h-10 group relative">
        {/* Tooltip */}
        <span className="absolute bottom-11 scale-0 group-hover:scale-100 transition-all bg-card border border-cyan/40 text-[9px] text-cyan px-1.5 py-0.5 rounded shadow-lg z-10 font-mono">
          {idx}시: {val}건
        </span>
        <div 
          style={{ height: `${barHeight}px` }} 
          className={`w-full rounded-t-sm transition-all duration-300 ${
            val > 8 ? "bg-red" : val > 5 ? "bg-orange" : "bg-cyan/80"
          } group-hover:opacity-100`}
        ></div>
        <span className="text-[8px] text-text-dim mt-1 font-mono">{idx}</span>
      </div>
    );
  });

  // Monthly Lines SVG calculations
  const chartW = 280;
  const chartH = 45;
  const maxMonthlyVal = Math.max(...MONTHLY, 1);
  const paddingX = 10;
  const points = MONTHLY.map((val, index) => {
    const x = paddingX + (index / 11) * (chartW - paddingX * 2);
    const y = chartH - 5 - (val / maxMonthlyVal) * (chartH - 10);
    return { x, y, val };
  });
  const pointsString = points.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div className="space-y-4 page-transition flex flex-col min-h-[calc(100vh-100px)]">
      {/* 행 1: 페이지 제목 영역 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[18px] font-semibold text-[#ECECEC]">통합관제</h2>
      </div>

      {/* 🌤 Weather card (최상단) */}
      <div className="bg-panel border border-border-main p-4 rounded-xl flex items-center justify-between mb-4">
        <div className="space-y-1">
          <span className="text-[10px] text-text-dim font-mono tracking-wider uppercase flex items-center gap-1">
            <CloudSun className="w-3.5 h-3.5 text-cyan" /> 오늘의 날씨
          </span>
          <h4 className="font-bold text-sm text-text-main">
            {currentZoneFilter === "ALL" ? "남양주 왕숙 지구" : `${filteredZones[0]?.name} | ${filteredZones[0]?.company}`}
          </h4>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-cyan">28.4°C</span>
            <span className="text-xs text-text-sub font-mono">습도 72% · 남실바람</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-yellow text-3xl font-bold animate-pulse">☀️</div>
          <div className="text-[10px] text-green font-semibold mt-1 bg-green/10 px-2 py-0.5 rounded border border-green/20">
            폭염특보 대기중
          </div>
        </div>
      </div>

      {/* 행 2: 요약 바 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* 카드 1: 총 출역 인원 */}
        <div className="bg-[#19191C] border border-[#2A2A2F] rounded-[10px] p-[14px_20px] flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#8A8A96] uppercase tracking-wider">총 출역 인원</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-[22px] font-bold text-[#00D1E8]">{totalWorkers}명</span>
          </div>
        </div>

        {/* 카드 2: 미조치 이벤트 */}
        <div className="bg-[#19191C] border border-[#2A2A2F] rounded-[10px] p-[14px_20px] flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#8A8A96] uppercase tracking-wider">미조치 이벤트</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-[22px] font-bold ${totalEvents > 0 ? "text-[#FF4444]" : "text-[#22C55E]"}`}>{totalEvents}건</span>
            <span className="text-[10px] text-[#8A8A96]">확인 필요</span>
          </div>
        </div>

        {/* 카드 3: TBM 완료율 */}
        <div className="bg-[#19191C] border border-[#2A2A2F] rounded-[10px] p-[14px_20px] flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#8A8A96] uppercase tracking-wider">TBM 완료율</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-[22px] font-bold text-[#ECECEC]">{tbmRate}</span>
            <span className="text-[10px] text-[#8A8A96]">금일 진행 기준</span>
          </div>
        </div>

        {/* 카드 4: 미연결 센서 */}
        <div className="bg-[#19191C] border border-[#2A2A2F] rounded-[10px] p-[14px_20px] flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#8A8A96] uppercase tracking-wider">미연결 센서</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-[22px] font-bold ${disconnectedSensors > 0 ? "text-[#FF9F0A]" : "text-[#8A8A96]"}`}>{disconnectedSensors}개</span>
            <span className="text-[10px] text-[#8A8A96]">연결끊김</span>
          </div>
        </div>
      </div>

      {/* 🗺 Mid Row: GIS Interactive Leaflet map & High Risk tasks desk */}
      <div className="grid grid-cols-1 gap-4">
        {/* Leaflet map of 남양주 왕숙 (Always Full Width) */}
        <div className="bg-panel border border-border-main rounded-xl overflow-hidden flex flex-col h-[350px] transition-all duration-300">
          <div className="px-4 py-2.5 bg-panel/80 border-b border-border-main flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MapPin className="text-cyan w-4 h-4" />
              <h3 className="font-bold text-xs text-text-main">남양주 왕숙</h3>
            </div>
          </div>
          <div ref={mapRef} className="flex-1 w-full" style={{ zIndex: 1 }} />
        </div>
      </div>

      {/* 📊 Bottom Row: Event Status & Monthly graph on the same row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 이벤트 현황 패널 */}
        <div className="bg-panel border border-border-main rounded-xl p-4 flex flex-col h-[350px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-text-main">이벤트 현황</h3>
            <span className="bg-red text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              {filteredActiveEvents.length}건
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredActiveEvents.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-text-dim">
                활성 이벤트가 없습니다.
              </div>
            ) : (
              filteredActiveEvents.map(evt => {
                const zone = ZONES.find(z => z.id === evt.zoneId);
                const zoneName = zone ? zone.name : "알수없음";
                const dot = evt.severity === "CRITICAL" ? "🔴" : "🟠";
                const typeText = evt.type === "DEVICE" ? "장치" : evt.type;
                
                // subtitle mapping
                let subtext = evt.subtype;
                if (evt.subtype === "안전모미착용") subtext = "안전모 미착용";
                else if (evt.subtype === "위험구역진입") subtext = "위험구역 진입";
                else if (evt.subtype === "쓰러짐감지") subtext = "쓰러짐 감지";
                else if (evt.subtype === "긴급구조요청") subtext = "긴급구조 요청";
                else if (evt.subtype === "화재연기감지") subtext = "화재·연기 감지";
                else if (evt.subtype === "변위이상") subtext = "변위센서 임계치 초과";

                const isCritical = evt.severity === "CRITICAL";
                const bgStyle = isCritical 
                  ? "rgba(224, 48, 48, 0.08)" 
                  : "rgba(212, 120, 10, 0.08)";
                const borderStyle = isCritical ? "3px solid #e03030" : "3px solid #d4780a";

                return (
                  <div
                    key={evt.id}
                    onClick={() => navigate("event-detail", { eventId: evt.id })}
                    style={{ 
                      height: "40px", 
                      backgroundColor: bgStyle, 
                      borderLeft: borderStyle 
                    }}
                    className="flex items-center justify-between px-3 rounded-r cursor-pointer hover:bg-opacity-20 transition-all text-[13px] text-text-main"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{dot}</span>
                      <span className="font-mono text-cyan-500 font-bold w-10">{typeText}</span>
                      <span className="font-semibold text-text-main truncate max-w-[150px]">{subtext}</span>
                    </div>
                    <div className="flex items-center gap-4 text-text-sub font-mono">
                      <span>{zoneName}</span>
                      <span className="text-text-dim">{formatEventTime(evt.time)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 mt-2 border-t border-border-main text-right">
            <button
              onClick={() => navigate("events")}
              className="text-xs text-cyan hover:underline hover:text-cyan/80 transition-colors font-bold flex items-center justify-end gap-1 ml-auto cursor-pointer"
            >
              <span>이벤트 전체보기 →</span>
            </button>
          </div>
        </div>

        {/* Monthly alerts line chart */}
        <div className="bg-panel border border-border-main rounded-xl p-4 flex flex-col justify-between h-[350px]">
          <div>
            <span className="text-[10px] text-text-dim font-mono tracking-wider uppercase flex items-center gap-1 mb-2">
              <Calendar className="w-3.5 h-3.5 text-cyan" /> 월별 이벤트 현황
            </span>
            <div className="bg-card/40 border border-border-dim p-2.5 rounded-lg mb-4 flex items-center justify-center">
              {/* Dynamic SVG line chart */}
              <svg width="100%" height="90" viewBox={`0 0 ${chartW} ${chartH}`} className="overflow-visible">
                {/* Horizontal reference lines */}
                <line x1="0" y1="5" x2={chartW} y2="5" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1="0" y1="20" x2={chartW} y2="20" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1="0" y1="35" x2={chartW} y2="35" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
                {/* Curved Polyline */}
                <polyline points={pointsString} fill="none" stroke="var(--cyan)" strokeWidth="1.8" />
                {/* Dots with tooltips */}
                {points.map((p, i) => (
                  <g key={i} className="group cursor-pointer">
                    <circle cx={p.x} cy={p.y} r="3" fill="#ffffff" stroke="var(--cyan)" strokeWidth="1.5" />
                    <text x={p.x} y={p.y - 6} textAnchor="middle" fill="var(--cyan)" fontSize="8" className="font-mono scale-0 group-hover:scale-100 transition-all font-semibold">
                      {p.val}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            {/* Grid legend labels */}
            <div className="flex justify-between font-mono text-[8px] text-text-dim px-1.5 -mt-2.5 mb-2.5">
              <span>1월</span><span>2월</span><span>3월</span><span>4월</span><span>5월</span><span>6월</span>
              <span>7월</span><span>8월</span><span>9월</span><span>10월</span><span>11월</span><span>12월</span>
            </div>
          </div>

          {/* Quick Stats Summary underneath the chart */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-main text-center">
            <div className="bg-[var(--bg-card)]/60 p-2 rounded">
              <div className="text-[9px] text-text-dim font-medium">연간 누적 이벤트</div>
              <div className="text-sm font-bold text-cyan mt-0.5">48건</div>
            </div>
            <div className="bg-[var(--bg-card)]/60 p-2 rounded">
              <div className="text-[9px] text-text-dim font-medium">월평균 발생</div>
              <div className="text-sm font-bold text-text-main mt-0.5">4.0건</div>
            </div>
            <div className="bg-[var(--bg-card)]/60 p-2 rounded">
              <div className="text-[9px] text-text-dim font-medium">직전 월 대비</div>
              <div className="text-sm font-bold text-green mt-0.5">-12.5%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
