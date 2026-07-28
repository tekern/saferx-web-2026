/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";
import { WorkerLoc, Zone } from "../types";
import { WORKERS_LOC, ZONES } from "../data";
import { MapPin, Search, AlertOctagon, Heart, Send, CheckCircle2, UserCheck, ShieldAlert } from "lucide-react";

interface WorkersViewProps {
  currentZoneFilter: string;
  availableZones?: Zone[];
}

export default function WorkersView({ currentZoneFilter, availableZones }: WorkersViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInst = useRef<any>(null);
  const workersLayerGroupRef = useRef<any>(null);

  const [filterZone, setFilterZone] = useState("ALL");
  const [filterTag, setFilterTag] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [smsSentToast, setSmsSentToast] = useState(false);

  const zoneList = availableZones || ZONES;

  // Sync with LNB zone filters
  const selectedZone = filterZone === "ALL" ? currentZoneFilter : filterZone;

  // Calculators
  const totalActWorkers = WORKERS_LOC.filter(w => zoneList.some(z => z.id === w.zoneId)).length;
  const tagOnCount = WORKERS_LOC.filter(w => zoneList.some(z => z.id === w.zoneId) && w.tag === "ON").length;
  const tagOffCount = WORKERS_LOC.filter(w => zoneList.some(z => z.id === w.zoneId) && w.tag === "OFF").length;
  const vulnerableCount = WORKERS_LOC.filter(w => zoneList.some(z => z.id === w.zoneId) && w.vulnerable).length;

  // Filter list results
  const filteredWorkers = WORKERS_LOC.filter((w) => {
    if (selectedZone !== "ALL") {
      if (w.zoneId !== selectedZone) return false;
    } else {
      if (!zoneList.some(z => z.id === w.zoneId)) return false;
    }
    if (filterTag !== "ALL" && w.tag !== filterTag) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTxt = (w.name + w.job + w.area).toLowerCase();
      if (!matchTxt.includes(q)) return false;
    }
    return true;
  });

  const getZoneName = (zoneId: string) => {
    const found = ZONES.find(z => z.id === zoneId);
    return found ? found.name : zoneId;
  };

  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    if (!leafletInst.current) {
      // 1. Initialize Leaflet map
      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false
      }).setView([37.6478, 127.2160], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      leafletInst.current = map;
      workersLayerGroupRef.current = L.layerGroup().addTo(map);
    } else {
      leafletInst.current.invalidateSize();
    }

    // 2. Clear existing and set current worker coordinates markers
    const map = leafletInst.current;
    const workersLayerGroup = workersLayerGroupRef.current;
    workersLayerGroup.clearLayers();

    filteredWorkers.forEach((w) => {
      // Color depend of tags & vulnerability
      let color = "#1a7fd4"; // Cyan-blue default (ON)
      let borderGlow = "box-shadow: 0 0 6px #1a7fd4;";
      let indicatorHtml = `<span style="font-size: 8px;">👷</span>`;

      if (w.tag === "OFF") {
        color = "#7a8a99"; // Offline grey
        borderGlow = "box-shadow: 0 0 4px #7a8a99;";
      }

      const activeBadgeHtml = `
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="
            width: 22px; 
            height: 22px; 
            background: var(--bg-card); 
            border: 2px solid ${color}; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            ${borderGlow}"
          >
            ${indicatorHtml}
          </div>
          <div style="
            background: var(--bg-elevated); 
            color: var(--text-primary); 
            font-size: 8px; 
            font-weight: bold;
            padding: 1px 3px; 
            border-radius: 3px; 
            border: 1px solid var(--border-default); 
            margin-top: 1px;
            white-space: nowrap;"
          >
            ${w.name}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: activeBadgeHtml,
        className: 'custom-worker-leaflet-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const popupHtml = `
        <div class="p-2 text-xs font-sans text-text-main" style="min-width: 150px;">
          <div class="font-bold text-cyan text-sm mb-1">${w.name} (${w.job})</div>
          <p><span class="text-text-sub">지정 구역:</span> ${getZoneName(w.zoneId)} (${w.area})</p>
          <p><span class="text-text-sub">수신 상태:</span> <span class="${w.tag === "ON" ? "text-green font-bold" : "text-text-dim"}">${w.tag === "ON" ? "GPS 수신 중" : "GPS 끊김"}</span></p>
          <p class="text-[9px] text-text-dim mt-1.5 border-t border-border/30 pt-1">위성 핑: 금일 ${w.lastUpdate}</p>
        </div>
      `;

      const marker = L.marker([w.lat, w.lng], { icon: customIcon }).addTo(workersLayerGroup);
      marker.bindPopup(popupHtml);
    });

    // Auto fit map coordinates to encompass markers if available
    if (filteredWorkers.length > 0) {
      const latlngs = filteredWorkers.map(w => [w.lat, w.lng]);
      map.fitBounds(latlngs, { padding: [25, 25], maxZoom: 15 });
    }

  }, [filteredWorkers]);

  const handleSmsDispatchedBroadcast = () => {
    setSmsSentToast(true);
    setTimeout(() => setSmsSentToast(false), 3000);
  };

  return (
    <div className="space-y-4 page-transition">
      {/* 📊 Top Statistical KPI aggregate bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-panel border border-border-main p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-dim font-mono tracking-wider">현장 출역</span>
            <span className="block text-2xl font-display font-extrabold text-text-main mt-0.5">{totalActWorkers}명</span>
          </div>
          <UserCheck className="w-8 h-8 text-text-main opacity-40" />
        </div>
        
        <div className="bg-panel border border-border-main p-4 rounded-xl flex items-center justify-between font-bold">
          <div>
            <span className="text-[10px] text-text-dim font-mono tracking-wider text-green">GPS 수신 중</span>
            <span className="block text-2xl font-display font-extrabold text-green mt-0.5">{tagOnCount}명</span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-green opacity-40" />
        </div>

        <div className="bg-panel border border-border-main p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-dim font-mono tracking-wider text-orange">GPS 끊김</span>
            <span className="block text-2xl font-display font-extrabold text-orange mt-0.5">{tagOffCount}명</span>
          </div>
          <ShieldAlert className="w-8 h-8 text-orange opacity-40" />
        </div>
      </div>

      {/* SMS delivery feedback toast alert notifications */}
      {smsSentToast && (
        <div className="max-w-md mx-auto bg-green-500/20 border border-green/50 text-green font-bold text-xs p-2.5 rounded text-center animate-bounce flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-green" />
          <span>지정된 번호로 SMS를 발송하였습니다.</span>
        </div>
      )}

      {/* 🧭 Workers live coordinate maps split pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Side (55%): Leaflet GIS mapping panel */}
        <div className="lg:col-span-7 bg-panel border border-border-main rounded-xl overflow-hidden flex flex-col h-[380px]">
          <div className="px-4 py-2.5 bg-panel/80 border-b border-border-main flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <MapPin className="text-cyan w-4 h-4 animate-bounce" />
              <h3 className="font-bold text-xs text-text-main">작업자 GPS 현황 지도</h3>
            </div>
          </div>

          <div ref={mapRef} className="flex-1 w-full" style={{ zIndex: 1 }} />
        </div>

        {/* Right Side (45%): Worker accounts list desk */}
        <div className="lg:col-span-5 bg-panel border border-border-main rounded-xl p-4 flex flex-col h-[380px]">
          
          {/* Header with SMS button */}
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h4 className="font-bold text-xs text-text-main">출역 근로자 목록</h4>
            <button
              onClick={handleSmsDispatchedBroadcast}
              className="flex items-center gap-1 px-2.5 py-1 bg-cyan text-outer font-extrabold text-[10px] rounded hover:bg-cyan/90 transition-all shrink-0 shadow-sm shadow-cyan/10"
            >
              <Send className="w-3 h-3" />
              <span>SMS 일괄발송</span>
            </button>
          </div>

          {/* Controls filtering toolbox */}
          <div className="grid grid-cols-2 gap-2 mb-3 shrink-0">
            <div className="flex flex-col">
              <span className="text-[8px] text-text-dim font-mono uppercase font-bold">구역 필터</span>
              <select
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className="bg-outer border border-border-main text-text-main text-xs px-2.5 py-1.5 rounded focus:outline-none"
              >
                <option value="ALL">전체 건설 구역</option>
                {zoneList.map(z => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <span className="text-[8px] text-text-dim font-mono uppercase font-bold">수신 상태</span>
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="bg-outer border border-border-main text-text-main text-xs px-2.5 py-1.5 rounded focus:outline-none"
              >
                <option value="ALL">전체</option>
                <option value="ON">GPS 수신 중</option>
                <option value="OFF">GPS 끊김</option>
              </select>
            </div>
          </div>

          <div className="relative mb-3.5 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="작업자 성명, 공종, 위치로 검색..."
              className="w-full bg-outer border border-border-main text-text-main px-3 py-1.5 rounded pr-8 text-xs focus:outline-none placeholder-text-dim"
            />
            <Search className="w-3.5 h-3.5 text-text-dim absolute right-2.5 top-2.5" />
          </div>

          {/* List display pane */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredWorkers.map((w) => {
              const hasTagOn = w.tag === "ON";
              
              let rowStyle = "bg-card hover:bg-hover/60 border border-border-main rounded-xl p-3 flex items-center justify-between text-xs";

              return (
                <div key={w.id} className={rowStyle}>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-lg bg-panel flex items-center justify-center font-bold text-text-sub">
                        👷
                      </div>
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-card ${hasTagOn ? "bg-green" : "bg-text-dim"}`}></span>
                    </div>

                    <div>
                      <h5 className="font-black text-text-main flex items-center gap-1">
                        <span>{w.name}</span>
                        <span className="text-[10px] text-text-dim font-normal">({w.job})</span>
                      </h5>
                      <p className="text-[11px] text-text-dim mt-0.5">{getZoneName(w.zoneId)} / {w.area}</p>
                    </div>
                  </div>

                  {/* Tag indicator elements */}
                  <div className="text-right text-[11px] font-mono font-bold">
                    <span className={hasTagOn ? "text-green" : "text-orange"}>
                      {hasTagOn ? "GPS 수신 중" : "GPS 끊김"}
                    </span>
                    <span className="block text-[9px] text-text-dim mt-0.5 font-normal">최종수신: {w.lastUpdate}</span>
                  </div>
                </div>
              );
            })}

            {filteredWorkers.length === 0 && (
              <div className="py-12 text-center text-text-dim text-xs flex flex-col items-center justify-center gap-2 border border-dashed border-border-main rounded-xl">
                <AlertOctagon className="w-6 h-6 text-text-dim" />
                <span>작업자 정보가 없습니다.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
