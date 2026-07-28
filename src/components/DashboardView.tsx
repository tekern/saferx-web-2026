/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";
import { Zone, SafetyEvent, TbmItem } from "../types";
import { ZONES, HOURLY, MONTHLY, SENSORS, INIT_SYS_DEVICES } from "../data";
import { 
  MapPin, AlertTriangle, Cpu, CloudSun, Calendar, Building2, 
  HardDrive, Users, Server, Activity, CheckCircle2, Clock, Eye, Bell
} from "lucide-react";

interface DashboardViewProps {
  currentZoneFilter: string;
  setCurrentZoneFilter: (val: string) => void;
  events: SafetyEvent[];
  navigate: (page: string, params?: any) => void;
  tbmList?: TbmItem[];
  availableZones?: Zone[];
  userRole?: string;
}

export default function DashboardView({
  currentZoneFilter,
  setCurrentZoneFilter,
  events,
  navigate,
  tbmList,
  availableZones,
  userRole = "SUPER_ADMIN"
}: DashboardViewProps) {
  const [activeRoleTab, setActiveRoleTab] = useState<string>(userRole);

  useEffect(() => {
    setActiveRoleTab(userRole);
  }, [userRole]);

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInst = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  const zoneList = availableZones || ZONES;

  // Filtered zones based on selector
  const filteredZones = currentZoneFilter === "ALL" 
    ? zoneList 
    : zoneList.filter(z => z.id === currentZoneFilter);

  // Filtered events based on selector
  const filteredEvents = currentZoneFilter === "ALL"
    ? events.filter(e => zoneList.some(z => z.id === e.zoneId))
    : events.filter(e => e.zoneId === currentZoneFilter);

  const activeEvents = filteredEvents.filter(e => e.status === "ACTIVE");

  const formatEventTime = (timeStr: string) => {
    if (!timeStr) return "";
    if (timeStr.includes(" ")) {
      const parts = timeStr.split(" ");
      return parts[parts.length - 1];
    }
    return timeStr;
  };

  // Calculations for KPI Cards
  const totalWorkers = zoneList.reduce((sum, z) => sum + z.workers, 0);
  const totalActiveEvents = events.filter(e => e.status === "ACTIVE").length;

  const getTbmRateNum = () => {
    const list = tbmList || [
      { id: "t1", zoneId: "z1", date: "2025-05-27", zone: "왕숙1구역", total: 142, completed: 139, rate: 97.9, manager: "김관수", time: "07:30" },
      { id: "t2", zoneId: "z2", date: "2025-05-27", zone: "왕숙2구역", total: 98, completed: 95, rate: 96.9, manager: "이현장", time: "07:45" },
      { id: "t3", zoneId: "z3", date: "2025-05-27", zone: "왕숙3구역", total: 115, completed: 108, rate: 93.9, manager: "최안전", time: "08:00" },
    ];
    if (list.length === 0) return 96.8;
    const sum = list.reduce((acc, t) => acc + t.rate, 0);
    return Number((sum / list.length).toFixed(1));
  };

  // Map initialization for Super Admin & Site Mgr views
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    if (!leafletInst.current) {
      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false
      }).setView([zoneList[0]?.lat || 37.6478, zoneList[0]?.lng || 127.2156], zoneList.length <= 2 ? 14 : 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      leafletInst.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    } else {
      leafletInst.current.invalidateSize();
    }

    const map = leafletInst.current;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    zoneList.forEach(z => {
      let color = "#22C55E";
      if (z.status === "위험") color = "#EF4444";
      else if (z.status === "주의") color = "#F59E0B";

      const isActive = currentZoneFilter === "ALL" || currentZoneFilter === z.id;
      const opacity = isActive ? 1.0 : 0.3;

      const markerHtml = `
        <div style="opacity: ${opacity}; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="
            width: 32px; 
            height: 32px; 
            background: #222226; 
            border: 2px solid ${color}; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.5);"
          >
            <span style="color: ${color}; font-size: 10px; font-weight: bold;">${z.name.replace("구역", "")}</span>
          </div>
          <div style="
            background: #111113; 
            color: #ECECEC; 
            font-size: 9px; 
            padding: 2px 6px; 
            border-radius: 6px; 
            border: 1px solid #2A2A2F; 
            margin-top: 4px;
            white-space: nowrap;"
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
        <div class="p-2 text-xs font-sans text-[#ECECEC]" style="min-width: 170px; background: #222226; border-radius: 8px;">
          <div class="flex items-center justify-between border-b border-[#2A2A2F] pb-1.5 mb-2">
            <span class="font-bold text-[#00D1E8] text-sm">${z.name}</span>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold" style="background: ${color}20; color: ${color}">
              ${z.status}
            </span>
          </div>
          <p class="mb-1"><span class="text-[#8A8A96]">시공사:</span> ${z.company}</p>
          <p class="mb-1"><span class="text-[#8A8A96]">출역 인원:</span> ${z.workers}명</p>
          <p class="border-t border-[#2A2A2F] pt-1.5 mt-1.5 font-semibold text-[10px] flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full ${activeEvtsForZone.length > 0 ? "bg-[#EF4444] animate-ping" : "bg-[#22C55E]"}"></span>
            미조치 이벤트: <span class="${activeEvtsForZone.length > 0 ? "text-[#EF4444] font-bold" : "text-[#22C55E]"}">${activeEvtsForZone.length}건</span>
          </p>
        </div>
      `;

      const marker = L.marker([z.lat, z.lng], { icon: customIcon }).addTo(markersGroup);
      marker.bindPopup(popupHtml);

      if (currentZoneFilter === z.id) {
        map.setView([z.lat, z.lng], 15);
        marker.openPopup();
      }
    });

    if (currentZoneFilter === "ALL") {
      map.setView([zoneList[0]?.lat || 37.6478, zoneList[0]?.lng || 127.2156], zoneList.length <= 2 ? 14 : 13);
    }
  }, [currentZoneFilter, events, zoneList, activeRoleTab]);

  return (
    <div className="space-y-5 page-transition flex flex-col min-h-[calc(100vh-100px)] text-[#ECECEC]">
      
      {/* Top Header & Role Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2A2A2F]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00D1E8]" />
            {activeRoleTab === "SYS_ADMIN" && "시스템관리자 대시보드"}
            {activeRoleTab === "SUPER_ADMIN" && "통합관리자 대시보드"}
            {activeRoleTab === "SITE_MGR" && "현장관리자 대시보드"}
          </h2>
          <p className="text-xs text-[#8A8A96] mt-0.5">
            {activeRoleTab === "SYS_ADMIN" && "전체 고객사, 인프라 디바이스 및 핵심 서버 상태 실시간 관제"}
            {activeRoleTab === "SUPER_ADMIN" && "전 현장 종합 관제, 총 출역 근로자, 미처리 이벤트 및 TBM 완료 현황"}
            {activeRoleTab === "SITE_MGR" && "담당 현장 출근 인원, 이벤트, TBM 및 실시간 기상 상태 모니터링"}
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex bg-[#222226] border border-[#2A2A2F] p-1 rounded-xl gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveRoleTab("SYS_ADMIN")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeRoleTab === "SYS_ADMIN"
                ? "bg-[#2A2A2F] text-[#8A8A96] border border-[#8A8A96]/40 font-bold"
                : "text-[#8A8A96] hover:text-white"
            }`}
          >
            시스템관리자
          </button>
          <button
            onClick={() => setActiveRoleTab("SUPER_ADMIN")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeRoleTab === "SUPER_ADMIN"
                ? "bg-[#00D1E8]/10 text-[#00D1E8] border border-[#00D1E8]/40 font-bold"
                : "text-[#8A8A96] hover:text-white"
            }`}
          >
            통합관리자
          </button>
          <button
            onClick={() => setActiveRoleTab("SITE_MGR")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeRoleTab === "SITE_MGR"
                ? "bg-[#2A2A2F] text-[#ECECEC] border border-[#ECECEC]/40 font-bold"
                : "text-[#8A8A96] hover:text-white"
            }`}
          >
            현장관리자
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. SYS_ADMIN 대시보드
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeRoleTab === "SYS_ADMIN" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* 요약 카드 4개: 전체 고객사 수 · 전체 현장 수 · 전체 디바이스 수 · 전체 사용자 수 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-2">
              <div className="flex justify-between items-center text-[#8A8A96] text-xs font-semibold">
                <span>전체 고객사 수</span>
                <Building2 className="w-4 h-4 text-[#00D1E8]" />
              </div>
              <div className="text-2xl font-black text-white font-mono">12개사</div>
              <p className="text-[11px] text-[#22C55E]">● 정상 계약 유지 중</p>
            </div>

            <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-2">
              <div className="flex justify-between items-center text-[#8A8A96] text-xs font-semibold">
                <span>전체 현장 수</span>
                <MapPin className="w-4 h-4 text-[#00D1E8]" />
              </div>
              <div className="text-2xl font-black text-white font-mono">{zoneList.length}개 현장</div>
              <p className="text-[11px] text-[#8A8A96]">남양주 왕숙지구 관제 적용</p>
            </div>

            <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-2">
              <div className="flex justify-between items-center text-[#8A8A96] text-xs font-semibold">
                <span>전체 디바이스 수</span>
                <HardDrive className="w-4 h-4 text-[#00D1E8]" />
              </div>
              <div className="text-2xl font-black text-white font-mono">528대</div>
              <p className="text-[11px] text-[#22C55E]">온라인 가동률 98.2%</p>
            </div>

            <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-2">
              <div className="flex justify-between items-center text-[#8A8A96] text-xs font-semibold">
                <span>전체 사용자 수</span>
                <Users className="w-4 h-4 text-[#00D1E8]" />
              </div>
              <div className="text-2xl font-black text-white font-mono">1,420명</div>
              <p className="text-[11px] text-[#8A8A96]">활성 사용자 1,380명</p>
            </div>
          </div>

          {/* 서비스 상태 카드: VMS · AI서버 · ThingX · DB (정상/경고/장애) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-[#00D1E8]" />
              핵심 인프라 서비스 상태
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* VMS */}
              <div className="bg-[#222226] border border-[#22C55E]/40 p-5 rounded-xl space-y-3 shadow-md">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-white">VMS 영상 서버</span>
                  <span className="px-2 py-0.5 text-[10px] bg-[#22C55E]/20 text-[#22C55E] font-bold rounded border border-[#22C55E]/30">
                    정상
                  </span>
                </div>
                <div className="text-xs text-[#8A8A96] space-y-1.5 font-mono">
                  <div className="flex justify-between"><span>응답속도:</span> <span className="text-white">12 ms</span></div>
                  <div className="flex justify-between"><span>가동률:</span> <span className="text-white">99.98%</span></div>
                  <div className="flex justify-between"><span>스트림 채널:</span> <span className="text-white">214 / 214</span></div>
                </div>
              </div>

              {/* AI서버 */}
              <div className="bg-[#222226] border border-[#22C55E]/40 p-5 rounded-xl space-y-3 shadow-md">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-white">AI 영상분석 서버</span>
                  <span className="px-2 py-0.5 text-[10px] bg-[#22C55E]/20 text-[#22C55E] font-bold rounded border border-[#22C55E]/30">
                    정상
                  </span>
                </div>
                <div className="text-xs text-[#8A8A96] space-y-1.5 font-mono">
                  <div className="flex justify-between"><span>응답속도:</span> <span className="text-white">28 ms</span></div>
                  <div className="flex justify-between"><span>GPU 점유율:</span> <span className="text-white">64%</span></div>
                  <div className="flex justify-between"><span>추론 속도:</span> <span className="text-white">30 fps</span></div>
                </div>
              </div>

              {/* ThingX */}
              <div className="bg-[#222226] border border-[#F59E0B]/40 p-5 rounded-xl space-y-3 shadow-md">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-white">ThingX IoT 플랫폼</span>
                  <span className="px-2 py-0.5 text-[10px] bg-[#F59E0B]/20 text-[#F59E0B] font-bold rounded border border-[#F59E0B]/30">
                    경고
                  </span>
                </div>
                <div className="text-xs text-[#8A8A96] space-y-1.5 font-mono">
                  <div className="flex justify-between"><span>응답속도:</span> <span className="text-[#F59E0B]">180 ms</span></div>
                  <div className="flex justify-between"><span>트래픽 부하:</span> <span className="text-[#F59E0B]">82%</span></div>
                  <div className="flex justify-between"><span>대기 메시지:</span> <span className="text-white">120 건</span></div>
                </div>
              </div>

              {/* DB */}
              <div className="bg-[#222226] border border-[#22C55E]/40 p-5 rounded-xl space-y-3 shadow-md">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-white">관제 DB 서버</span>
                  <span className="px-2 py-0.5 text-[10px] bg-[#22C55E]/20 text-[#22C55E] font-bold rounded border border-[#22C55E]/30">
                    정상
                  </span>
                </div>
                <div className="text-xs text-[#8A8A96] space-y-1.5 font-mono">
                  <div className="flex justify-between"><span>디스크 용량:</span> <span className="text-white">42% (2.1TB)</span></div>
                  <div className="flex justify-between"><span>세션 커넥션:</span> <span className="text-white">128 / 500</span></div>
                  <div className="flex justify-between"><span>일일 백업:</span> <span className="text-[#22C55E]">성공 (04:00)</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          2. SUPER_ADMIN 대시보드
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeRoleTab === "SUPER_ADMIN" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* 요약 카드 4개: 전체 현장 수 · 전체 근로자 수 · 미처리 이벤트 수 · 오늘 TBM 완료율 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-2">
              <span className="text-xs font-semibold text-[#8A8A96]">전체 현장 수</span>
              <div className="text-2xl font-bold text-[#00D1E8] font-mono">{zoneList.length}개 현장</div>
              <p className="text-[11px] text-[#8A8A96]">왕숙지구 전 구역 연동</p>
            </div>

            <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-2">
              <span className="text-xs font-semibold text-[#8A8A96]">전체 근로자 수</span>
              <div className="text-2xl font-bold text-white font-mono">{totalWorkers.toLocaleString()}명</div>
              <p className="text-[11px] text-[#22C55E]">● 금일 실시간 출역 합계</p>
            </div>

            <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-2">
              <span className="text-xs font-semibold text-[#8A8A96]">미처리 이벤트 수</span>
              <div className={`text-2xl font-bold font-mono ${totalActiveEvents > 0 ? "text-[#EF4444]" : "text-[#22C55E]"}`}>
                {totalActiveEvents}건
              </div>
              <p className="text-[11px] text-[#8A8A96]">실시간 관제 조치 필요</p>
            </div>

            <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-2">
              <span className="text-xs font-semibold text-[#8A8A96]">오늘 TBM 완료율</span>
              <div className="text-2xl font-bold text-[#ECECEC] font-mono">{getTbmRateNum()}%</div>
              <p className="text-[11px] text-[#22C55E]">전체 현장 평균</p>
            </div>
          </div>

          {/* 지도 & 현장별 현황 테이블 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* GIS 지도 */}
            <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden flex flex-col h-[380px] lg:col-span-1">
              <div className="px-4 py-3 bg-[#111113] border-b border-[#2A2A2F] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="text-[#00D1E8] w-4 h-4" />
                  <span className="font-bold text-xs text-white">현장 위치 지도</span>
                </div>
              </div>
              <div ref={mapRef} className="flex-1 w-full" style={{ zIndex: 1 }} />
            </div>

            {/* 현장별 현황 테이블: 현장명 · 출근 인원 · 미처리 이벤트 · TBM 완료율 */}
            <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-white">현장별 관제 현황</h3>
                  <span className="text-xs text-[#8A8A96]">총 {zoneList.length}개 구역</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#2A2A2F] text-[#8A8A96] font-semibold">
                        <th className="py-2.5 px-3">현장명</th>
                        <th className="py-2.5 px-3">시공사</th>
                        <th className="py-2.5 px-3">출근 인원</th>
                        <th className="py-2.5 px-3">미처리 이벤트</th>
                        <th className="py-2.5 px-3">TBM 완료율</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2A2F]/50 text-[#ECECEC]">
                      {zoneList.slice(0, 7).map(z => {
                        const activeEvts = events.filter(e => e.zoneId === z.id && e.status === "ACTIVE").length;
                        const tbmItem = tbmList?.find(t => t.zoneId === z.id);
                        const rate = tbmItem ? tbmItem.rate : (95 + Math.floor(Math.random() * 5));

                        return (
                          <tr key={z.id} className="hover:bg-[#2A2A2F]/40 transition-colors">
                            <td className="py-3 px-3 font-bold text-[#00D1E8]">{z.name}</td>
                            <td className="py-3 px-3 text-[#8A8A96]">{z.company}</td>
                            <td className="py-3 px-3 font-mono font-semibold">{z.workers}명</td>
                            <td className="py-3 px-3">
                              {activeEvts > 0 ? (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-[#EF4444]/20 text-[#EF4444] font-bold border border-[#EF4444]/30">
                                  {activeEvts}건 미조치
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-[#22C55E]/10 text-[#22C55E] font-medium">
                                  0건 (정상)
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-[#111113] h-2 rounded-full overflow-hidden border border-[#2A2A2F]">
                                  <div className="bg-[#00D1E8] h-full" style={{ width: `${rate}%` }} />
                                </div>
                                <span className="font-mono text-[11px] text-white">{rate}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 border-t border-[#2A2A2F] text-right">
                <button
                  onClick={() => navigate("sites")}
                  className="text-xs text-[#00D1E8] hover:underline font-bold transition-colors cursor-pointer"
                >
                  전체 현장 상세 관리 →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          3. SITE_MGR 대시보드
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeRoleTab === "SITE_MGR" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* 요약 카드 4개: 오늘 출근 인원 · 미처리 이벤트 · TBM 완료율 · 등록 디바이스 수 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-2">
              <span className="text-xs font-semibold text-[#8A8A96]">오늘 출근 인원</span>
              <div className="text-2xl font-bold text-[#00D1E8] font-mono">142명</div>
              <p className="text-[11px] text-[#22C55E]">왕숙1구역 출역 현황</p>
            </div>

            <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-2">
              <span className="text-xs font-semibold text-[#8A8A96]">미처리 이벤트</span>
              <div className="text-2xl font-bold text-[#EF4444] font-mono">3건</div>
              <p className="text-[11px] text-[#EF4444]">● 현장 즉시 조치 필요</p>
            </div>

            <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-2">
              <span className="text-xs font-semibold text-[#8A8A96]">TBM 완료율</span>
              <div className="text-2xl font-bold text-white font-mono">97.9%</div>
              <p className="text-[11px] text-[#22C55E]">139 / 142명 서명 완료</p>
            </div>

            <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-2">
              <span className="text-xs font-semibold text-[#8A8A96]">등록 디바이스 수</span>
              <div className="text-2xl font-bold text-[#ECECEC] font-mono">18대</div>
              <p className="text-[11px] text-[#8A8A96]">CCTV 12대 · IoT센서 6대</p>
            </div>
          </div>

          {/* 최근 이벤트 목록 5건 & 날씨 정보 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 최근 이벤트 목록 5건 */}
            <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 lg:col-span-2 flex flex-col justify-between min-h-[340px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#EF4444]" />
                    최근 미조치 이벤트 (최근 5건)
                  </h3>
                  <button
                    onClick={() => navigate("events")}
                    className="text-xs text-[#00D1E8] hover:underline font-bold transition-colors cursor-pointer"
                  >
                    이벤트 전체보기 →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {events.slice(0, 5).map(evt => {
                    const isCritical = evt.severity === "CRITICAL";
                    const bgStyle = isCritical ? "rgba(239, 68, 68, 0.08)" : "rgba(245, 158, 11, 0.08)";
                    const borderStyle = isCritical ? "3px solid #EF4444" : "3px solid #F59E0B";

                    return (
                      <div
                        key={evt.id}
                        onClick={() => navigate("event-detail", { eventId: evt.id })}
                        style={{ backgroundColor: bgStyle, borderLeft: borderStyle }}
                        className="flex items-center justify-between p-3 rounded-r cursor-pointer hover:bg-opacity-20 transition-all text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-[#00D1E8] font-bold">{evt.type}</span>
                          <span className="font-semibold text-white">{evt.subtype}</span>
                          <span className="text-[#8A8A96] hidden sm:inline">({evt.desc})</span>
                        </div>
                        <div className="flex items-center gap-3 font-mono text-[11px] text-[#8A8A96]">
                          <span>{evt.camera || "CAM-01"}</span>
                          <span className="text-white font-bold">{formatEventTime(evt.time)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 날씨 정보 카드 */}
            <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 lg:col-span-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#2A2A2F] pb-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CloudSun className="w-4 h-4 text-[#00D1E8]" />
                    현장 날씨 정보
                  </span>
                  <span className="text-[10px] text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/30 font-bold">
                    왕숙1구역
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="text-3xl font-extrabold text-[#00D1E8] font-mono">28.4°C</div>
                    <div className="text-xs text-[#8A8A96] mt-1 font-medium">맑음 · 남실바람</div>
                  </div>
                  <div className="text-4xl animate-bounce">☀️</div>
                </div>

                <div className="space-y-2 text-xs bg-[#111113] p-3.5 rounded-lg border border-[#2A2A2F] font-mono">
                  <div className="flex justify-between text-[#8A8A96]">
                    <span>습도:</span> <span className="text-white">72%</span>
                  </div>
                  <div className="flex justify-between text-[#8A8A96]">
                    <span>강수확률:</span> <span className="text-white">10%</span>
                  </div>
                  <div className="flex justify-between text-[#8A8A96]">
                    <span>풍속:</span> <span className="text-white">2.1 m/s</span>
                  </div>
                  <div className="flex justify-between text-[#8A8A96]">
                    <span>미세먼지:</span> <span className="text-[#22C55E] font-bold">좋음 (24 µg/m³)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-2.5 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg text-center text-[11px] text-[#F59E0B] font-bold">
                ⚠️ [온열질환 주의] 매 시간 10분 이상 휴식 권고
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
