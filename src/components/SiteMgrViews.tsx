/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Zone, SafetyEvent, SystemDevice, Company, Notice, User } from "../types";
import { INIT_SYS_DEVICES, COMPANIES, INIT_NOTICES, USERS, ZONES } from "../data";
import { 
  Building2, Users, AlertTriangle, CheckCircle2, CloudSun, Plus, Search, 
  MapPin, Eye, Radio, HardDrive, Map, Navigation, Check, Download,
  Megaphone, Trash2, X, Filter
} from "lucide-react";

interface SiteMgrViewsProps {
  currentPage: string;
  navigate: (page: string, params?: any) => void;
  currentZone?: Zone;
  events?: SafetyEvent[];
  availableZones?: Zone[];
  noticesList?: Notice[];
  setNoticesList?: React.Dispatch<React.SetStateAction<Notice[]>>;
  companiesList?: Company[];
  setCompaniesList?: React.Dispatch<React.SetStateAction<Company[]>>;
}

export default function SiteMgrViews({
  currentPage,
  navigate,
  currentZone = ZONES[0],
  events = [],
  availableZones = ZONES,
  noticesList = INIT_NOTICES,
  setNoticesList,
  companiesList = COMPANIES,
  setCompaniesList,
}: SiteMgrViewsProps) {
  // ── 1. State for Zones (site-zones) ──
  const [zones, setZones] = useState<any[]>([
    { id: "z-1", name: "A구역 (정문 출입구)", lat: 37.6478, lng: 127.2156, devCount: 6, createdAt: "2025-01-10" },
    { id: "z-2", name: "B구역 (주상복합 동)", lat: 37.6482, lng: 127.2162, devCount: 12, createdAt: "2025-01-10" },
    { id: "z-3", name: "C구역 (지하 주차장)", lat: 37.6472, lng: 127.2148, devCount: 8, createdAt: "2025-02-01" },
  ]);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [newZone, setNewZone] = useState({
    name: "",
    lat: "37.6478",
    lng: "127.2156"
  });

  // ── 2. State for Users (site-users) ──
  const [userList, setUserList] = useState<User[]>(USERS.filter(u => u.site === "왕숙1구역" || u.zones === "z1" || u.role === "SITE_MGR"));
  const [userCompanyFilter, setUserCompanyFilter] = useState("ALL");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState("ALL");
  const [showUserModal, setShowUserModal] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    loginId: "",
    password: "",
    company: "삼호건설",
    role: "Admin" as "Admin" | "Member",
    tel: ""
  });

  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Confirm modal state for user approval/rejection/role change
  const [confirmModal, setConfirmModal] = useState<{
    type: "APPROVE" | "REJECT" | "ROLE_CHANGE" | null;
    userId: string;
    userName: string;
    newRole?: string;
  }>({ type: null, userId: "", userName: "" });

  // ── 3. State for Device Mapping (site-device-mapping / site-devices) ──
  const [siteDevices, setSiteDevices] = useState<SystemDevice[]>(INIT_SYS_DEVICES.filter(d => d.siteName === "왕숙1구역" || d.siteName === currentZone.name));
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedDevId, setSelectedDevId] = useState("");
  const [targetZoneName, setTargetZoneName] = useState("A구역 (정문 출입구)");

  // ── 4. State for Contractors (site-contractors) ──
  const [contractors, setContractors] = useState<Company[]>(companiesList);
  const [showContractorModal, setShowContractorModal] = useState(false);
  const [newContractor, setNewContractor] = useState({
    name: "",
    pm: "",
    tel: "",
    category: "토목공사",
    workers: 20
  });

  // ── 5. State for Notices (site-notices) ──
  const [notices, setNotices] = useState<Notice[]>(noticesList.filter(n => n.targetType === "ALL" || n.targetZones?.includes(currentZone.name)));
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    content: ""
  });

  // Excel download helper
  const handleExportExcel = (title: string) => {
    alert(`[${title}] 엑셀 다운로드가 시작되었습니다.`);
  };

  // GPS Auto Fill
  const handleGpsAutoFill = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setNewZone({
            ...newZone,
            lat: pos.coords.latitude.toFixed(4),
            lng: pos.coords.longitude.toFixed(4)
          });
          alert("현재 위치 GPS 좌표가 자동 입력되었습니다.");
        },
        () => {
          setNewZone({ ...newZone, lat: "37.6478", lng: "127.2156" });
          alert("GPS 좌표 자동 입력을 완료했습니다.");
        }
      );
    } else {
      setNewZone({ ...newZone, lat: "37.6478", lng: "127.2156" });
    }
  };

  // Add Zone
  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZone.name.trim()) return;
    const added = {
      id: `z-${Date.now()}`,
      name: newZone.name.trim(),
      lat: parseFloat(newZone.lat) || 37.6478,
      lng: parseFloat(newZone.lng) || 127.2156,
      devCount: 0,
      createdAt: new Date().toISOString().split("T")[0]
    };
    setZones([added, ...zones]);
    setShowZoneModal(false);
    setNewZone({ name: "", lat: "37.6478", lng: "127.2156" });
    alert(`[${added.name}] 작업 구역이 성공적으로 등록되었습니다.`);
  };

  // Device Mapping
  const handleDeviceMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevId) return;
    setSiteDevices(siteDevices.map(d => {
      if (d.id === selectedDevId) {
        return { ...d, zoneName: targetZoneName };
      }
      return d;
    }));
    setShowMapModal(false);
    alert(`디바이스 [${selectedDevId}]가 [${targetZoneName}] 구역에 성공적으로 배정되었습니다.`);
  };

  // Add User
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim()) return;
    const added: User = {
      id: `u-${Date.now()}`,
      loginId: `siteuser_${Date.now().toString().slice(-4)}`,
      name: newUser.name.trim(),
      role: newUser.role === "Admin" ? "SITE_MGR" : "WORKER",
      dept: newUser.company,
      zones: currentZone.name,
      tel: newUser.tel || "010-0000-0000",
      lastLogin: "방금 전",
      status: "ACTIVE",
      company: newUser.company,
      site: currentZone.name,
      createdAt: new Date().toISOString().split("T")[0]
    };
    setUserList([added, ...userList]);
    setShowUserModal(false);
    setNewUser({ name: "", tel: "", company: "삼호건설", role: "Admin" });
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
      const mappedRole = confirmModal.newRole === "Admin" ? "SITE_MGR" : "WORKER";
      setUserList(userList.map(u => u.id === confirmModal.userId ? { ...u, role: mappedRole } : u));
      alert(`[${confirmModal.userName}] 권한이 [${confirmModal.newRole}] (으)로 변경되었습니다.`);
    }
    setConfirmModal({ type: null, userId: "", userName: "" });
  };

  // Add Contractor
  const handleAddContractor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContractor.name.trim()) return;
    const added: Company = {
      id: `c-${Date.now()}`,
      name: newContractor.name.trim(),
      zones: [currentZone.name],
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
    setNewContractor({ name: "", pm: "", tel: "", category: "토목공사", workers: 20 });
    alert(`[${added.name}] 협력사가 등록되었습니다.`);
  };

  // Add Notice
  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) return;
    const added: Notice = {
      id: `n-${Date.now()}`,
      title: noticeForm.title.trim(),
      content: noticeForm.content.trim(),
      author: "현장관리자",
      targetType: "ZONES",
      targetZones: [currentZone.name],
      importance: "NORMAL",
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      status: "SENT",
      readCount: 0,
      totalCount: 50
    };
    const updated = [added, ...notices];
    setNotices(updated);
    if (setNoticesList) setNoticesList([...noticesList, added]);
    setShowNoticeModal(false);
    setNoticeForm({ title: "", content: "" });
    alert("현장 공지사항이 정상 등록되었습니다.");
  };

  // Delete Notice
  const handleDeleteNotice = (id: string) => {
    if (confirm("이 공지사항을 삭제하시겠습니까?")) {
      const updated = notices.filter(n => n.id !== id);
      setNotices(updated);
      if (setNoticesList) setNoticesList(noticesList.filter(n => n.id !== id));
    }
  };

  // ──────────────────────────────────────────────────
  // 1. 대시보드 (site-dashboard or dashboard)
  // ──────────────────────────────────────────────────
  if (currentPage === "site-dashboard" || currentPage === "dashboard") {
    const unhandled = events.filter(e => e.status === "ACTIVE").length;
    const recent5 = events.slice(0, 5);

    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#00D1E8]" />
              [{currentZone?.name || "왕숙1구역"}] 현장관리자 대시보드
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">담당 현장의 일일 출근 근로자, 미처리 안전 위험 및 날씨 모니터링</p>
          </div>
          <div className="text-xs text-[#00D1E8] font-mono font-bold bg-[#00D1E8]/10 px-3 py-1.5 rounded border border-[#00D1E8]/30">
            SITE MANAGER CONSOLE
          </div>
        </div>

        {/* 요약 카드 4개 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#222226] border border-[#2A2A2F] p-5 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-[#8A8A96] text-xs font-semibold">
              <span>오늘 출근 인원</span>
              <Users className="w-4 h-4 text-[#00D1E8]" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{currentZone?.workers || 142}명</div>
            <p className="text-[11px] text-[#22C55E]">전원 게이트 출입 태깅 완료</p>
          </div>

          <div className="bg-[#222226] border border-[#EF4444]/40 p-5 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-[#8A8A96] text-xs font-semibold">
              <span>미처리 이벤트</span>
              <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
            </div>
            <div className="text-2xl font-black text-[#EF4444] font-mono">{unhandled}건</div>
            <p className="text-[11px] text-[#EF4444] font-bold">확인 및 SOP 조치 필요</p>
          </div>

          <div className="bg-[#222226] border border-[#22C55E]/40 p-5 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-[#8A8A96] text-xs font-semibold">
              <span>TBM 완료율</span>
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div className="text-2xl font-black text-[#22C55E] font-mono">100.0%</div>
            <p className="text-[11px] text-[#8A8A96]">오늘 총 145명 중 145명 완료</p>
          </div>

          <div className="bg-[#222226] border border-[#2A2A2F] p-5 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-[#8A8A96] text-xs font-semibold">
              <span>등록 디바이스 수</span>
              <HardDrive className="w-4 h-4 text-[#00D1E8]" />
            </div>
            <div className="text-2xl font-black text-white font-mono">18대</div>
            <p className="text-[11px] text-[#22C55E]">CCTV 12대 · 센서 6대</p>
          </div>
        </div>

        {/* 최근 이벤트 5건 + 현장 날씨 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-4 lg:col-span-2">
            <div className="flex justify-between items-center border-b border-[#2A2A2F] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                최근 발생 위험 이벤트 (최근 5건)
              </h3>
              <button onClick={() => navigate("events")} className="text-xs text-[#00D1E8] hover:underline cursor-pointer">전체보기 →</button>
            </div>
            <div className="space-y-2 text-xs">
              {recent5.map(e => (
                <div key={e.id} className="p-3 bg-[#111113] border border-[#2A2A2F] rounded-lg flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <span className="text-[#00D1E8]">{e.id}</span>
                      <span>[{e.subtype}] {e.desc}</span>
                    </div>
                    <div className="text-[11px] text-[#8A8A96]">발생시각: {e.time} | 대상: {e.worker || "감지장비"}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    e.status === "ACTIVE" ? "bg-[#EF4444]/20 text-[#EF4444]" : "bg-[#22C55E]/20 text-[#22C55E]"
                  }`}>
                    {e.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-[#2A2A2F]">
              <CloudSun className="w-4 h-4 text-[#00D1E8]" />
              현장 날씨 및 기상 경보
            </h3>
            <div className="p-4 bg-[#111113] rounded-lg border border-[#2A2A2F] space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#8A8A96]">{currentZone?.name || "남양주 왕숙 현장"}</div>
                  <div className="text-2xl font-black text-white font-mono mt-1">26.0 °C</div>
                  <div className="text-xs text-[#22C55E] font-bold mt-0.5">맑음</div>
                </div>
                <CloudSun className="w-10 h-10 text-[#00D1E8]" />
              </div>
              <div className="border-t border-[#2A2A2F] pt-2 space-y-1 font-mono text-[#8A8A96]">
                <div className="flex justify-between"><span>습도:</span><span className="text-white">55%</span></div>
                <div className="flex justify-between"><span>풍속:</span><span className="text-white">2.1 m/s (북서풍)</span></div>
                <div className="flex justify-between"><span>미세먼지:</span><span className="text-[#22C55E] font-bold">보통 (24 ㎍/m³)</span></div>
              </div>
              <div className="p-2.5 bg-[#F59E0B]/10 border border-[#F59E0B]/40 text-[#F59E0B] font-bold text-[11px] rounded text-center">
                ☀️ 옥외작업 안전 수칙 - 1시간 마다 수분 섭취 권고
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────
  // 2. 사용자 관리 (site-users or users)
  // ──────────────────────────────────────────────────
  if (currentPage === "site-users" || currentPage === "users") {
    const filteredUsers = userList.filter(u => {
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
              현장 사용자 관리
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">[{currentZone.name}] 현장 소속 근로자 및 안전 관리자 승인, 권한을 관리합니다.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportExcel("현장 사용자 목록")}
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
            <span className="text-[#8A8A96] font-semibold">소속 협력사:</span>
            <select
              value={userCompanyFilter}
              onChange={(e) => setUserCompanyFilter(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체 협력사</option>
              {contractors.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
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
              <option value="SITE_MGR">Admin (현장관리자)</option>
              <option value="WORKER">Member (근로자)</option>
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
                <th className="px-4 py-3">소속 협력사</th>
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
                  <td className="px-4 py-3.5 font-semibold text-white">
                    {u.role === "SITE_MGR" ? "Admin" : "Member"}
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
                <div><span className="text-[#8A8A96]">소속 협력사:</span> <strong>{viewingUser.company || viewingUser.dept}</strong></div>
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
                  <label className="text-[#8A8A96] font-semibold block mb-1">소속 협력사</label>
                  <select
                    value={editingUser.company || editingUser.dept}
                    onChange={(e) => setEditingUser({ ...editingUser, company: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  >
                    {contractors.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">역할</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  >
                    <option value="SITE_MGR">Admin (현장관리자)</option>
                    <option value="WORKER">Member (일반 근로자)</option>
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
                  <label className="text-[#8A8A96] font-semibold block mb-1">소속 협력사</label>
                  <select
                    value={newUser.company}
                    onChange={(e) => setNewUser({ ...newUser, company: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  >
                    {contractors.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">역할 부여</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  >
                    <option value="Admin">Admin (현장관리자)</option>
                    <option value="Member">Member (일반 근로자)</option>
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
  // 3. 작업 구역(Zone) 관리 (site-zones)
  // ──────────────────────────────────────────────────
  if (currentPage === "site-zones") {
    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Map className="w-5 h-5 text-[#00D1E8]" />
              작업 구역(Zone) 관리
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">현장 내 세부 작업 구역(Zone) 및 GPS 위치 정보 등록 관리</p>
          </div>
          <button
            onClick={() => setShowZoneModal(true)}
            className="px-3.5 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> 구역 등록
          </button>
        </div>

        {/* 목록 테이블 */}
        <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111113] text-[#8A8A96] font-semibold uppercase border-b border-[#2A2A2F]">
              <tr>
                <th className="px-4 py-3">구역명</th>
                <th className="px-4 py-3">위도 (Latitude)</th>
                <th className="px-4 py-3">경도 (Longitude)</th>
                <th className="px-4 py-3">등록 디바이스 수</th>
                <th className="px-4 py-3">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F] text-white">
              {zones.map((z) => (
                <tr key={z.id} className="hover:bg-[#2A2A2F]/50 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-[#00D1E8]">{z.name}</td>
                  <td className="px-4 py-3.5 font-mono">{z.lat}</td>
                  <td className="px-4 py-3.5 font-mono">{z.lng}</td>
                  <td className="px-4 py-3.5 font-mono text-[#22C55E] font-bold">{z.devCount}대</td>
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{z.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 구역 등록 모달 + 지도 미리보기 */}
        {showZoneModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-lg bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white border-b border-[#2A2A2F] pb-3">신규 작업 구역(Zone) 등록</h3>
              <form onSubmit={handleAddZone} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">구역명 (필수)</label>
                  <input
                    type="text"
                    required
                    placeholder="예: D구역 (자재 하역장)"
                    value={newZone.name}
                    onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[#8A8A96] font-semibold">GPS 위치 입력</label>
                    <button
                      type="button"
                      onClick={handleGpsAutoFill}
                      className="px-2 py-1 bg-[#00D1E8]/20 text-[#00D1E8] hover:bg-[#00D1E8]/30 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Navigation className="w-3 h-3" /> GPS 자동 입력
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="위도"
                      value={newZone.lat}
                      onChange={(e) => setNewZone({ ...newZone, lat: e.target.value })}
                      className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                    />
                    <input
                      type="text"
                      placeholder="경도"
                      value={newZone.lng}
                      onChange={(e) => setNewZone({ ...newZone, lng: e.target.value })}
                      className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                    />
                  </div>
                </div>

                {/* 지도 미리보기 Mock */}
                <div className="h-36 bg-[#111113] border border-[#2A2A2F] rounded-lg p-3 flex flex-col items-center justify-center text-center text-[#8A8A96] space-y-1">
                  <MapPin className="w-6 h-6 text-[#00D1E8] animate-bounce" />
                  <div className="font-bold text-white text-xs">네이버 지도 영역 미리보기 (Naver Maps Preview)</div>
                  <div className="text-[10px] font-mono">LAT: {newZone.lat} | LNG: {newZone.lng}</div>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowZoneModal(false)}
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
  // 4. 디바이스 관리 (site-device-mapping or site-devices)
  // ──────────────────────────────────────────────────
  if (currentPage === "site-device-mapping" || currentPage === "site-devices") {
    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-[#00D1E8]" />
              현장 디바이스 매핑 관리
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">현장에 등록된 CCTV 및 IoT 센서를 특정 작업 구역에 배정(매핑)합니다.</p>
          </div>
          <button
            onClick={() => setShowMapModal(true)}
            className="px-3.5 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> 디바이스 매핑
          </button>
        </div>

        {/* 목록 테이블 */}
        <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111113] text-[#8A8A96] font-semibold uppercase border-b border-[#2A2A2F]">
              <tr>
                <th className="px-4 py-3">디바이스 ID</th>
                <th className="px-4 py-3">디바이스 종류</th>
                <th className="px-4 py-3">제조사</th>
                <th className="px-4 py-3">모델명</th>
                <th className="px-4 py-3">현재 배정 구역</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">마지막 수신</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F] text-white">
              {siteDevices.map((d) => (
                <tr key={d.id} className="hover:bg-[#2A2A2F]/50 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-[#00D1E8]">{d.id}</td>
                  <td className="px-4 py-3.5 font-semibold">{d.type}</td>
                  <td className="px-4 py-3.5 text-white">{d.vendor || "한화비전"}</td>
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{d.model || "XNO-6080R"}</td>
                  <td className="px-4 py-3.5 text-white font-bold">{d.zoneName || "A구역 (정문 출입구)"}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      d.status === "ONLINE" ? "bg-[#22C55E]/20 text-[#22C55E]" : "bg-[#EF4444]/20 text-[#EF4444]"
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{d.lastPing || "방금 전"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 디바이스 매핑 모달 */}
        {showMapModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-md bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white border-b border-[#2A2A2F] pb-3">디바이스 구역 매핑</h3>
              <form onSubmit={handleDeviceMapping} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">매핑할 디바이스 선택</label>
                  <select
                    value={selectedDevId}
                    onChange={(e) => setSelectedDevId(e.target.value)}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  >
                    <option value="">디바이스 선택...</option>
                    {siteDevices.map(d => (
                      <option key={d.id} value={d.id}>{d.id} [{d.type}]</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">배정할 작업 구역 선택</label>
                  <select
                    value={targetZoneName}
                    onChange={(e) => setTargetZoneName(e.target.value)}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.name}>{z.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowMapModal(false)}
                    className="flex-1 py-2 bg-[#2A2A2F] text-white font-bold rounded cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#00D1E8] text-[#111113] font-bold rounded cursor-pointer"
                  >
                    매핑 완료
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
  // 5. 협력사 관리 (site-contractors or companies)
  // ──────────────────────────────────────────────────
  if (currentPage === "site-contractors" || currentPage === "companies") {
    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#00D1E8]" />
              현장 협력사 관리
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">[{currentZone.name}] 현장의 참여 협력업체 정보를 관리합니다.</p>
          </div>
          <button
            onClick={() => setShowContractorModal(true)}
            className="px-3.5 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> 협력사 등록
          </button>
        </div>

        {/* 테이블 */}
        <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111113] text-[#8A8A96] font-semibold uppercase border-b border-[#2A2A2F]">
              <tr>
                <th className="px-4 py-3">협력사명</th>
                <th className="px-4 py-3">업종</th>
                <th className="px-4 py-3">대표자</th>
                <th className="px-4 py-3">연락처</th>
                <th className="px-4 py-3">소속 인원 수</th>
                <th className="px-4 py-3">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F] text-white">
              {contractors.map((c) => (
                <tr key={c.id} className="hover:bg-[#2A2A2F]/50 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-[#00D1E8]">{c.name}</td>
                  <td className="px-4 py-3.5 text-[#8A8A96]">{c.category || "토목/건축"}</td>
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
  // 6. 공지사항 (site-notices or notice)
  // ──────────────────────────────────────────────────
  if (currentPage === "site-notices" || currentPage === "notice") {
    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#00D1E8]" />
              현장 공지사항
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">[{currentZone.name}] 현장 근로자 전체를 대상으로 안전 공지사항을 전파합니다.</p>
          </div>
          <button
            onClick={() => setShowNoticeModal(true)}
            className="px-3.5 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> 공지 등록
          </button>
        </div>

        {/* 테이블 */}
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
                      <span className="px-1.5 py-0.5 bg-[#EF4444]/20 text-[#EF4444] rounded text-[10px]">긴급</span>
                    )}
                    <span>{n.title}</span>
                  </td>
                  <td className="px-4 py-3.5">{n.author}</td>
                  <td className="px-4 py-3.5 text-[#00D1E8]">{n.targetType === "ALL" ? "현장 전체" : "특정 대상"}</td>
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{n.createdAt}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E]">
                      게시중
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
                    placeholder="공지 제목을 입력하세요."
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#8A8A96] font-semibold block mb-1">수신 대상</label>
                    <select
                      className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                    >
                      <option value="ALL">현장 전체</option>
                      <option value="WORKER">현장 근로자</option>
                      <option value="ADMIN">안전관리자</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[#8A8A96] font-semibold block mb-1">중요도</label>
                    <select
                      className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                    >
                      <option value="NORMAL">일반</option>
                      <option value="URGENT">긴급</option>
                      <option value="INSPECT">점검</option>
                    </select>
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
                    placeholder="현장 공지 내용을 상세히 입력하세요."
                    value={noticeForm.content}
                    onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white p-3 rounded outline-none resize-none"
                  />
                </div>

                <div className="text-[10px] text-[#F59E0B]">
                  ※ 등록 후 내용 수정이 불가하며, 작성글 삭제만 가능합니다.
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

  return null;
}
