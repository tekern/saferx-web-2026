/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Customer, SystemDevice } from "../types";
import { INIT_CUSTOMERS, INIT_SYS_DEVICES } from "../data";
import { 
  Building2, HardDrive, Users, Server, Activity, Plus, Download, 
  Search, Shield, Bell, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Cpu, Database, Wifi,
  FileText, Settings, Radio, Tv, Clock, Megaphone, Check, ToggleLeft, ToggleRight, AlertCircle, Send, Smartphone, Lock
} from "lucide-react";

interface SysAdminViewsProps {
  currentPage: string;
  navigate: (page: string) => void;
}

export default function SysAdminViews({ currentPage, navigate }: SysAdminViewsProps) {
  // ── Existing State for Customers & Accounts & Devices ──
  const [customers, setCustomers] = useState<Customer[]>(INIT_CUSTOMERS);
  const [custFilterStatus, setCustFilterStatus] = useState("ALL");
  const [custSearch, setCustSearch] = useState("");
  const [showCustModal, setShowCustModal] = useState(false);
  const [newCust, setNewCust] = useState({
    name: "",
    managerName: "",
    tel: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "2027-12-31"
  });

  const [accounts, setAccounts] = useState<any[]>([
    { id: "acc-1", name: "김경기", loginId: "super01", company: "GH 경기주택도시공사", role: "SUPER_ADMIN", status: "ACTIVE", tel: "010-2222-0002", createdAt: "2024-01-15", lastLogin: "2026-07-27 18:40" },
    { id: "acc-2", name: "이현대", loginId: "hd_admin", company: "현대건설", role: "SUPER_ADMIN", status: "ACTIVE", tel: "010-3333-1111", createdAt: "2024-02-10", lastLogin: "2026-07-27 16:12" },
    { id: "acc-3", name: "박현장", loginId: "site01", company: "GH 경기주택도시공사", role: "SITE_MGR", status: "ACTIVE", tel: "010-4444-2222", createdAt: "2024-03-20", lastLogin: "2026-07-27 19:10" },
    { id: "acc-4", name: "최시스템", loginId: "sys_admin", company: "HQ 본사", role: "SYS_ADMIN", status: "ACTIVE", tel: "010-5555-3333", createdAt: "2024-01-01", lastLogin: "2026-07-27 19:50" },
  ]);
  const [accFilterCompany, setAccFilterCompany] = useState("ALL");
  const [accFilterRole, setAccFilterRole] = useState("ALL");
  const [accFilterStatus, setAccFilterStatus] = useState("ALL");
  const [showAccModal, setShowAccModal] = useState(false);
  const [viewAccModal, setViewAccModal] = useState<any | null>(null);
  const [editAccModal, setEditAccModal] = useState<any | null>(null);
  const [deleteAccModal, setDeleteAccModal] = useState<any | null>(null);

  const [newAcc, setNewAcc] = useState({
    name: "",
    loginId: "",
    password: "",
    company: "GH 경기주택도시공사",
    role: "Admin",
    tel: ""
  });

  const [devices, setDevices] = useState<any[]>([
    { id: "DEV-CCTV-101", type: "카메라", manufacturer: "(주)한화비전", model: "XNO-C9083R", customerName: "GH 경기주택도시공사", siteName: "왕숙1구역", location: "1공구 A구역 정문 출입구", status: "ONLINE", createdAt: "2024-01-15" },
    { id: "DEV-IOT-204", type: "센서", manufacturer: "하이크비전", model: "DS-2CD2143G0", customerName: "현대건설", siteName: "왕숙2구역", location: "B동 3층 굴착 구역", status: "ONLINE", createdAt: "2024-02-01" },
    { id: "DEV-SPK-302", type: "스피커", manufacturer: "코콤", model: "K-SPK-50W", customerName: "GH 경기주택도시공사", siteName: "왕숙1구역", location: "타워크레인 1호기 상부", status: "OFFLINE", createdAt: "2024-03-10" },
    { id: "DEV-LGT-401", type: "조명", manufacturer: "필립스", model: "LUM-SAFE-200", customerName: "삼성물산", siteName: "왕숙3구역", location: "지하 주차장 통로 B구역", status: "ONLINE", createdAt: "2024-04-12" },
  ]);
  const [devFilterType, setDevFilterType] = useState("ALL");
  const [devFilterCompany, setDevFilterCompany] = useState("ALL");
  const [devFilterStatus, setDevFilterStatus] = useState("ALL");
  const [showDevModal, setShowDevModal] = useState(false);
  const [newDev, setNewDev] = useState({
    id: `DEV-${Math.floor(100 + Math.random() * 899)}`,
    type: "카메라",
    manufacturer: "한화비전",
    model: "XNO-6080R",
    siteName: "왕숙1구역",
    location: "A구역 정문"
  });

  // ── 1. Contracts State (계약 관리) ──
  const [contracts, setContracts] = useState<any[]>([
    { id: "cnt-1", customerName: "GH 경기주택도시공사", startDate: "2024-01-01", endDate: "2026-12-31", status: "활성", manager: "김경기 차장", memo: "스마트 건설 안전 통합 관제 풀패키지", createdAt: "2023-12-20" },
    { id: "cnt-2", customerName: "현대건설", startDate: "2024-03-01", endDate: "2025-02-28", status: "활성", manager: "이현대 부장", memo: "CCTV 및 AI 안전 분석 모듈", createdAt: "2024-02-15" },
    { id: "cnt-3", customerName: "한국토지주택공사(LH)", startDate: "2023-01-01", endDate: "2023-12-31", status: "만료", manager: "박관제 팀장", memo: "시범 사업 1차", createdAt: "2022-12-10" },
    { id: "cnt-4", customerName: "삼성물산", startDate: "2026-09-01", endDate: "2028-08-31", status: "대기", manager: "정삼성 이사", memo: "신규 현장 확대 도입 예정", createdAt: "2026-07-01" },
  ]);
  const [contractFilterStatus, setContractFilterStatus] = useState("ALL");
  const [contractFilterPeriod, setContractFilterPeriod] = useState("ALL");
  const [contractSearch, setContractSearch] = useState("");
  const [showContractModal, setShowContractModal] = useState(false);
  const [newContract, setNewContract] = useState({
    customerName: "GH 경기주택도시공사",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "2027-12-31",
    manager: "",
    memo: ""
  });

  // ── 2. Permission Management State (권한 관리) ──
  const [permFilterRole, setPermFilterRole] = useState("ALL");
  const [permFilterCompany, setPermFilterCompany] = useState("ALL");
  const [permSearch, setPermSearch] = useState("");
  const [tempRoleMap, setTempRoleMap] = useState<{ [key: string]: string }>({});
  const [confirmPermModal, setConfirmPermModal] = useState<{ open: boolean; user: any; newRole: string } | null>(null);

  // ── 3. Device Assignment State (디바이스 배정) ──
  const [assignDevices, setAssignDevices] = useState<any[]>([
    { id: "dev-assign-1", sn: "DEV-CCTV-001", type: "카메라", manufacturer: "(주)한화비전", model: "XNO-C9083R", customerName: "GH 경기주택도시공사", siteName: "왕숙1구역", assignDate: "2024-01-15", status: "배정" },
    { id: "dev-assign-2", sn: "DEV-IOT-102", type: "센서", manufacturer: "하이크비전", model: "DS-2CD2143G0", customerName: "현대건설", siteName: "왕숙2구역", assignDate: "2024-03-01", status: "배정" },
    { id: "dev-assign-3", sn: "DEV-SAFE-08", type: "무사고기기", manufacturer: "코콤", model: "K-SPK-50W", customerName: "미배정", siteName: "미배정", assignDate: "-", status: "미배정" },
    { id: "dev-assign-4", sn: "DEV-CCTV-044", type: "카메라", manufacturer: "필립스", model: "LUM-SAFE-200", customerName: "미배정", siteName: "미배정", assignDate: "-", status: "미배정" },
  ]);
  const [assignFilterType, setAssignFilterType] = useState("ALL");
  const [assignFilterStatus, setAssignFilterStatus] = useState("ALL");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newAssign, setNewAssign] = useState({
    sn: "",
    customerName: "GH 경기주택도시공사",
    siteName: "왕숙1구역"
  });

  // ── 4. FOTA State (FOTA 관리) ──
  const [fotaTab, setFotaTab] = useState<"list" | "history">("list");
  const [firmwares, setFirmwares] = useState<any[]>([
    { id: "fw-1", version: "v2.4.1", deviceType: "CCTV / AI분석기", releaseDate: "2026-07-20", patchNotes: "AI 영상인식 추론 속도 15% 향상 및 메모리 누수 수정", targetCount: 214 },
    { id: "fw-2", version: "v2.3.0", deviceType: "IoT 게이트웨이", releaseDate: "2026-06-11", patchNotes: "MQTT 통신 암호화 프로토콜 강화 (TLS 1.3)", targetCount: 180 },
    { id: "fw-3", version: "v1.9.5", deviceType: "무사고 디스플레이", releaseDate: "2026-04-05", patchNotes: "화면 잔상 방지 알고리즘 및 전원 절전 모드 추가", targetCount: 134 },
  ]);
  const [fotaHistories, setFotaHistories] = useState<any[]>([
    { id: "fh-1", sn: "DEV-CCTV-001", version: "v2.4.1", date: "2026-07-27 10:15", result: "성공", errorCode: "-" },
    { id: "fh-2", sn: "DEV-IOT-102", version: "v2.3.0", date: "2026-07-26 14:22", result: "성공", errorCode: "-" },
    { id: "fh-3", sn: "DEV-SAFE-08", version: "v2.4.1", date: "2026-07-25 18:05", result: "실패", errorCode: "E-401 Network Timeout" },
    { id: "fh-4", sn: "DEV-CCTV-044", version: "v2.4.1", date: "2026-07-25 11:30", result: "성공", errorCode: "-" },
  ]);
  const [showFotaUploadModal, setShowFotaUploadModal] = useState(false);
  const [confirmFotaBatchModal, setConfirmFotaBatchModal] = useState(false);

  // ── 5. Infra Monitoring State ──
  const [infraTab, setInfraTab] = useState<"total" | "ai" | "vms" | "db">("total");

  // ── 6. Access Logs State (접속 로그) ──
  const [accessLogTab, setAccessLogTab] = useState<"system" | "location" | "iot" | "privacy">("system");
  const [logFilterPeriod, setLogFilterPeriod] = useState("ALL");
  const [logFilterResult, setLogFilterResult] = useState("ALL");
  const [logSearch, setLogSearch] = useState("");
  const [accessLogs] = useState<any[]>([
    { id: "log-1", timestamp: "2026-07-27 19:50:12", user: "최시스템 (sys_admin)", affiliation: "HQ 본사", ip: "10.0.4.12", result: "성공", reason: "정상 인증" },
    { id: "log-2", timestamp: "2026-07-27 19:42:01", user: "김경기 (super01)", affiliation: "GH 경기주택도시공사", ip: "192.168.1.105", result: "성공", reason: "정상 인증" },
    { id: "log-3", timestamp: "2026-07-27 18:15:33", user: "unknown_user", affiliation: "외부", ip: "211.45.12.99", result: "실패", reason: "비밀번호 5회 오류" },
    { id: "log-4", timestamp: "2026-07-27 17:30:00", user: "박현장 (site01)", affiliation: "GH 경기주택도시공사", ip: "172.16.0.44", result: "성공", reason: "정상 인증" },
  ]);
  const [privacyLogs] = useState<any[]>([
    { id: "prv-1", timestamp: "2026-07-27 19:12:04", operator: "최시스템 (sys_admin)", targetId: "worker_1042 (홍길동)", actionType: "개인위치 및 비상연락처 조회", ip: "10.0.4.12" },
    { id: "prv-2", timestamp: "2026-07-27 18:05:11", operator: "김경기 (super01)", targetId: "user_site01 (박현장)", actionType: "계정 개인정보 변경", ip: "192.168.1.105" },
    { id: "prv-3", timestamp: "2026-07-27 16:40:22", operator: "이현대 (hd_admin)", targetId: "worker_8820 (이철수)", actionType: "안전장구 착용이력 마스킹 해제", ip: "172.16.10.8" },
  ]);

  // ── 7. Alert Settings State (알림 설정) ──
  const [alertSwitches, setAlertSwitches] = useState({
    sosAlert: true,
    offlineAlert: true,
    contractExpiryAlert: true,
    resourceLimitAlert: true,
    fotaFailAlert: false
  });
  const [alertRecipients, setAlertRecipients] = useState({
    sysAdmin: true,
    superAdmin: true
  });
  const [alertChannels, setAlertChannels] = useState({
    sms: true,
    email: true,
    webPush: true
  });
  const [alertSavedMsg, setAlertSavedMsg] = useState(false);

  // ── 8. Notice State (공지 발송) ──
  const [noticeList, setNoticeList] = useState<any[]>([
    { id: "not-1", title: "[긴급] v2.4.1 FOTA 시스템 일괄 점검 안내", targetCompany: "전체 고객사", noticeType: "긴급", sentAt: "2026-07-27 14:00", sender: "시스템관리자", status: "발송완료" },
    { id: "not-2", title: "하반기 건설안전 법정 교육 가이드 및 웹 세미나", targetCompany: "GH 경기주택도시공사", noticeType: "일반", sentAt: "2026-07-20 10:30", sender: "시스템관리자", status: "발송완료" },
    { id: "not-3", title: "주말 DB 인프라 정기 백업 점검 예정", targetCompany: "전체 고객사", noticeType: "점검", sentAt: "2026-07-15 09:00", sender: "시스템관리자", status: "발송완료" },
  ]);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: "",
    targetCompany: "전체 고객사",
    noticeType: "긴급",
    content: ""
  });
  const [confirmNoticeModal, setConfirmNoticeModal] = useState(false);

  // ── Export Helper ──
  const handleExportExcel = (title: string) => {
    alert(`[${title}] 데이터 엑셀/CSV 다운로드가 완료되었습니다.`);
  };

  // ── Handlers ──
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name.trim()) return;
    const added: Customer = {
      id: `cust-${Date.now()}`,
      name: newCust.name.trim(),
      siteCount: 1,
      contractStatus: "계약중",
      startDate: newCust.startDate,
      endDate: newCust.endDate,
      managerName: newCust.managerName,
      tel: newCust.tel,
      createdAt: new Date().toISOString().split("T")[0]
    };
    setCustomers([added, ...customers]);
    setShowCustModal(false);
    setNewCust({ name: "", managerName: "", tel: "", startDate: new Date().toISOString().split("T")[0], endDate: "2027-12-31" });
  };

  const handleAddContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContract.manager.trim()) return;
    const added = {
      id: `cnt-${Date.now()}`,
      customerName: newContract.customerName,
      startDate: newContract.startDate,
      endDate: newContract.endDate,
      status: "활성",
      manager: newContract.manager,
      memo: newContract.memo || "신규 등록 계약",
      createdAt: new Date().toISOString().split("T")[0]
    };
    setContracts([added, ...contracts]);
    setShowContractModal(false);
    setNewContract({ customerName: "GH 경기주택도시공사", startDate: new Date().toISOString().split("T")[0], endDate: "2027-12-31", manager: "", memo: "" });
  };

  const handleConfirmRoleChange = () => {
    if (!confirmPermModal) return;
    const { user, newRole } = confirmPermModal;
    setAccounts(accounts.map(a => a.id === user.id ? { ...a, role: newRole } : a));
    setConfirmPermModal(null);
    alert(`[${user.name}] 님의 권한이 '${newRole}'(으)로 변경되었습니다.`);
  };

  const handleAddAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssign.sn.trim()) return;
    const added = {
      id: `dev-assign-${Date.now()}`,
      sn: newAssign.sn.trim(),
      type: "CCTV",
      customerName: newAssign.customerName,
      siteName: newAssign.siteName,
      assignDate: new Date().toISOString().split("T")[0],
      status: "배정"
    };
    setAssignDevices([added, ...assignDevices]);
    setShowAssignModal(false);
    setNewAssign({ sn: "", customerName: "GH 경기주택도시공사", siteName: "왕숙1구역" });
  };

  const handleUnassignDevice = (id: string) => {
    if (confirm("해당 디바이스의 고객사 및 현장 배정을 해제하시겠습니까?")) {
      setAssignDevices(assignDevices.map(d => d.id === id ? { ...d, customerName: "미배정", siteName: "미배정", assignDate: "-", status: "미배정" } : d));
    }
  };

  const handleSaveAlerts = () => {
    setAlertSavedMsg(true);
    setTimeout(() => setAlertSavedMsg(false), 3000);
  };

  const handleSendNoticeSubmit = () => {
    if (!newNotice.title.trim()) return;
    setConfirmNoticeModal(true);
  };

  const handleExecuteSendNotice = () => {
    const added = {
      id: `not-${Date.now()}`,
      title: newNotice.title.trim(),
      targetCompany: newNotice.targetCompany,
      noticeType: newNotice.noticeType,
      sentAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      sender: "시스템관리자",
      status: "발송완료"
    };
    setNoticeList([added, ...noticeList]);
    setConfirmNoticeModal(false);
    setShowNoticeModal(false);
    setNewNotice({ title: "", targetCompany: "전체 고객사", noticeType: "긴급", content: "" });
    alert("공지사항이 정상 발송되었습니다.");
  };

  // ─────────────────────────────────────────────────────────────
  // 1. SYS-DASHBOARD (시스템관리자 대시보드)
  // ─────────────────────────────────────────────────────────────
  if (currentPage === "sys-dashboard") {
    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex items-center justify-between pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-[#00D1E8]" />
              시스템 관리자 대시보드
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">전체 서비스 인프라 및 고객사 모니터링 개요</p>
          </div>
          <div className="text-xs text-[#00D1E8] font-mono font-bold bg-[#00D1E8]/10 px-3 py-1.5 rounded border border-[#00D1E8]/30">
            SYSTEM ADMIN CONSOLE
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#222226] border border-[#2A2A2F] p-5 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-[#8A8A96] text-xs font-semibold">
              <span>전체 고객사 수</span>
              <Building2 className="w-4 h-4 text-[#00D1E8]" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{customers.length}개사</div>
            <p className="text-[11px] text-[#22C55E]">● 정상 계약 유지 중</p>
          </div>

          <div className="bg-[#222226] border border-[#2A2A2F] p-5 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-[#8A8A96] text-xs font-semibold">
              <span>전체 현장 수</span>
              <Activity className="w-4 h-4 text-[#00D1E8]" />
            </div>
            <div className="text-2xl font-black text-white font-mono">34개 현장</div>
            <p className="text-[11px] text-[#8A8A96]">13개 지구 관제 적용</p>
          </div>

          <div className="bg-[#222226] border border-[#2A2A2F] p-5 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-[#8A8A96] text-xs font-semibold">
              <span>전체 디바이스 수</span>
              <HardDrive className="w-4 h-4 text-[#00D1E8]" />
            </div>
            <div className="text-2xl font-black text-white font-mono">528대</div>
            <p className="text-[11px] text-[#22C55E]">온라인 비율 98.2%</p>
          </div>

          <div className="bg-[#222226] border border-[#2A2A2F] p-5 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-[#8A8A96] text-xs font-semibold">
              <span>전체 사용자 수</span>
              <Users className="w-4 h-4 text-[#00D1E8]" />
            </div>
            <div className="text-2xl font-black text-white font-mono">1,420명</div>
            <p className="text-[11px] text-[#8A8A96]">활성 사용자 1,380명</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00D1E8]" />
            핵심 서비스 모니터링 상태
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#222226] border border-[#22C55E]/40 p-5 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-white">VMS 영상 서버</span>
                <span className="px-2 py-0.5 text-[10px] bg-[#22C55E]/20 text-[#22C55E] font-bold rounded">정상</span>
              </div>
              <div className="text-xs text-[#8A8A96] space-y-1 font-mono">
                <div>응답시간: 12ms</div>
                <div>가동률: 99.98%</div>
                <div>스트림: 214 / 214 활성</div>
              </div>
            </div>

            <div className="bg-[#222226] border border-[#22C55E]/40 p-5 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-white">AI 영상분석 서버</span>
                <span className="px-2 py-0.5 text-[10px] bg-[#22C55E]/20 text-[#22C55E] font-bold rounded">정상</span>
              </div>
              <div className="text-xs text-[#8A8A96] space-y-1 font-mono">
                <div>응답시간: 28ms</div>
                <div>GPU 사용률: 64%</div>
                <div>추론 속도: 30 fps</div>
              </div>
            </div>

            <div className="bg-[#222226] border border-[#F59E0B]/40 p-5 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-white">ThingX IoT 서버</span>
                <span className="px-2 py-0.5 text-[10px] bg-[#F59E0B]/20 text-[#F59E0B] font-bold rounded">경고</span>
              </div>
              <div className="text-xs text-[#8A8A96] space-y-1 font-mono">
                <div>응답시간: 180ms</div>
                <div>트래픽 부하: 82%</div>
                <div>메시지 큐: 120 건 대기</div>
              </div>
            </div>

            <div className="bg-[#222226] border border-[#22C55E]/40 p-5 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-white">DB 서버</span>
                <span className="px-2 py-0.5 text-[10px] bg-[#22C55E]/20 text-[#22C55E] font-bold rounded">정상</span>
              </div>
              <div className="text-xs text-[#8A8A96] space-y-1 font-mono">
                <div>사용량: 42% (2.1 TB / 5 TB)</div>
                <div>커넥션: 128 / 500</div>
                <div>백업: 성공 (오늘 04:00)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. SYS-CONTRACTS (계약 관리)
  // ─────────────────────────────────────────────────────────────
  if (currentPage === "sys-contracts") {
    const filtered = contracts.filter(c => {
      if (contractFilterStatus !== "ALL" && c.status !== contractFilterStatus) return false;
      if (contractSearch.trim() && !c.customerName.includes(contractSearch.trim())) return false;
      return true;
    });

    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#00D1E8]" />
              계약 관리
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">고객사별 서비스 계약 정보, 상태 및 만료일을 통합 관리합니다.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportExcel("계약 목록")}
              className="px-3.5 py-2 bg-[#2A2A2F] hover:bg-[#3A3A40] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> 엑셀 다운로드
            </button>
            <button
              onClick={() => setShowContractModal(true)}
              className="px-3.5 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> 계약 등록
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#222226] border border-[#2A2A2F] p-4 rounded-xl flex flex-wrap gap-4 items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">계약 상태:</span>
            <select
              value={contractFilterStatus}
              onChange={(e) => setContractFilterStatus(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체</option>
              <option value="활성">활성</option>
              <option value="만료">만료</option>
              <option value="대기">대기</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">기간 검색:</span>
            <select
              value={contractFilterPeriod}
              onChange={(e) => setContractFilterPeriod(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체</option>
              <option value="TODAY">오늘</option>
              <option value="1WEEK">1주일</option>
              <option value="1MONTH">1개월</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#8A8A96]" />
            <input
              type="text"
              placeholder="고객사명 검색..."
              value={contractSearch}
              onChange={(e) => setContractSearch(e.target.value)}
              className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            />
          </div>
        </div>

        {/* Contracts Table */}
        <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111113] text-[#8A8A96] font-semibold uppercase border-b border-[#2A2A2F]">
              <tr>
                <th className="px-4 py-3">고객사명</th>
                <th className="px-4 py-3">계약 시작일</th>
                <th className="px-4 py-3">계약 종료일</th>
                <th className="px-4 py-3">계약 상태</th>
                <th className="px-4 py-3">담당자</th>
                <th className="px-4 py-3">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F] text-white">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#2A2A2F]/50 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-[#00D1E8]">{c.customerName}</td>
                  <td className="px-4 py-3.5 font-mono">{c.startDate}</td>
                  <td className="px-4 py-3.5 font-mono">{c.endDate}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                      c.status === "활성" ? "bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30" :
                      c.status === "만료" ? "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30" :
                      "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">{c.manager}</td>
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{c.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Contract Registration Modal */}
        {showContractModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-md bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white border-b border-[#2A2A2F] pb-3">신규 계약 등록</h3>
              <form onSubmit={handleAddContract} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">고객사 선택</label>
                  <select
                    value={newContract.customerName}
                    onChange={(e) => setNewContract({ ...newContract, customerName: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  >
                    {INIT_CUSTOMERS.map(cust => (
                      <option key={cust.id} value={cust.name}>{cust.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[#8A8A96] font-semibold block mb-1">계약 시작일</label>
                    <input
                      type="date"
                      required
                      value={newContract.startDate}
                      onChange={(e) => setNewContract({ ...newContract, startDate: e.target.value })}
                      className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A8A96] font-semibold block mb-1">계약 종료일</label>
                    <input
                      type="date"
                      required
                      value={newContract.endDate}
                      onChange={(e) => setNewContract({ ...newContract, endDate: e.target.value })}
                      className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">담당자</label>
                  <input
                    type="text"
                    required
                    placeholder="성명 및 직급"
                    value={newContract.manager}
                    onChange={(e) => setNewContract({ ...newContract, manager: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">메모</label>
                  <textarea
                    rows={3}
                    placeholder="계약 관련 특이사항 메모"
                    value={newContract.memo}
                    onChange={(e) => setNewContract({ ...newContract, memo: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white p-3 rounded outline-none"
                  />
                </div>
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowContractModal(false)}
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

  // ─────────────────────────────────────────────────────────────
  // 3. SYS-PERMISSIONS / SYS-ROLES (권한 관리)
  // ─────────────────────────────────────────────────────────────
  if (currentPage === "sys-permissions" || currentPage === "sys-roles") {
    const filteredAcc = accounts.filter(a => {
      if (permFilterRole !== "ALL" && a.role !== permFilterRole) return false;
      if (permFilterCompany !== "ALL" && a.company !== permFilterCompany) return false;
      if (permSearch.trim()) {
        const query = permSearch.trim().toLowerCase();
        if (!a.name.toLowerCase().includes(query) && !a.loginId.toLowerCase().includes(query)) return false;
      }
      return true;
    });

    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#00D1E8]" />
              권한 관리
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">시스템 권한 구조 (SYS_ADMIN / SUPER_ADMIN / SITE_MGR) 및 사용자 역할을 변경합니다.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#222226] border border-[#2A2A2F] p-4 rounded-xl flex flex-wrap gap-4 items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">권한:</span>
            <select
              value={permFilterRole}
              onChange={(e) => setPermFilterRole(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체</option>
              <option value="SYS_ADMIN">시스템관리자 (SYS_ADMIN)</option>
              <option value="SUPER_ADMIN">통합관리자 (SUPER_ADMIN)</option>
              <option value="SITE_MGR">현장관리자 (SITE_MGR)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">소속 고객사:</span>
            <select
              value={permFilterCompany}
              onChange={(e) => setPermFilterCompany(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체</option>
              {INIT_CUSTOMERS.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#8A8A96]" />
            <input
              type="text"
              placeholder="이름 / 아이디 검색..."
              value={permSearch}
              onChange={(e) => setPermSearch(e.target.value)}
              className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111113] text-[#8A8A96] font-semibold uppercase border-b border-[#2A2A2F]">
              <tr>
                <th className="px-4 py-3">이름</th>
                <th className="px-4 py-3">아이디</th>
                <th className="px-4 py-3">소속</th>
                <th className="px-4 py-3">현재 권한</th>
                <th className="px-4 py-3">권한 변경</th>
                <th className="px-4 py-3">최근 접속일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F] text-white">
              {filteredAcc.map((a) => {
                const currentSel = tempRoleMap[a.id] || a.role;
                return (
                  <tr key={a.id} className="hover:bg-[#2A2A2F]/50 transition-colors">
                    <td className="px-4 py-3.5 font-bold">{a.name}</td>
                    <td className="px-4 py-3.5 font-mono text-[#00D1E8]">{a.loginId}</td>
                    <td className="px-4 py-3.5">{a.company}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#2A2A2F] text-white border border-[#3A3A40]">
                        {a.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <select
                          value={currentSel}
                          onChange={(e) => setTempRoleMap({ ...tempRoleMap, [a.id]: e.target.value })}
                          className="bg-[#111113] border border-[#2A2A2F] text-white px-2 py-1 rounded text-xs outline-none"
                        >
                          <option value="SYS_ADMIN">SYS_ADMIN (시스템관리자)</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN (통합관리자)</option>
                          <option value="SITE_MGR">SITE_MGR (현장관리자)</option>
                        </select>
                        <button
                          disabled={currentSel === a.role}
                          onClick={() => setConfirmPermModal({ open: true, user: a, newRole: currentSel })}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            currentSel === a.role 
                              ? "bg-[#2A2A2F] text-[#8A8A96] cursor-not-allowed opacity-50"
                              : "bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] cursor-pointer shadow"
                          }`}
                        >
                          변경
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{a.lastLogin || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Confirmation Modal */}
        {confirmPermModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-sm bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-full bg-[#00D1E8]/10 text-[#00D1E8] flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">권한 변경 확인</h3>
              <p className="text-xs text-[#8A8A96] leading-relaxed">
                <strong className="text-white">{confirmPermModal.user.name}</strong> ({confirmPermModal.user.loginId}) 님의 권한을
                <br />
                <span className="text-[#EF4444] font-mono font-bold">{confirmPermModal.user.role}</span> &rarr;{" "}
                <span className="text-[#22C55E] font-mono font-bold">{confirmPermModal.newRole}</span> (으)로 변경하시겠습니까?
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setConfirmPermModal(null)}
                  className="flex-1 py-2 bg-[#2A2A2F] text-white font-bold rounded cursor-pointer text-xs"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmRoleChange}
                  className="flex-1 py-2 bg-[#00D1E8] text-[#111113] font-bold rounded cursor-pointer text-xs"
                >
                  확인 변경
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 4. SYS-DEVICE-ASSIGN / SYS-DEVICES-ASSIGN (디바이스 배정)
  // ─────────────────────────────────────────────────────────────
  if (currentPage === "sys-device-assign" || currentPage === "sys-devices-assign") {
    const filtered = assignDevices.filter(d => {
      if (assignFilterType !== "ALL" && d.type !== assignFilterType) return false;
      if (assignFilterStatus !== "ALL" && d.status !== assignFilterStatus) return false;
      return true;
    });

    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#00D1E8]" />
              디바이스 배정 관리
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">CCTV, IoT센서, 무사고기기 디바이스를 특정 고객사 및 현장에 배정하거나 해제합니다.</p>
          </div>
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-3.5 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> 디바이스 배정
          </button>
        </div>

        {/* Filter */}
        <div className="bg-[#222226] border border-[#2A2A2F] p-4 rounded-xl flex flex-wrap gap-4 items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">디바이스 종류:</span>
            <select
              value={assignFilterType}
              onChange={(e) => setAssignFilterType(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체</option>
              <option value="CCTV">CCTV</option>
              <option value="IoT센서">IoT센서</option>
              <option value="무사고기기">무사고기기</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">배정 상태:</span>
            <select
              value={assignFilterStatus}
              onChange={(e) => setAssignFilterStatus(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체</option>
              <option value="배정">배정</option>
              <option value="미배정">미배정</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111113] text-[#8A8A96] font-semibold uppercase border-b border-[#2A2A2F]">
              <tr>
                <th className="px-4 py-3">디바이스 ID</th>
                <th className="px-4 py-3">디바이스 종류</th>
                <th className="px-4 py-3">제조사</th>
                <th className="px-4 py-3">모델명</th>
                <th className="px-4 py-3">할당 고객사</th>
                <th className="px-4 py-3">할당 현장</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">할당일</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F] text-white">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-[#2A2A2F]/50 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-[#00D1E8]">{d.sn}</td>
                  <td className="px-4 py-3.5 font-semibold">{d.type}</td>
                  <td className="px-4 py-3.5 text-white">{d.manufacturer || "한화비전"}</td>
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{d.model || "XNO-C9083R"}</td>
                  <td className="px-4 py-3.5">{d.customerName}</td>
                  <td className="px-4 py-3.5">{d.siteName}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      d.status === "배정" ? "bg-[#22C55E]/20 text-[#22C55E]" : "bg-[#8A8A96]/20 text-[#8A8A96]"
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{d.assignDate}</td>
                  <td className="px-4 py-3.5 text-right">
                    {d.status === "배정" && (
                      <button
                        onClick={() => handleUnassignDevice(d.id)}
                        className="px-2.5 py-1 bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] rounded text-xs font-bold cursor-pointer"
                      >
                        배정 해제
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Device Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-md bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white border-b border-[#2A2A2F] pb-3">디바이스 고객사 배정</h3>
              <form onSubmit={handleAddAssign} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">미배정 디바이스 선택</label>
                  <input
                    type="text"
                    required
                    placeholder="예: DEV-CCTV-099"
                    value={newAssign.sn}
                    onChange={(e) => setNewAssign({ ...newAssign, sn: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">고객사 선택</label>
                  <select
                    value={newAssign.customerName}
                    onChange={(e) => setNewAssign({ ...newAssign, customerName: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  >
                    {INIT_CUSTOMERS.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">현장 선택 (고객사 연동)</label>
                  <select
                    value={newAssign.siteName}
                    onChange={(e) => setNewAssign({ ...newAssign, siteName: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  >
                    <option value="왕숙1구역">왕숙1구역</option>
                    <option value="왕숙2구역">왕숙2구역</option>
                    <option value="왕숙3구역">왕숙3구역</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 py-2 bg-[#2A2A2F] text-white font-bold rounded cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#00D1E8] text-[#111113] font-bold rounded cursor-pointer"
                  >
                    배정 완료
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 5. SYS-FOTA (FOTA 관리)
  // ─────────────────────────────────────────────────────────────
  if (currentPage === "sys-fota") {
    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#00D1E8]" />
              FOTA (Firmware Over-The-Air) 관리
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">현장 디바이스 펌웨어 패키지 관리 및 무선 원격 업데이트 이력을 모니터링합니다.</p>
          </div>
        </div>

        {/* Upper Tabs */}
        <div className="flex gap-2 border-b border-[#2A2A2F] pb-3 text-xs">
          <button
            onClick={() => setFotaTab("list")}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              fotaTab === "list" ? "bg-[#00D1E8] text-[#111113]" : "bg-[#222226] text-[#8A8A96] hover:text-white"
            }`}
          >
            펌웨어 목록
          </button>
          <button
            onClick={() => setFotaTab("history")}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              fotaTab === "history" ? "bg-[#00D1E8] text-[#111113]" : "bg-[#222226] text-[#8A8A96] hover:text-white"
            }`}
          >
            업데이트 이력
          </button>
        </div>

        {/* Tab 1: 펌웨어 목록 */}
        {fotaTab === "list" && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowFotaUploadModal(true)}
                className="px-3.5 py-2 bg-[#2A2A2F] hover:bg-[#3A3A40] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> 펌웨어 업로드
              </button>
              <button
                onClick={() => setConfirmFotaBatchModal(true)}
                className="px-3.5 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> 일괄 배포
              </button>
            </div>

            <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111113] text-[#8A8A96] font-semibold uppercase border-b border-[#2A2A2F]">
                  <tr>
                    <th className="px-4 py-3">펌웨어 버전</th>
                    <th className="px-4 py-3">대상 디바이스 종류</th>
                    <th className="px-4 py-3">출시일</th>
                    <th className="px-4 py-3">패치 내역</th>
                    <th className="px-4 py-3">적용 대상 수</th>
                    <th className="px-4 py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2F] text-white">
                  {firmwares.map((f) => (
                    <tr key={f.id} className="hover:bg-[#2A2A2F]/50 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-[#00D1E8]">{f.version}</td>
                      <td className="px-4 py-3.5 font-semibold">{f.deviceType}</td>
                      <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{f.releaseDate}</td>
                      <td className="px-4 py-3.5 text-[#ECECEC]">{f.patchNotes}</td>
                      <td className="px-4 py-3.5 font-mono">{f.targetCount} 대</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => alert(`[${f.version}] 무선 배포 명령이 전송되었습니다.`)}
                          className="px-2.5 py-1 bg-[#2A2A2F] hover:bg-[#3A3A40] text-xs rounded text-white font-bold"
                        >
                          배포
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: 업데이트 이력 */}
        {fotaTab === "history" && (
          <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111113] text-[#8A8A96] font-semibold uppercase border-b border-[#2A2A2F]">
                <tr>
                  <th className="px-4 py-3">디바이스 S/N</th>
                  <th className="px-4 py-3">적용 펌웨어</th>
                  <th className="px-4 py-3">업데이트 일시</th>
                  <th className="px-4 py-3">결과</th>
                  <th className="px-4 py-3">에러코드</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2F] text-white">
                {fotaHistories.map((h) => (
                  <tr key={h.id} className="hover:bg-[#2A2A2F]/50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-[#00D1E8] font-bold">{h.sn}</td>
                    <td className="px-4 py-3.5 font-mono font-bold">{h.version}</td>
                    <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{h.date}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        h.result === "성공" ? "bg-[#22C55E]/20 text-[#22C55E]" : "bg-[#EF4444]/20 text-[#EF4444]"
                      }`}>
                        {h.result}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{h.errorCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Batch FOTA Confirmation Modal */}
        {confirmFotaBatchModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-sm bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-full bg-[#00D1E8]/10 text-[#00D1E8] flex items-center justify-center mx-auto">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-white">FOTA 일괄 배포 실행</h3>
              <p className="text-xs text-[#8A8A96] leading-relaxed">
                전체 온라인 디바이스 <strong className="text-white font-mono">528대</strong>에 최신 펌웨어
                <br />
                <span className="text-[#00D1E8] font-mono font-bold">v2.4.1</span> 패키지를 무선 일괄 배포하시겠습니까?
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setConfirmFotaBatchModal(false)}
                  className="flex-1 py-2 bg-[#2A2A2F] text-white font-bold rounded cursor-pointer text-xs"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setConfirmFotaBatchModal(false);
                    alert("FOTA 무선 일괄 배포 명령이 실행되었습니다.");
                  }}
                  className="flex-1 py-2 bg-[#00D1E8] text-[#111113] font-bold rounded cursor-pointer text-xs"
                >
                  일괄 배포 실행
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal Mockup */}
        {showFotaUploadModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-md bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white border-b border-[#2A2A2F] pb-3">신규 펌웨어 패키지 업로드</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                setShowFotaUploadModal(false);
                alert("펌웨어 패키지가 등록되었습니다.");
              }} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">펌웨어 버전</label>
                  <input type="text" required placeholder="예: v2.5.0" className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none" />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">대상 디바이스</label>
                  <select className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none">
                    <option value="CCTV">CCTV / AI 분석기</option>
                    <option value="IoT">IoT 게이트웨이</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">패치 내역</label>
                  <textarea rows={2} required placeholder="패치 주요 내용" className="w-full bg-[#111113] border border-[#2A2A2F] text-white p-2 rounded outline-none" />
                </div>
                <div className="flex gap-2 pt-3">
                  <button type="button" onClick={() => setShowFotaUploadModal(false)} className="flex-1 py-2 bg-[#2A2A2F] text-white font-bold rounded">취소</button>
                  <button type="submit" className="flex-1 py-2 bg-[#00D1E8] text-[#111113] font-bold rounded">업로드</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 6. INFRASTRUCTURE MONITORING (sys-infra, infra-vms, infra-ai, infra-thingx, infra-db, infra-net)
  // ─────────────────────────────────────────────────────────────
  if (["sys-infra", "infra-vms", "infra-ai", "infra-thingx", "infra-db", "infra-net"].includes(currentPage)) {
    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-[#00D1E8]" />
              인프라 모니터링
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">VMS 영상, AI 분석, ThingX IoT, DB 서버 리소스 및 헬스체크 현황</p>
          </div>
          <button
            onClick={() => alert("서버 헬스체크를 새로고침 하였습니다.")}
            className="px-3.5 py-2 bg-[#2A2A2F] hover:bg-[#3A3A40] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#00D1E8]" /> 새로고침
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#2A2A2F] pb-3 text-xs">
          {[
            { id: "total", label: "통합 관제" },
            { id: "ai", label: "AI 분석" },
            { id: "vms", label: "VMS" },
            { id: "db", label: "DB 상태" }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setInfraTab(t.id as any)}
              className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                infraTab === t.id ? "bg-[#00D1E8] text-[#111113]" : "bg-[#222226] text-[#8A8A96] hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Server Status Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#222226] border border-[#22C55E]/40 p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-white">VMS 서버</span>
              <span className="text-[#22C55E] font-bold">● 정상</span>
            </div>
            <div className="text-xs font-mono text-[#8A8A96]">CPU 24.5% · RAM 4.2GB</div>
          </div>
          <div className="bg-[#222226] border border-[#22C55E]/40 p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-white">AI 영상분석</span>
              <span className="text-[#22C55E] font-bold">● 정상</span>
            </div>
            <div className="text-xs font-mono text-[#8A8A96]">GPU 64.0% · 30 FPS</div>
          </div>
          <div className="bg-[#222226] border border-[#F59E0B]/40 p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-white">ThingX IoT</span>
              <span className="text-[#F59E0B] font-bold">● 경고</span>
            </div>
            <div className="text-xs font-mono text-[#8A8A96]">180ms · 120개 대기</div>
          </div>
          <div className="bg-[#222226] border border-[#22C55E]/40 p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-white">DB 서버</span>
              <span className="text-[#22C55E] font-bold">● 정상</span>
            </div>
            <div className="text-xs font-mono text-[#8A8A96]">용량 42% (2.1TB/5TB)</div>
          </div>
        </div>

        {/* Detail content by Tab */}
        {infraTab === "total" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CPU Chart Card */}
              <div className="bg-[#222226] border border-[#2A2A2F] p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">CPU 사용률</span>
                  <span className="text-xs font-mono font-bold text-[#00D1E8]">34.2%</span>
                </div>
                <div className="w-full bg-[#111113] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#00D1E8] h-full w-[34%]" />
                </div>
                <div className="flex items-end gap-1 h-16 pt-2 justify-between border-t border-[#2A2A2F]">
                  {[22, 28, 35, 42, 30, 25, 34, 40, 38, 34].map((val, idx) => (
                    <div key={idx} className="flex-1 bg-[#00D1E8]/20 hover:bg-[#00D1E8] rounded-t transition-all" style={{ height: `${val}%` }} title={`${val}%`} />
                  ))}
                </div>
              </div>

              {/* Memory Chart Card */}
              <div className="bg-[#222226] border border-[#2A2A2F] p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">RAM 메모리</span>
                  <span className="text-xs font-mono font-bold text-[#22C55E]">58.4%</span>
                </div>
                <div className="w-full bg-[#111113] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#22C55E] h-full w-[58%]" />
                </div>
                <div className="flex items-end gap-1 h-16 pt-2 justify-between border-t border-[#2A2A2F]">
                  {[50, 52, 55, 54, 58, 60, 57, 56, 59, 58].map((val, idx) => (
                    <div key={idx} className="flex-1 bg-[#22C55E]/20 hover:bg-[#22C55E] rounded-t transition-all" style={{ height: `${val}%` }} title={`${val}%`} />
                  ))}
                </div>
              </div>

              {/* Disk Chart Card */}
              <div className="bg-[#222226] border border-[#2A2A2F] p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Disk 스토리지</span>
                  <span className="text-xs font-mono font-bold text-[#F59E0B]">72.1%</span>
                </div>
                <div className="w-full bg-[#111113] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#F59E0B] h-full w-[72%]" />
                </div>
                <div className="flex items-end gap-1 h-16 pt-2 justify-between border-t border-[#2A2A2F]">
                  {[68, 69, 70, 70, 71, 71, 72, 72, 72, 72].map((val, idx) => (
                    <div key={idx} className="flex-1 bg-[#F59E0B]/20 hover:bg-[#F59E0B] rounded-t transition-all" style={{ height: `${val}%` }} title={`${val}%`} />
                  ))}
                </div>
              </div>

              {/* Network Chart Card */}
              <div className="bg-[#222226] border border-[#2A2A2F] p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Network 트래픽</span>
                  <span className="text-xs font-mono font-bold text-[#00D1E8]">142 Mbps</span>
                </div>
                <div className="w-full bg-[#111113] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#00D1E8] h-full w-[45%]" />
                </div>
                <div className="flex items-end gap-1 h-16 pt-2 justify-between border-t border-[#2A2A2F]">
                  {[30, 45, 60, 80, 55, 40, 75, 90, 65, 45].map((val, idx) => (
                    <div key={idx} className="flex-1 bg-[#00D1E8]/20 hover:bg-[#00D1E8] rounded-t transition-all" style={{ height: `${val}%` }} title={`${val} Mbps`} />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#222226] border border-[#2A2A2F] p-5 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-white">실시간 네트워크 트래픽 대역폭</h3>
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-[#8A8A96] mb-1">
                    <span>Inbound Traffic (142 Mbps)</span>
                    <span className="text-[#00D1E8]">42%</span>
                  </div>
                  <div className="w-full bg-[#111113] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#00D1E8] h-full w-[42%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[#8A8A96] mb-1">
                    <span>Outbound Traffic (88 Mbps)</span>
                    <span className="text-[#22C55E]">28%</span>
                  </div>
                  <div className="w-full bg-[#111113] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#22C55E] h-full w-[28%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {infraTab === "ai" && (
          <div className="bg-[#222226] border border-[#2A2A2F] p-5 rounded-xl space-y-3 font-mono text-xs text-[#8A8A96]">
            <h3 className="text-sm font-bold text-white font-sans">AI 추론 엔진 메트릭</h3>
            <div>GPU 사용률: <strong className="text-[#00D1E8]">64.0% (NVIDIA RTX 4090)</strong></div>
            <div>추론 프레임 레이트: <strong className="text-white">30.2 FPS</strong></div>
            <div>처리 큐 대기 건수: <strong className="text-[#22C55E]">0 건 (지연 없음)</strong></div>
          </div>
        )}

        {infraTab === "vms" && (
          <div className="bg-[#222226] border border-[#2A2A2F] p-5 rounded-xl space-y-3 font-mono text-xs text-[#8A8A96]">
            <h3 className="text-sm font-bold text-white font-sans">VMS 관제 스트리밍</h3>
            <div>카메라 스트림 상태: <strong className="text-[#22C55E]">214 / 214 활성 (100%)</strong></div>
            <div>녹화용 스토리비: <strong className="text-white">16.4 TB / 20.0 TB (82%)</strong></div>
          </div>
        )}

        {infraTab === "db" && (
          <div className="bg-[#222226] border border-[#2A2A2F] p-5 rounded-xl space-y-3 font-mono text-xs text-[#8A8A96]">
            <h3 className="text-sm font-bold text-white font-sans">Database 상태 및 IOPS</h3>
            <div>커넥션 수: <strong className="text-white">128 / 500 Active Connections</strong></div>
            <div>IOPS: <strong className="text-[#00D1E8]">14,200 IOPS</strong></div>
            <div>백업 상태: <strong className="text-[#22C55E]">성공 (금일 04:00 완료)</strong></div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 7. SYS-ACCESS-LOG / SYS-LOGS (접속 로그)
  // ─────────────────────────────────────────────────────────────
  if (currentPage === "sys-access-log" || currentPage === "sys-logs") {
    const filteredLogs = accessLogs.filter(l => {
      if (logFilterResult !== "ALL" && l.result !== logFilterResult) return false;
      if (logSearch.trim()) {
        const query = logSearch.trim().toLowerCase();
        if (!l.user.toLowerCase().includes(query) && !l.ip.includes(query)) return false;
      }
      return true;
    });

    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#00D1E8]" />
              접속 로그
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">시스템 접속, 위치 조회 및 IoT 데이터 수집 관련 로그를 조회합니다.</p>
          </div>
          <button
            onClick={() => handleExportExcel("접속 로그")}
            className="px-3.5 py-2 bg-[#2A2A2F] hover:bg-[#3A3A40] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> 로그 다운로드 (CSV)
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#2A2A2F] pb-3 text-xs">
          <button
            onClick={() => setAccessLogTab("system")}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              accessLogTab === "system" ? "bg-[#00D1E8] text-[#111113]" : "bg-[#222226] text-[#8A8A96] hover:text-white"
            }`}
          >
            시스템 접속 이력
          </button>
          <button
            onClick={() => setAccessLogTab("location")}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              accessLogTab === "location" ? "bg-[#00D1E8] text-[#111113]" : "bg-[#222226] text-[#8A8A96] hover:text-white"
            }`}
          >
            위치조회 이력
          </button>
          <button
            onClick={() => setAccessLogTab("iot")}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              accessLogTab === "iot" ? "bg-[#00D1E8] text-[#111113]" : "bg-[#222226] text-[#8A8A96] hover:text-white"
            }`}
          >
            IoT 디바이스 위치
          </button>
          <button
            onClick={() => setAccessLogTab("privacy")}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              accessLogTab === "privacy" ? "bg-[#00D1E8] text-[#111113]" : "bg-[#222226] text-[#8A8A96] hover:text-white"
            }`}
          >
            개인정보 처리 이력
          </button>
        </div>

        {/* Filters */}
        <div className="bg-[#222226] border border-[#2A2A2F] p-4 rounded-xl flex flex-wrap gap-4 items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">기간:</span>
            <select
              value={logFilterPeriod}
              onChange={(e) => setLogFilterPeriod(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체</option>
              <option value="TODAY">오늘</option>
              <option value="1WEEK">1주일</option>
              <option value="1MONTH">1개월</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">접속 결과:</span>
            <select
              value={logFilterResult}
              onChange={(e) => setLogFilterResult(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체</option>
              <option value="성공">성공</option>
              <option value="실패">실패</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#8A8A96]" />
            <input
              type="text"
              placeholder="사용자 / IP / 검색어 입력..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            />
          </div>
        </div>

        {/* Table */}
        {accessLogTab === "privacy" ? (
          <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111113] text-[#8A8A96] font-semibold uppercase border-b border-[#2A2A2F]">
                <tr>
                  <th className="px-4 py-3">일시</th>
                  <th className="px-4 py-3">작업자</th>
                  <th className="px-4 py-3">대상자 ID</th>
                  <th className="px-4 py-3">작업 유형</th>
                  <th className="px-4 py-3">접속 IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2F] text-white">
                {privacyLogs.map((p) => (
                  <tr key={p.id} className="hover:bg-[#2A2A2F]/50 transition-colors font-mono">
                    <td className="px-4 py-3.5 text-[#8A8A96]">{p.timestamp}</td>
                    <td className="px-4 py-3.5 text-[#00D1E8] font-bold font-sans">{p.operator}</td>
                    <td className="px-4 py-3.5 font-sans font-semibold text-white">{p.targetId}</td>
                    <td className="px-4 py-3.5 font-sans text-white">{p.actionType}</td>
                    <td className="px-4 py-3.5 text-[#8A8A96]">{p.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111113] text-[#8A8A96] font-semibold uppercase border-b border-[#2A2A2F]">
                <tr>
                  <th className="px-4 py-3">접속 일시</th>
                  <th className="px-4 py-3">사용자명(아이디)</th>
                  <th className="px-4 py-3">소속</th>
                  <th className="px-4 py-3">IP 주소</th>
                  <th className="px-4 py-3">접속 결과</th>
                  <th className="px-4 py-3">사유</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2F] text-white">
                {filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-[#2A2A2F]/50 transition-colors font-mono">
                    <td className="px-4 py-3.5 text-[#8A8A96]">{l.timestamp}</td>
                    <td className="px-4 py-3.5 text-[#00D1E8] font-bold font-sans">{l.user}</td>
                    <td className="px-4 py-3.5 font-sans text-white">{l.affiliation}</td>
                    <td className="px-4 py-3.5">{l.ip}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.result === "성공" ? "bg-[#22C55E]/20 text-[#22C55E]" : "bg-[#EF4444]/20 text-[#EF4444]"
                      }`}>
                        {l.result}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-sans text-[#8A8A96]">{l.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 8. SYS-ALERT-SETTINGS / SYS-ALERTS (알림 설정)
  // ─────────────────────────────────────────────────────────────
  if (currentPage === "sys-alert-settings" || currentPage === "sys-alerts") {
    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#00D1E8]" />
              알림 설정
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">시스템 주요 이벤트 및 리소스 임계치 알림 수신 조건을 설정합니다.</p>
          </div>
          <button
            onClick={handleSaveAlerts}
            className="px-4 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Check className="w-4 h-4" /> 설정 저장
          </button>
        </div>

        {alertSavedMsg && (
          <div className="p-3 bg-[#22C55E]/10 border border-[#22C55E]/40 text-[#22C55E] text-xs font-bold rounded-lg text-center">
            ✓ 알림 설정이 성공적으로 저장되었습니다.
          </div>
        )}

        {/* Toggles */}
        <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-[#2A2A2F] pb-2">이벤트 트리거 알림 (ON / OFF)</h3>
          
          <div className="space-y-3 text-xs">
            {[
              { key: "sosAlert", label: "긴급 SOS 발생 시 시스템 알림", desc: "근로자 비상 버튼 누름 감지 시 즉시 전파" },
              { key: "offlineAlert", label: "디바이스 오프라인 감지 시 알림", desc: "CCTV/센서 통신 단절 5분 이상 지속 시" },
              { key: "contractExpiryAlert", label: "계약 만료 D-30 알림", desc: "고객사 계약 종료 30일 전 자동 알림" },
              { key: "resourceLimitAlert", label: "서버 리소스 90% 초과 시 알림", desc: "CPU/Memory/Disk 용량 임계치 경고" },
              { key: "fotaFailAlert", label: "FOTA 업데이트 실패 시 알림", desc: "패치 전송 오류 및 타임아웃 발생 시" },
            ].map(item => {
              const active = (alertSwitches as any)[item.key];
              return (
                <div key={item.key} className="flex justify-between items-center p-3 bg-[#111113] rounded-lg border border-[#2A2A2F]">
                  <div>
                    <div className="font-bold text-white">{item.label}</div>
                    <div className="text-[#8A8A96] text-[11px]">{item.desc}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAlertSwitches({ ...alertSwitches, [item.key]: !active })}
                    className="cursor-pointer text-2xl transition-all"
                  >
                    {active ? (
                      <span className="text-[#00D1E8] font-bold text-xs bg-[#00D1E8]/20 px-3 py-1 rounded-full border border-[#00D1E8]/40">ON</span>
                    ) : (
                      <span className="text-[#8A8A96] font-bold text-xs bg-[#2A2A2F] px-3 py-1 rounded-full">OFF</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white border-b border-[#2A2A2F] pb-2">수신 대상 설정</h3>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-white font-semibold">
                <input
                  type="checkbox"
                  checked={alertRecipients.sysAdmin}
                  onChange={(e) => setAlertRecipients({ ...alertRecipients, sysAdmin: e.target.checked })}
                  className="accent-[#00D1E8]"
                />
                시스템관리자 (SYS_ADMIN)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white font-semibold">
                <input
                  type="checkbox"
                  checked={alertRecipients.superAdmin}
                  onChange={(e) => setAlertRecipients({ ...alertRecipients, superAdmin: e.target.checked })}
                  className="accent-[#00D1E8]"
                />
                통합관리자 (SUPER_ADMIN)
              </label>
            </div>
          </div>

          <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white border-b border-[#2A2A2F] pb-2">알림 채널 선택</h3>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-white font-semibold">
                <input
                  type="checkbox"
                  checked={alertChannels.sms}
                  onChange={(e) => setAlertChannels({ ...alertChannels, sms: e.target.checked })}
                  className="accent-[#00D1E8]"
                />
                SMS 문자 메시지
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white font-semibold">
                <input
                  type="checkbox"
                  checked={alertChannels.email}
                  onChange={(e) => setAlertChannels({ ...alertChannels, email: e.target.checked })}
                  className="accent-[#00D1E8]"
                />
                이메일 (E-mail)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white font-semibold">
                <input
                  type="checkbox"
                  checked={alertChannels.webPush}
                  onChange={(e) => setAlertChannels({ ...alertChannels, webPush: e.target.checked })}
                  className="accent-[#00D1E8]"
                />
                Web Push 알림
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 9. SYS-NOTICE (시스템 공지사항)
  // ─────────────────────────────────────────────────────────────
  if (currentPage === "sys-notice") {
    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#00D1E8]" />
              시스템 공지사항
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">고객사 및 전체 현장에 긴급 공지사항을 등록하고 전파합니다.</p>
          </div>
          <button
            onClick={() => setShowNoticeModal(true)}
            className="px-3.5 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> 공지 작성
          </button>
        </div>

        {/* Notice List Table */}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F] text-white">
              {noticeList.map((n, idx) => (
                <tr key={n.id} className="hover:bg-[#2A2A2F]/50 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{noticeList.length - idx}</td>
                  <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      n.noticeType === "긴급" ? "bg-[#EF4444]/20 text-[#EF4444]" :
                      n.noticeType === "점검" ? "bg-[#F59E0B]/20 text-[#F59E0B]" : "bg-[#00D1E8]/20 text-[#00D1E8]"
                    }`}>
                      {n.noticeType}
                    </span>
                    {n.title}
                  </td>
                  <td className="px-4 py-3.5 text-white">{n.sender}</td>
                  <td className="px-4 py-3.5 text-[#00D1E8]">{n.targetCompany}</td>
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{n.sentAt}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E]">
                      {n.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Write Notice Modal */}
        {showNoticeModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-md bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white border-b border-[#2A2A2F] pb-3">공지사항 작성 및 등록</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleSendNoticeSubmit(); }} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">수신 대상</label>
                  <select
                    value={newNotice.targetCompany}
                    onChange={(e) => setNewNotice({ ...newNotice, targetCompany: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  >
                    <option value="전체 (모든 사용자)">전체 (모든 사용자)</option>
                    <option value="통합관리자 (SUPER_ADMIN)">통합관리자 (SUPER_ADMIN)</option>
                    <option value="현장관리자 (SITE_MGR)">현장관리자 (SITE_MGR)</option>
                    <option value="전체 고객사">전체 고객사</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">중요도 (유형)</label>
                  <select
                    value={newNotice.noticeType}
                    onChange={(e) => setNewNotice({ ...newNotice, noticeType: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  >
                    <option value="긴급">긴급</option>
                    <option value="일반">일반</option>
                    <option value="점검">점검</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">공지 제목</label>
                  <input
                    type="text"
                    required
                    placeholder="제목 입력"
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">공지 내용</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="상세 내용을 입력하세요."
                    value={newNotice.content}
                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white p-3 rounded outline-none"
                  />
                </div>
                <div className="flex gap-2 pt-3">
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
                    발송하기
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notice Send Confirmation Modal */}
        {confirmNoticeModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000] p-4">
            <div className="w-full max-w-sm bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-full bg-[#00D1E8]/10 text-[#00D1E8] flex items-center justify-center mx-auto">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">공지 즉시 발송</h3>
              <p className="text-xs text-[#8A8A96] leading-relaxed">
                <span className="text-[#00D1E8] font-bold">[{newNotice.targetCompany}]</span> 고객사에
                <br />
                공지사항을 즉시 시스템 전파 및 발송하시겠습니까?
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setConfirmNoticeModal(false)}
                  className="flex-1 py-2 bg-[#2A2A2F] text-white font-bold rounded cursor-pointer text-xs"
                >
                  취소
                </button>
                <button
                  onClick={handleExecuteSendNotice}
                  className="flex-1 py-2 bg-[#00D1E8] text-[#111113] font-bold rounded cursor-pointer text-xs"
                >
                  확인 발송
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Fallback views: sys-customers, sys-accounts, sys-devices, sys-ops
  // ─────────────────────────────────────────────────────────────
  if (currentPage === "sys-customers") {
    const filtered = customers.filter(c => {
      if (custFilterStatus !== "ALL" && c.contractStatus !== custFilterStatus) return false;
      if (custSearch.trim() && !c.name.includes(custSearch.trim())) return false;
      return true;
    });

    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#00D1E8]" />
              고객사 관리
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">고객사 목록 및 계약 정보를 조회 및 등록할 수 있습니다.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportExcel("고객사 목록")}
              className="px-3.5 py-2 bg-[#2A2A2F] hover:bg-[#3A3A40] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> 엑셀 다운로드
            </button>
            <button
              onClick={() => setShowCustModal(true)}
              className="px-3.5 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> 고객사 등록
            </button>
          </div>
        </div>

        <div className="bg-[#222226] border border-[#2A2A2F] p-4 rounded-xl flex flex-wrap gap-3 items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">계약 상태:</span>
            <select
              value={custFilterStatus}
              onChange={(e) => setCustFilterStatus(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체</option>
              <option value="계약중">계약중</option>
              <option value="만료예정">만료예정</option>
              <option value="종료">종료</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#8A8A96]" />
            <input
              type="text"
              placeholder="고객사명 검색..."
              value={custSearch}
              onChange={(e) => setCustSearch(e.target.value)}
              className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            />
          </div>
        </div>

        <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111113] text-[#8A8A96] font-semibold uppercase border-b border-[#2A2A2F]">
              <tr>
                <th className="px-4 py-3">고객사명</th>
                <th className="px-4 py-3">현장 수</th>
                <th className="px-4 py-3">담당자 / 연락처</th>
                <th className="px-4 py-3">계약 기간</th>
                <th className="px-4 py-3">계약 상태</th>
                <th className="px-4 py-3">등록일</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F] text-white">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#2A2A2F]/50 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-[#00D1E8]">{c.name}</td>
                  <td className="px-4 py-3.5 font-mono">{c.siteCount}개 현장</td>
                  <td className="px-4 py-3.5">{c.managerName} ({c.tel})</td>
                  <td className="px-4 py-3.5 font-mono">{c.startDate} ~ {c.endDate}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.contractStatus === "계약중" ? "bg-[#22C55E]/20 text-[#22C55E]" :
                      c.contractStatus === "만료예정" ? "bg-[#F59E0B]/20 text-[#F59E0B]" : "bg-[#EF4444]/20 text-[#EF4444]"
                    }`}>
                      {c.contractStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{c.createdAt}</td>
                  <td className="px-4 py-3.5 text-right space-x-1">
                    <button
                      onClick={() => alert(`[${c.name}] 정보 수정 모달`)}
                      className="px-2 py-1 bg-[#2A2A2F] hover:bg-[#3A3A40] text-xs rounded text-[#ECECEC]"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => setCustomers(customers.filter(x => x.id !== c.id))}
                      className="px-2 py-1 bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-xs rounded text-[#EF4444]"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showCustModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-md bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white border-b border-[#2A2A2F] pb-3">고객사 신규 등록</h3>
              <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">고객사명</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 현대건설"
                    value={newCust.name}
                    onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none focus:border-[#00D1E8]"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">담당자 성명</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 홍길동"
                    value={newCust.managerName}
                    onChange={(e) => setNewCust({ ...newCust, managerName: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none focus:border-[#00D1E8]"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">연락처</label>
                  <input
                    type="text"
                    required
                    placeholder="010-0000-0000"
                    value={newCust.tel}
                    onChange={(e) => setNewCust({ ...newCust, tel: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none focus:border-[#00D1E8]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[#8A8A96] font-semibold block mb-1">계약 시작일</label>
                    <input
                      type="date"
                      value={newCust.startDate}
                      onChange={(e) => setNewCust({ ...newCust, startDate: e.target.value })}
                      className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A8A96] font-semibold block mb-1">계약 종료일</label>
                    <input
                      type="date"
                      value={newCust.endDate}
                      onChange={(e) => setNewCust({ ...newCust, endDate: e.target.value })}
                      className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCustModal(false)}
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

  if (currentPage === "sys-accounts") {
    const filteredAcc = accounts.filter(a => {
      if (accFilterCompany !== "ALL" && a.company !== accFilterCompany) return false;
      if (accFilterRole !== "ALL" && a.role !== accFilterRole) return false;
      if (accFilterStatus !== "ALL" && a.status !== accFilterStatus) return false;
      return true;
    });

    const handleAddAccountSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newAcc.name.trim() || !newAcc.loginId.trim() || !newAcc.password.trim()) {
        alert("이름, 아이디, 비밀번호는 필수 입력입니다.");
        return;
      }
      const added = {
        id: `acc-${Date.now()}`,
        name: newAcc.name.trim(),
        loginId: newAcc.loginId.trim(),
        company: newAcc.company,
        role: newAcc.role === "Admin" ? "SUPER_ADMIN" : "VIEWER",
        status: "ACTIVE",
        tel: newAcc.tel || "010-0000-0000",
        createdAt: new Date().toISOString().split("T")[0],
        lastLogin: "방금 전"
      };
      setAccounts([added, ...accounts]);
      setShowAccModal(false);
      setNewAcc({ name: "", loginId: "", password: "", company: "GH 경기주택도시공사", role: "Admin", tel: "" });
      alert(`[${added.name}] 계정이 성공적으로 등록되었습니다.`);
    };

    const handleEditAccountSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editAccModal) return;
      setAccounts(accounts.map(a => a.id === editAccModal.id ? editAccModal : a));
      alert(`[${editAccModal.name}] 계정 정보가 수정되었습니다.`);
      setEditAccModal(null);
    };

    const handleDeleteAccount = () => {
      if (!deleteAccModal) return;
      setAccounts(accounts.filter(a => a.id !== deleteAccModal.id));
      alert(`[${deleteAccModal.name}] 계정이 삭제되었습니다.`);
      setDeleteAccModal(null);
    };

    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00D1E8]" />
              통합관리자 계정 관리
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">고객사별 Super Admin 및 모니터링 계정을 관리합니다.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportExcel("계정 목록")}
              className="px-3.5 py-2 bg-[#2A2A2F] hover:bg-[#3A3A40] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> 엑셀 다운로드
            </button>
            <button
              onClick={() => setShowAccModal(true)}
              className="px-3.5 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> 계정 등록
            </button>
          </div>
        </div>

        <div className="bg-[#222226] border border-[#2A2A2F] p-4 rounded-xl flex flex-wrap gap-4 items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">고객사:</span>
            <select
              value={accFilterCompany}
              onChange={(e) => setAccFilterCompany(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체</option>
              {customers.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">권한:</span>
            <select
              value={accFilterRole}
              onChange={(e) => setAccFilterRole(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="SITE_MGR">SITE_MGR</option>
              <option value="VIEWER">모니터링</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8A8A96] font-semibold">상태:</span>
            <select
              value={accFilterStatus}
              onChange={(e) => setAccFilterStatus(e.target.value)}
              className="bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="ALL">전체</option>
              <option value="ACTIVE">활성 (ACTIVE)</option>
              <option value="INACTIVE">비활성 (INACTIVE)</option>
            </select>
          </div>
        </div>

        <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111113] text-[#8A8A96] font-semibold uppercase border-b border-[#2A2A2F]">
              <tr>
                <th className="px-4 py-3">이름</th>
                <th className="px-4 py-3">아이디</th>
                <th className="px-4 py-3">소속 고객사</th>
                <th className="px-4 py-3">역할</th>
                <th className="px-4 py-3">연락처</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">등록일</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F] text-white">
              {filteredAcc.map((a) => (
                <tr key={a.id} className="hover:bg-[#2A2A2F]/50 transition-colors">
                  <td className="px-4 py-3.5 font-bold">{a.name}</td>
                  <td className="px-4 py-3.5 font-mono text-[#00D1E8]">{a.loginId}</td>
                  <td className="px-4 py-3.5">{a.company}</td>
                  <td className="px-4 py-3.5 font-semibold font-mono">
                    {a.role === "SUPER_ADMIN" ? "Admin" : a.role === "VIEWER" ? "모니터링" : a.role}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{a.tel}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.status === "ACTIVE" ? "bg-[#22C55E]/20 text-[#22C55E]" : "bg-[#8A8A96]/20 text-[#8A8A96]"
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{a.createdAt}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => setViewAccModal(a)}
                        className="px-2 py-1 bg-[#2A2A2F] hover:bg-[#3A3A40] text-white font-bold rounded text-[10px] cursor-pointer"
                      >
                        보기
                      </button>
                      <button
                        onClick={() => setEditAccModal({ ...a })}
                        className="px-2 py-1 bg-[#00D1E8]/20 hover:bg-[#00D1E8]/30 text-[#00D1E8] font-bold rounded text-[10px] cursor-pointer"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => setDeleteAccModal(a)}
                        className="px-2 py-1 bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] font-bold rounded text-[10px] cursor-pointer"
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

        {/* 계정 상세보기 모달 */}
        {viewAccModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-md bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white border-b border-[#2A2A2F] pb-3">계정 상세 정보 (조회)</h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-[#111113] rounded-lg">
                  <div className="text-[#8A8A96]">이름</div>
                  <div className="text-white font-bold mt-0.5">{viewAccModal.name}</div>
                </div>
                <div className="p-3 bg-[#111113] rounded-lg">
                  <div className="text-[#8A8A96]">아이디</div>
                  <div className="text-[#00D1E8] font-mono font-bold mt-0.5">{viewAccModal.loginId}</div>
                </div>
                <div className="p-3 bg-[#111113] rounded-lg">
                  <div className="text-[#8A8A96]">소속 고객사</div>
                  <div className="text-white font-bold mt-0.5">{viewAccModal.company}</div>
                </div>
                <div className="p-3 bg-[#111113] rounded-lg">
                  <div className="text-[#8A8A96]">역할</div>
                  <div className="text-white font-bold mt-0.5">
                    {viewAccModal.role === "SUPER_ADMIN" ? "Admin" : viewAccModal.role === "VIEWER" ? "모니터링" : viewAccModal.role}
                  </div>
                </div>
                <div className="p-3 bg-[#111113] rounded-lg">
                  <div className="text-[#8A8A96]">연락처</div>
                  <div className="text-white font-mono mt-0.5">{viewAccModal.tel}</div>
                </div>
              </div>
              <div className="pt-2 text-right">
                <button
                  onClick={() => setViewAccModal(null)}
                  className="px-4 py-2 bg-[#2A2A2F] text-white font-bold rounded cursor-pointer text-xs"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 계정 수정 모달 */}
        {editAccModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-md bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white border-b border-[#2A2A2F] pb-3">계정 정보 수정</h3>
              <form onSubmit={handleEditAccountSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">아이디 (수정 불가)</label>
                  <input
                    type="text"
                    disabled
                    value={editAccModal.loginId}
                    className="w-full bg-[#111113]/50 border border-[#2A2A2F] text-[#8A8A96] px-3 py-2 rounded outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">이름</label>
                  <input
                    type="text"
                    required
                    value={editAccModal.name}
                    onChange={(e) => setEditAccModal({ ...editAccModal, name: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">연락처</label>
                  <input
                    type="text"
                    required
                    value={editAccModal.tel}
                    onChange={(e) => setEditAccModal({ ...editAccModal, tel: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">소속 고객사</label>
                  <select
                    value={editAccModal.company}
                    onChange={(e) => setEditAccModal({ ...editAccModal, company: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">역할</label>
                  <select
                    value={editAccModal.role === "SUPER_ADMIN" ? "Admin" : "모니터링"}
                    onChange={(e) => setEditAccModal({ ...editAccModal, role: e.target.value === "Admin" ? "SUPER_ADMIN" : "VIEWER" })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  >
                    <option value="Admin">Admin</option>
                    <option value="모니터링">모니터링</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditAccModal(null)}
                    className="flex-1 py-2 bg-[#2A2A2F] text-white font-bold rounded cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#00D1E8] text-[#111113] font-bold rounded cursor-pointer"
                  >
                    수정 완료
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 계정 삭제 확인 모달 */}
        {deleteAccModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-sm bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl text-center">
              <h3 className="text-base font-bold text-white">계정을 삭제하시겠습니까?</h3>
              <p className="text-xs text-[#8A8A96]">
                대상 계정: <span className="text-[#00D1E8] font-bold">{deleteAccModal.name} ({deleteAccModal.loginId})</span>
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setDeleteAccModal(null)}
                  className="flex-1 py-2 bg-[#2A2A2F] text-white font-bold rounded cursor-pointer text-xs"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-2 bg-[#EF4444] text-white font-bold rounded cursor-pointer text-xs"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 계정 등록 모달 */}
        {showAccModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-md bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white border-b border-[#2A2A2F] pb-3">신규 계정 등록</h3>
              <form onSubmit={handleAddAccountSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">이름 <span className="text-[#EF4444]">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="사용자 이름"
                    value={newAcc.name}
                    onChange={(e) => setNewAcc({ ...newAcc, name: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">아이디 <span className="text-[#EF4444]">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="로그인 아이디"
                    value={newAcc.loginId}
                    onChange={(e) => setNewAcc({ ...newAcc, loginId: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">비밀번호 <span className="text-[#EF4444]">*</span></label>
                  <input
                    type="password"
                    required
                    placeholder="비밀번호 입력"
                    value={newAcc.password}
                    onChange={(e) => setNewAcc({ ...newAcc, password: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">소속 고객사</label>
                  <select
                    value={newAcc.company}
                    onChange={(e) => setNewAcc({ ...newAcc, company: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">역할</label>
                  <select
                    value={newAcc.role}
                    onChange={(e) => setNewAcc({ ...newAcc, role: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  >
                    <option value="Admin">Admin</option>
                    <option value="모니터링">모니터링</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">연락처</label>
                  <input
                    type="text"
                    placeholder="010-0000-0000"
                    value={newAcc.tel}
                    onChange={(e) => setNewAcc({ ...newAcc, tel: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none font-mono"
                  />
                </div>
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAccModal(false)}
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

  if (currentPage === "sys-devices") {
    const filteredDev = devices.filter(d => {
      if (devFilterType !== "ALL" && d.type !== devFilterType) return false;
      if (devFilterCompany !== "ALL" && d.customerName !== devFilterCompany) return false;
      if (devFilterStatus !== "ALL" && d.status !== devFilterStatus) return false;
      return true;
    });

    const handleAddDeviceSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const added = {
        id: newDev.id,
        type: newDev.type,
        manufacturer: newDev.manufacturer,
        model: newDev.model,
        customerName: "GH 경기주택도시공사",
        siteName: newDev.siteName,
        location: newDev.location,
        status: "ONLINE",
        createdAt: new Date().toISOString().split("T")[0]
      };
      setDevices([added, ...devices]);
      setShowDevModal(false);
      setNewDev({
        id: `DEV-${Math.floor(100 + Math.random() * 899)}`,
        type: "카메라",
        manufacturer: "한화비전",
        model: "XNO-6080R",
        siteName: "왕숙1구역",
        location: "A구역 정문"
      });
      alert(`[${added.id}] 디바이스가 등록되었습니다.`);
    };

    return (
      <div className="p-6 space-y-6 text-[#ECECEC] font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2F]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-[#00D1E8]" />
              디바이스 관리
            </h2>
            <p className="text-xs text-[#8A8A96] mt-1">CCTV, IoT 센서, 스피커, 조명 등 전체 디바이스 상태 관리</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportExcel("디바이스 목록")}
              className="px-3.5 py-2 bg-[#2A2A2F] hover:bg-[#3A3A40] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> 엑셀 다운로드
            </button>
            <button
              onClick={() => setShowDevModal(true)}
              className="px-3.5 py-2 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> 디바이스 등록
            </button>
          </div>
        </div>

        <div className="bg-[#222226] border border-[#2A2A2F] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111113] text-[#8A8A96] font-semibold uppercase border-b border-[#2A2A2F]">
              <tr>
                <th className="px-4 py-3">제조사</th>
                <th className="px-4 py-3">모델명</th>
                <th className="px-4 py-3">디바이스 ID</th>
                <th className="px-4 py-3">소속 현장</th>
                <th className="px-4 py-3">설치장소</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F] text-white">
              {filteredDev.map((d) => (
                <tr key={d.id} className="hover:bg-[#2A2A2F]/50 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-white">{d.manufacturer}</td>
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{d.model}</td>
                  <td className="px-4 py-3.5 font-mono font-bold text-[#00D1E8]">{d.id}</td>
                  <td className="px-4 py-3.5">{d.siteName}</td>
                  <td className="px-4 py-3.5 text-[#8A8A96]">{d.location}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      d.status === "ONLINE" ? "bg-[#22C55E]/20 text-[#22C55E]" : "bg-[#EF4444]/20 text-[#EF4444]"
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[#8A8A96]">{d.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 디바이스 등록 모달 */}
        {showDevModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-md bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white border-b border-[#2A2A2F] pb-3">신규 디바이스 등록</h3>
              <form onSubmit={handleAddDeviceSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">디바이스 종류</label>
                  <select
                    value={newDev.type}
                    onChange={(e) => setNewDev({ ...newDev, type: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  >
                    <option value="카메라">카메라</option>
                    <option value="센서">센서</option>
                    <option value="스피커">스피커</option>
                    <option value="조명">조명</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">제조사</label>
                  <input
                    type="text"
                    required
                    placeholder="제조사명"
                    value={newDev.manufacturer}
                    onChange={(e) => setNewDev({ ...newDev, manufacturer: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">모델명</label>
                  <input
                    type="text"
                    required
                    placeholder="모델명 입력"
                    value={newDev.model}
                    onChange={(e) => setNewDev({ ...newDev, model: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">디바이스 ID</label>
                  <input
                    type="text"
                    required
                    value={newDev.id}
                    onChange={(e) => setNewDev({ ...newDev, id: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">소속 현장</label>
                  <input
                    type="text"
                    required
                    value={newDev.siteName}
                    onChange={(e) => setNewDev({ ...newDev, siteName: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8A8A96] font-semibold block mb-1">설치장소</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 1공구 A구역 정문"
                    value={newDev.location}
                    onChange={(e) => setNewDev({ ...newDev, location: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2 rounded outline-none"
                  />
                </div>
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowDevModal(false)}
                    className="flex-1 py-2 bg-[#2A2A2F] text-white font-bold rounded cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#00D1E8] text-[#111113] font-bold rounded cursor-pointer"
                  >
                    등록
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
