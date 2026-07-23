/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Zone, SafetyEvent, EventType, SeverityType, EventStatus } from "../types";
import { ZONES } from "../data";
import { 
  AlertTriangle, ShieldAlert, CheckCircle, Search, Calendar, ChevronRight, 
  MapPin, PhoneCall, Save, X, ArrowLeft, Camera, Maximize, Clock, FileText, Star
} from "lucide-react";

interface EventsViewProps {
  events: SafetyEvent[];
  dispatch: (action: any) => void;
  currentPage: string;
  pageParams: any;
  navigate: (page: string, params?: any) => void;
  currentZoneFilter: string;
  availableZones?: Zone[];
}

export default function EventsView({
  events,
  dispatch,
  currentPage,
  pageParams,
  navigate,
  currentZoneFilter,
  availableZones
}: EventsViewProps) {
  const [filterZone, setFilterZone] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [treatmentStatus, setTreatmentStatus] = useState<string>("CONFIRMED");
  const [treatmentMemo, setTreatmentMemo] = useState("");
  const [treatmentUser, setTreatmentUser] = useState("김관수");
  const [zoomCCTV, setZoomCCTV] = useState(false);

  const zoneList = availableZones || ZONES;

  // Fallback sync with LNB zone filters
  const selectedZone = filterZone === "ALL" ? currentZoneFilter : filterZone;

  // Filter items logic
  const filteredEvents = events.filter((e) => {
    if (selectedZone !== "ALL") {
      if (e.zoneId !== selectedZone) return false;
    } else {
      if (!zoneList.some(z => z.id === e.zoneId)) return false;
    }
    if (filterType !== "ALL" && e.type !== filterType && !(filterType === "센서" && e.type === "DEVICE")) return false;
    if (filterSeverity !== "ALL" && e.severity !== filterSeverity) return false;
    if (filterStatus !== "ALL" && e.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (e.desc + e.subtype + (e.worker || "") + e.id).toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const getSeverityBadge = (sev: SeverityType) => {
    switch (sev) {
      case "CRITICAL":
        return (
          <span className="px-2.5 py-1 rounded-[5px] text-[11px] font-semibold bg-[#EF4444]/10 text-[#EF4444] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            CRITICAL
          </span>
        );
      case "HIGH":
        return (
          <span className="px-2.5 py-1 rounded-[5px] text-[11px] font-semibold bg-[#F59E0B]/10 text-[#F59E0B] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            HIGH
          </span>
        );
      case "LOW":
        return (
          <span className="px-2.5 py-1 rounded-[5px] text-[11px] font-semibold bg-[#00D1E8]/10 text-[#00D1E8] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (sta: EventStatus) => {
    switch (sta) {
      case "ACTIVE":
        return (
          <span className="px-2.5 py-1 rounded-[5px] text-[11px] font-semibold bg-[#EF4444]/10 text-[#EF4444] inline-flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            미처리
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="px-2.5 py-1 rounded-[5px] text-[11px] font-semibold bg-[#22C55E]/10 text-[#22C55E] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            처리완료
          </span>
        );
      case "PENDING":
      case "SNOOZED":
        return (
          <span className="px-2.5 py-1 rounded-[5px] text-[11px] font-semibold bg-[#2A2A2F] text-[#8A8A96] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            보류
          </span>
        );
    }
  };

  const getZoneName = (zoneId: string) => {
    const found = ZONES.find((z) => z.id === zoneId);
    return found ? found.name : zoneId;
  };

  const getZoneCompany = (zoneId: string) => {
    const found = ZONES.find((z) => z.id === zoneId);
    return found ? found.company : "";
  };

  // Quick action buttons in table
  const triggerQuickConfirm = (eId: string) => {
    const timeStr = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    dispatch({
      type: "CONFIRM",
      payload: { id: eId, user: "김관수", time: timeStr, result: "탐지", memo: "" }
    });
  };

  const triggerQuickPending = (eId: string) => {
    const timeStr = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    dispatch({
      type: "PENDING",
      payload: { id: eId, user: "김관수", time: timeStr, memo: "" }
    });
  };

  const triggerQuickFalseAlarm = (eId: string) => {
    const timeStr = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    dispatch({
      type: "FALSE_ALARM",
      payload: { id: eId, user: "김관수", time: timeStr, memo: "" }
    });
  };

  const triggerToggleImportant = (eId: string) => {
    dispatch({ type: "TOGGLE_IMPORTANT", payload: { id: eId } });
  };

  const handleSopSaveSubmit = (eId: string) => {
    const timeStr = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    if (treatmentStatus === "CONFIRMED") {
      dispatch({
        type: "CONFIRM",
        payload: { id: eId, user: treatmentUser, time: timeStr, result: "탐지", memo: treatmentMemo }
      });
    } else if (treatmentStatus === "PENDING") {
      dispatch({
        type: "PENDING",
        payload: { id: eId, user: treatmentUser, time: timeStr, memo: treatmentMemo }
      });
    } else if (treatmentStatus === "FALSE") {
      dispatch({
        type: "FALSE_ALARM",
        payload: { id: eId, user: treatmentUser, time: timeStr, memo: treatmentMemo }
      });
    }
    setTreatmentMemo("");
  };

  // Switch between List and Detail rendering
  if (currentPage === "event-detail") {
    const activeId = pageParams?.eventId || "EVT-001";
    const evtItem = events.find((e) => e.id === activeId);

    if (!evtItem) {
      return (
        <div className="p-8 text-center text-[#8A8A96] space-y-3 page-transition">
          <ShieldAlert className="w-12 h-12 text-[#EF4444] mx-auto" />
          <p className="text-sm">선택한 이벤트를 찾을 수 없습니다.</p>
          <button onClick={() => navigate("events")} className="px-3 py-1.5 bg-[#2A2A2F] border border-[#333338] rounded text-xs text-[#ECECEC]">
            돌아가기
          </button>
        </div>
      );
    }

    return (
      <div className="min-h-[calc(100vh-100px)] flex flex-col gap-4 page-transition pb-2">
        {/* Breadcrumb row */}
        <div className="flex items-center justify-between bg-[#222226] border border-[#333338] px-4 py-2.5 rounded-xl shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#8A8A96] cursor-pointer hover:text-[#00D1E8]" onClick={() => navigate("events")}>이벤트 관리</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8A8A96]" />
            <span className="text-[#ECECEC] font-bold">상세 이벤트:</span>
            <span className="text-[#00D1E8] font-mono font-bold">{evtItem.id}</span>
          </div>

          <button
            onClick={() => navigate("events")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2A2A2F] hover:bg-[#333338] border border-[#333338] rounded text-xs text-[#ECECEC] hover:text-[#00D1E8] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>목록으로 돌아가기</span>
          </button>
        </div>

        {/* Detail Split columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-stretch">
          {/* Left Main (8 col): Summary card and SOP timeline */}
          <div className="lg:col-span-8 col-span-12 flex flex-col gap-4">
            {/* Primary content info block */}
            <div className="bg-[#222226] border border-[#333338] rounded-xl p-5 space-y-4 shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#333338] pb-3">
                <div className="flex items-center gap-3">
                  {getSeverityBadge(evtItem.severity)}
                  <h3 className="font-bold text-base text-[#ECECEC]">{evtItem.desc}</h3>
                </div>
                {getStatusBadge(evtItem.status)}
              </div>

              {/* Specifications row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-[#111113] border border-[#333338] p-2.5 rounded">
                  <span className="text-[#8A8A96] block mb-1">발생 시각:</span>
                  <span className="font-mono text-[#ECECEC] font-bold">{evtItem.time}</span>
                </div>
                <div className="bg-[#111113] border border-[#333338] p-2.5 rounded">
                  <span className="text-[#8A8A96] block mb-1">구역:</span>
                  <span className="text-[#ECECEC] font-bold">{getZoneName(evtItem.zoneId)}</span>
                </div>
                <div className="bg-[#111113] border border-[#333338] p-2.5 rounded">
                  <span className="text-[#8A8A96] block mb-1">시공사:</span>
                  <span className="text-[#00D1E8] font-semibold font-mono">{getZoneCompany(evtItem.zoneId)}</span>
                </div>
                <div className="bg-[#111113] border border-[#333338] p-2.5 rounded">
                  <span className="text-[#8A8A96] block mb-1">CCTV / 장치:</span>
                  <span className="text-[#ECECEC] font-mono">{evtItem.camera || "센서 노드 가동"}</span>
                </div>
                <div className="bg-[#111113] border border-[#333338] p-2.5 rounded">
                  <span className="text-[#8A8A96] block mb-1">담당자:</span>
                  <span className="text-[#ECECEC] font-bold">{evtItem.confirmedBy || evtItem.worker || "-"}</span>
                </div>
              </div>

              <div className="bg-[#111113] border border-[#333338] p-3 rounded-lg text-xs leading-relaxed">
                <span className="text-[#8A8A96] font-semibold block mb-1">감지 내용:</span>
                <p className="text-[#ECECEC]">{evtItem.desc}</p>
              </div>
            </div>

            {/* Processing Timeline */}
            <div className="bg-[#19191C] border border-[#2A2A2F] rounded-[8px] p-5 flex flex-col flex-grow">
              <h4 className="font-bold text-xs text-[#8A8A96] uppercase tracking-wider mb-4 flex items-center gap-1 shrink-0">
                <Clock className="w-4 h-4 text-[#00D1E8]" /> 이벤트 처리 이력
              </h4>

              <div className="relative pl-6 space-y-4 flex-1 overflow-y-auto">
                <div className="absolute left-2 top-1.5 bottom-1.5 w-0.5 bg-[#333338]"></div>

                {evtItem.sopHistory.map((sop, sIdx) => {
                  let dotColor = "bg-[#EF4444] shadow-[#EF4444]/20";
                  if (sop.action.includes("확인") || sop.action.includes("종결")) dotColor = "bg-[#22C55E] shadow-[#22C55E]/20";
                  else if (sop.action.includes("유예") || sop.action.includes("보류")) dotColor = "bg-[#F59E0B] shadow-[#F59E0B]/30";
                  else if (sop.action.includes("오탐")) dotColor = "bg-[#00D1E8] shadow-[#00D1E8]/30";

                  let actionText = sop.action;
                  if (sop.action.includes("확인")) actionText = "확인 처리";
                  else if (sop.action.includes("유예") || sop.action.includes("보류")) actionText = "보류 처리";
                  else if (sop.action.includes("오탐")) actionText = "오탐 처리";
                  else if (sop.action.includes("발생") || sop.action.includes("감지")) actionText = "이벤트 감지";

                  return (
                    <div key={sIdx} className="relative group text-xs">
                      <span className={`absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full border border-[#111113] shadow-md ${dotColor}`}></span>

                      <div className="bg-[#222226] border border-[#333338] p-3 rounded-lg flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-[#8A8A96] text-[11px] font-mono font-medium mr-2">[{sop.time}]</span>
                          <span className="text-[#ECECEC] text-[13px] font-semibold mr-2">
                            {actionText}
                          </span>
                          <span className="text-[11px] text-[#8A8A96] font-mono">
                            {sop.user === "시스템" ? "시스템" : `담당자: ${sop.user}`}
                          </span>
                        </div>
                        {sop.memo && (
                          <p className="w-full text-[#ECECEC] text-[12px] mt-1 pl-3 border-l border-[#333338]">
                            {sop.memo}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {evtItem.status === "ACTIVE" && (
                  <div className="relative group text-xs">
                    <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full border border-[#111113] bg-[#EF4444] animate-ping"></span>
                    <div className="bg-[#222226]/40 border border-[#333338] border-dashed p-3 rounded-lg text-[#8A8A96]">
                      미처리 상태 (대기 중)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Main (4 col): Dynamic Action form & simulated CCTV preview */}
          <div className="lg:col-span-4 col-span-12 flex flex-col gap-4">
            {/* Input Form card */}
            <div className="bg-[#222226] border border-[#333338] rounded-xl p-5 space-y-4 shrink-0">
              <h4 className="font-bold text-xs text-[#ECECEC] border-b border-[#333338] pb-2">이벤트 처리</h4>
              
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[#8A8A96] text-[11px] block mb-1">처리 상태:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTreatmentStatus("CONFIRMED")}
                      className={`py-1.5 px-2 rounded font-bold border transition-all cursor-pointer text-center ${
                        treatmentStatus === "CONFIRMED" 
                          ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/50" 
                          : "bg-[#111113] text-[#8A8A96] border-[#333338] hover:text-[#ECECEC]"
                      }`}
                    >
                      확인
                    </button>
                    <button
                      type="button"
                      onClick={() => setTreatmentStatus("PENDING")}
                      className={`py-1.5 px-2 rounded font-bold border transition-all cursor-pointer text-center ${
                        treatmentStatus === "PENDING" 
                          ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/50" 
                          : "bg-[#111113] text-[#8A8A96] border-[#333338] hover:text-[#ECECEC]"
                      }`}
                    >
                      보류
                    </button>
                    <button
                      type="button"
                      onClick={() => setTreatmentStatus("FALSE")}
                      className={`py-1.5 px-2 rounded font-bold border transition-all cursor-pointer text-center ${
                        treatmentStatus === "FALSE"
                          ? "bg-[#00D1E8]/10 text-[#00D1E8] border-[#00D1E8]/50"
                          : "bg-[#111113] text-[#8A8A96] border-[#333338] hover:text-[#ECECEC]"
                      }`}
                    >
                      오탐
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[#8A8A96] text-[11px] block mb-1">처리 내용</label>
                  <textarea
                    rows={3}
                    value={treatmentMemo}
                    onChange={(e) => setTreatmentMemo(e.target.value)}
                    placeholder=""
                    className="w-full bg-[#111113] border border-[#333338] rounded p-2 text-[#ECECEC] focus:outline-none focus:border-[#00D1E8] text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="text-[#8A8A96] text-[11px] block mb-1">담당자:</label>
                  <input
                    type="text"
                    value={treatmentUser}
                    onChange={(e) => setTreatmentUser(e.target.value)}
                    className="w-full bg-[#111113] border border-[#333338] rounded px-2.5 py-1.5 text-[#ECECEC] font-bold font-mono focus:outline-none text-xs"
                  />
                </div>

                <div className="pt-2 border-t border-[#333338] space-y-2">
                  <button
                    onClick={() => handleSopSaveSubmit(evtItem.id)}
                    className="w-full bg-[#00D1E8] text-[#111113] font-extrabold py-2 rounded-lg hover:bg-[#00D1E8]/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>저장</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated CCTV preview */}
            {evtItem.camera && (
              <div className="bg-[#222226] border border-[#333338] rounded-xl p-4 space-y-2 flex-grow flex flex-col justify-between">
                <div className="flex items-center justify-between shrink-0">
                  <span className="text-[10px] text-[#8A8A96] font-mono tracking-wider flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-[#00D1E8]" /> 현장 CCTV:
                  </span>
                  <span className="text-[10px] text-[#00D1E8] font-mono font-bold">{evtItem.camera}</span>
                </div>

                <div className="w-full flex-grow min-h-[150px] bg-[#111113] rounded border border-[#333338] overflow-hidden relative">
                  <div className="w-full h-full bg-[#111113] flex flex-col items-center justify-center p-4">
                    <span className="text-[11px] text-[#00D1E8] font-bold animate-pulse">● CCTV PREVIEW</span>
                  </div>

                  <button 
                    onClick={() => setZoomCCTV(true)}
                    className="absolute right-2 top-2 bg-[#111113]/70 border border-[#333338] p-1 rounded hover:bg-[#2A2A2F] hover:text-[#00D1E8] transition-all"
                  >
                    <Maximize className="w-3.5 h-3.5 text-[#ECECEC]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating CCTV Zoom component */}
        {zoomCCTV && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
            <div className="bg-[#222226] border border-[#333338] w-full max-w-lg rounded-xl overflow-hidden p-4 relative">
              <button 
                onClick={() => setZoomCCTV(false)}
                className="absolute right-4 top-4 bg-[#111113] border border-[#333338] p-1.5 rounded text-[#8A8A96] hover:text-[#ECECEC]"
              >
                <X className="w-4 h-4" />
              </button>
              <h4 className="font-bold text-xs text-[#00D1E8] mb-2">CCTV 영상 보기</h4>
              <div className="w-full aspect-video bg-black flex flex-col items-center justify-center text-[#8A8A96]">
                <span className="text-sm font-semibold text-[#ECECEC] animate-pulse">CAM-001 LIVE STREAM</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 page-transition flex flex-col min-h-[calc(100vh-100px)]">
      {/* 행 1: 페이지 제목 영역 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[18px] font-semibold text-[#ECECEC]">이벤트 관리</h2>
      </div>

      {/* 행 3: 필터 바 */}
      <div className="bg-[#19191C] border border-[#2A2A2F] rounded-[8px] py-3 px-4 flex flex-wrap gap-4 items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Zone */}
          <div className="flex flex-col">
            <span className="text-[10px] text-[#8A8A96] font-mono uppercase font-bold tracking-wider mb-1">구역</span>
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="bg-[#111113] border border-[#333338] text-[#ECECEC] text-xs px-2.5 py-1.5 rounded focus:outline-none"
            >
              <option value="ALL">전체 구역</option>
              {zoneList.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div className="flex flex-col">
            <span className="text-[10px] text-[#8A8A96] font-mono uppercase font-bold tracking-wider mb-1">유형</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#111113] border border-[#333338] text-[#ECECEC] text-xs px-2.5 py-1.5 rounded focus:outline-none"
            >
              <option value="ALL">전체 유형</option>
              <option value="AI">AI</option>
              <option value="센서">센서</option>
              <option value="SOS">SOS</option>
            </select>
          </div>

          {/* Severity/Grade */}
          <div className="flex flex-col">
            <span className="text-[10px] text-[#8A8A96] font-mono uppercase font-bold tracking-wider mb-1">등급</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-[#111113] border border-[#333338] text-[#ECECEC] text-xs px-2.5 py-1.5 rounded focus:outline-none"
            >
              <option value="ALL">전체 등급</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          {/* Status (Label removed -> Dropdown only) */}
          <div className="flex flex-col justify-end">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#111113] border border-[#333338] text-[#ECECEC] text-xs px-2.5 py-1.5 rounded focus:outline-none mt-4"
            >
              <option value="ALL">전체 상태</option>
              <option value="ACTIVE">미처리</option>
              <option value="CONFIRMED">처리완료</option>
              <option value="PENDING">보류</option>
            </select>
          </div>
        </div>

        {/* Search Input (Placeholder deleted) */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder=""
            className="bg-[#111113] border border-[#333338] text-[#ECECEC] px-3 py-1.5 pr-8 rounded text-xs focus:outline-none focus:border-[#00D1E8] w-48"
          />
          <Search className="w-3.5 h-3.5 text-[#8A8A96] absolute right-2.5 top-2.5" />
        </div>
      </div>

      {/* Events Table Container */}
      <div className="bg-[#222226] border border-[#333338] rounded-xl overflow-hidden flex-1">
        <div className="px-4 py-2.5 bg-[#111113]/60 border-b border-[#333338] flex items-center justify-between">
          <span className="text-[10px] text-[#8A8A96] font-mono tracking-wider uppercase flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#00D1E8]" /> 발생 목록 ({filteredEvents.length}건)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#ECECEC]">
            <thead>
              <tr className="bg-[#19191C] border-b border-[#333338] text-[#8A8A96] font-semibold uppercase text-[11px] tracking-[0.08em]">
                <th className="p-3">이벤트 ID</th>
                <th className="p-3">발생 시각</th>
                <th className="p-3">구역</th>
                <th className="p-3">유형</th>
                <th className="p-3">감지 내용</th>
                <th className="p-3">등급</th>
                <th className="p-3">담당자</th>
                <th className="p-3 text-center">결과</th>
                <th className="p-3 text-center">중요</th>
                <th className="p-3 text-right">상태 관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333338]">
              {filteredEvents.map((evt) => {
                let rowBgStyle = "";
                if (evt.severity === "CRITICAL") {
                  rowBgStyle = "bg-[rgba(239,68,68,0.04)] border-l-2 border-[#EF4444]";
                } else if (evt.severity === "HIGH") {
                  rowBgStyle = "bg-[rgba(245,158,11,0.04)] border-l-2 border-[#F59E0B]";
                } else {
                  rowBgStyle = "bg-transparent border-l-2 border-[#333338]";
                }

                return (
                  <tr 
                    key={evt.id} 
                    className={`${rowBgStyle} hover:bg-[#2A2A2F] transition-colors cursor-pointer`}
                    onClick={() => navigate("event-detail", { eventId: evt.id })}
                  >
                    <td className="p-3 font-mono font-bold text-[#00D1E8] text-[11px]">{evt.id}</td>
                    <td className="p-3 font-mono text-[#8A8A96]">{evt.time}</td>
                    <td className="p-3 font-bold text-[#ECECEC]">
                      {getZoneName(evt.zoneId)}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-semibold text-[#8A8A96] tracking-wider bg-[#111113] border border-[#333338] px-1.5 py-0.5 rounded font-mono">
                        {evt.type === "DEVICE" ? "센서" : evt.type}
                      </span>
                    </td>
                    <td className="p-3 text-[#ECECEC] max-w-[200px] truncate">{evt.desc}</td>
                    <td className="p-3">{getSeverityBadge(evt.severity)}</td>
                    <td className="p-3 font-mono text-[#ECECEC] font-bold">{evt.confirmedBy || "-"}</td>
                    <td className="p-3 text-center font-bold text-[11px]">
                      {evt.status === "CONFIRMED" ? (
                        evt.result === "오탐" ? (
                          <span className="text-[#F59E0B]">오탐</span>
                        ) : (
                          <span className="text-[#22C55E]">탐지</span>
                        )
                      ) : (
                        <span className="text-[#8A8A96]">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => triggerToggleImportant(evt.id)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        title="중요"
                      >
                        <Star 
                          className={`w-4 h-4 ${
                            evt.isImportant 
                              ? "text-[#F59E0B] fill-[#F59E0B]" 
                              : "text-[#8A8A96] hover:text-[#F59E0B]"
                          }`} 
                        />
                      </button>
                    </td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5">
                        {evt.status === "ACTIVE" && (
                          <>
                            <button
                              onClick={() => triggerQuickConfirm(evt.id)}
                              className="px-2 py-0.5 bg-[#22C55E] hover:bg-[#22C55E]/90 text-[#111113] font-bold rounded text-[10px] transition-colors cursor-pointer"
                            >
                              확인
                            </button>
                            <button
                              onClick={() => triggerQuickPending(evt.id)}
                              className="px-2 py-0.5 bg-[#F59E0B]/80 hover:bg-[#F59E0B] text-[#111113] font-bold rounded text-[10px] transition-colors cursor-pointer"
                            >
                              보류
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => triggerQuickFalseAlarm(evt.id)}
                          className="px-1.5 py-0.5 border border-[#333338] text-[#8A8A96] hover:text-[#00D1E8] hover:border-[#00D1E8] text-[10px] rounded transition-all cursor-pointer"
                        >
                          오탐
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-[#8A8A96] space-y-2">
                    <CheckCircle className="w-8 h-8 text-[#22C55E] mx-auto" />
                    <p className="text-sm">검색 조건에 해당하거나 미처리 상태인 이벤트가 존재하지 않습니다.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
