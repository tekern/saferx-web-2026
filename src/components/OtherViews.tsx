/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Company, User, TbmItem, SafetyEvent, EventStatus, Zone, Notice } from "../types";
import { COMPANIES, USERS, TBM_LIST, ZONES, INIT_NOTICES } from "../data";
import { 
  Truck, HardHat, ShieldAlert, CheckCircle, BarChart3, Settings, 
  HelpCircle, Printer, Plus, Edit2, ToggleLeft, ToggleRight, Trash2, 
  Volume2, ShieldCheck, Cpu, Database, UserPlus, Info, Lock, ArrowLeft, ArrowRight,
  Calendar, Clock, Check, X, Filter, Users, FileText, Download, MapPin, AlertTriangle,
  Megaphone, Building2, Bell, Send, Eye
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface OtherViewsProps {
  currentPage: string;
  navigate: (page: string, params?: any) => void;
  events?: SafetyEvent[];
  tbmList: TbmItem[];
  setTbmList: React.Dispatch<React.SetStateAction<TbmItem[]>>;
  availableZones?: Zone[];
  currentZoneFilter?: string;
  zonesList?: Zone[];
  setZonesList?: React.Dispatch<React.SetStateAction<Zone[]>>;
  noticesList?: Notice[];
  setNoticesList?: React.Dispatch<React.SetStateAction<Notice[]>>;
  companiesList?: Company[];
  setCompaniesList?: React.Dispatch<React.SetStateAction<Company[]>>;
  isSiteManager?: boolean;
  currentUserName?: string;
}

export default function OtherViews({ 
  currentPage, 
  navigate, 
  events, 
  tbmList, 
  setTbmList, 
  availableZones, 
  currentZoneFilter, 
  zonesList, 
  setZonesList,
  noticesList,
  setNoticesList,
  companiesList,
  setCompaniesList,
  isSiteManager,
  currentUserName
}: OtherViewsProps) {
  // Page 6: 중장비 경보관리 (heavy)
  if (currentPage === "heavy") {
    return <HeavyMachineryView />;
  }
  // Page 8: TBM 현황 (tbm)
  if (currentPage === "tbm") {
    return <TBMStatusView tbmList={tbmList} setTbmList={setTbmList} availableZones={availableZones} />;
  }
  // Page 9: 협력사 관리 (companies)
  if (currentPage === "companies") {
    return (
      <CompaniesView 
        companiesList={companiesList || COMPANIES} 
        setCompaniesList={setCompaniesList} 
        availableZones={availableZones || zonesList || ZONES}
      />
    );
  }
  // Page 10: 사용자 관리 (users)
  if (currentPage === "users") {
    return <UsersManagementView />;
  }
  // Page 11: AI 분석 현황 (ai)
  if (currentPage === "ai") {
    return <AIAnalysisView events={events} navigate={navigate} />;
  }
  // Page 12: 리포트 (reports)
  if (currentPage === "reports") {
    return <ReportsView />;
  }
  // Page 13: 시스템 설정 (settings)
  if (currentPage === "settings") {
    return <SystemSettingsView />;
  }
  // Page 14: 현장 관리 (sites)
  if (currentPage === "sites") {
    return <SiteManagementView zonesList={zonesList || availableZones || ZONES} setZonesList={setZonesList} />;
  }
  // Page 15: 공지사항 (notice)
  if (currentPage === "notice") {
    return (
      <NoticeManagementView 
        noticesList={noticesList || INIT_NOTICES} 
        setNoticesList={setNoticesList} 
        availableZones={availableZones || zonesList || ZONES}
        isSiteManager={isSiteManager}
        currentUserName={currentUserName}
      />
    );
  }

  return null;
}

// 🚛 PAGE 6: Heavy Machinery Telemetry
function HeavyMachineryView() {
  const machinery = [
    { zone: "왕숙1구역", type: "타워크레인(TC-02)", speed: "운행중", status: "정상", check: "금일 완료", alarm: 0 },
    { zone: "왕숙1구역", type: "굴착기(EX-04)", speed: "정지", status: "정상", check: "금일 완료", alarm: 2 },
    { zone: "왕숙2구역", type: "항타기(PD-01)", speed: "운행중", status: "경보 (선로 임박)", check: "금일 완료", alarm: 5 },
    { zone: "왕숙3구역", type: "지게차(FL-05)", speed: "정지", status: "정상", check: "금일 완료", alarm: 1 },
  ];

  return (
    <div className="space-y-4 page-transition">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Machinery Status Table */}
        <div className="lg:col-span-2 bg-panel border border-border-main rounded-xl p-4">
          <h4 className="font-bold text-xs text-text-sub uppercase border-b border-border-main pb-2 mb-3 flex items-center gap-1">
            <Truck className="w-4 h-4 text-cyan" /> 구역별 중장비 안전제어 스마트 수신 현황
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-main">
              <thead>
                <tr className="border-b border-border-main text-text-sub bg-card">
                  <th className="p-2">배치구역</th>
                  <th className="p-2">중장비 기종</th>
                  <th className="p-2">가동성</th>
                  <th className="p-2">충돌 경보 필터</th>
                  <th className="p-2">정기 점검 여부</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dim">
                {machinery.map((m, idx) => (
                  <tr key={idx} className="hover:bg-hover/30">
                    <td className="p-2 font-bold">{m.zone}</td>
                    <td className="p-2 font-mono text-cyan">{m.type}</td>
                    <td className="p-2 font-mono">{m.speed}</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        m.alarm > 3 ? "bg-red/10 text-red animate-pulse" : "bg-green/10 text-green"
                      }`}>
                        {m.status} ({m.alarm}회 감지)
                      </span>
                    </td>
                    <td className="p-2 text-text-sub">{m.check}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alarm SVG Doughnut chart */}
        <div className="bg-panel border border-border-main rounded-xl p-4 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-xs text-text-sub border-b border-border-main pb-2 mb-3 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-orange" /> 중장비 근접 충돌 방지센서 알람 요약
            </h4>
            <div className="flex items-center justify-center p-4">
              <svg width="100" height="100" viewBox="0 0 36 36" className="transform -rotate-95">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10233d" strokeWidth="4" />
                {/* 62% for Danger sensor warnings */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e03030" strokeWidth="4" strokeDasharray="62 38" />
                {/* 38% for resolved warnings */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#00c853" strokeWidth="4" strokeDasharray="38 62" strokeDashoffset="62" />
              </svg>
            </div>
          </div>
          <div className="text-xs space-y-1.5 font-mono pt-2 border-t border-border-dim">
            <div className="flex justify-between">
              <span className="text-red">● 총 근접 센서 알림 수 (금일):</span>
              <span className="font-bold text-text-main">9건 발생</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green">● 현장 통신원 피드백 조치:</span>
              <span className="font-bold text-text-main">9건 즉시 대피완료</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 📋 PAGE 8: Daily safety TBM Register
const MOCK_WORKERS_BY_ZONE: Record<string, { name: string; dept: string; role: string }[]> = {
  "왕숙1구역": [
    { name: "김민준", dept: "현대건설", role: "철근공" },
    { name: "이서준", dept: "현대건설", role: "형틀목공" },
    { name: "박현우", dept: "현대건설", role: "안전관리원" },
    { name: "정도윤", dept: "현대건설", role: "중장비 기사" },
    { name: "최시우", dept: "현대건설", role: "잡부" },
  ],
  "왕숙2구역": [
    { name: "이현장", dept: "삼성물산", role: "현장소장" },
    { name: "김관수", dept: "삼성물산", role: "안전관리원" },
    { name: "박철수", dept: "삼성물산", role: "전기공" },
    { name: "오영희", dept: "삼성물산", role: "측량사" },
  ],
  "왕숙3구역": [
    { name: "최안전", dept: "대우건설", role: "안전관리원" },
    { name: "박현장", dept: "대우건설", role: "현장소장" },
    { name: "강명수", dept: "대우건설", role: "용접공" },
    { name: "윤철민", dept: "대우건설", role: "배관공" },
  ],
};

const MOCK_WORKERS_FOR_CREATION: Record<string, { name: string; job: string }[]> = {
  "왕숙1구역": [
    { name: "김상훈", job: "형틀목공" },
    { name: "최동현", job: "용접공" },
    { name: "정재원", job: "전기공" },
    { name: "김민준", job: "철근공" },
    { name: "이서준", job: "형틀목공" },
    { name: "박현우", job: "비계공" },
    { name: "정도윤", job: "용접공" },
    { name: "최시우", job: "전기공" },
    { name: "이지호", job: "철근공" },
    { name: "강도현", job: "형틀목공" },
    { name: "윤건우", job: "철근공" },
    { name: "신우진", job: "전기공" },
  ],
  "왕숙2구역": [
    { name: "이현우", job: "철근공" },
    { name: "박민석", job: "조적공" },
    { name: "최진수", job: "비계공" },
    { name: "박철수", job: "전기공" },
    { name: "오영희", job: "측량사" },
    { name: "임재원", job: "용접공" },
    { name: "한지훈", job: "형틀목공" },
    { name: "서민재", job: "철근공" },
    { name: "권우주", job: "비계공" },
    { name: "배윤성", job: "조적공" },
  ],
  "왕숙3구역": [
    { name: "강명수", job: "용접공" },
    { name: "윤철민", job: "배관공" },
    { name: "정성진", job: "형틀목공" },
    { name: "한민우", job: "철근공" },
    { name: "송지훈", job: "전기공" },
    { name: "유호성", job: "비계공" },
    { name: "조현석", job: "배관공" },
    { name: "황정민", job: "용접공" },
  ],
};

const SignatureThumbnail = ({ name, onClick }: { name: string; onClick?: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className={`w-16 h-8 bg-[var(--bg-base)] border border-[var(--border-default)] rounded flex items-center justify-center relative overflow-hidden select-none transition-all ${onClick ? 'cursor-pointer hover:border-cyan/80 hover:bg-[var(--bg-hover)]' : ''}`}
    >
      <svg className="absolute inset-0 w-full h-full text-cyan/25 opacity-70" viewBox="0 0 100 50">
        <path d="M 15 35 Q 30 15 45 32 T 75 18 T 90 35" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 25 25 Q 55 10 85 40" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <span className="font-serif text-[10px] text-cyan/90 z-10 font-bold italic tracking-wider">{name}</span>
    </div>
  );
};

function TBMStatusView({
  tbmList,
  setTbmList,
  availableZones
}: {
  tbmList: TbmItem[];
  setTbmList: React.Dispatch<React.SetStateAction<TbmItem[]>>;
  availableZones?: Zone[];
}) {
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [activeTbm, setActiveTbm] = useState<any | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const zoneList = availableZones || ZONES;

  // Filter states
  const [filterZone, setFilterZone] = useState<string>("ALL");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL"); // ALL, BEFORE, COMPLETED

  // Creation Modal states
  const [newZone, setNewZone] = useState(() => zoneList[0]?.name || "왕숙1구역");
  const [newDate, setNewDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [newTime, setNewTime] = useState("07:30");
  const [newManager, setNewManager] = useState("");
  const [newHasRiskAssessment, setNewHasRiskAssessment] = useState("예");
  const [newWorkContent, setNewWorkContent] = useState("");
  
  // Hazards and Measures
  const [hazard1, setHazard1] = useState("");
  const [measure1, setMeasure1] = useState("");
  const [hazard2, setHazard2] = useState("");
  const [measure2, setMeasure2] = useState("");
  const [hazard3, setHazard3] = useState("");
  const [measure3, setMeasure3] = useState("");
  const [primaryHazardIndex, setPrimaryHazardIndex] = useState<number>(1);

  // Attendees selection in Modal
  const availableWorkers = MOCK_WORKERS_FOR_CREATION[newZone] || [];
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]); // Array of worker name labels

  // Confirm dialog states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bigSignatureWorker, setBigSignatureWorker] = useState<any | null>(null);

  // Validation tracking
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Update selected workers when zone changes
  useEffect(() => {
    setSelectedWorkers([]);
  }, [newZone]);

  // Lock or default primary hazard index if secondary/tertiary are empty
  useEffect(() => {
    const has2 = !!hazard2.trim();
    const has3 = !!hazard3.trim();
    if (!has2 && !has3) {
      setPrimaryHazardIndex(1);
    }
  }, [hazard2, hazard3]);

  // Sync active TBM with updated tbmList
  useEffect(() => {
    if (activeTbm) {
      const updated = tbmList.find(t => t.id === activeTbm.id);
      if (updated) {
        setActiveTbm(updated);
      }
    }
  }, [tbmList]);

  // TBM List Filtering Logic
  const filteredTbmList = tbmList.filter(item => {
    if (filterZone !== "ALL") {
      if (item.zone !== filterZone && item.zoneId !== filterZone) return false;
    } else {
      if (!zoneList.some(z => z.id === item.zoneId || z.name === item.zone)) return false;
    }
    if (filterStartDate && item.date < filterStartDate) return false;
    if (filterEndDate && item.date > filterEndDate) return false;
    if (filterStatus !== "ALL") {
      if (filterStatus === "BEFORE" && item.status !== "BEFORE") return false;
      if (filterStatus === "COMPLETED" && item.status !== "COMPLETED") return false;
    }
    return true;
  });

  // Handle Create Submit
  const handleCreateSubmit = () => {
    setFormSubmitted(true);

    // Validation checks
    if (!newZone || !newDate || !newTime || !newManager.trim() || !newWorkContent.trim() || !hazard1.trim() || !measure1.trim() || selectedWorkers.length === 0) {
      return;
    }

    const zoneIdMap: Record<string, string> = {
      "왕숙1구역": "z1",
      "왕숙2구역": "z2",
      "왕숙3구역": "z3",
    };

    const newTbmId = `tbm-${Date.now()}`;
    const newTbmItem: TbmItem = {
      id: newTbmId,
      zoneId: zoneIdMap[newZone] || "z1",
      zone: newZone,
      date: newDate,
      time: newTime,
      manager: newManager.trim(),
      hasRiskAssessment: newHasRiskAssessment,
      workContent: newWorkContent.trim(),
      hazard1: hazard1.trim(),
      measure1: measure1.trim(),
      hazard2: hazard2.trim() || undefined,
      measure2: measure2.trim() || undefined,
      hazard3: hazard3.trim() || undefined,
      measure3: measure3.trim() || undefined,
      primaryHazardIndex,
      total: selectedWorkers.length,
      completed: 0,
      rate: 0,
      status: "BEFORE",
      attendees: selectedWorkers.map(label => {
        const matchingWorker = availableWorkers.find(w => `${w.name} (${w.job})` === label);
        return {
          name: matchingWorker ? matchingWorker.name : label.split(" ")[0],
          job: matchingWorker ? matchingWorker.job : "근로자",
          signed: false
        };
      })
    };

    setTbmList(prev => [newTbmItem, ...prev]);
    setIsCreateOpen(false);

    // Reset Form
    setNewZone("왕숙1구역");
    setNewManager("");
    setNewHasRiskAssessment("예");
    setNewWorkContent("");
    setHazard1("");
    setMeasure1("");
    setHazard2("");
    setMeasure2("");
    setHazard3("");
    setMeasure3("");
    setPrimaryHazardIndex(1);
    setSelectedWorkers([]);
    setFormSubmitted(false);
  };

  // Toggle single attendee selection
  const handleToggleWorker = (label: string) => {
    if (selectedWorkers.includes(label)) {
      setSelectedWorkers(prev => prev.filter(x => x !== label));
    } else {
      setSelectedWorkers(prev => [...prev, label]);
    }
  };

  // Select/Deselect All Attendees
  const handleSelectAllWorkers = () => {
    if (selectedWorkers.length === availableWorkers.length) {
      setSelectedWorkers([]);
    } else {
      setSelectedWorkers(availableWorkers.map(w => `${w.name} (${w.job})`));
    }
  };

  // Delete TBM Confirmation
  const triggerDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = (id: string) => {
    setTbmList(prev => prev.filter(t => t.id !== id));
    setDeleteConfirmId(null);
    if (activeTbm && activeTbm.id === id) {
      setCurrentView('list');
      setActiveTbm(null);
    }
  };

  // Simulate TBM signing completed instantly (highly functional testing feature)
  const handleSimulateSigningComplete = (tbm: any) => {
    const updatedList = tbmList.map(t => {
      if (t.id === tbm.id) {
        const now = new Date();
        const timeNow = now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
        
        // Randomly sign most participants, leaving 3 unsigned for realism as specified in mockup section 5
        const updatedAttendees = t.attendees.map((att: any, idx: number) => {
          if (idx < 3) {
            return { ...att, signed: false };
          }
          return { ...att, signed: true };
        });

        const totalAttendees = updatedAttendees.length;
        const completedCount = updatedAttendees.filter((a: any) => a.signed).length;
        const finalRate = parseFloat(((completedCount / totalAttendees) * 100).toFixed(1));

        return {
          ...t,
          status: "COMPLETED" as any,
          completed: completedCount,
          rate: finalRate,
          completedAt: `${t.date} ${timeNow}`,
          leaderSignature: t.manager,
          attendees: updatedAttendees
        };
      }
      return t;
    });

    setTbmList(updatedList);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilterZone("ALL");
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterStatus("ALL");
  };

  return (
    <div className="space-y-4 page-transition text-xs flex flex-col min-h-[calc(100vh-100px)]">
      
      {/* ────────────────────────────────────────────────────────
          VIEW 1: TBM LIST VIEW
          ──────────────────────────────────────────────────────── */}
      {currentView === 'list' && (
        <div className="space-y-4 flex flex-col flex-1">
          
          {/* 行 1: 페이지 제목 영역 */}
          <div className="flex items-center justify-between mb-4 select-none">
            <h2 className="text-[18px] font-semibold text-[#ECECEC]">TBM 관리</h2>
            
            <button
              onClick={() => {
                setFormSubmitted(false);
                setIsCreateOpen(true);
              }}
              className="px-4 py-2.5 bg-[#00D1E8] hover:bg-[#00e1ff] text-[#0A0A0C] font-semibold rounded-lg shadow-lg shadow-cyan/10 hover:shadow-cyan/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> TBM 생성
            </button>
          </div>

          {/* 행 3: 필터 바 */}
          <div className="bg-[#19191C] border border-[#2A2A2F] rounded-[8px] py-3 px-4 flex flex-wrap gap-4 items-end mb-4">
            
            {/* Zone Filter */}
            <div className="flex-1 min-w-[150px] space-y-1.5">
              <label className="text-[10px] font-bold text-text-sub flex items-center gap-1 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-cyan" /> 구역 선택
              </label>
              <select
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className="w-full bg-[#222226] border border-[#333338] text-text-main py-2 px-3 rounded-lg focus:border-cyan outline-none transition-all"
              >
                <option value="ALL">전체 구역</option>
                {zoneList.map(z => (
                  <option key={z.id} value={z.name}>{z.name}</option>
                ))}
              </select>
            </div>

            {/* Date Range Picker */}
            <div className="flex-2 min-w-[280px] space-y-1.5">
              <label className="text-[10px] font-bold text-text-sub flex items-center gap-1 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-cyan" /> 날짜 범위 선택
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="flex-1 bg-[#222226] border border-[#333338] text-text-main py-2 px-3 rounded-lg focus:border-cyan outline-none"
                />
                <span className="text-text-dim text-[11px]">~</span>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="flex-1 bg-[#222226] border border-[#333338] text-text-main py-2 px-3 rounded-lg focus:border-cyan outline-none"
                />
              </div>
            </div>

            {/* Status Segmented/Select Filter */}
            <div className="flex-1 min-w-[150px] space-y-1.5">
              <label className="text-[10px] font-bold text-text-sub flex items-center gap-1 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan" /> TBM 상태
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-[#222226] border border-[#333338] text-text-main py-2 px-3 rounded-lg focus:border-cyan outline-none transition-all"
              >
                <option value="ALL">전체 상태</option>
                <option value="BEFORE">수행 전</option>
                <option value="COMPLETED">수행 완료</option>
              </select>
            </div>

            {/* Reset Button */}
            {(filterZone !== "ALL" || filterStartDate || filterEndDate || filterStatus !== "ALL") && (
              <button
                onClick={handleResetFilters}
                className="py-2 px-4 bg-[#19191C] hover:bg-[#2A2A2F] text-text-sub rounded-lg font-bold hover:text-white transition-all cursor-pointer whitespace-nowrap border border-[#333338]"
              >
                필터 초기화
              </button>
            )}
          </div>

          {/* Table Container */}
          <div className="bg-[#222226] border border-[#333338] rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#19191C] border-b border-[#2A2A2F] text-text-sub text-[10px] tracking-wider uppercase">
                    <th className="p-3.5 pl-5 font-bold">일자</th>
                    <th className="p-3.5 font-bold">공사 현장</th>
                    <th className="p-3.5 font-bold">총 출역 인원</th>
                    <th className="p-3.5 font-bold">TBM 서명 인원</th>
                    <th className="p-3.5 font-bold">완료율</th>
                    <th className="p-3.5 font-bold">TBM 리더</th>
                    <th className="p-3.5 font-bold">상태</th>
                    <th className="p-3.5 pr-5 font-bold text-right">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#10243e]/40">
                  {filteredTbmList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-text-dim text-[11px]">
                        등록된 TBM이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredTbmList.map((t) => {
                      // Status Badge classes
                      let badgeClass = "";
                      let statusText = "";
                      
                      if (t.status === "BEFORE") {
                        badgeClass = "bg-amber-500/10 text-amber-500 border border-amber-500/20";
                        statusText = "수행 전";
                      } else if (t.status === "COMPLETED") {
                        badgeClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                        statusText = "수행 완료";
                      } else {
                        badgeClass = "bg-sky-500/10 text-sky-400 border border-sky-500/20";
                        statusText = "진행 중";
                      }

                      // Progress bar color
                      const progColor = t.rate >= 95 ? 'bg-cyan' : t.rate >= 80 ? 'bg-amber-500' : 'bg-red-500';

                      return (
                        <tr 
                          key={t.id}
                          className="hover:bg-hover/35 transition-all group"
                        >
                          <td className="p-3.5 pl-5 font-mono text-text-dim">{t.date}</td>
                          <td className="p-3.5 font-extrabold text-text-primary">{t.zone}</td>
                          <td className="p-3.5 font-mono text-text-sub">{t.total}명</td>
                          <td className="p-3.5 font-mono text-text-sub">{t.completed}명</td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2 max-w-[120px]">
                              <div className="flex-1 bg-outer h-1.5 rounded-full overflow-hidden">
                                <div style={{ width: `${t.rate}%` }} className={`h-full ${progColor}`} />
                              </div>
                              <span className="font-mono font-black text-text-primary text-[11px] shrink-0">{t.rate}%</span>
                            </div>
                          </td>
                          <td className="p-3.5 font-semibold text-text-main">{t.manager}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${badgeClass}`}>
                              {statusText}
                            </span>
                          </td>
                          <td className="p-3.5 pr-5 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => {
                                  setActiveTbm(t);
                                  setCurrentView('detail');
                                }}
                                className="px-3 py-1 bg-panel hover:bg-cyan hover:text-outer border border-border-main text-cyan font-bold rounded transition-all cursor-pointer"
                              >
                                상세 보기
                              </button>
                              
                              {t.status === "BEFORE" && (
                                <button
                                  onClick={(e) => triggerDelete(t.id, e)}
                                  className="px-3 py-1 bg-red-950/20 hover:bg-red/90 text-red hover:text-text-primary border border-red/30 rounded font-bold transition-all cursor-pointer"
                                >
                                  삭제
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          VIEW 2: TBM DETAIL VIEW (PAGE TRANSITION)
          ──────────────────────────────────────────────────────── */}
      {currentView === 'detail' && activeTbm && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Top Navbar */}
          <div className="flex items-center justify-between bg-panel border border-border-main rounded-xl p-4 shadow-lg">
            <button
              onClick={() => {
                setCurrentView('list');
                setActiveTbm(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-card hover:bg-cyan hover:text-outer border border-border-main text-cyan font-extrabold rounded-lg transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>이전 목록</span>
            </button>
            
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-text-dim">문서번호: saferx-tbm-{activeTbm.id.replace('tbm-', '')}</span>
              
              {/* Status Badge */}
              <span className={`px-3 py-1 text-xs font-black rounded-full border ${
                activeTbm.status === "BEFORE"
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
               }`}>
                {activeTbm.status === "BEFORE" ? "수행 전" : "수행 완료"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Left side column: Cards (Info, Content, Hazard Table) */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Section 1: 기본 정보 카드 */}
              <div className="bg-panel border border-border-main rounded-xl p-5 shadow-lg space-y-3">
                <h3 className="text-xs font-black text-cyan uppercase tracking-wider flex items-center gap-1.5 border-b border-border-main pb-2">
                  <FileText className="w-4 h-4" /> 점검 기본 사항 (법적 서식)
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4.5 text-xs">
                  <div className="space-y-1">
                    <span className="text-text-dim block">공사 현장</span>
                    <span className="text-text-primary font-extrabold text-[13px]">{activeTbm.zone}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-text-dim block">점검 일자</span>
                    <span className="text-text-primary font-mono font-bold">{activeTbm.date}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-text-dim block">시작 시간</span>
                    <span className="text-text-primary font-mono font-bold">{activeTbm.time}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-text-dim block">TBM 리더</span>
                    <span className="text-text-primary font-bold">{activeTbm.manager} 리더</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-text-dim block">위험성평가 실시 여부</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[11px] inline-block ${
                      activeTbm.hasRiskAssessment === "예"
                        ? "bg-cyan/15 text-cyan border border-cyan/30"
                        : "bg-red/15 text-red border border-red/30"
                    }`}>
                      {activeTbm.hasRiskAssessment || "예"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: 작업 내용 카드 */}
              <div className="bg-panel border border-border-main rounded-xl p-5 shadow-lg space-y-3">
                <h3 className="text-xs font-black text-cyan uppercase tracking-wider flex items-center gap-1.5 border-b border-border-main pb-2">
                  <ShieldAlert className="w-4 h-4" /> 당일 작업 내용
                </h3>
                <p className="text-text-sub leading-relaxed whitespace-pre-wrap bg-outer p-4 border border-border-dim rounded-lg">
                  {activeTbm.workContent}
                </p>
              </div>

              {/* Section 3: 위험요인 및 대책 카드 */}
              <div className="bg-panel border border-border-main rounded-xl p-5 shadow-lg space-y-3">
                <h3 className="text-xs font-black text-cyan uppercase tracking-wider flex items-center gap-1.5 border-b border-border-main pb-2">
                  <Cpu className="w-4 h-4" /> 주요 위험요인 및 세부 대책안
                </h3>

                <div className="border border-border-main rounded-lg overflow-hidden">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-outer border-b border-border-main text-text-sub font-bold text-[10px] uppercase">
                        <th className="p-3 w-16 text-center">구분</th>
                        <th className="p-3">위험 요인</th>
                        <th className="p-3">안전 대책</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {/* Row 1 */}
                      <tr className={`hover:bg-[#2A2A2F]/40 ${activeTbm.primaryHazardIndex === 1 ? 'bg-cyan/5 border-l-2 border-cyan' : ''}`}>
                        <td className="p-3 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <span className="font-bold text-white text-[11px]">❶</span>
                            {activeTbm.primaryHazardIndex === 1 && (
                              <span className="text-[9px] bg-cyan/20 text-cyan px-1 rounded font-black mt-1">중점</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-text-main">{activeTbm.hazard1}</td>
                        <td className="p-3 text-text-sub">{activeTbm.measure1}</td>
                      </tr>

                      {/* Row 2 */}
                      {activeTbm.hazard2 && (
                        <tr className={`hover:bg-[#2A2A2F]/40 ${activeTbm.primaryHazardIndex === 2 ? 'bg-cyan/5 border-l-2 border-cyan' : ''}`}>
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <span className="font-bold text-white text-[11px]">❷</span>
                              {activeTbm.primaryHazardIndex === 2 && (
                                <span className="text-[9px] bg-cyan/20 text-cyan px-1 rounded font-black mt-1">중점</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-text-main">{activeTbm.hazard2}</td>
                          <td className="p-3 text-text-sub">{activeTbm.measure2}</td>
                        </tr>
                      )}

                      {/* Row 3 */}
                      {activeTbm.hazard3 && (
                        <tr className={`hover:bg-[#2A2A2F]/40 ${activeTbm.primaryHazardIndex === 3 ? 'bg-cyan/5 border-l-2 border-cyan' : ''}`}>
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <span className="font-bold text-white text-[11px]">❸</span>
                              {activeTbm.primaryHazardIndex === 3 && (
                                <span className="text-[9px] bg-cyan/20 text-cyan px-1 rounded font-black mt-1">중점</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-text-main">{activeTbm.hazard3}</td>
                          <td className="p-3 text-text-sub">{activeTbm.measure3}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Star Accent of Primary Hazard */}
                <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-lg flex items-start gap-2.5 mt-2">
                  <span className="text-base font-bold text-yellow-500 select-none">★</span>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider block">중점위험요인</span>
                    <p className="text-[11px] font-extrabold text-white">
                      {activeTbm.primaryHazardIndex === 1 ? activeTbm.hazard1 : activeTbm.primaryHazardIndex === 2 ? activeTbm.hazard2 : activeTbm.hazard3}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side column: Signature Status Panel */}
            <div className="space-y-4">
              
              {/* Section 4: 참석자 서명 현황 카드 */}
              <div className="bg-[#222226] border border-[#333338] rounded-xl p-5 shadow-lg space-y-4">
                <div className="border-b border-[#333338] pb-2">
                  <h3 className="text-xs font-black text-cyan uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> 참석자 서명 현황
                  </h3>
                </div>

                {/* Progress bar & details */}
                <div className="bg-[#19191C] p-4.5 border border-[#333338]/60 rounded-xl space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-text-sub font-semibold">TBM 이수 현황</span>
                    <span className="font-mono text-cyan font-black text-[15px]">
                      {activeTbm.completed} / {activeTbm.total} 명 ({activeTbm.rate}%)
                    </span>
                  </div>

                  <div className="w-full bg-outer h-2 rounded-full overflow-hidden border border-[#333338]">
                    <div 
                      style={{ width: `${activeTbm.rate}%` }} 
                      className="bg-cyan h-full shadow-lg shadow-cyan/30 rounded-full transition-all duration-500" 
                    />
                  </div>
                </div>

                {/* Attendees list grid */}
                <div className="space-y-2">
                  <span className="text-[10px] text-text-dim uppercase tracking-wider block font-bold">소속 근로자 명단 (서명 대기/완료)</span>
                  <div className="grid grid-cols-2 gap-2.5 max-h-[290px] overflow-y-auto pr-1 scrollbar-thin">
                    {activeTbm.attendees && activeTbm.attendees.map((att: any, idx: number) => {
                      return (
                        <div 
                          key={idx}
                          className={`p-2 bg-[#19191C]/80 border ${att.signed ? 'border-cyan/30 bg-[#2A2A2F]/20' : 'border-[#333338]'} rounded-lg flex items-center justify-between gap-1.5`}
                        >
                          <div className="min-w-0">
                            <span className="text-white font-extrabold truncate block text-[11px]">{att.name}</span>
                            <span className="text-text-dim block text-[9px] font-mono tracking-wider">{att.job}</span>
                          </div>

                          {att.signed ? (
                            <SignatureThumbnail name={att.name} onClick={() => setBigSignatureWorker(att)} />
                          ) : (
                            <span className="text-[9px] bg-slate-800 text-text-dim px-2 py-1 rounded font-bold">
                              미서명
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section 5: 수행 완료 상태일 때만 표시 */}
              {activeTbm.status === "COMPLETED" && (
                <div className="bg-[#222226] border border-emerald-500/20 rounded-xl p-5 shadow-lg space-y-3 animate-in slide-in-from-bottom duration-300">
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-500/10 pb-2">
                    <CheckCircle className="w-4 h-4" /> TBM 최종 완료 승인
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-[#333338]/40 pb-1.5">
                      <span className="text-text-dim">완료 처리 시각</span>
                      <span className="text-white font-mono font-bold">{activeTbm.completedAt || `${activeTbm.date} 08:15`}</span>
                    </div>

                    <div className="space-y-1.5 pt-1.5">
                      <span className="text-text-dim block">TBM 리더 (안전 감독자) 서명</span>
                      
                      {/* Stylized big Leader signature block */}
                      <div className="w-full bg-[#19191C] border border-emerald-500/20 rounded-lg p-3.5 flex flex-col items-center justify-center relative overflow-hidden">
                        <svg className="absolute inset-0 w-full h-full text-emerald-400/20" viewBox="0 0 120 40">
                          <path d="M 10 25 C 30 5, 50 35, 70 15 S 100 5, 110 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M 20 15 Q 60 5 90 35" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                        </svg>
                        <span className="font-serif italic font-extrabold text-emerald-400 text-[13px] tracking-widest z-10">
                          {activeTbm.leaderSignature || activeTbm.manager} (서명완료)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions Row */}
          <div className="flex justify-between items-center bg-[#222226] border border-[#333338] rounded-xl p-4 shadow-lg">
            
            {/* If BEFORE, allow simulating signatures for rich testing experience */}
            {activeTbm.status === "BEFORE" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleSimulateSigningComplete(activeTbm)}
                  className="px-4 py-2.5 bg-cyan hover:bg-[#00e1ff] text-[#0A0A0C] font-extrabold rounded-lg hover:shadow-lg hover:shadow-cyan/10 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> TBM 완료 처리 (근로자 139명 서명 및 마감 시뮬레이션)
                </button>
              </div>
            ) : (
              <div className="text-[11px] text-text-dim font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>완료된 TBM 보고서는 공문서 기록 보존 규정(산업안전보건법)에 따라 삭제/수정이 불가합니다.</span>
              </div>
            )}

            {/* Delete button only if BEFORE state */}
            {activeTbm.status === "BEFORE" && (
              <button
                onClick={() => triggerDelete(activeTbm.id)}
                className="px-4 py-2.5 bg-red-950/40 hover:bg-red text-red-500 hover:text-white border border-red/40 rounded-lg font-extrabold transition-all cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> TBM 삭제
              </button>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          MODAL 1: TBM CREATION MODAL
          ──────────────────────────────────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#222226] border border-[#333338] w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2A2A2F] p-4 bg-[#19191C] rounded-t-xl">
              <h3 className="text-sm font-extrabold text-cyan flex items-center gap-1.5 uppercase tracking-wider">
                <HardHat className="w-4 h-4 animate-bounce" /> TBM 생성
              </h3>
              <button 
                onClick={() => setIsCreateOpen(false)} 
                className="text-text-dim hover:text-white text-base font-mono transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin text-xs text-text-main">
              
              {/* SECTION 1: 기본 정보 */}
              <div className="space-y-3.5">
                <h4 className="text-[11px] font-black text-cyan border-b border-[#333338] pb-1.5 uppercase">
                  기본 정보
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 공사 현장 */}
                  <div className="space-y-1.5">
                    <label className="text-text-sub font-bold block">
                      공사 현장 <span className="text-red-500 font-extrabold">*</span>
                    </label>
                    <select
                      value={newZone}
                      onChange={(e) => setNewZone(e.target.value)}
                      className="w-full bg-[#19191C] border border-[#333338] text-text-main p-2.5 rounded-lg outline-none focus:border-cyan"
                    >
                      <option value="왕숙1구역">왕숙1구역</option>
                      <option value="왕숙2구역">왕숙2구역</option>
                      <option value="왕숙3구역">왕숙3구역</option>
                    </select>
                  </div>

                  {/* 점검 일자 */}
                  <div className="space-y-1.5">
                    <label className="text-text-sub font-bold block">
                      점검 일자 <span className="text-red-500 font-extrabold">*</span>
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className={`w-full bg-[#19191C] border ${formSubmitted && !newDate ? 'border-red-500' : 'border-[#333338]'} text-text-main p-2.5 rounded-lg outline-none focus:border-cyan`}
                    />
                    {formSubmitted && !newDate && (
                      <span className="text-[10px] text-red-500 block">점검 일자를 입력해 주십시오.</span>
                    )}
                  </div>

                  {/* 시작 시간 */}
                  <div className="space-y-1.5">
                    <label className="text-text-sub font-bold block">
                      시작 시간 <span className="text-red-500 font-extrabold">*</span>
                    </label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className={`w-full bg-[#19191C] border ${formSubmitted && !newTime ? 'border-red-500' : 'border-[#333338]'} text-text-main p-2.5 rounded-lg outline-none focus:border-cyan`}
                    />
                    {formSubmitted && !newTime && (
                      <span className="text-[10px] text-red-500 block">시작 시간을 입력해 주십시오.</span>
                    )}
                  </div>

                  {/* TBM 리더 */}
                  <div className="space-y-1.5">
                    <label className="text-text-sub font-bold block">
                      TBM 리더 <span className="text-red-500 font-extrabold">*</span>
                    </label>
                    <input
                      type="text"
                      value={newManager}
                      onChange={(e) => setNewManager(e.target.value)}
                      placeholder="담당자 이름 입력"
                      className={`w-full bg-[#19191C] border ${formSubmitted && !newManager.trim() ? 'border-red-500' : 'border-[#333338]'} text-text-main p-2.5 rounded-lg outline-none focus:border-cyan`}
                    />
                    {formSubmitted && !newManager.trim() && (
                      <span className="text-[10px] text-red-500 block">TBM 리더의 실명을 기입해 주십시오.</span>
                    )}
                  </div>

                  {/* 위험성평가 실시 여부 */}
                  <div className="space-y-1.5">
                    <label className="text-text-sub font-bold block">
                      위험성평가 실시 여부 <span className="text-red-500 font-extrabold">*</span>
                    </label>
                    <div className="flex gap-4.5 pt-1.5">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="riskAssess"
                          value="예"
                          checked={newHasRiskAssessment === "예"}
                          onChange={() => setNewHasRiskAssessment("예")}
                          className="accent-cyan w-4 h-4"
                        />
                        <span className="text-white font-bold">예</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="riskAssess"
                          value="아니오"
                          checked={newHasRiskAssessment === "아니오"}
                          onChange={() => setNewHasRiskAssessment("아니오")}
                          className="accent-cyan w-4 h-4"
                        />
                        <span className="text-text-sub">아니오</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: 당일 작업 내용 */}
              <div className="space-y-3.5">
                <h4 className="text-[11px] font-black text-cyan border-b border-[#333338] pb-1.5 uppercase">
                  작업 내용
                </h4>
                
                <div className="space-y-1.5">
                  <label className="text-text-sub font-bold block">
                    당일 작업 내용 <span className="text-red-500 font-extrabold">*</span>
                  </label>
                  <textarea
                    rows={2.5}
                    value={newWorkContent}
                    onChange={(e) => setNewWorkContent(e.target.value)}
                    placeholder="오늘 진행할 작업 내용을 입력하세요"
                    className={`w-full bg-[#19191C] border ${formSubmitted && !newWorkContent.trim() ? 'border-red-500' : 'border-[#333338]'} text-text-main p-2.5 rounded-lg outline-none focus:border-cyan resize-none`}
                  />
                  {formSubmitted && !newWorkContent.trim() && (
                    <span className="text-[10px] text-red-500 block">금일 세부 공사작업 사항을 명시해주십시오.</span>
                  )}
                </div>
              </div>

              {/* SECTION 3: 위험요인 및 대책 (3개 구조) */}
              <div className="space-y-3.5">
                <h4 className="text-[11px] font-black text-cyan border-b border-[#333338] pb-1.5 uppercase">
                  위험요인 및 대책
                </h4>

                <div className="space-y-3 text-xs">
                  {/* Row 1 (Required) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-text-sub font-bold block">
                        위험요인 ❶ <span className="text-red-500 font-extrabold">*</span>
                      </label>
                      <input
                        type="text"
                        value={hazard1}
                        onChange={(e) => setHazard1(e.target.value)}
                        placeholder="예) 고소작업 낙하 위험"
                        className={`w-full bg-[#19191C] border ${formSubmitted && !hazard1.trim() ? 'border-red-500' : 'border-[#333338]'} text-text-main p-2.5 rounded-lg outline-none focus:border-cyan`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-text-sub font-bold block">
                        대책 ❶ <span className="text-red-500 font-extrabold">*</span>
                      </label>
                      <input
                        type="text"
                        value={measure1}
                        onChange={(e) => setMeasure1(e.target.value)}
                        placeholder="예) 안전모 착용 필수, 작업발판 점검"
                        className={`w-full bg-[#19191C] border ${formSubmitted && !measure1.trim() ? 'border-red-500' : 'border-[#333338]'} text-text-main p-2.5 rounded-lg outline-none focus:border-cyan`}
                      />
                    </div>
                  </div>
                  {formSubmitted && (!hazard1.trim() || !measure1.trim()) && (
                    <span className="text-[10px] text-red-500 block">최소 ❶번 위험요인 및 대응책은 필수로 작성이 완료되어야 합니다.</span>
                  )}

                  {/* Row 2 (Optional) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-text-sub block">위험요인 ❷ (선택)</label>
                      <input
                        type="text"
                        value={hazard2}
                        onChange={(e) => setHazard2(e.target.value)}
                        placeholder="예) 중장비 협착 위험"
                        className="w-full bg-[#19191C] border border-[#333338] text-text-main p-2.5 rounded-lg outline-none focus:border-cyan"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-text-sub block">대책 ❷ (선택)</label>
                      <input
                        type="text"
                        value={measure2}
                        onChange={(e) => setMeasure2(e.target.value)}
                        placeholder="예) 중장비 작업 반경 내 접근 금지, 신호수 배치"
                        className="w-full bg-[#19191C] border border-[#333338] text-text-main p-2.5 rounded-lg outline-none focus:border-cyan"
                      />
                    </div>
                  </div>

                  {/* Row 3 (Optional) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-text-sub block">위험요인 ❸ (선택)</label>
                      <input
                        type="text"
                        value={hazard3}
                        onChange={(e) => setHazard3(e.target.value)}
                        placeholder="예) 감전 위험"
                        className="w-full bg-[#19191C] border border-[#333338] text-text-main p-2.5 rounded-lg outline-none focus:border-cyan"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-text-sub block">대책 ❸ (선택)</label>
                      <input
                        type="text"
                        value={measure3}
                        onChange={(e) => setMeasure3(e.target.value)}
                        placeholder="예) 전기 작업 전 차단기 확인, 절연장갑 착용"
                        className="w-full bg-[#19191C] border border-[#333338] text-text-main p-2.5 rounded-lg outline-none focus:border-cyan"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: 중점위험요인 선정 */}
              <div className="space-y-3.5">
                <h4 className="text-[11px] font-black text-cyan border-b border-[#333338] pb-1.5 uppercase">
                  중점위험요인 선정
                </h4>
                
                <div className="space-y-2">
                  <span className="text-text-sub font-bold block">
                    위에서 입력한 위험요인 중 가장 중요한 1개를 선택하세요 <span className="text-red-500 font-extrabold">*</span>
                  </span>

                  <div className="space-y-2 bg-[var(--bg-base)] p-4.5 border border-[var(--border-default)]/60 rounded-xl">
                    {/* Option 1 */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="primaryHazard"
                        value={1}
                        checked={primaryHazardIndex === 1}
                        onChange={() => setPrimaryHazardIndex(1)}
                        className="accent-cyan w-4 h-4"
                      />
                      <span className="text-white font-extrabold">위험요인 ❶:</span>
                      <span className="text-text-sub truncate">
                        {hazard1.trim() ? hazard1 : "위험요인 ❶번 내용을 상단에 입력해주십시오."}
                      </span>
                    </label>

                    {/* Option 2 */}
                    <label className={`flex items-center gap-2 select-none ${hazard2.trim() ? 'cursor-pointer opacity-100' : 'opacity-40 cursor-not-allowed'}`}>
                      <input
                        type="radio"
                        name="primaryHazard"
                        value={2}
                        disabled={!hazard2.trim()}
                        checked={primaryHazardIndex === 2}
                        onChange={() => setPrimaryHazardIndex(2)}
                        className="accent-cyan w-4 h-4"
                      />
                      <span className="text-white font-extrabold">위험요인 ❷:</span>
                      <span className="text-text-sub truncate">
                        {hazard2.trim() ? hazard2 : "(2번이 비어있음)"}
                      </span>
                    </label>

                    {/* Option 3 */}
                    <label className={`flex items-center gap-2 select-none ${hazard3.trim() ? 'cursor-pointer opacity-100' : 'opacity-40 cursor-not-allowed'}`}>
                      <input
                        type="radio"
                        name="primaryHazard"
                        value={3}
                        disabled={!hazard3.trim()}
                        checked={primaryHazardIndex === 3}
                        onChange={() => setPrimaryHazardIndex(3)}
                        className="accent-cyan w-4 h-4"
                      />
                      <span className="text-white font-extrabold">위험요인 ❸:</span>
                      <span className="text-text-sub truncate">
                        {hazard3.trim() ? hazard3 : "(3번이 비어있음)"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 5: 참석자 목록 */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center border-b border-[#333338] pb-1.5">
                  <h4 className="text-[11px] font-black text-cyan uppercase tracking-wider">
                    참석자 목록
                  </h4>
                  <button
                    type="button"
                    onClick={handleSelectAllWorkers}
                    className="px-2.5 py-1 bg-[#19191C] hover:bg-cyan hover:text-[#0A0A0C] border border-[#333338] text-cyan font-bold rounded text-[10px] transition-all cursor-pointer"
                  >
                    {selectedWorkers.length === availableWorkers.length ? "전체 해제" : "전체 선택"}
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-text-sub font-bold block">
                    참석자 목록 (소속 근로자) <span className="text-red-500 font-extrabold">*</span>
                  </span>

                  <div className={`grid grid-cols-2 gap-2.5 bg-[#19191C] border ${formSubmitted && selectedWorkers.length === 0 ? 'border-red-500' : 'border-[#333338]'} rounded-xl p-4.5 max-h-[160px] overflow-y-auto`}>
                    {availableWorkers.map((w, idx) => {
                      const label = `${w.name} (${w.job})`;
                      const isChecked = selectedWorkers.includes(label);
                      return (
                        <label
                          key={idx}
                          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-[#2A2A2F] cursor-pointer select-none transition-all ${
                            isChecked 
                              ? 'bg-[#2A2A2F] border border-cyan/40 text-cyan font-bold' 
                              : 'border border-[#333338]/40 text-text-sub'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleWorker(label)}
                            className="accent-cyan w-4 h-4 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <span className="text-white block font-extrabold truncate text-[11px]">{w.name}</span>
                            <span className="text-text-dim block text-[9px] font-mono tracking-wide">{w.job}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  {formSubmitted && selectedWorkers.length === 0 && (
                    <span className="text-[10px] text-red-500 block">TBM 안전 교육 이수 근로자를 최소 1인 이상 선정하십시오.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex gap-3 p-4 bg-[#19191C] border-t border-[#333338] rounded-b-xl">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="flex-1 py-2.5 bg-[#222226] hover:bg-[#2A2A2F] text-text-main font-bold text-xs rounded-lg transition-colors border border-[#333338] cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleCreateSubmit}
                className="flex-1 py-2.5 bg-cyan hover:bg-[#00e1ff] text-[#0A0A0C] font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-lg shadow-cyan/15 text-center"
              >
                TBM 생성 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          CONFIRMATION MODAL: SECURE DELETE CONFIRMATION
          ──────────────────────────────────────────────────────── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-red/40 w-full max-w-sm rounded-xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-2 bg-red-500/10 rounded-full">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">TBM 삭제 경고</h4>
            </div>
            
            <p className="text-text-sub leading-relaxed">
              이 TBM을 삭제하시겠습니까?<br />
              <span className="text-red-500 font-extrabold">삭제된 TBM은 복구할 수 없습니다.</span>
            </p>
            
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2 bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)] text-text-main font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={() => {
                  handleConfirmDelete(deleteConfirmId);
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-lg transition-colors cursor-pointer"
              >
                삭제 확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          MODAL: LARGE ORIGINAL SIGNATURE VIEW
          ──────────────────────────────────────────────────────── */}
      {bigSignatureWorker && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setBigSignatureWorker(null)}>
          <div className="bg-[var(--bg-card)] border border-cyan/40 w-full max-w-sm rounded-xl p-6 shadow-2xl flex flex-col items-center space-y-4.5 animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="w-full flex justify-between items-center border-b border-[var(--border-default)] pb-2">
              <span className="text-[10px] text-text-dim font-mono font-black uppercase tracking-widest">{bigSignatureWorker.job}</span>
              <h4 className="font-extrabold text-sm text-cyan">{bigSignatureWorker.name} 근로자 전자서명</h4>
              <button onClick={() => setBigSignatureWorker(null)} className="text-text-dim hover:text-white font-mono text-sm cursor-pointer">✕</button>
            </div>
            
            {/* Signature Canvas Box with Seals */}
            <div className="w-full aspect-[2/1] bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg flex flex-col items-center justify-center relative overflow-hidden p-4 shadow-inner">
              
              {/* Complex handwritten vectors */}
              <svg className="absolute inset-0 w-full h-full text-cyan opacity-85" viewBox="0 0 200 100">
                <path d="M 25 65 C 45 15, 85 95, 115 45 S 165 25, 185 75" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M 55 55 Q 125 15 155 85" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M 30 30 Q 95 85 160 30" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              
              <div className="absolute top-2 right-2 border-2 border-red-500/40 text-red-500 text-[8px] font-black tracking-widest p-1 rounded uppercase select-none transform rotate-12 bg-red-500/5">
                안전 확인
              </div>
              
              <span className="absolute bottom-2 left-3 font-serif text-[9px] text-cyan/30 tracking-widest uppercase select-none">AUTHORIZED SIGNATURE</span>
            </div>

            <p className="text-[11px] text-text-dim text-center leading-relaxed">
              본 전자서명은 산업안전보건법 제29조 규정에 따른<br />
              일일 TBM 안전보건 교육 이수 완료 사실을 공인합니다.
            </p>

            <button
              onClick={() => setBigSignatureWorker(null)}
              className="w-full py-2.5 bg-cyan text-[var(--bg-base)] font-extrabold text-xs rounded-lg hover:bg-[#00e1ff] transition-colors cursor-pointer"
            >
              확인 완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 🏗 PAGE 9: Sub-contractor Management View (협력사 관리)
function CompaniesView({
  companiesList,
  setCompaniesList,
  availableZones
}: {
  companiesList: Company[];
  setCompaniesList?: React.Dispatch<React.SetStateAction<Company[]>>;
  availableZones?: Zone[];
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [pm, setPm] = useState("");
  const [tel, setTel] = useState("");
  const [category, setCategory] = useState("철근/콘크리트");

  const zones = availableZones || ZONES;

  const handleOpenAdd = () => {
    setName("");
    setSelectedZones(zones.length > 0 ? [zones[0].name] : ["왕숙1구역"]);
    setPm("");
    setTel("");
    setCategory("철근/콘크리트");
    setErrorMsg("");
    setShowAddModal(true);
  };

  const handleZoneToggle = (zoneName: string) => {
    setSelectedZones(prev =>
      prev.includes(zoneName)
        ? prev.filter(z => z !== zoneName)
        : [...prev, zoneName]
    );
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("협력사명을 입력해 주세요.");
      return;
    }
    if (selectedZones.length === 0) {
      setErrorMsg("담당 구역을 최소 1개 이상 선택해 주세요.");
      return;
    }
    if (!pm.trim()) {
      setErrorMsg("대표자 이름을 입력해 주세요.");
      return;
    }
    if (!tel.trim()) {
      setErrorMsg("연락처를 입력해 주세요.");
      return;
    }

    const newCompany: Company = {
      id: `c-${Date.now()}`,
      name: name.trim(),
      zones: selectedZones,
      pm: pm.trim(),
      tel: tel.trim(),
      workers: Math.floor(Math.random() * 80) + 40,
      category: category.trim() || "기타",
      status: "운영중",
      rating: "A",
      safetyMgr: `${pm.trim().slice(0, 1)}안전`
    };

    if (setCompaniesList) {
      setCompaniesList(prev => [newCompany, ...prev]);
    }
    setShowAddModal(false);
  };

  const handleDeleteConfirm = () => {
    if (deletingCompany && setCompaniesList) {
      setCompaniesList(prev => prev.filter(c => c.id !== deletingCompany.id));
    }
    setDeletingCompany(null);
  };

  return (
    <div className="space-y-4 page-transition font-sans text-[#ECECEC]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#ECECEC] flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#00D1E8]" />
          협력사 관리
        </h2>
        <button
          onClick={handleOpenAdd}
          className="bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-black font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" /> 협력사 등록
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-[#222226] border border-border-main rounded-xl p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#ECECEC]">
            <thead>
              <tr className="border-b border-border-main text-[#8A8A96] text-[11px] uppercase tracking-wider font-semibold">
                <th className="p-3">협력사명</th>
                <th className="p-3">담당 구역</th>
                <th className="p-3">대표자</th>
                <th className="p-3">연락처</th>
                <th className="p-3">소속 인원 수</th>
                <th className="p-3">상태</th>
                <th className="p-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/50">
              {companiesList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#8A8A96]">
                    등록된 협력사가 없습니다.
                  </td>
                </tr>
              ) : (
                companiesList.map((c) => (
                  <tr key={c.id} className="hover:bg-[#2A2A2F] transition-colors">
                    <td className="p-3 font-bold text-[#ECECEC]">
                      {c.name}
                      {c.category && (
                        <span className="ml-2 text-[10px] font-normal text-[#8A8A96] bg-[#111113] px-1.5 py-0.5 rounded border border-border-main/40">
                          {c.category}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-[#ECECEC] font-medium">
                      {Array.isArray(c.zones) ? c.zones.join(", ") : c.zones}
                    </td>
                    <td className="p-3 text-[#ECECEC]">{c.pm || "-"}</td>
                    <td className="p-3 text-[#8A8A96] font-mono">{c.tel || "-"}</td>
                    <td className="p-3 font-mono text-[#00D1E8] font-bold">{c.workers}명</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30">
                        {c.status || "운영중"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setDeletingCompany(c)}
                        title="협력사 삭제"
                        className="p-1.5 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 협력사 등록 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999] backdrop-blur-sm p-4">
          <div className="bg-[#222226] border border-[#333338] text-[#ECECEC] rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-base font-bold text-[#ECECEC] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00D1E8]" /> 협력사 등록
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#8A8A96] hover:text-[#ECECEC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-3.5 text-xs">
              {errorMsg && (
                <div className="p-2.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg text-[#EF4444] font-bold text-[11px]">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-[#8A8A96] mb-1 font-semibold">
                  협력사명 <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 현대건설"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#111113] border border-border-main rounded-lg p-2.5 text-[#ECECEC] outline-none focus:border-[#00D1E8]"
                />
              </div>

              <div>
                <label className="block text-[#8A8A96] mb-1.5 font-semibold">
                  담당 구역 <span className="text-[#EF4444]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-[#111113] border border-border-main rounded-lg">
                  {zones.map((z) => (
                    <label key={z.id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-[#2A2A2F]">
                      <input
                        type="checkbox"
                        checked={selectedZones.includes(z.name)}
                        onChange={() => handleZoneToggle(z.name)}
                        className="accent-[#00D1E8] w-3.5 h-3.5"
                      />
                      <span className="text-xs text-[#ECECEC]">{z.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8A8A96] mb-1 font-semibold">
                    대표자 이름 <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 홍길동"
                    value={pm}
                    onChange={(e) => setPm(e.target.value)}
                    className="w-full bg-[#111113] border border-border-main rounded-lg p-2.5 text-[#ECECEC] outline-none focus:border-[#00D1E8]"
                  />
                </div>
                <div>
                  <label className="block text-[#8A8A96] mb-1 font-semibold">
                    연락처 <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 02-1234-5678"
                    value={tel}
                    onChange={(e) => setTel(e.target.value)}
                    className="w-full bg-[#111113] border border-border-main rounded-lg p-2.5 text-[#ECECEC] outline-none focus:border-[#00D1E8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8A8A96] mb-1 font-semibold">
                  업종 <span className="text-[#8A8A96] font-normal">(선택, 예: 철근/콘크리트/전기/기계)</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 철근/콘크리트"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#111113] border border-border-main rounded-lg p-2.5 text-[#ECECEC] outline-none focus:border-[#00D1E8]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-main">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#2A2A2F] hover:bg-[#2A2A2F]/80 text-[#ECECEC] rounded-lg font-bold transition-all cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-black rounded-lg font-bold transition-all cursor-pointer"
                >
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 협력사 삭제 확인 모달 */}
      {deletingCompany && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999] backdrop-blur-sm p-4">
          <div className="bg-[#222226] border border-[#333338] text-[#ECECEC] rounded-xl p-6 w-full max-w-sm space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-full flex items-center justify-center mx-auto text-[#EF4444]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#ECECEC]">협력사 삭제</h3>
              <p className="text-xs text-[#8A8A96]">
                협력사를 삭제하면 관련 데이터가 모두 제거됩니다.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingCompany(null)}
                className="px-4 py-2 bg-[#2A2A2F] hover:bg-[#2A2A2F]/80 text-[#ECECEC] rounded-lg font-bold text-xs transition-all cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white rounded-lg font-bold text-xs transition-all cursor-pointer"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 👥 PAGE 10: Users roster Directory
function UsersManagementView() {
  const [usersList, setUsersList] = useState<User[]>(USERS);
  const [showAddModal, setShowAddModal] = useState(false);

  // Users template addition form parameters
  const [newLoginId, setNewLoginId] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<'SUPER_ADMIN' | 'SITE_MGR' | 'SAFETY' | 'VIEWER'>("SITE_MGR");
  const [newDept, setNewDept] = useState("현대건설");
  const [newTel, setNewTel] = useState("");

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoginId || !newName) return;

    const newUserItem: User = {
      id: "u-" + Date.now(),
      loginId: newLoginId,
      name: newName,
      role: newRole,
      dept: newDept,
      zones: "z1, z2",
      tel: newTel || "010-1111-2222",
      lastLogin: "미가동 로그기록 없음",
      status: "ACTIVE"
    };

    setUsersList([...usersList, newUserItem]);
    setShowAddModal(false);

    // Reset
    setNewLoginId("");
    setNewName("");
    setNewTel("");
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("해당 유저의 관제 접근 사설 핑 계정을 비활성화(정지) 하겠습니까?")) {
      setUsersList(usersList.filter(u => u.id !== id));
    }
  };

  const getRoleBadge = (role: string) => {
    let classes = "";
    switch (role) {
      case "SUPER_ADMIN":
        classes = "bg-[rgba(239,68,68,0.10)] text-[#EF4444] border border-[rgba(239,68,68,0.20)]";
        break;
      case "SYS_ADMIN":
        classes = "bg-[rgba(0,209,232,0.10)] text-[#00D1E8] border border-[rgba(0,209,232,0.20)]";
        break;
      case "SITE_MGR":
        classes = "bg-[rgba(245,158,11,0.10)] text-[#F59E0B] border border-[rgba(245,158,11,0.20)]";
        break;
      case "SITE_DIRECTOR":
        classes = "bg-[rgba(168,85,247,0.10)] text-[#A855F7] border border-[rgba(168,85,247,0.20)]";
        break;
      case "SAFETY":
      case "VIEWER":
        classes = "bg-[rgba(138,138,150,0.10)] text-[#8A8A96] border border-[rgba(138,138,150,0.20)]";
        break;
      case "WORKER":
        classes = "bg-[rgba(34,197,94,0.10)] text-[#22C55E] border border-[rgba(34,197,94,0.20)]";
        break;
      default:
        classes = "bg-[rgba(138,138,150,0.10)] text-[#8A8A96] border border-[rgba(138,138,150,0.20)]";
    }
    return (
      <span className={`rounded-[5px] px-[8px] py-[3px] font-semibold text-[11px] inline-block ${classes}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="space-y-4 page-transition flex flex-col min-h-[calc(100vh-100px)]">
      {/* 行 1: 페이지 제목 영역 */}
      <div className="flex items-center justify-between mb-4 select-none">
        <h2 className="text-[18px] font-semibold text-[#ECECEC]">사용자 관리</h2>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#00D1E8] text-[#0A0A0C] font-semibold text-xs rounded-lg hover:bg-[#00e1ff] transition-all shadow-lg shadow-cyan/10"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>사용자 등록</span>
        </button>
      </div>

      {/* Users table */}
      <div className="bg-[#19191C] border border-[#2A2A2F] rounded-xl overflow-hidden flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#19191C] text-[#8A8A96] text-[11px] font-semibold uppercase tracking-[0.08em] border-b border-[#333338]">
              <th className="px-4 py-3">성명</th>
              <th className="px-4 py-3">로그인 ID</th>
              <th className="px-4 py-3">역할 및 권한</th>
              <th className="px-4 py-3">소속업체</th>
              <th className="px-4 py-3">연락처</th>
              <th className="px-4 py-3">최종 로그인</th>
              <th className="px-4 py-3 text-right">계정 관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2F]">
            {usersList.map((u) => (
              <tr key={u.id} className="bg-transparent hover:bg-[#2A2A2F] transition-colors text-xs">
                <td className="px-4 py-3 font-semibold text-[#ECECEC] text-[13px]">{u.name}</td>
                <td className="px-4 py-3 font-mono text-[#00D1E8] text-[13px]">{u.loginId}</td>
                <td className="px-4 py-3">
                  {getRoleBadge(u.role)}
                </td>
                <td className="px-4 py-3 text-[#C8C8D0] text-[13px]">{u.dept}</td>
                <td className="px-4 py-3 font-mono text-[#ECECEC] text-[13px]">{u.tel}</td>
                <td className="px-4 py-3 font-mono text-[#8A8A96] text-[13px]">{u.lastLogin}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className="p-1 hover:bg-red/15 text-[#8A8A96] hover:text-red rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Addition Modal popup form */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateUser} className="bg-panel border border-border-main w-full max-w-sm rounded-xl p-5 space-y-4">
            <h4 className="font-bold text-sm text-text-main border-b border-border-main pb-2">
              사용자 등록
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-text-sub text-[11px] block mb-1">이름: *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="예: 정승안 대리"
                  className="w-full bg-outer border border-border-main p-2 rounded text-text-main focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-text-sub text-[11px] block mb-1">아이디: *</label>
                  <input
                    type="text"
                    required
                    value={newLoginId}
                    onChange={(e) => setNewLoginId(e.target.value)}
                    placeholder="예: safety34"
                    className="w-full bg-outer border border-border-main p-2 rounded text-text-main focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-text-sub text-[11px] block mb-1">휴대전화번호:</label>
                  <input
                    type="text"
                    value={newTel}
                    onChange={(e) => setNewTel(e.target.value)}
                    placeholder="010-XXXX-XXXX"
                    className="w-full bg-outer border border-border-main p-2 rounded text-text-main focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-text-sub text-[11px] block mb-1">권한:</label>
                  <select
                    value={newRole}
                    onChange={(e: any) => setNewRole(e.target.value)}
                    className="w-full bg-outer border border-border-main p-2 rounded text-text-main focus:outline-none"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    <option value="SITE_MGR">SITE_MGR</option>
                    <option value="SAFETY">SAFETY</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </div>
                <div>
                  <label className="text-text-sub text-[11px] block mb-1">소속:</label>
                  <input
                    type="text"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full bg-outer border border-border-main p-2 rounded text-text-main focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-1.5 bg-hover text-text-main font-bold text-xs rounded"
              >
                닫기
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 bg-cyan text-outer font-extrabold text-xs rounded hover:bg-cyan/90"
              >
                등록하기
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// 🤖 PAGE 11: AI Analytical Warning logs (Event Statistics)
function AIAnalysisView({ 
  events = [], 
  navigate 
}: { 
  events?: SafetyEvent[]; 
  navigate: (page: string, params?: any) => void;
}) {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [tablePage, setTablePage] = useState(1);

  // Period Configs Map
  const PERIOD_CONFIGS = {
    today: {
      total: 18,
      critical: 8,
      high: 7,
      low: 3,
      unprocessed: 13,
      avgTime: 12,
      rateStr: "27.8%",
      rateVal: 27.8,
      trendText: "어제 대비 +3건 ↑",
      criticalText: "전일比 +2건",
      unprocessedText: "처리율 27.8%",
      avgTimeText: "목표: 15분",
      avgTimeSuccess: true
    },
    week: {
      total: 67,
      critical: 22,
      high: 31,
      low: 14,
      unprocessed: 41,
      avgTime: 11,
      rateStr: "38.8%",
      rateVal: 38.8,
      trendText: "지난 주 대비 +8건 ↑",
      criticalText: "전주比 +4건",
      unprocessedText: "처리율 38.8%",
      avgTimeText: "목표: 15분",
      avgTimeSuccess: true
    },
    month: {
      total: 115,
      critical: 38,
      high: 54,
      low: 23,
      unprocessed: 79,
      avgTime: 14,
      rateStr: "31.3%",
      rateVal: 31.3,
      trendText: "지난 달 대비 +15건 ↑",
      criticalText: "전월比 +6건",
      unprocessedText: "처리율 31.3%",
      avgTimeText: "목표: 15분",
      avgTimeSuccess: true
    }
  };

  const activeConfig = PERIOD_CONFIGS[selectedPeriod];

  // 1. Hourly Stacked Chart Data
  const HOURLY_LABELS = Array.from({ length: 24 }, (_, i) => `${i}시`);
  
  const HOURLY_DATA_BY_PERIOD = {
    today: {
      critical: [0,0,0,0,0,0,0,1,2,2,1,1,2,1,3,2,1,0,0,0,0,0,0,0],
      high:     [0,0,0,0,0,0,1,1,2,2,2,1,1,1,2,2,1,1,0,0,0,0,0,0],
      low:      [0,0,0,0,0,0,0,0,1,1,0,1,0,0,1,0,1,0,0,0,0,0,0,0]
    },
    week: {
      critical: [0,0,0,0,0,0,1,3,5,6,4,3,4,3,7,6,4,1,0,0,0,0,0,0],
      high:     [0,0,0,0,0,0,2,4,7,8,6,5,4,5,7,8,4,3,0,0,0,0,0,0],
      low:      [0,0,0,0,0,0,1,2,3,4,2,3,1,2,3,2,2,1,0,0,0,0,0,0]
    },
    month: {
      critical: [0,0,0,0,0,0,2,5,9,11,8,6,7,5,12,11,7,3,0,0,0,0,0,0],
      high:     [0,0,0,0,0,0,3,7,12,14,11,9,8,10,14,13,9,5,0,0,0,0,0,0],
      low:      [0,0,0,0,0,0,2,4,5,6,3,5,2,4,5,4,3,2,0,0,0,0,0,0]
    }
  };

  const hourlyPeriodData = HOURLY_DATA_BY_PERIOD[selectedPeriod];

  const hourlyChartData = {
    labels: HOURLY_LABELS,
    datasets: [
      {
        label: 'CRITICAL',
        data: hourlyPeriodData.critical,
        backgroundColor: '#e03030', // Red
        stack: 'combined',
      },
      {
        label: 'HIGH',
        data: hourlyPeriodData.high,
        backgroundColor: '#d4780a', // Orange
        stack: 'combined',
      },
      {
        label: 'LOW',
        data: hourlyPeriodData.low,
        backgroundColor: '#1a7fd4', // Blue
        stack: 'combined',
      }
    ]
  };

  const hourlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          color: '#e8f4ff',
          boxWidth: 8,
          boxHeight: 8,
          font: { size: 10 }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#7ec8e3', font: { size: 9 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#7ec8e3', font: { size: 10 } }
      }
    }
  };

  // 2. Type Distribution Doughnut
  const TYPE_DATA_BY_PERIOD = {
    today: [11, 3, 4],
    week: [41, 11, 15],
    month: [72, 18, 25]
  };

  const typePeriodData = TYPE_DATA_BY_PERIOD[selectedPeriod];
  const typeChartData = {
    labels: ['AI 감지', 'SOS 요청', '장치 이상'],
    datasets: [
      {
        data: typePeriodData,
        backgroundColor: ['#1a7fd4', '#e03030', '#d4780a'],
        borderWidth: 0,
      }
    ]
  };

  // 3. Severity Distribution Doughnut
  const SEVERITY_DATA_BY_PERIOD = {
    today: [8, 7, 3],
    week: [22, 31, 14],
    month: [38, 54, 23]
  };

  const severityPeriodData = SEVERITY_DATA_BY_PERIOD[selectedPeriod];
  const severityChartData = {
    labels: ['CRITICAL', 'HIGH', 'LOW'],
    datasets: [
      {
        data: severityPeriodData,
        backgroundColor: ['#e03030', '#d4780a', '#1a7fd4'],
        borderWidth: 0,
      }
    ]
  };

  // 4. Center text custom plugins
  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw(chart: any) {
      const { width, height, ctx } = chart;
      const centerConfig = chart.config.options?.plugins?.centerTextValue;
      if (!centerConfig) return;
      
      ctx.save();
      ctx.font = 'bold 15px "Noto Sans KR", sans-serif';
      ctx.fillStyle = '#e8f4ff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(centerConfig.title, width / 2, height / 2 - 8);
      
      ctx.font = '10px "Noto Sans KR", sans-serif';
      ctx.fillStyle = '#7ec8e3';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(centerConfig.sub, width / 2, height / 2 + 10);
      ctx.restore();
    }
  };

  const typeChartOptions = {
    cutout: '65%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      centerTextValue: {
        title: `${activeConfig.total}건`,
        sub: '전체'
      }
    }
  };

  const severityChartOptions = {
    cutout: '65%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      centerTextValue: {
        title: `${activeConfig.critical}건`,
        sub: 'CRITICAL'
      }
    }
  };

  // 5. Zone Distribution horizontal Bar Chart
  const ZONE_LABELS_MOCK = [
    '왕숙1구역', '왕숙2구역', '왕숙3구역', '왕숙4구역', '왕숙5구역', 
    '왕숙6구역', '왕숙7구역', '왕숙8구역', '왕숙9구역', '왕숙10구역',
    '왕숙11구역', '왕숙12구역', '왕숙13구역'
  ];

  const ZONE_DATA_BY_PERIOD = {
    today: {
      critical: [2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      high:     [1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      low:      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    week: {
      critical: [5, 4, 3, 3, 2, 2, 3, 0, 0, 0, 0, 0, 0],
      high:     [7, 6, 6, 4, 3, 3, 2, 0, 0, 0, 0, 0, 0],
      low:      [3, 3, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0]
    },
    month: {
      critical: [10, 8, 7, 5, 4, 2, 2, 0, 0, 0, 0, 0, 0],
      high:     [12, 11, 9, 7, 5, 5, 5, 0, 0, 0, 0, 0, 0],
      low:      [6, 5, 4, 4, 3, 1, 0, 0, 0, 0, 0, 0, 0]
    }
  };

  const zonePeriodData = ZONE_DATA_BY_PERIOD[selectedPeriod];

  // Combined counts for sorting Zones by count (highest first)
  const sortedZonesData = ZONE_LABELS_MOCK.map((label, idx) => {
    const crit = zonePeriodData.critical[idx] || 0;
    const hi = zonePeriodData.high[idx] || 0;
    const lo = zonePeriodData.low[idx] || 0;
    return {
      label,
      critical: crit,
      high: hi,
      low: lo,
      total: crit + hi + lo
    };
  }).sort((a, b) => b.total - a.total); // Sorted descending

  const horizontalLabels = sortedZonesData.map(d => d.label);
  const horizontalChartData = {
    labels: horizontalLabels,
    datasets: [
      {
        label: 'CRITICAL',
        data: sortedZonesData.map(d => d.critical),
        backgroundColor: '#e03030',
        barThickness: 14,
      },
      {
        label: 'HIGH',
        data: sortedZonesData.map(d => d.high),
        backgroundColor: '#d4780a',
        barThickness: 14,
      },
      {
        label: 'LOW',
        data: sortedZonesData.map(d => d.low),
        backgroundColor: '#1a7fd4',
        barThickness: 14,
      }
    ]
  };

  const horizontalChartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        stacked: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#7ec8e3', font: { size: 10 } }
      },
      y: {
        stacked: true,
        grid: { display: false },
        ticks: { color: '#e8f4ff', font: { size: 10 } }
      }
    }
  };

  // Table pagination & items
  const PAGE_SIZE = 5;
  const filteredEventsForTable = events.length > 0 ? events : [
    { id: "EVT-001", time: "05-27 14:32", zoneId: "z1", type: "AI", subtype: "안전모 미착용", severity: "HIGH", status: "ACTIVE", confirmedBy: "-", confirmedAt: "-", sopHistory: [] },
    { id: "EVT-002", time: "05-27 14:28", zoneId: "z1", type: "AI", subtype: "위험구역 진입", severity: "HIGH", status: "ACTIVE", confirmedBy: "-", confirmedAt: "-", sopHistory: [] },
    { id: "EVT-003", time: "05-27 14:15", zoneId: "z2", type: "AI", subtype: "작업자 쓰러짐", severity: "CRITICAL", status: "CONFIRMED", confirmedBy: "김관수", confirmedAt: "2분", sopHistory: [] },
    { id: "EVT-004", time: "05-27 13:55", zoneId: "z2", type: "SOS", subtype: "긴급구조 요청", severity: "CRITICAL", status: "ACTIVE", confirmedBy: "-", confirmedAt: "-", sopHistory: [] },
    { id: "EVT-005", time: "05-27 13:40", zoneId: "z3", type: "AI", subtype: "화재·연기 감지", severity: "CRITICAL", status: "ACTIVE", confirmedBy: "-", confirmedAt: "-", sopHistory: [] },
    { id: "EVT-006", time: "05-27 13:22", zoneId: "z4", type: "장치", subtype: "변위센서 임계치 초과", severity: "HIGH", status: "ACTIVE", confirmedBy: "-", confirmedAt: "-", sopHistory: [] }
  ];

  const totalPages = Math.max(1, Math.ceil(filteredEventsForTable.length / PAGE_SIZE));
  const pageStartIndex = (tablePage - 1) * PAGE_SIZE;
  const pageItems = filteredEventsForTable.slice(pageStartIndex, pageStartIndex + PAGE_SIZE);

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case "CRITICAL": return "bg-red/10 border border-red/30 text-red px-2 py-0.5 rounded text-[10px] font-bold";
      case "HIGH": return "bg-orange/10 border border-orange/30 text-orange px-2 py-0.5 rounded text-[10px] font-bold";
      default: return "bg-blue/10 border border-blue/30 text-blue px-2 py-0.5 rounded text-[10px] font-bold";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-red text-[#ffffff] px-2 py-0.5 rounded text-[10px] font-bold";
      case "CONFIRMED": return "bg-green text-[#ffffff] px-2 py-0.5 rounded text-[10px] font-bold";
      case "SNOOZED": return "bg-yellow text-outer px-2 py-0.5 rounded text-[10px] font-bold";
      default: return "bg-white/10 text-text-sub px-2 py-0.5 rounded text-[10px] font-bold";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE": return "미처리";
      case "CONFIRMED": return "처리완료";
      case "SNOOZED": return "보류";
      case "PENDING": return "보류";
      default: return status;
    }
  };

  const getZoneLabelName = (zoneId: string) => {
    const zoneMap: Record<string, string> = {
      z1: "왕숙1구역",
      z2: "왕숙2구역",
      z3: "왕숙3구역",
      z4: "왕숙4구역",
      z5: "왕숙5구역",
      z6: "왕숙6구역",
      z7: "왕숙7구역",
    };
    return zoneMap[zoneId] || zoneId;
  };

  return (
    <div className="space-y-4 page-transition flex-grow flex flex-col justify-stretch pb-4">
      {/* 📊 Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-panel border border-border-main p-4 rounded-xl shrink-0">
        <div>
          <h3 className="font-extrabold text-sm text-text-main flex items-center gap-1.5 leading-none">
            <Cpu className="w-4 h-4 text-cyan" />
            <span>이벤트 관제 통계 보고 분석</span>
          </h3>
          <p className="text-[10px] text-text-dim font-mono mt-1">
            건설 현장 지능형 에지 디프 AI 분석기 수신 경보 통계 데이터 대시보드
          </p>
        </div>

        {/* 📅 Period Tabs */}
        <div className="flex bg-outer border border-border-main p-1 rounded-lg shrink-0 overflow-hidden">
          {(['today', 'week', 'month'] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => {
                setSelectedPeriod(period);
                setTablePage(1);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                selectedPeriod === period
                  ? "bg-cyan text-outer shadow-md"
                  : "text-text-dim hover:text-text-main"
              }`}
            >
              {period === 'today' ? "오늘" : period === 'week' ? "이번 주" : "이번 달"}
            </button>
          ))}
        </div>
      </div>

      {/* 🚀 KPI cards row (4 cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {/* Card 1: 총 이벤트 */}
        <div className="bg-panel border border-border-main rounded-xl p-4 border-t-2 border-t-cyan flex flex-col justify-between min-h-[95px]">
          <span className="text-[10px] text-text-sub font-bold">총 이벤트 발생 건수</span>
          <div className="text-2xl font-black text-white py-1">{activeConfig.total}건</div>
          <span className="text-[11px] text-cyan font-mono flex items-center gap-0.5">{activeConfig.trendText}</span>
        </div>

        {/* Card 2: CRITICAL */}
        <div className="bg-panel border border-border-main rounded-xl p-4 border-t-2 border-t-red flex flex-col justify-between min-h-[95px]">
          <span className="text-[10px] text-text-sub font-bold text-red/90">CRITICAL 경보 건수</span>
          <div className="text-2xl font-black text-red py-1">{activeConfig.critical}건</div>
          <span className="text-[11px] text-text-dim font-mono">{activeConfig.criticalText}</span>
        </div>

        {/* Card 3: 미처리 건수 */}
        <div className="bg-panel border border-border-main rounded-xl p-4 border-t-2 border-t-orange flex flex-col justify-between min-h-[95px]">
          <span className="text-[10px] text-text-sub font-bold text-orange/90">미처리 현장 보류 건수</span>
          <div className="text-2xl font-black text-orange py-1">{activeConfig.unprocessed}건</div>
          <span className="text-[11px] text-[#ffae42] font-mono">{activeConfig.unprocessedText}</span>
        </div>

        {/* Card 4: 평균 처리 시간 */}
        <div className="bg-panel border border-[#1e293b] rounded-xl p-4 border-t-2 border-t-[#22c55e] flex flex-col justify-between min-h-[95px]">
          <span className="text-[10px] text-text-sub font-bold text-green/90">평균 수동 이행 완료 시간</span>
          <div className="text-2xl font-black text-green py-1">{activeConfig.avgTime}분</div>
          <span className="text-[11px] text-green/80 flex items-center gap-1 font-mono">
            {activeConfig.avgTimeText} <span className="text-[10px]">✅ 목표달성</span>
          </span>
        </div>
      </div>

      {/* 📈 Charts Split: Time distribution (60%) vs Doughnuts distribution (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 shrink-0">
        
        {/* Left Card: Hourly stacked trend */}
        <div className="lg:col-span-7 bg-panel border border-border-main p-4 rounded-xl flex flex-col h-[280px]">
          <h4 className="font-extrabold text-xs text-text-sub border-b border-border-main pb-2 mb-3 flex items-center justify-between">
            <span>📊 시간대별 이벤트 발생 추이 수신 빈도</span>
            <span className="text-[9px] font-mono text-text-dim font-bold">24H TIMELOCK</span>
          </h4>
          <div className="flex-1 w-full relative">
            <Bar data={hourlyChartData} options={hourlyChartOptions} />
          </div>
        </div>

        {/* Right Card: Both Doughnuts side-by-side */}
        <div className="lg:col-span-5 bg-panel border border-border-main p-4 rounded-xl flex flex-col h-[280px]">
          <h4 className="font-extrabold text-xs text-text-sub border-b border-border-main pb-2 mb-3">
            🎯 다중 분석 위협 분류 및 심각도 분포
          </h4>
          <div className="flex-1 grid grid-cols-2 gap-2">
            
            {/* Doughnut 1: Type Distribution */}
            <div className="flex flex-col items-center justify-between">
              <span className="text-[10px] text-text-main font-bold">유형별 분포</span>
              <div className="w-full h-24 relative flex items-center justify-center my-1">
                <Doughnut data={typeChartData} options={typeChartOptions} plugins={[centerTextPlugin]} />
              </div>
              <div className="text-[9px] text-text-dim flex flex-col gap-0.5 font-mono w-full px-2">
                <div className="flex justify-between">
                  <span className="text-blue">● AI 감지:</span>
                  <span className="text-text-sub font-semibold">{typePeriodData[0]}건 ({Math.round(typePeriodData[0]/activeConfig.total*100)}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red">● SOS 요청:</span>
                  <span className="text-text-sub font-semibold">{typePeriodData[1]}건 ({Math.round(typePeriodData[1]/activeConfig.total*100)}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange">● 장치 이상:</span>
                  <span className="text-text-sub font-semibold">{typePeriodData[2]}건 ({Math.round(typePeriodData[2]/activeConfig.total*100)}%)</span>
                </div>
              </div>
            </div>

            {/* Doughnut 2: Severity Distribution */}
            <div className="flex flex-col items-center justify-between">
              <span className="text-[10px] text-text-main font-bold">심각도별 분포</span>
              <div className="w-full h-24 relative flex items-center justify-center my-1">
                <Doughnut data={severityChartData} options={severityChartOptions} plugins={[centerTextPlugin]} />
              </div>
              <div className="text-[9px] text-text-dim flex flex-col gap-0.5 font-mono w-full px-2">
                <div className="flex justify-between">
                  <span className="text-red">● CRITICAL:</span>
                  <span className="text-text-sub font-semibold">{severityPeriodData[0]}건 ({Math.round(severityPeriodData[0]/activeConfig.total*100)}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange">● HIGH:</span>
                  <span className="text-text-sub font-semibold">{severityPeriodData[1]}건 ({Math.round(severityPeriodData[1]/activeConfig.total*100)}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue">● LOW:</span>
                  <span className="text-text-sub font-semibold">{severityPeriodData[2]}건 ({Math.round(severityPeriodData[2]/activeConfig.total*100)}%)</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 🗺 Gu역별 이벤트 발생 현황 가로 바 차트 */}
      <div className="bg-panel border border-border-main p-4 rounded-xl flex flex-col h-[220px] shrink-0">
        <div className="flex justify-between items-center border-b border-border-main pb-2 mb-3">
          <h4 className="font-extrabold text-xs text-text-sub flex items-center gap-1 leading-none">
            <Database className="w-4 h-4 text-cyan" />
            <span>구역별 이벤트 발생 현황 (가로 바)</span>
          </h4>
          <span className="text-[9px] text-text-dim font-mono uppercase bg-outer px-2 py-0.5 border border-border-dim rounded">
            기간: {selectedPeriod === 'today' ? "오늘" : selectedPeriod === 'week' ? "이번 주" : "이번 달"}
          </span>
        </div>
        <div className="flex-1 min-h-0 relative">
          <Bar data={horizontalChartData} options={horizontalChartOptions} />
        </div>
      </div>

      {/* 📊 처리율 요약 바 (테이블 바로 위에 배치) */}
      <div className="bg-panel border border-border-main rounded-xl p-3.5 space-y-2 shrink-0">
        <span className="text-xs font-extrabold text-cyan block mb-1">처리 현황:</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-[#0a201c] border border-green/20 rounded p-2.5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[#44ff7c] font-black text-xs block">✓ 처리완료 {activeConfig.total - activeConfig.unprocessed}건</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] text-text-dim">프로세스:</span>
                <span className="text-[11px] text-white">
                  {"█".repeat(Math.ceil(activeConfig.rateVal / 10)) + "░".repeat(10 - Math.ceil(activeConfig.rateVal / 10))}
                </span>
              </div>
            </div>
            <span className="text-xl font-black text-[#44ff7c]">{activeConfig.rateStr}</span>
          </div>
          <div className="bg-[#240e0e] border border-red/20 rounded p-2.5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-red font-black text-xs block">✗ 미처리 {activeConfig.unprocessed}건</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] text-text-dim">기타대기:</span>
                <span className="text-[11px] text-text-dim">────────────────</span>
              </div>
            </div>
            <span className="text-xl font-black text-red">{(100 - activeConfig.rateVal).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* 📋 이벤트 처리 현황 테이블 */}
      <div className="bg-panel border border-border-main p-4 rounded-xl flex-grow flex flex-col justify-stretch min-h-[320px]">
        <div className="flex items-center justify-between border-b border-border-main pb-2.5 mb-3 shrink-0">
          <h4 className="font-extrabold text-xs text-text-sub flex items-center gap-1.5 leading-none">
            <CheckCircle className="w-4 h-4 text-cyan" />
            <span>이벤트 처리 현황</span>
          </h4>
          <button
            onClick={() => navigate('events')}
            className="text-[11px] text-cyan font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>전체 이벤트 목록 →</span>
          </button>
        </div>

        {/* Dynamic Table wrapper */}
        <div className="flex-1 overflow-x-auto min-h-0">
          <table className="w-full text-left text-xs text-text-main">
            <thead>
              <tr className="bg-cyan text-outer font-bold uppercase select-none">
                <th className="p-2 border-r border-[#00a3cc]">이벤트ID</th>
                <th className="p-2 border-r border-[#00a3cc]">발생일시</th>
                <th className="p-2 border-r border-[#00a3cc]">구역</th>
                <th className="p-2 border-r border-[#00a3cc]">유형</th>
                <th className="p-2 border-r border-[#00a3cc]">내용</th>
                <th className="p-2 border-r border-[#00a3cc]">심각도</th>
                <th className="p-2 border-r border-[#00a3cc]">처리상태</th>
                <th className="p-2 border-r border-[#00a3cc]">처리자</th>
                <th className="p-2">처리시간</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dim">
              {pageItems.map((e) => (
                <tr key={e.id} className="hover:bg-hover/35 select-none bg-card transition-all">
                  <td className="p-2 font-mono">
                    <button
                      onClick={() => {
                        navigate('event-detail', { eventId: e.id });
                      }}
                      className="text-cyan font-bold hover:underline cursor-pointer focus:outline-none"
                    >
                      {e.id}
                    </button>
                  </td>
                  <td className="p-2 font-mono text-text-dim text-[11px]">{e.time.startsWith('202') ? e.time.slice(5) : e.time}</td>
                  <td className="p-2 font-semibold text-text-main">{getZoneLabelName(e.zoneId)}</td>
                  <td className="p-2 text-text-sub font-mono font-bold text-[11px]">{e.type}</td>
                  <td className="p-2 truncate max-w-xs">{e.subtype || e.desc}</td>
                  <td className="p-2">
                    <span className={getSeverityBadgeClass(e.severity)}>
                      {e.severity === 'CRITICAL' ? '긴급' : e.severity === 'HIGH' ? '높음' : '낮음'}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className={getStatusBadgeClass(e.status)}>
                      {getStatusText(e.status)}
                    </span>
                  </td>
                  <td className="p-2 text-text-sub">{e.status === 'CONFIRMED' ? (e.confirmedBy || "김관수 소장") : "-"}</td>
                  <td className="p-2 font-mono text-text-dim text-[11px]">{e.status === 'CONFIRMED' ? "2분" : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination row */}
        <div className="flex items-center justify-between border-t border-border-dim pt-3 mt-3 shrink-0">
          <span className="text-[10px] text-text-dim">
            총 {filteredEventsForTable.length}개 이력 중 {pageStartIndex + 1} - {Math.min(filteredEventsForTable.length, pageStartIndex + PAGE_SIZE)}행 표시
          </span>
          <div className="flex items-center gap-1 bg-outer border border-border-dim p-0.5 rounded-lg">
            <button
              disabled={tablePage === 1}
              onClick={() => setTablePage(p => p - 1)}
              className="p-1 px-2.5 rounded-md text-xs font-bold text-text-dim hover:text-cyan disabled:opacity-30 disabled:pointer-events-none transition-hover cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>이전</span>
            </button>
            <div className="px-2 text-xs text-text-sub font-mono font-bold select-none">
              {tablePage} / {totalPages}
            </div>
            <button
              disabled={tablePage === totalPages}
              onClick={() => setTablePage(p => p + 1)}
              className="p-1 px-2.5 rounded-md text-xs font-bold text-text-dim hover:text-cyan disabled:opacity-30 disabled:pointer-events-none transition-hover cursor-pointer flex items-center gap-1"
            >
              <span>다음</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

// 📊 PAGE 12: Print Reports viewsheet
function ReportsView() {
  const handlePrintReportsheets = () => {
    window.print();
  };

  return (
    <div className="space-y-4 page-transition">
      <div className="bg-panel border border-border-main p-5 rounded-xl space-y-5 max-w-2xl mx-auto">
        {/* Header printable */}
        <div className="border-b-2 border-border-main pb-4 text-center space-y-1">
          <h2 className="text-xl font-bold text-text-main flex items-center justify-center gap-2">
            <span>건설안전종합 일일보고서</span>
          </h2>
          <p className="font-mono text-xs text-text-sub">출력일자: 2025.05.27 (남양주 왕숙 1~13지구 종합관제)</p>
        </div>

        {/* Core numbers */}
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="bg-card border border-border-dim p-3 rounded">
            <span className="text-text-dim block mb-1">총 출역 원수:</span>
            <span className="text-sm font-bold text-text-main">520명</span>
          </div>
          <div className="bg-card border border-border-dim p-3 rounded">
            <span className="text-text-dim block mb-1">TBM 서명 이수:</span>
            <span className="text-sm font-bold text-green">498명 (95.7%)</span>
          </div>
          <div className="bg-card border border-border-dim p-3 rounded text-red">
            <span className="text-text-dim block mb-1">미처리 이벤트:</span>
            <span className="text-sm font-extrabold block animate-pulse">2건</span>
          </div>
        </div>

        {/* Written statement template */}
        <div className="space-y-2.5 text-xs leading-relaxed text-text-sub">
          <p className="font-bold text-text-main">1. 금일 거동 종합 의결 요약:</p>
          <p>
            남양주 왕숙1구역 현대건설 및 왕숙2구역 삼성물산의 지반 붕괴 수동 경사계 CS-003 노드는 주의 한계치인 0.82°를 관측하여, 현장 보강 조치를 수동 지시 완료하였습니다. AI 탑재 CCTV 검사 로그를 통해 검출된 3건의 안전모 미착용 건은 현장 확성 마이크 방송 송출로 시정 유도 조치 완료되었습니다.
          </p>
        </div>

        {/* Layout footer trigger */}
        <div className="pt-4 border-t border-border-main flex justify-end">
          <button
            onClick={handlePrintReportsheets}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-cyan text-outer font-black text-xs rounded-lg hover:bg-cyan/90 transition-all shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>PDF 보고서 인쇄 (Print)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ⚙️ PAGE 13: System Preferences
function SystemSettingsView() {
  const [popupsEnabled, setPopupsEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(14);
  const [saveComplete, setSaveComplete] = useState(false);

  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveComplete(true);
    setTimeout(() => setSaveComplete(false), 2500);
  };

  const handleExportUiTermsToExcel = () => {
    const headers = ["구분", "한글 용어", "영문 용어 / 식별자", "노출 화면 / 위치", "타입 / 설명"];
    const rows = [
      ["공통/헤더", "통합건설안전관제시스템", "Integrated Safety Control Portal", "메인 상단 헤더", "타이틀"],
      ["공통/헤더", "통합안전관리", "Integrated Safety Management", "로고 및 헤더 영역", "서브 타이틀"],
      ["공통/헤더", "실시간 위험 지수", "Real-time Risk Index", "LNB / 대시보드", "위험 지수 지표"],
      ["공통/헤더", "공지사항", "Announcements", "상단 공지 롤러", "공지 알림 타이틀"],
      ["공통/헤더", "통합 관리자", "Admin", "상단 사용자 프로필", "사용자 등급"],
      ["공통/헤더", "발주처", "Client / Owner", "회원가입 및 프로필", "부서/소속 구분"],
      ["공통/헤더", "경보 발생", "Alarm Alert", "실시간 알림 상단", "시스템 상태"],
      ["로그인", "아이디", "ID / Username", "로그인 폼", "입력 필드 라벨"],
      ["로그인", "비밀번호", "Password", "로그인 폼", "입력 필드 라벨"],
      ["로그인", "비밀번호 확인", "Confirm Password", "회원가입 폼", "입력 필드 라벨"],
      ["로그인", "성명", "Full Name", "회원가입 폼", "입력 필드 라벨"],
      ["로그인", "연락처", "Phone Number", "회원가입 폼", "입력 필드 라벨"],
      ["로그인", "소속 회사", "Company / Department", "회원가입 폼", "드롭다운 라벨"],
      ["로그인", "직무 / 권한", "Role / Permission", "회원가입 폼", "드롭다운 라벨"],
      ["로그인", "로그인 상태 유지", "Remember Me", "로그인 폼", "체크박스 라벨"],
      ["로그인", "관리자 계정 바로가기", "Quick Admin Login", "로그인 하단", "빠른 접속 링크"],
      ["로그인", "계정이 없으신가요? 회원가입", "Sign Up Now", "로그인 하단", "화면 전환 링크"],
      ["대시보드", "남양주 왕숙 수치 지형도(GIS)", "Namyangju Wangsuk GIS Map", "메인 대시보드 중앙", "지도 영역 타이틀"],
      ["대시보드", "기상 정보", "Weather Info", "대시보드 우측 상단", "실시간 대기 환경 지표"],
      ["대시보드", "위험 이벤트 감지", "Risk Event Detection", "대시보드 좌측", "경보 알림"],
      ["대시보드", "협력사 현황", "Subcontractor Status", "대시보드 좌측 하단", "테이블 요약"],
      ["CCTV 관제", "실시간 CCTV 스트리밍", "Real-time CCTV Streaming", "CCTV 관제 화면", "CCTV 리스트 타이틀"],
      ["CCTV 관제", "녹화 재생", "Playback", "CCTV 하단", "과거 기록 분석"],
      ["CCTV 관제", "CCTV 채널 선택", "CCTV Channel Selection", "CCTV 사이드바", "선택 가이드"],
      ["CCTV 관제", "AI 감지", "AI Object Detection", "CCTV 오버레이", "안전 수칙 미준수 감지"],
      ["센서 모니터링", "가스 감지 센서", "Gas Detection Sensor", "센서 종합 화면", "센서 유형 타이틀"],
      ["센서 모니터링", "일산화탄소 농도", "CO Concentration", "밀폐공간 계측기", "센서 상세 지표"],
      ["센서 모니터링", "임계값 초과 경보", "Threshold Alarm", "알람 이력", "이벤트 알람 상태"],
      ["센서 모니터링", "산소 농도", "Oxygen Level", "밀폐공간 센서", "안전 한계치 검측"],
      ["센서 모니터링", "온습도 센서", "Temp & Humidity Sensor", "외곽 구역 모니터링", "환경 센서"],
      ["근로자 관리", "근로자 위치 관제", "Worker Location Tracking", "근로자 현황판", "실시간 위치 추적"],
      ["근로자 관리", "안전모 착용 상태", "Helmet Wearing Status", "AI 분석 패널", "안전 미준수 검출"],
      ["근로자 관리", "비상 호출 SOS", "Emergency SOS Call", "모바일/태그 알림", "긴급 SOS 알람"],
      ["근로자 관리", "출근 현황", "Attendance Log", "근로자 탭", "투입 인원 분석"],
      ["일일 보고서", "건설안전종합 일일보고서", "Daily Construction Safety Report", "보고서 출력 화면", "공식 문서 양식"],
      ["일일 보고서", "출력일자", "Export Date", "일일 보고서 우측 상단", "인쇄용 메타데이터"],
      ["일일 보고서", "안전 점검 일지", "Safety Inspection Log", "보고서 본문", "종합 결재 서식"],
      ["일일 보고서", "금일 조치사항", "Actions Taken Today", "보고서 본문 하단", "텍스트 영역"],
      ["일일 보고서", "명일 안전 계획", "Safety Plan for Tomorrow", "보고서 본문 하단", "텍스트 영역"]
    ];

    const csvContent = "\uFEFF" + [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "UI_용어_사전.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 page-transition max-w-sm mx-auto">
      <form onSubmit={handleSaveConfigs} className="bg-panel border border-border-main p-5 rounded-xl space-y-4">
        <h4 className="font-bold text-sm text-text-main border-b border-border-main pb-2 flex items-center gap-2">
          <Settings className="w-4 h-4 text-cyan animate-spin" style={{ animationDuration: "8s" }} />
          <span>관제 시스템 로컬 동작 값 설정</span>
        </h4>

        {/* Inputs */}
        <div className="space-y-3.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-text-sub">신규 알람 팝업 배너 표시:</span>
            <button
              type="button"
              onClick={() => setPopupsEnabled(!popupsEnabled)}
              className="text-cyan focus:outline-none"
            >
              {popupsEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-text-dim" />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-sub">비상 수동 조치자 자동 SMS 전파:</span>
            <button
              type="button"
              onClick={() => setSmsEnabled(!smsEnabled)}
              className="text-cyan focus:outline-none"
            >
              {smsEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-text-dim" />}
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-text-sub block">GIS 지표 기본 지도 줌배율:</label>
            <input
              type="number"
              min="10"
              max="18"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseInt(e.target.value))}
              className="w-full bg-outer border border-border-main p-2 rounded text-text-main font-mono text-xs focus:outline-none"
            />
          </div>

          {/* Password modifier */}
          <div className="pt-2 border-t border-border-dim space-y-1">
            <span className="text-text-sub text-[11px] block text-cyan flex items-center gap-1 font-bold">
              <Lock className="w-3.5 h-3.5" /> 비밀번호 변경
            </span>
            <input
              type="password"
              placeholder="현재 비밀번호"
              className="w-full bg-outer border border-border-main p-2 rounded text-text-main focus:outline-none text-xs placeholder-text-dim"
            />
            <input
              type="password"
              placeholder="새 비밀번호"
              className="w-full bg-outer border border-border-main p-2 rounded text-text-main focus:outline-none text-xs placeholder-text-dim"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-cyan text-outer font-extrabold text-xs rounded-lg hover:bg-cyan/90 transition-colors"
        >
          설정 저장
        </button>

        {saveComplete && (
          <div className="bg-green/10 border border-green/30 p-2 rounded text-[11px] text-green text-center font-bold">
            ✓ 설정이 저장되었습니다.
          </div>
        )}
      </form>

      {/* 📥 UI Terms Dictionary Export Box */}
      <div className="bg-panel border border-border-main p-5 rounded-xl space-y-3.5">
        <h4 className="font-bold text-sm text-text-main border-b border-border-main pb-2 flex items-center gap-2">
          <Download className="w-4 h-4 text-cyan" />
          <span>관제 시스템 UI 단어 사전 반출</span>
        </h4>
        <p className="text-text-sub text-[11px] leading-relaxed">
          대시보드, 보고서, 챗봇, 센서 관제 화면 등 <strong>실제 UI 상에 표시되는 전체 단어 및 문구 목록</strong>을 엑셀(CSV) 형식으로 즉시 다운로드하여 간편하게 일괄 편집 및 검토할 수 있습니다.
        </p>
        <button
          type="button"
          onClick={handleExportUiTermsToExcel}
          className="w-full py-2.5 bg-cyan hover:bg-[#00e1ff] text-outer font-black text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>UI 용어사전 Excel(.CSV) 다운로드</span>
        </button>
      </div>
    </div>
  );
}

// 🏗️ PAGE 14: Site Management View
function SiteManagementView({
  zonesList,
  setZonesList
}: {
  zonesList: Zone[];
  setZonesList?: React.Dispatch<React.SetStateAction<Zone[]>>;
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingZone, setDeletingZone] = useState<Zone | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Form states
  const [form, setForm] = useState({
    name: "",
    company: "현대건설",
    pm: "",
    tel: "",
    lat: "37.6478",
    lng: "127.2156"
  });

  const handleOpenAddModal = () => {
    setForm({
      name: "",
      company: "현대건설",
      pm: "",
      tel: "",
      lat: "37.6478",
      lng: "127.2156"
    });
    setErrorMsg("");
    setShowAddModal(true);
  };

  const handleCreateSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.company || !form.pm.trim() || !form.tel.trim() || !form.lat || !form.lng) {
      setErrorMsg("모든 필수 항목을 입력해 주세요.");
      return;
    }

    const latNum = parseFloat(form.lat);
    const lngNum = parseFloat(form.lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setErrorMsg("위도와 경도는 올바른 숫자여야 합니다.");
      return;
    }

    const newZone: Zone = {
      id: `z-${Date.now()}`,
      name: form.name.trim(),
      company: form.company,
      lat: latNum,
      lng: lngNum,
      workers: 0,
      risk: 0.0,
      events: 0,
      status: "보통",
      pm: form.pm.trim(),
      tel: form.tel.trim()
    };

    if (setZonesList) {
      setZonesList(prev => [...prev, newZone]);
    }
    setShowAddModal(false);
  };

  const handleDeleteConfirm = () => {
    if (deletingZone && setZonesList) {
      setZonesList(prev => prev.filter(z => z.id !== deletingZone.id));
    }
    setDeletingZone(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "위험":
        return "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30";
      case "주의":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30";
    }
  };

  return (
    <div className="space-y-4 page-transition font-sans text-[#ECECEC]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#ECECEC] flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#00D1E8]" />
          현장 관리
        </h2>
        <button
          onClick={handleOpenAddModal}
          className="bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-black font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" /> 현장 등록
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-[#222226] border border-border-main rounded-xl p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#ECECEC]">
            <thead>
              <tr className="border-b border-border-main text-[#8A8A96] text-[11px] uppercase tracking-wider font-semibold">
                <th className="p-3">현장명</th>
                <th className="p-3">시공사</th>
                <th className="p-3">PM</th>
                <th className="p-3">연락처</th>
                <th className="p-3">작업자 수</th>
                <th className="p-3">상태</th>
                <th className="p-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/50">
              {zonesList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#8A8A96]">
                    등록된 현장이 없습니다.
                  </td>
                </tr>
              ) : (
                zonesList.map((z) => (
                  <tr key={z.id} className="hover:bg-[#2A2A2F] transition-colors">
                    <td className="p-3 font-bold text-[#ECECEC]">{z.name}</td>
                    <td className="p-3 text-[#ECECEC]">{z.company}</td>
                    <td className="p-3 text-[#ECECEC]">{z.pm || "-"}</td>
                    <td className="p-3 text-[#8A8A96] font-mono">{z.tel || "-"}</td>
                    <td className="p-3 font-mono text-[#ECECEC]">{z.workers}명</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadge(z.status)}`}>
                        {z.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setDeletingZone(z)}
                        title="현장 삭제"
                        className="p-1.5 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 현장 등록 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999] backdrop-blur-sm p-4">
          <div className="bg-[#222226] border border-[#333338] text-[#ECECEC] rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-base font-bold text-[#ECECEC] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00D1E8]" /> 현장 등록
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#8A8A96] hover:text-[#ECECEC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSite} className="space-y-3.5 text-xs">
              {errorMsg && (
                <div className="p-2.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg text-[#EF4444] font-bold text-[11px]">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-[#8A8A96] mb-1 font-semibold">
                  현장명 <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 왕숙14구역"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#111113] border border-border-main rounded-lg p-2.5 text-[#ECECEC] outline-none focus:border-[#00D1E8]"
                />
              </div>

              <div>
                <label className="block text-[#8A8A96] mb-1 font-semibold">
                  시공사 <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full bg-[#111113] border border-border-main rounded-lg p-2.5 text-[#ECECEC] outline-none focus:border-[#00D1E8]"
                >
                  <option value="현대건설">현대건설</option>
                  <option value="삼성물산">삼성물산</option>
                  <option value="대우건설">대우건설</option>
                  <option value="GS건설">GS건설</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8A8A96] mb-1 font-semibold">
                    PM 이름 <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 김관수"
                    value={form.pm}
                    onChange={(e) => setForm({ ...form, pm: e.target.value })}
                    className="w-full bg-[#111113] border border-border-main rounded-lg p-2.5 text-[#ECECEC] outline-none focus:border-[#00D1E8]"
                  />
                </div>
                <div>
                  <label className="block text-[#8A8A96] mb-1 font-semibold">
                    PM 연락처 <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 010-1234-5678"
                    value={form.tel}
                    onChange={(e) => setForm({ ...form, tel: e.target.value })}
                    className="w-full bg-[#111113] border border-border-main rounded-lg p-2.5 text-[#ECECEC] outline-none focus:border-[#00D1E8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8A8A96] mb-1 font-semibold">
                    위도 <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    placeholder="예: 37.6478"
                    value={form.lat}
                    onChange={(e) => setForm({ ...form, lat: e.target.value })}
                    className="w-full bg-[#111113] border border-border-main rounded-lg p-2.5 text-[#ECECEC] outline-none focus:border-[#00D1E8] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#8A8A96] mb-1 font-semibold">
                    경도 <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    placeholder="예: 127.2156"
                    value={form.lng}
                    onChange={(e) => setForm({ ...form, lng: e.target.value })}
                    className="w-full bg-[#111113] border border-border-main rounded-lg p-2.5 text-[#ECECEC] outline-none focus:border-[#00D1E8] font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-main">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#2A2A2F] hover:bg-[#2A2A2F]/80 text-[#ECECEC] rounded-lg font-bold transition-all cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-black rounded-lg font-bold transition-all cursor-pointer"
                >
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 현장 삭제 확인 모달 */}
      {deletingZone && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999] backdrop-blur-sm p-4">
          <div className="bg-[#222226] border border-[#333338] text-[#ECECEC] rounded-xl p-6 w-full max-w-sm space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-full flex items-center justify-center mx-auto text-[#EF4444]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#ECECEC]">현장 삭제</h3>
              <p className="text-xs text-[#8A8A96]">
                현장을 삭제하면 관련 데이터가 모두 제거됩니다.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingZone(null)}
                className="px-4 py-2 bg-[#2A2A2F] hover:bg-[#2A2A2F]/80 text-[#ECECEC] rounded-lg font-bold text-xs transition-all cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white rounded-lg font-bold text-xs transition-all cursor-pointer"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 📢 PAGE 15: Notice Management View (공지사항)
function NoticeManagementView({
  noticesList,
  setNoticesList,
  availableZones,
  isSiteManager,
  currentUserName
}: {
  noticesList: Notice[];
  setNoticesList?: React.Dispatch<React.SetStateAction<Notice[]>>;
  availableZones?: Zone[];
  isSiteManager?: boolean;
  currentUserName?: string;
}) {
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetType, setTargetType] = useState<'ALL' | 'ZONES'>('ALL');
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [importance, setImportance] = useState<'NORMAL' | 'IMPORTANT'>('NORMAL');

  const zones = availableZones || ZONES;

  const handleOpenAdd = () => {
    setTitle("");
    setContent("");
    setTargetType("ALL");
    setSelectedZones(zones.length > 0 ? [zones[0].name] : ["왕숙1구역"]);
    setImportance("NORMAL");
    setErrorMsg("");
    setShowAddModal(true);
  };

  const handleZoneToggle = (zoneName: string) => {
    setSelectedZones(prev =>
      prev.includes(zoneName)
        ? prev.filter(z => z !== zoneName)
        : [...prev, zoneName]
    );
  };

  // Pre-submit validates inputs then opens confirmation modal
  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("제목을 입력해 주세요.");
      return;
    }
    if (!content.trim()) {
      setErrorMsg("내용을 입력해 주세요.");
      return;
    }
    if (targetType === "ZONES" && selectedZones.length === 0) {
      setErrorMsg("특정 구역을 최소 1개 이상 선택해 주세요.");
      return;
    }
    setErrorMsg("");
    setShowConfirmModal(true);
  };

  // Final creation after confirmation modal
  const handleFinalCreate = () => {
    const authorName = currentUserName ? `${currentUserName} (SUPER_ADMIN)` : "김관수 (SUPER_ADMIN)";
    const newNotice: Notice = {
      id: `N-${String(Date.now()).slice(-4)}`,
      title: title.trim(),
      content: content.trim(),
      author: authorName,
      targetType,
      targetZones: targetType === "ZONES" ? selectedZones : [],
      importance,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: "SENT",
      readCount: 0,
      totalCount: targetType === "ALL" ? 50 : (selectedZones.length * 10)
    };

    if (setNoticesList) {
      setNoticesList(prev => [newNotice, ...prev]);
    }

    setShowConfirmModal(false);
    setShowAddModal(false);
  };

  const handleDeleteNotice = (id: string) => {
    if (setNoticesList) {
      setNoticesList(prev => prev.filter(n => n.id !== id));
    }
    setSelectedNotice(null);
  };

  return (
    <div className="space-y-4 page-transition font-sans text-[#ECECEC]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#ECECEC] flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-[#00D1E8]" />
          공지사항
        </h2>
        {!isSiteManager && (
          <button
            onClick={handleOpenAdd}
            className="bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-black font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" /> 공지 등록
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-[#222226] border border-border-main rounded-xl p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#ECECEC]">
            <thead>
              <tr className="border-b border-border-main text-[#8A8A96] text-[11px] uppercase tracking-wider font-semibold">
                <th className="p-3 w-16 text-center">번호</th>
                <th className="p-3">제목</th>
                <th className="p-3 w-36">작성자</th>
                <th className="p-3 w-36">수신 대상</th>
                <th className="p-3 w-36 font-mono">등록일시</th>
                <th className="p-3 w-24 text-center">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/50">
              {noticesList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#8A8A96]">
                    등록된 공지사항이 없습니다.
                  </td>
                </tr>
              ) : (
                noticesList.map((notice, idx) => (
                  <tr
                    key={notice.id}
                    onClick={() => setSelectedNotice(notice)}
                    className="hover:bg-[#2A2A2F] transition-colors cursor-pointer group"
                  >
                    <td className="p-3 text-center text-[#8A8A96] font-mono">
                      {noticesList.length - idx}
                    </td>
                    <td className="p-3 font-semibold text-[#ECECEC] group-hover:text-[#00D1E8] transition-colors">
                      <div className="flex items-center gap-2">
                        {notice.importance === "IMPORTANT" && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 rounded font-bold shrink-0">
                            중요
                          </span>
                        )}
                        <span className="truncate">{notice.title}</span>
                      </div>
                    </td>
                    <td className="p-3 text-[#8A8A96]">{notice.author}</td>
                    <td className="p-3 text-[#ECECEC]">
                      {notice.targetType === "ALL" ? (
                        <span className="px-2 py-0.5 rounded bg-[#2A2A2F] text-[11px] text-[#ECECEC]">전체</span>
                      ) : (
                        <span className="text-[11px] text-[#00D1E8]">{notice.targetZones?.join(", ") || "구역"}</span>
                      )}
                    </td>
                    <td className="p-3 text-[#8A8A96] font-mono">{notice.createdAt}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30">
                        발송완료
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 공지 등록 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999] backdrop-blur-sm p-4">
          <div className="bg-[#222226] border border-[#333338] text-[#ECECEC] rounded-xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-base font-bold text-[#ECECEC] flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#00D1E8]" /> 공지 등록
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#8A8A96] hover:text-[#ECECEC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePreSubmit} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-2.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg text-[#EF4444] font-bold text-[11px]">
                  {errorMsg}
                </div>
              )}

              {/* 제목 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[#8A8A96] font-semibold">
                    제목 <span className="text-[#EF4444]">*</span>
                  </label>
                  <span className="text-[10px] text-[#8A8A96] font-mono">{title.length}/50</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={50}
                  placeholder="공지사항 제목을 입력해 주세요. (최대 50자)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#111113] border border-border-main rounded-lg p-2.5 text-[#ECECEC] outline-none focus:border-[#00D1E8]"
                />
              </div>

              {/* 내용 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[#8A8A96] font-semibold">
                    내용 <span className="text-[#EF4444]">*</span>
                  </label>
                  <span className="text-[10px] text-[#8A8A96] font-mono">{content.length}/1000</span>
                </div>
                <textarea
                  required
                  rows={5}
                  maxLength={1000}
                  placeholder="공지사항 내용을 상세히 작성해 주세요. (최대 1,000자)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-[#111113] border border-border-main rounded-lg p-2.5 text-[#ECECEC] outline-none focus:border-[#00D1E8] resize-none leading-relaxed"
                />
              </div>

              {/* 수신 대상 */}
              <div>
                <label className="block text-[#8A8A96] mb-1.5 font-semibold">수신 대상</label>
                <div className="flex items-center gap-6 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="targetType"
                      checked={targetType === "ALL"}
                      onChange={() => setTargetType("ALL")}
                      className="accent-[#00D1E8]"
                    />
                    <span className="text-[#ECECEC] font-medium">전체</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="targetType"
                      checked={targetType === "ZONES"}
                      onChange={() => setTargetType("ZONES")}
                      className="accent-[#00D1E8]"
                    />
                    <span className="text-[#ECECEC] font-medium">특정 구역 선택</span>
                  </label>
                </div>

                {targetType === "ZONES" && (
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#111113] border border-border-main rounded-lg max-h-36 overflow-y-auto">
                    {zones.map((z) => (
                      <label key={z.id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-[#2A2A2F]">
                        <input
                          type="checkbox"
                          checked={selectedZones.includes(z.name)}
                          onChange={() => handleZoneToggle(z.name)}
                          className="accent-[#00D1E8] w-3.5 h-3.5"
                        />
                        <span className="text-xs text-[#ECECEC]">{z.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 중요도 */}
              <div>
                <label className="block text-[#8A8A96] mb-1.5 font-semibold">중요도</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importance"
                      checked={importance === "NORMAL"}
                      onChange={() => setImportance("NORMAL")}
                      className="accent-[#00D1E8]"
                    />
                    <span className="text-[#ECECEC]">일반</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importance"
                      checked={importance === "IMPORTANT"}
                      onChange={() => setImportance("IMPORTANT")}
                      className="accent-[#EF4444]"
                    />
                    <span className="text-[#EF4444] font-bold">중요</span>
                  </label>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-border-main">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#2A2A2F] hover:bg-[#2A2A2F]/80 text-[#ECECEC] rounded-lg font-bold transition-all cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-black rounded-lg font-bold transition-all cursor-pointer"
                >
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 등록 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] backdrop-blur-sm p-4">
          <div className="bg-[#222226] border border-[#333338] text-[#ECECEC] rounded-xl p-6 w-full max-w-sm space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-[#00D1E8]/10 border border-[#00D1E8]/30 rounded-full flex items-center justify-center mx-auto text-[#00D1E8]">
              <Send className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-[#ECECEC]">공지사항 등록 및 발송</h3>
              <p className="text-xs text-[#ECECEC] font-medium leading-relaxed">
                등록 후 수신 대상에게 즉시 발송됩니다.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-[#2A2A2F] hover:bg-[#2A2A2F]/80 text-[#ECECEC] rounded-lg font-bold text-xs transition-all cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleFinalCreate}
                className="px-4 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-black rounded-lg font-bold text-xs transition-all cursor-pointer"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공지 상세 모달 */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999] backdrop-blur-sm p-4">
          <div className="bg-[#222226] border border-[#333338] text-[#ECECEC] rounded-xl p-6 w-full max-w-lg space-y-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border-main pb-3">
              <div className="space-y-1.5 pr-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedNotice.importance === "IMPORTANT" 
                      ? "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30" 
                      : "bg-[#8A8A96]/10 text-[#8A8A96] border border-[#8A8A96]/30"
                  }`}>
                    {selectedNotice.importance === "IMPORTANT" ? "중요" : "일반"}
                  </span>
                  <span className="text-[11px] text-[#8A8A96] font-mono">{selectedNotice.createdAt}</span>
                </div>
                <h3 className="text-base font-bold text-[#ECECEC] leading-snug">
                  {selectedNotice.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="text-[#8A8A96] hover:text-[#ECECEC] shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info bar */}
            <div className="grid grid-cols-3 gap-2 bg-[#111113] border border-border-main p-3 rounded-lg text-xs">
              <div>
                <span className="text-[#8A8A96] block text-[10px]">작성자</span>
                <span className="font-semibold text-[#ECECEC]">{selectedNotice.author}</span>
              </div>
              <div>
                <span className="text-[#8A8A96] block text-[10px]">수신 대상</span>
                <span className="font-semibold text-[#ECECEC]">
                  {selectedNotice.targetType === "ALL" 
                    ? "전체" 
                    : selectedNotice.targetZones?.join(", ")}
                </span>
              </div>
              <div>
                <span className="text-[#8A8A96] block text-[10px]">읽음 현황</span>
                <span className="font-bold text-[#00D1E8] font-mono">
                  읽음 {selectedNotice.readCount}명 / 전체 {selectedNotice.totalCount}명
                </span>
              </div>
            </div>

            {/* Notice Body Content */}
            <div className="p-4 bg-[#111113] border border-border-main rounded-xl text-xs text-[#ECECEC] whitespace-pre-wrap leading-relaxed min-h-[140px] max-h-80 overflow-y-auto">
              {selectedNotice.content}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border-main">
              {/* 본인 작성 공지 / SUPER_ADMIN일 때 삭제 버튼 제공 */}
              {(!isSiteManager || selectedNotice.author.includes(currentUserName || "")) ? (
                <button
                  type="button"
                  onClick={() => handleDeleteNotice(selectedNotice.id)}
                  className="px-3.5 py-2 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> 삭제
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 bg-[#2A2A2F] hover:bg-[#2A2A2F]/80 text-[#ECECEC] rounded-lg font-bold text-xs transition-all cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
