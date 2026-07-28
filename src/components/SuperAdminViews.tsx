/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Zone, SafetyEvent, AuditLog, SystemDevice, Company, Notice, User } from "../types";
import { INIT_AUDIT_LOGS, INIT_SYS_DEVICES, ZONES, COMPANIES, INIT_NOTICES, USERS } from "../data";
import { 
  Building2, Users, AlertTriangle, CheckCircle2, Download, Plus, Search, 
  MapPin, Eye, FileText, Printer, Shield, Calendar, Activity, HardDrive,
  Megaphone, UserCheck, UserX, Trash2, X, Check, Filter
} from "lucide-react";

interface SuperAdminViewsProps {
  currentPage: string;
  navigate: (page: string, params?: any) => void;
  zonesList?: Zone[];
  setZonesList?: React.Dispatch<React.SetStateAction<Zone[]>>;
  events?: SafetyEvent[];
  availableZones?: Zone[];
  noticesList?: Notice[];
  setNoticesList?: React.Dispatch<React.SetStateAction<Notice[]>>;
  companiesList?: Company[];
  setCompaniesList?: React.Dispatch<React.SetStateAction<Company[]>>;
}

export default function SuperAdminViews({
  currentPage,
  navigate,
  zonesList = ZONES,
  setZonesList,
  events = [],
  availableZones = ZONES,
  noticesList = INIT_NOTICES,
  setNoticesList,
  companiesList = COMPANIES,
  setCompaniesList,
}: SuperAdminViewsProps) {
  // ── 1. State for Sites (super-sites) ──
  const [siteFilterUse, setSiteFilterUse] = useState("ALL");
  const [siteDateFilter, setSiteDateFilter] = useState("ALL");
  const [siteSearch, setSiteSearch] = useState("");
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [selectedSiteDetail, setSelectedSiteDetail] = useState<Zone | null>(null);

  const [newSite, setNewSite] = useState({
    name: "",
    company: "현대건설",
    pm: "",
    tel: "",
    lat: "37.6478",
    lng: "127.2156"
  });

  // ── 2. State for Contractors (super-contractors) ──
  const [contractors, setContractors] = useState<Company[]>(companiesList);
  const [contractorSiteFilter, setContractorSiteFilter] = useState("ALL");
  const [contractorSearch, setContractorSearch] = useState("");
  const [showContractorModal, setShowContractorModal] = useState(false);
  const [newContractor, setNewContractor] = useState({
    name: "",
    zone: "왕숙1구역",
    pm: "",
    tel: "",
    category: "토목공사",
    workers: 25
  });

  // ── 3. State for Users (super-users) ──
  const [userList, setUserList] = useState<User[]>(USERS);
  const [userSiteFilter, setUserSiteFilter] = useState("ALL");
  const [userCompanyFilter, setUserCompanyFilter] = useState("ALL");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState("ALL");
  const [showUserModal, setShowUserModal] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    loginId: "",
    password: "",
    company: "GH",
    site: "왕숙1구역",
    role: "Admin" as "Admin" | "모니터링",
    tel: ""
  });

  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // User action modal state
  const [confirmModal, setConfirmModal] = useState<{
    type: "APPROVE" | "REJECT" | "ROLE_CHANGE" | null;
    userId: string;
    userName: string;
    newRole?: string;
  }>({ type: null, userId: "", userName: "" });

  // ── 4. State for Event Stats (super-event-stats) ──
  const [statPeriod, setStatPeriod] = useState("1week"); // 'today' | '1week' | '1month' | 'custom'

  // ── 5. State for Devices (super-devices) ──
  const [devStatusList, setDevStatusList] = useState<SystemDevice[]>(INIT_SYS_DEVICES);
  const [devFilterSite, setDevFilterSite] = useState("ALL");
  const [devFilterType, setDevFilterType] = useState("ALL");
  const [devFilterStatus, setDevFilterStatus] = useState("ALL");

  // ── 6. State for Notices (super-notices) ──
  const [notices, setNotices] = useState<Notice[]>(noticesList);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    content: "",
    targetType: "ALL" as "ALL" | "ZONES",
    selectedZones: [] as string[],
    importance: "NORMAL" as "NORMAL" | "IMPORTANT"
  });

  // ── 7. State for Audit Logs (super-audit-log) ──
  const [auditLogs] = useState<AuditLog[]>(INIT_AUDIT_LOGS);
  const [auditPeriodFilter, setAuditPeriodFilter] = useState("ALL");
  const [auditSearchUser, setAuditSearchUser] = useState("");

  // Excel export helper
  const handleExportExcel = (title: string) => {
    alert(`[${title}] 데이터 엑셀 파일 다운로드가 시작되었습니다.`);
  };

  // Site Registration
  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.name.trim()) return;
    const added: Zone = {
      id: `z${zonesList.length + 1}`,
      name: newSite.name.trim(),
      company: newSite.company,
      lat: parseFloat(newSite.lat) || 37.6478,
      lng: parseFloat(newSite.lng) || 127.2156,
      workers: 80,
      risk: 15.0,
      events: 0,
      status: "보통",
      pm: newSite.pm || "담당자",
      tel: newSite.tel || "010-0000-0000"
    };
    if (setZonesList) {
      setZonesList([added, ...zonesList]);
    }
    setShowSiteModal(false);
    setNewSite({ name: "", company: "현대건설", pm: "", tel: "", lat: "37.6478", lng: "127.2156" });
    alert(`[${added.name}] 신규 현장이 등록되었습니다.`);
  };

  // Contractor Registration
  const handleAddContractor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContractor.name.trim()) return;
    const added: Company = {
      id: `c-${Date.now()}`,
      name: newContractor.name.trim(),
      zones: [newContractor.zone],
      workers: newContractor.workers,
      pm: newContractor.pm || "대표자",
      tel: newContractor.tel || "010-0000-0000",
      category: newContractor.category,
      rating: "A"
    };
    const updated = [added, ...contractors];
    setContractors(updated);
    if (setCompaniesList) setCompaniesList(updated);
    setShowContractorModal(false);
    setNewContractor({ name: "", zone: "왕숙1구역", pm: "", tel: "", category: "토목공사", workers: 25 });
    alert(`[${added.name}] 협력사가 등록되었습니다.`);
  };

  // User Registration
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim()) return;
    const added: User = {
      id: `u-${Date.now()}`,
      loginId: `user_${Date.now().toString().slice(-4)}`,
      name: newUser.name.trim(),
      role: newUser.role === "Admin" ? "SUPER_ADMIN" : "VIEWER",
      dept: newUser.company,
      zones: newUser.site,
      tel: newUser.tel || "010-0000-0000",
      lastLogin: "방금 전",
      status: "ACTIVE",
      company: newUser.company,
      site: newUser.site,
      signupType: "직접등록",
      createdAt: new Date().toISOString().split("T")[0]
    };
    setUserList([added, ...userList]);
    setShowUserModal(false);
    setNewUser({ name: "", tel: "", company: "GH", site: "왕숙1구역", role: "Admin" });
    alert(`[${added.name}] 사용자가 등록되었습니다.`);
  };

  // User Confirm Modal Actions
  const handleExecuteUserConfirm = () => {
    if (!confirmModal.type) return;

    if (confirmModal.type === "APPROVE") {
      setUserList(userList.map(u => u.id === confirmModal.userId ? { ...u, status: "ACTIVE" } : u));
      alert(`[${confirmModal.userName}] 가입이 승인되었습니다.`);
    } else if (confirmModal.type === "REJECT") {
      setUserList(userList.map(u => u.id === confirmModal.userId ? { ...u, status: "REJECTED" } : u));
      alert(`[${confirmModal.userName}] 가입이 반려되었습니다.`);
    } else if (confirmModal.type === "ROLE_CHANGE") {
      const mappedRole = confirmModal.newRole === "Admin" ? "SUPER_ADMIN" : "VIEWER";
      setUserList(userList.map(u => u.id === confirmModal.userId ? { ...u, role: mappedRole } : u));
      alert(`[${confirmModal.userName}] 권한이 [${confirmModal.newRole}] (으)로 변경되었습니다.`);
    }
    setConfirmModal({ type: null, userId: "", userName: "" });
  };

  // Notice Registration
  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) return;
    const added: Notice = {
      id: `n-${Date.now()}`,
      title: noticeForm.title.trim(),
      content: noticeForm.content.trim(),
      author: "통합관리자",
      targetType: noticeForm.targetType,
      targetZones: noticeForm.targetType === "ZONES" ? noticeForm.selectedZones : ["ALL"],
      importance: noticeForm.importance,
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      status: "SENT",
      readCount: 0,
      totalCount: 150
    };
    const updated = [added, ...notices];
    setNotices(updated);
    if (setNoticesList) setNoticesList(updated);
    setShowNoticeModal(false);
    setNoticeForm({ title: "", content: "", targetType: "ALL", selectedZones: [], importance: "NORMAL" });
    alert("공지사항이 정상 등록되었습니다.");
  };

  // Delete Notice
  const handleDeleteNotice = (id: string) => {
    if (confirm("이 공지사항을 삭제하시겠습니까?")) {
      const updated = notices.filter(n => n.id !== id);
      setNotices(updated);
      if (setNoticesList) setNoticesList(updated);
    }
  };

  // ──────────────────────────────────────────────────
  // 1. 대시보드 (super-dashboard or dashboard)
  // ──────────────────────────────────────────────────
  if (currentPage === "super-dashboard" || currentPage === "dashboard") {
    const totalWorkers = zonesList.reduce((acc, z) => acc + z.workers, 0);
    const unhandledEvents = events.filter(e => e.status === "ACTIVE").length;

    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#00D1E8]" />
              통합관리자 관제 대시보드
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">전체 사업 지구 현장, 근로자 및 실시간 안전 위험도 총괄 모니터링</p>
          </div>
          <div className="text-xs text-[#00D1E8] font-mono font-bold bg-[#00D1E8]/10 px-3 py-1.5 rounded border border-[#00D1E8]/30">
            GH SUPER ADMIN CONSOLE
          </div>
        </div>

        {/* 요약 카드 4개 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#222226] border border-[#2A2A2F] p-5 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-[#8A8A96] text-xs font-semibold">
              <span>전체 현장 수</span>
              <MapPin className="w-4 h-4 text-[#00D1E8]" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{zonesList.length}개 지구</div>
            <p className="text-[11px] text-[#22C55E]">● 전 현장 관제 시스템 정상 작동</p>
          </div>

          <div className="bg-[#222226] border border-[#2A2A2F] p-5 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-[#8A8A96] text-xs font-semibold">
              <span>전체 근로자 수</span>
              <Users className="w-4 h-4 text-[#00D1E8]" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{totalWorkers}명</div>
            <p className="text-[11px] text-[#8A8A96]">오늘 실시간 출근 1,438명</p>
          </div>

          <div className="bg-[#222226] border border-[#EF4444]/40 p-5 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-[#8A8A96] text-xs font-semibold">
              <span>미처리 위험 이벤트</span>
              <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
            </div>
            <div className="text-2xl font-black text-[#EF4444] font-mono">{unhandledEvents}건</div>
            <p className="text-[11px] text-[#EF4444] font-bold">즉시 SOP 대응 필요</p>
          </div>

          <div className="bg-[#222226] border border-[#22C55E]/40 p-5 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-[#8A8A96] text-xs font-semibold">
              <span>오늘 TBM 완료율</span>
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div className="text-2xl font-black text-[#22C55E] font-mono">97.8%</div>
            <p className="text-[11px] text-[#8A8A96]">32개 팀 TBM 서명 완료</p>
          </div>
        </div>

        {/* 현장별 현황 테이블 */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#00D1E8]" />
            지구별 현장 안전 관제 현황
          </h3>
          <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111113] text-[#8A8A96] font-semibold uppercase border-b border-[#2A2A2F]">
                <tr>
                  <th className="px-4 py-3">현장명</th>
                  <th className="px-4 py-3">소속 건설사</th>
                  <th className="px-4 py-3">출근 인원</th>
                  <th className="px-4 py-3">미처리 이벤트</th>
                  <th className="px-4 py-3">TBM 완료율</th>
                  <th className="px-4 py-3">안전 상태</th>
                  <th className="px-4 py-3 text-right">상세 관제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2F] text-white">
                {zonesList.slice(0, 8).map((z) => {
                  const zEvents = events.filter(e => e.zoneId === z.id && e.status === "ACTIVE").length;
                  return (
                    <tr key={z.id} className="hover:bg-[#2A2A2F]/50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-[#00D1E8]">{z.name}</td>
                      <td className="px-4 py-3.5">{z.company}</td>
                      <td className="px-4 py-3.5 font-mono">{z.workers}명</td>
                      <td className="px-4 py-3.5 font-mono">
                        {zEvents > 0 ? (
                          <span className="text-[#EF4444] font-bold">{zEvents}건</span>
                        ) : (
                          <span className="text-[#8A8A96]">0건</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[#22C55E] font-bold">98.5%</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          z.status === "위험" ? "bg-[#EF4444]/20 text-[#EF4444]" :
                          z.status === "주의" ? "bg-[#F59E0B]/20 text-[#F59E0B]" : "bg-[#22C55E]/20 text-[#22C55E]"
                        }`}>
                          {z.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => navigate("cctv")}
                          className="px-2.5 py-1 bg-[#2A2A2F] hover:bg-[#00D1E8] hover:text-[#111113] text-xs font-bold rounded transition-colors cursor-pointer"
                        >
                          CCTV 관제
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────
  // 2. 현장 관리 (super-sites or sites)
  // ──────────────────────────────────────────────────
  if (currentPage === "super-sites" || currentPage === "sites") {
    const filteredSites = zonesList.filter(z => {
      if (siteSearch.trim() && !z.name.includes(siteSearch.trim())) return false;
      return true;
    });

    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#00D1E8]" />
              현장 관리
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">사업 지구별 건설 현장 등록, 위치 좌표 및 담당자 정보를 관리합니다.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportExcel("현장 목록")}
              className="px-3.5 py-2 bg-[#2A2A2F] hover:bg-[#3A3A40] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> 엑셀 다운로드
            </button>
            <button
              onClick={() => setShowSiteModal(true)}
              className="px-3.5 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> 현장 등록
            </button>
          </div>
        </div>

        {/* 필터 Bar */}
        <div className="bg-[#222226] border border-[#2A2A2F] p-4 rounded-xl flex flex-wrap gap-4 items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">사용여부:</span>
            <select
              value={siteFilterUse}
              onChange={(e) => setSiteFilterUse(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체</option>
              <option value="USE">사용</option>
              <option value="UNUSE">미사용</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">등록 기간:</span>
            <select
              value={siteDateFilter}
              onChange={(e) => setSiteDateFilter(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체 기간</option>
              <option value="TODAY">오늘</option>
              <option value="1WEEK">1주일</option>
              <option value="1MONTH">1개월</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#8A8A96]" />
            <input
              type="text"
              placeholder="현장명 검색..."
              value={siteSearch}
              onChange={(e) => setSiteSearch(e.target.value)}
              className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            />
          </div>
        </div>

        {/* 목록 테이블 */}
        <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111113] text-[#8A8A96] font-semibold uppercase border-b border-[#2A2A2F]">
              <tr>
                <th className="px-4 py-3">현장 ID</th>
                <th className="px-4 py-3">현장명 (클릭시 상세)</th>
                <th className="px-4 py-3">소속 건설사</th>
                <th className="px-4 py-3">근로자 수</th>
                <th className="px-4 py-3">관리자 수</th>
                <th className="px-4 py-3">현장 PM / 연락처</th>
                <th className="px-4 py-3">등록일</th>
                <th className="px-4 py-3">사용여부</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F] text-white">
              {filteredSites.map((s) => (
                <tr key={s.id} className="hover:bg-[#2A2A2F]/50 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{s.id}</td>
                  <td className="px-4 py-3.5 font-bold text-[#00D1E8] hover:underline cursor-pointer" onClick={() => setSelectedSiteDetail(s)}>
                    {s.name}
                  </td>
                  <td className="px-4 py-3.5">{s.company}</td>
                  <td className="px-4 py-3.5 font-mono">{s.workers}명</td>
                  <td className="px-4 py-3.5 font-mono text-[#00D1E8]">4명</td>
                  <td className="px-4 py-3.5">{s.pm} ({s.tel})</td>
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">2025-01-15</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E]">
                      사용중
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 현장 상세 모달 */}
        {selectedSiteDetail && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-lg bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-[#2A2A2F] pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#00D1E8]" />
                  [{selectedSiteDetail.name}] 상세 정보
                </h3>
                <button onClick={() => setSelectedSiteDetail(null)} className="text-[#8A8A96] hover:text-white cursor-pointer">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 bg-[#111113] rounded-lg">
                  <div className="text-[#8A8A96]">소속 건설사</div>
                  <div className="text-white font-bold text-sm mt-1">{selectedSiteDetail.company}</div>
                </div>
                <div className="p-3 bg-[#111113] rounded-lg">
                  <div className="text-[#8A8A96]">현장 소장 (PM)</div>
                  <div className="text-white font-bold text-sm mt-1">{selectedSiteDetail.pm} ({selectedSiteDetail.tel})</div>
                </div>
                <div className="p-3 bg-[#111113] rounded-lg">
                  <div className="text-[#8A8A96]">현재 출근 근로자</div>
                  <div className="text-[#00D1E8] font-bold text-sm mt-1">{selectedSiteDetail.workers} 명</div>
                </div>
                <div className="p-3 bg-[#111113] rounded-lg">
                  <div className="text-[#8A8A96]">배정 관리자 현황</div>
                  <div className="text-white font-bold text-sm mt-1">현장관리자 2명 · 안전원 2명</div>
                </div>
                <div className="p-3 bg-[#111113] rounded-lg col-span-2">
                  <div className="text-[#8A8A96]">등록 디바이스 현황</div>
                  <div className="text-[#22C55E] font-bold text-sm mt-1">총 18대 (CCTV 12대 / IoT 센서 6대)</div>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button onClick={() => setSelectedSiteDetail(null)} className="px-4 py-2 bg-[#2A2A2F] text-white font-bold rounded cursor-pointer text-xs">
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 현장 등록 모달 */}
        {showSiteModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-md bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white border-b border-[#2A2A2F] pb-3">신규 현장 등록</h3>
              <form onSubmit={handleAddSite} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">현장명</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 왕숙14구역"
                    value={newSite.name}
                    onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">소속 건설사</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 현대건설"
                    value={newSite.company}
                    onChange={(e) => setNewSite({ ...newSite, company: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">PM 이름</label>
                  <input
                    type="text"
                    required
                    placeholder="현장소장 이름"
                    value={newSite.pm}
                    onChange={(e) => setNewSite({ ...newSite, pm: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">PM 연락처</label>
                  <input
                    type="text"
                    required
                    placeholder="010-0000-0000"
                    value={newSite.tel}
                    onChange={(e) => setNewSite({ ...newSite, tel: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[#8A8A96] font-semibold block mb-1">위도 (Latitude)</label>
                    <input
                      type="text"
                      value={newSite.lat}
                      onChange={(e) => setNewSite({ ...newSite, lat: e.target.value })}
                      className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A8A96] font-semibold block mb-1">경도 (Longitude)</label>
                    <input
                      type="text"
                      value={newSite.lng}
                      onChange={(e) => setNewSite({ ...newSite, lng: e.target.value })}
                      className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowSiteModal(false)}
                    className="flex-1 py-2 bg-[#2A2A2F] text-white font-bold rounded cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#00D1E8] text-[#111113] font-bold rounded cursor-pointer"
                  >
                    등록 완료
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────────
  // 3. 협력사 관리 (super-contractors or companies)
  // ──────────────────────────────────────────────────
  if (currentPage === "super-contractors" || currentPage === "companies") {
    const filteredContractors = contractors.filter(c => {
      if (contractorSiteFilter !== "ALL" && !c.zones.includes(contractorSiteFilter)) return false;
      if (contractorSearch.trim() && !c.name.includes(contractorSearch.trim())) return false;
      return true;
    });

    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#00D1E8]" />
              협력사 관리
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">현장별 소속 협력업체 목록, 대표자, 업종 및 인원 현황을 통합 관리합니다.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportExcel("협력사 목록")}
              className="px-3.5 py-2 bg-[#2A2A2F] hover:bg-[#3A3A40] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> 엑셀 다운로드
            </button>
            <button
              onClick={() => setShowContractorModal(true)}
              className="px-3.5 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> 협력사 등록
            </button>
          </div>
        </div>

        {/* 필터 Bar */}
        <div className="bg-[#222226] border border-[#2A2A2F] p-4 rounded-xl flex flex-wrap gap-4 items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">담당 현장:</span>
            <select
              value={contractorSiteFilter}
              onChange={(e) => setContractorSiteFilter(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체 현장</option>
              {zonesList.map(z => (
                <option key={z.id} value={z.name}>{z.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#8A8A96]" />
            <input
              type="text"
              placeholder="협력사명 검색..."
              value={contractorSearch}
              onChange={(e) => setContractorSearch(e.target.value)}
              className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            />
          </div>
        </div>

        {/* 테이블 */}
        <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111113] text-[#8A8A96] font-semibold uppercase border-b border-[#2A2A2F]">
              <tr>
                <th className="px-4 py-3">협력사명</th>
                <th className="px-4 py-3">업종</th>
                <th className="px-4 py-3">담당 현장</th>
                <th className="px-4 py-3">대표자</th>
                <th className="px-4 py-3">연락처</th>
                <th className="px-4 py-3">소속 인원 수</th>
                <th className="px-4 py-3">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F] text-white">
              {filteredContractors.map((c) => (
                <tr key={c.id} className="hover:bg-[#2A2A2F]/50 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-[#00D1E8]">{c.name}</td>
                  <td className="px-4 py-3.5 text-[#8A8A96]">{c.category || "토목/건축"}</td>
                  <td className="px-4 py-3.5">{c.zones.join(", ")}</td>
                  <td className="px-4 py-3.5 font-semibold">{c.pm}</td>
                  <td className="px-4 py-3.5 font-mono">{c.tel}</td>
                  <td className="px-4 py-3.5 font-mono text-[#22C55E] font-bold">{c.workers}명</td>
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">2025-01-12</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 협력사 등록 모달 */}
        {showContractorModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-md bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white border-b border-[#2A2A2F] pb-3">신규 협력사 등록</h3>
              <form onSubmit={handleAddContractor} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">협력사명</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 삼호건설"
                    value={newContractor.name}
                    onChange={(e) => setNewContractor({ ...newContractor, name: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">담당 현장</label>
                  <select
                    value={newContractor.zone}
                    onChange={(e) => setNewContractor({ ...newContractor, zone: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  >
                    {zonesList.map(z => (
                      <option key={z.id} value={z.name}>{z.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">대표자 이름</label>
                  <input
                    type="text"
                    required
                    placeholder="홍길동"
                    value={newContractor.pm}
                    onChange={(e) => setNewContractor({ ...newContractor, pm: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">연락처</label>
                  <input
                    type="text"
                    required
                    placeholder="010-0000-0000"
                    value={newContractor.tel}
                    onChange={(e) => setNewContractor({ ...newContractor, tel: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">업종</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 토목공사 / 철근콘크리트"
                    value={newContractor.category}
                    onChange={(e) => setNewContractor({ ...newContractor, category: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowContractorModal(false)}
                    className="flex-1 py-2 bg-[#2A2A2F] text-white font-bold rounded cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#00D1E8] text-[#111113] font-bold rounded cursor-pointer"
                  >
                    등록 완료
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────────
  // 4. 사용자 관리 (super-users or users)
  // ──────────────────────────────────────────────────
  if (currentPage === "super-users" || currentPage === "users") {
    const filteredUsers = userList.filter(u => {
      if (userSiteFilter !== "ALL" && u.site !== userSiteFilter && u.zones !== userSiteFilter) return false;
      if (userCompanyFilter !== "ALL" && u.company !== userCompanyFilter && u.dept !== userCompanyFilter) return false;
      if (userRoleFilter !== "ALL" && u.role !== userRoleFilter) return false;
      if (userStatusFilter !== "ALL" && u.status !== userStatusFilter) return false;
      return true;
    });

    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00D1E8]" />
              사용자 관리
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">통합 플랫폼 사용자 승인, 역할 부여 및 접속 현황을 모니터링합니다.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportExcel("사용자 목록")}
              className="px-3.5 py-2 bg-[#2A2A2F] hover:bg-[#3A3A40] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> 엑셀 다운로드
            </button>
            <button
              onClick={() => setShowUserModal(true)}
              className="px-3.5 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> 사용자 등록
            </button>
          </div>
        </div>

        {/* 필터 Bar */}
        <div className="bg-[#222226] border border-[#2A2A2F] p-4 rounded-xl flex flex-wrap gap-3 items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">현장:</span>
            <select
              value={userSiteFilter}
              onChange={(e) => setUserSiteFilter(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체 현장</option>
              {zonesList.map(z => (
                <option key={z.id} value={z.name}>{z.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">소속:</span>
            <select
              value={userCompanyFilter}
              onChange={(e) => setUserCompanyFilter(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체 소속</option>
              <option value="GH">GH (경기주택도시공사)</option>
              <option value="현대건설">현대건설</option>
              <option value="삼호건설">삼호건설</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">역할:</span>
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체 역할</option>
              <option value="SUPER_ADMIN">Admin (통합관리자)</option>
              <option value="SITE_MGR">현장관리자</option>
              <option value="VIEWER">모니터링</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">상태:</span>
            <select
              value={userStatusFilter}
              onChange={(e) => setUserStatusFilter(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체 상태</option>
              <option value="ACTIVE">승인</option>
              <option value="PENDING">가입신청</option>
              <option value="REJECTED">반려</option>
            </select>
          </div>
        </div>

        {/* 테이블 */}
        <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111113] text-[#8A8A96] font-semibold uppercase border-b border-[#2A2A2F]">
              <tr>
                <th className="px-4 py-3">이름</th>
                <th className="px-4 py-3">아이디</th>
                <th className="px-4 py-3">연락처</th>
                <th className="px-4 py-3">소속</th>
                <th className="px-4 py-3">현장</th>
                <th className="px-4 py-3">역할</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F] text-white">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#2A2A2F]/50 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-[#00D1E8]">{u.name}</td>
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{u.loginId || u.id}</td>
                  <td className="px-4 py-3.5 font-mono">{u.tel}</td>
                  <td className="px-4 py-3.5">{u.company || u.dept}</td>
                  <td className="px-4 py-3.5">{u.site || (u.zones === "ALL" ? "전체 현장" : u.zones)}</td>
                  <td className="px-4 py-3.5 font-semibold text-white">
                    {u.role === "SUPER_ADMIN" ? "Admin" : u.role === "SITE_MGR" ? "현장관리자" : "모니터링"}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.status === "ACTIVE" ? "bg-[#22C55E]/20 text-[#22C55E]" :
                      u.status === "PENDING" ? "bg-[#F59E0B]/20 text-[#F59E0B]" : "bg-[#EF4444]/20 text-[#EF4444]"
                    }`}>
                      {u.status === "ACTIVE" ? "승인" : u.status === "PENDING" ? "가입신청" : "반려"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => setViewingUser(u)}
                        className="px-2 py-1 bg-[#2A2A2F] hover:bg-[#3A3A40] text-white font-bold rounded text-[11px] cursor-pointer"
                      >
                        보기
                      </button>
                      <button
                        onClick={() => setEditingUser(u)}
                        className="px-2 py-1 bg-[#00D1E8]/20 hover:bg-[#00D1E8]/30 text-[#00D1E8] font-bold rounded text-[11px] cursor-pointer"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => setDeletingUserId(u.id)}
                        className="px-2 py-1 bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] font-bold rounded text-[11px] cursor-pointer"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 사용자 상세 보기 모달 */}
        {viewingUser && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-md bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl text-xs">
              <h3 className="text-base font-bold text-white border-b border-[#2A2A2F] pb-3">사용자 상세 정보 (조회 전용)</h3>
              <div className="space-y-2 text-[#ECECEC]">
                <div><span className="text-[#8A8A96]">이름:</span> <strong className="text-[#00D1E8]">{viewingUser.name}</strong></div>
                <div><span className="text-[#8A8A96]">아이디:</span> <strong className="font-mono">{viewingUser.loginId || viewingUser.id}</strong></div>
                <div><span className="text-[#8A8A96]">연락처:</span> <strong className="font-mono">{viewingUser.tel}</strong></div>
                <div><span className="text-[#8A8A96]">소속:</span> <strong>{viewingUser.company || viewingUser.dept}</strong></div>
                <div><span className="text-[#8A8A96]">현장:</span> <strong>{viewingUser.site || "왕숙1구역"}</strong></div>
                <div><span className="text-[#8A8A96]">역할:</span> <strong>{viewingUser.role}</strong></div>
                <div><span className="text-[#8A8A96]">상태:</span> <strong>{viewingUser.status}</strong></div>
              </div>
              <div className="pt-3 text-right">
                <button
                  onClick={() => setViewingUser(null)}
                  className="px-4 py-2 bg-[#2A2A2F] text-white font-bold rounded cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 사용자 수정 모달 */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-md bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white border-b border-[#2A2A2F] pb-3">사용자 정보 수정</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setUserList(userList.map(u => u.id === editingUser.id ? editingUser : u));
                  setEditingUser(null);
                  alert("사용자 정보가 수정되었습니다.");
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">아이디 (수정 불가)</label>
                  <input
                    type="text"
                    readOnly
                    value={editingUser.loginId || editingUser.id}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-[#8A8A96] px-3 py-2 rounded outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">이름</label>
                  <input
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">연락처</label>
                  <input
                    type="text"
                    required
                    value={editingUser.tel}
                    onChange={(e) => setEditingUser({ ...editingUser, tel: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">소속</label>
                  <input
                    type="text"
                    required
                    value={editingUser.company || editingUser.dept}
                    onChange={(e) => setEditingUser({ ...editingUser, company: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">역할</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  >
                    <option value="SUPER_ADMIN">Admin (통합관리자)</option>
                    <option value="SITE_MGR">현장관리자</option>
                    <option value="VIEWER">모니터링</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">상태</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  >
                    <option value="ACTIVE">승인 (ACTIVE)</option>
                    <option value="PENDING">가입신청 (PENDING)</option>
                    <option value="REJECTED">반려 (REJECTED)</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 py-2 bg-[#2A2A2F] text-white font-bold rounded cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#00D1E8] text-[#111113] font-bold rounded cursor-pointer"
                  >
                    저장 완료
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 사용자 삭제 모달 */}
        {deletingUserId && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-sm bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl text-center">
              <h3 className="text-base font-bold text-white">사용자를 삭제하시겠습니까?</h3>
              <p className="text-xs text-[#8A8A96]">삭제된 사용자 계정은 복구할 수 없습니다.</p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setDeletingUserId(null)}
                  className="flex-1 py-2 bg-[#2A2A2F] text-white font-bold rounded cursor-pointer text-xs"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setUserList(userList.filter(u => u.id !== deletingUserId));
                    setDeletingUserId(null);
                  }}
                  className="flex-1 py-2 bg-[#EF4444] text-white font-bold rounded cursor-pointer text-xs"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 사용자 등록 모달 */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-md bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white border-b border-[#2A2A2F] pb-3">신규 사용자 등록</h3>
              <form onSubmit={handleAddUser} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">이름 (필수)</label>
                  <input
                    type="text"
                    required
                    placeholder="홍길동"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">아이디 (필수)</label>
                  <input
                    type="text"
                    required
                    placeholder="user_id"
                    value={newUser.loginId}
                    onChange={(e) => setNewUser({ ...newUser, loginId: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">비밀번호 (필수)</label>
                  <input
                    type="password"
                    required
                    placeholder="비밀번호 입력"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">소속</label>
                  <input
                    type="text"
                    required
                    value={newUser.company}
                    onChange={(e) => setNewUser({ ...newUser, company: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">역할</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  >
                    <option value="Admin">Admin (통합관리자)</option>
                    <option value="모니터링">모니터링 (관제전용)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">연락처</label>
                  <input
                    type="text"
                    placeholder="010-0000-0000"
                    value={newUser.tel}
                    onChange={(e) => setNewUser({ ...newUser, tel: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 py-2 bg-[#2A2A2F] text-white font-bold rounded cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#00D1E8] text-[#111113] font-bold rounded cursor-pointer"
                  >
                    등록 완료
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────────
  // 5. 이벤트 통계 (super-event-stats or event-stats)
  // ──────────────────────────────────────────────────
  if (currentPage === "super-event-stats" || currentPage === "event-stats") {
    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#00D1E8]" />
              이벤트 발생 통계 및 보고서
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">기간별 위험 이벤트 추이, 유형별 비율 및 현장별 위험 집계 분석</p>
          </div>
          <button
            onClick={() => alert("이벤트 종합 분석 보고서 PDF 출력이 시작되었습니다.")}
            className="px-3.5 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> 보고서 출력
          </button>
        </div>

        {/* 기간 선택 버튼 Bar */}
        <div className="bg-[#222226] border border-[#2A2A2F] p-4 rounded-xl flex items-center gap-3 text-xs">
          <span className="text-[#8A8A96] font-semibold">조회 기간:</span>
          {[
            { id: "today", label: "오늘" },
            { id: "1week", label: "1주일" },
            { id: "1month", label: "1개월" },
            { id: "custom", label: "직접입력" },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setStatPeriod(p.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                statPeriod === p.id ? "bg-[#00D1E8] text-[#111113]" : "bg-[#111113] text-[#8A8A96] hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* 차트 시각화 카드 3종 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 차트 1: 일별 발생 추이 */}
          <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-4 md:col-span-2">
            <h3 className="text-sm font-bold text-white">1. 일별 위험 이벤트 발생 추이</h3>
            <div className="h-48 flex items-end justify-between gap-2 pt-6 px-4 bg-[#111113] rounded-lg border border-[#2A2A2F]">
              {[12, 18, 9, 24, 15, 30, 8, 14, 19, 22, 11, 7, 16, 20].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[9px] font-mono text-[#00D1E8] opacity-0 group-hover:opacity-100 transition-opacity">{val}</span>
                  <div
                    className="w-full bg-[#00D1E8]/80 hover:bg-[#00D1E8] rounded-t transition-all"
                    style={{ height: `${val * 5}px` }}
                  ></div>
                  <span className="text-[9px] text-[#8A8A96] font-mono">{idx + 14}일</span>
                </div>
              ))}
            </div>
          </div>

          {/* 차트 2: 유형별 비율 (도넛/프로그레스) */}
          <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">2. 유형별 비율 (AI / 센서 / SOS)</h3>
            <div className="space-y-4 text-xs pt-2">
              <div>
                <div className="flex justify-between text-[#8A8A96] mb-1 font-semibold">
                  <span>AI 영상감지 (안전모/미착용/쓰러짐)</span>
                  <span className="text-[#00D1E8] font-bold font-mono">58% (142건)</span>
                </div>
                <div className="w-full bg-[#111113] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#00D1E8] h-full w-[58%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#8A8A96] mb-1 font-semibold">
                  <span>IoT 센서 (가스/경사/수위)</span>
                  <span className="text-[#F59E0B] font-bold font-mono">26% (64건)</span>
                </div>
                <div className="w-full bg-[#111113] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#F59E0B] h-full w-[26%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#8A8A96] mb-1 font-semibold">
                  <span>SOS 긴급신호</span>
                  <span className="text-[#EF4444] font-bold font-mono">16% (39건)</span>
                </div>
                <div className="w-full bg-[#111113] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#EF4444] h-full w-[16%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* 차트 3: 현장별 발생 건수 */}
          <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-4 md:col-span-3">
            <h3 className="text-sm font-bold text-white">3. 현장별 이벤트 발생 건수 비교</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {zonesList.slice(0, 3).map((z, i) => (
                <div key={z.id} className="p-4 bg-[#111113] rounded-lg border border-[#2A2A2F] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{z.name}</span>
                    <span className="text-[#00D1E8] font-mono font-bold">{42 + i * 15}건</span>
                  </div>
                  <div className="w-full bg-[#222226] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#00D1E8] h-full" style={{ width: `${60 + i * 15}%` }}></div>
                  </div>
                  <div className="text-[10px] text-[#8A8A96]">AI 28건 · 센서 10건 · SOS 4건</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────
  // 6. 디바이스 현황 (super-devices or devices-status)
  // ──────────────────────────────────────────────────
  if (currentPage === "super-devices" || currentPage === "devices-status") {
    const filteredDevs = devStatusList.filter(d => {
      if (devFilterSite !== "ALL" && d.siteName !== devFilterSite) return false;
      if (devFilterType !== "ALL" && d.type !== devFilterType) return false;
      if (devFilterStatus !== "ALL" && d.status !== devFilterStatus) return false;
      return true;
    });

    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-[#00D1E8]" />
              전체 디바이스 관제 현황
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">현장별 배정된 CCTV, IoT 센서, 무사고기기 상태 및 실시간 수신 모니터링</p>
          </div>
        </div>

        {/* 필터 Bar */}
        <div className="bg-[#222226] border border-[#2A2A2F] p-4 rounded-xl flex flex-wrap gap-4 items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">현장:</span>
            <select
              value={devFilterSite}
              onChange={(e) => setDevFilterSite(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체 현장</option>
              {zonesList.map(z => (
                <option key={z.id} value={z.name}>{z.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">유형:</span>
            <select
              value={devFilterType}
              onChange={(e) => setDevFilterType(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체</option>
              <option value="CCTV">CCTV</option>
              <option value="IoT센서">IoT센서</option>
              <option value="무사고기기">무사고기기</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">상태:</span>
            <select
              value={devFilterStatus}
              onChange={(e) => setDevFilterStatus(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체</option>
              <option value="ONLINE">온라인 (ONLINE)</option>
              <option value="OFFLINE">오프라인 (OFFLINE)</option>
            </select>
          </div>
        </div>

        {/* 디바이스 현황 테이블 */}
        <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111113] text-[#8A8A96] font-semibold uppercase border-b border-[#2A2A2F]">
              <tr>
                <th className="px-4 py-3">디바이스 ID</th>
                <th className="px-4 py-3">디바이스 종류</th>
                <th className="px-4 py-3">제조사</th>
                <th className="px-4 py-3">모델명</th>
                <th className="px-4 py-3">현장</th>
                <th className="px-4 py-3">설치 구역</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">마지막 수신</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F] text-white">
              {filteredDevs.map((d) => (
                <tr key={d.id} className="hover:bg-[#2A2A2F]/50 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-[#00D1E8]">{d.id}</td>
                  <td className="px-4 py-3.5 font-semibold">{d.type}</td>
                  <td className="px-4 py-3.5 text-white">{d.vendor || "한화비전"}</td>
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{d.model || "XNO-6080R"}</td>
                  <td className="px-4 py-3.5">{d.siteName}</td>
                  <td className="px-4 py-3.5 text-[#8A8A96]">{d.zoneName || "A구역"}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      d.status === "ONLINE" ? "bg-[#22C55E]/20 text-[#22C55E]" : "bg-[#EF4444]/20 text-[#EF4444]"
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{d.lastPing || "10초 전"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────
  // 7. 공지사항 (super-notices or notice)
  // ──────────────────────────────────────────────────
  if (currentPage === "super-notices" || currentPage === "notice") {
    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#00D1E8]" />
              공지사항 관리
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">전체 현장 또는 특정 선택 현장에 안전 공지사항을 발송하고 확인 상태를 모니터링합니다.</p>
          </div>
          <button
            onClick={() => setShowNoticeModal(true)}
            className="px-3.5 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> 공지 등록
          </button>
        </div>

        {/* 공지사항 테이블 */}
        <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111113] text-[#8A8A96] font-semibold uppercase border-b border-[#2A2A2F]">
              <tr>
                <th className="px-4 py-3">번호</th>
                <th className="px-4 py-3">제목</th>
                <th className="px-4 py-3">작성자</th>
                <th className="px-4 py-3">수신 대상</th>
                <th className="px-4 py-3">등록일시</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F] text-white">
              {notices.map((n, idx) => (
                <tr key={n.id} className="hover:bg-[#2A2A2F]/50 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{notices.length - idx}</td>
                  <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2">
                    {n.importance === "IMPORTANT" && (
                      <span className="px-1.5 py-0.5 bg-[#EF4444]/20 text-[#EF4444] rounded text-[10px]">중요</span>
                    )}
                    <span>{n.title}</span>
                  </td>
                  <td className="px-4 py-3.5">{n.author}</td>
                  <td className="px-4 py-3.5 text-[#00D1E8]">
                    {n.targetType === "ALL" ? "전체 현장" : (n.targetZones?.join(", ") || "특정 현장")}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{n.createdAt}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E]">
                      발송완료
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => handleDeleteNotice(n.id)}
                      className="p-1 hover:bg-[#EF4444]/20 text-[#8A8A96] hover:text-[#EF4444] rounded transition-colors cursor-pointer"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 공지 등록 모달 */}
        {showNoticeModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-lg bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white border-b border-[#2A2A2F] pb-3">신규 공지사항 등록</h3>
              <form onSubmit={handleAddNotice} className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[#8A8A96] font-semibold">공지 제목 (최대 50자)</label>
                    <span className="text-[10px] font-mono text-[#8A8A96]">{noticeForm.title.length}/50</span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    placeholder="공지사항 제목을 입력하세요."
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">중요도</label>
                  <div className="flex gap-4 text-white">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="importance"
                        checked={noticeForm.importance === "NORMAL"}
                        onChange={() => setNoticeForm({ ...noticeForm, importance: "NORMAL" })}
                      />
                      <span>일반</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="importance"
                        checked={noticeForm.importance === "IMPORTANT"}
                        onChange={() => setNoticeForm({ ...noticeForm, importance: "IMPORTANT" })}
                      />
                      <span className="text-[#EF4444] font-bold">중요 (상단 고정)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">수신 대상</label>
                  <div className="space-y-2">
                    <div className="flex gap-4 text-white">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="targetType"
                          checked={noticeForm.targetType === "ALL"}
                          onChange={() => setNoticeForm({ ...noticeForm, targetType: "ALL", selectedZones: [] })}
                        />
                        <span>전체 현장</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="targetType"
                          checked={noticeForm.targetType === "ZONES"}
                          onChange={() => setNoticeForm({ ...noticeForm, targetType: "ZONES" })}
                        />
                        <span>특정 현장 선택</span>
                      </label>
                    </div>

                    {noticeForm.targetType === "ZONES" && (
                      <div className="p-3 bg-[#111113] border border-[#2A2A2F] rounded-lg grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {zonesList.map(z => (
                          <label key={z.id} className="flex items-center gap-2 text-white cursor-pointer text-[11px]">
                            <input
                              type="checkbox"
                              checked={noticeForm.selectedZones.includes(z.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNoticeForm({ ...noticeForm, selectedZones: [...noticeForm.selectedZones, z.name] });
                                } else {
                                  setNoticeForm({ ...noticeForm, selectedZones: noticeForm.selectedZones.filter(item => item !== z.name) });
                                }
                              }}
                            />
                            <span>{z.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[#8A8A96] font-semibold">공지 내용 (최대 1,000자)</label>
                    <span className="text-[10px] font-mono text-[#8A8A96]">{noticeForm.content.length}/1000</span>
                  </div>
                  <textarea
                    required
                    maxLength={1000}
                    rows={4}
                    placeholder="공지사항 상세 내용을 작성하세요."
                    value={noticeForm.content}
                    onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white p-3 rounded outline-none resize-none"
                  />
                </div>

                <div className="text-[10px] text-[#F59E0B]">
                  ※ 공지 등록 완료 후에는 내용 수정을 지원하지 않으며, 본인 작성글 삭제만 가능합니다.
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNoticeModal(false)}
                    className="flex-1 py-2 bg-[#2A2A2F] text-white font-bold rounded cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#00D1E8] text-[#111113] font-bold rounded cursor-pointer"
                  >
                    공지 등록 완료
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────────
  // 8. 감사 로그 (super-audit-log or audit-logs)
  // ──────────────────────────────────────────────────
  if (currentPage === "super-audit-log" || currentPage === "audit-logs") {
    const filteredLogs = auditLogs.filter(l => {
      if (auditSearchUser.trim() && !l.userName.includes(auditSearchUser.trim())) return false;
      return true;
    });

    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#00D1E8]" />
              시스템 감사 로그 (Audit Logs)
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">플랫폼 내 관리자 작업 이력, 접근 시각 및 처리 내역을 모니터링합니다.</p>
          </div>
          <button
            onClick={() => handleExportExcel("감사로그 목록")}
            className="px-3.5 py-2 bg-[#2A2A2F] hover:bg-[#3A3A40] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> 엑셀 다운로드
          </button>
        </div>

        {/* 필터 Bar */}
        <div className="bg-[#222226] border border-[#2A2A2F] p-4 rounded-xl flex flex-wrap gap-4 items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">기간:</span>
            <select
              value={auditPeriodFilter}
              onChange={(e) => setAuditPeriodFilter(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체 기간</option>
              <option value="TODAY">오늘</option>
              <option value="1WEEK">1주일</option>
              <option value="1MONTH">1개월</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#8A8A96]" />
            <input
              type="text"
              placeholder="사용자명 검색..."
              value={auditSearchUser}
              onChange={(e) => setAuditSearchUser(e.target.value)}
              className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            />
          </div>
        </div>

        {/* 감사 로그 안내문 */}
        <div className="p-3 bg-[#111113] border border-[#2A2A2F] rounded-lg text-xs text-[#8A8A96]">
          ※ 시스템 감사 로그는 관련 법령에 의하여 1년간 자동 보존되며 임의 수정 및 삭제 버튼이 제공되지 않습니다.
        </div>

        {/* 감사 로그 테이블 */}
        <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111113] text-[#8A8A96] font-semibold uppercase border-b border-[#2A2A2F]">
              <tr>
                <th className="px-4 py-3">일시</th>
                <th className="px-4 py-3">사용자</th>
                <th className="px-4 py-3">권한</th>
                <th className="px-4 py-3">작업 내용</th>
                <th className="px-4 py-3">IP 주소</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F] text-white">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-[#2A2A2F]/50 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{l.timestamp}</td>
                  <td className="px-4 py-3.5 font-bold text-[#00D1E8]">{l.userName}</td>
                  <td className="px-4 py-3.5 font-semibold text-[#8A8A96]">{l.role}</td>
                  <td className="px-4 py-3.5">{l.action}</td>
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{l.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}
