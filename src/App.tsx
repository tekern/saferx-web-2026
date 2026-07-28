/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useReducer, useEffect, useState, useRef } from "react";
import { SafetyEvent, EventStatus, Zone, Notice, Company } from "./types";
import { INIT_EVENTS, SPA_RANDOM_EVENT_TEMP as SIMULATED_TEMPLATES, ZONES, INIT_NOTICES, COMPANIES } from "./data";

// Sub views
import DashboardView from "./components/DashboardView";
import CCTVView from "./components/CCTVView";
import EventsView from "./components/EventsView";
import SensorsView from "./components/SensorsView";
import WorkersView from "./components/WorkersView";
import OtherViews from "./components/OtherViews";
import SysAdminViews from "./components/SysAdminViews";
import SuperAdminViews from "./components/SuperAdminViews";
import SiteMgrViews from "./components/SiteMgrViews";
import MyPageView from "./components/MyPageView";

// Icons
import { 
  Tv, Database, Bell, LayoutDashboard, Eye, AlertTriangle, Cpu, Radio, 
  MapPin, Clock, CloudSun, LogOut, ChevronRight, Play, Maximize2, ShieldAlert, Settings, RefreshCw,
  User, Lock, Megaphone, Building2, Server, HardDrive, Shield, FileText, Activity
} from "lucide-react";

const SURNAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권", "황", "안", "송", "전", "홍"];
const GIVEN_NAMES = ["철수", "영호", "민수", "광수", "태현", "정우", "준호", "성민", "재호", "영진", "성식", "재욱", "병헌", "동근", "정식", "현우", "지훈", "동현", "민석", "진수", "상훈", "동진", "영우", "민기", "준식", "태영", "영철", "기태", "영민", "승우"];

// Reducer for safety alerts state
function eventsReducer(state: SafetyEvent[], action: any): SafetyEvent[] {
  switch (action.type) {
    case "ADD_EVENT":
      if (state.some(e => e.id === action.payload.id)) return state;
      return [action.payload, ...state];

    case "RESOLVE_EVENT":
      return state.map(e => {
        if (e.id === action.payload.id) {
          return {
            ...e,
            status: "RESOLVED" as EventStatus,
            resolvedAt: action.payload.time,
            resolvedBy: action.payload.user,
            memo: action.payload.memo || e.memo
          };
        }
        return e;
      });

    case "PENDING":
      return state.map(e => {
        if (e.id === action.payload.id) {
          const newHistory = [
            ...(e.sopHistory || []),
            { time: action.payload.time, action: "15분 보류 지정", user: action.payload.user, memo: "현장 안전원 육안 확인 진행 중" }
          ];
          return { ...e, sopHistory: newHistory };
        }
        return e;
      });

    case "ADD_SOP_LOG":
      return state.map(e => {
        if (e.id === action.payload.id) {
          const newHistory = [
            ...(e.sopHistory || []),
            { time: action.payload.time, action: action.payload.action, user: action.payload.user, memo: action.payload.memo }
          ];
          return { ...e, sopHistory: newHistory };
        }
        return e;
      });

    case "SOP_STEP_1":
      return state.map(e => {
        if (e.id === action.payload.id) {
          const updatedSop = [
            ...e.sopHistory,
            { time: action.payload.time, action: "구역 사이렌 발송", user: action.payload.user, memo: "경보 음향 및 단말 경고 노출 조치 완료" }
          ];
          return { ...e, sopHistory: updatedSop };
        }
        return e;
      });

    case "SOP_STEP_2":
      return state.map(e => {
        if (e.id === action.payload.id) {
          const updatedSop = [
            ...e.sopHistory,
            { time: action.payload.time, action: "작업자 무전 통보", user: action.payload.user, memo: `지구 안전반장(${action.payload.target}) 즉시 상황 전파` }
          ];
          return { ...e, sopHistory: updatedSop };
        }
        return e;
      });

    case "SOP_STEP_3":
      return state.map(e => {
        if (e.id === action.payload.id) {
          const updatedSop = [
            ...e.sopHistory,
            { time: action.payload.time, action: "119 비상 신고 전파", user: action.payload.user, memo: `소방 무선 접수 (접수번호: ${action.payload.ticket})` }
          ];
          return { ...e, sopHistory: updatedSop };
        }
        return e;
      });

    default:
      return state;
  }
}

export default function App() {
  // ⏳ 1. Splash Screen state
  const [isSplash, setIsSplash] = useState(true);

  // 🔐 2. Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);
  const [showFindPw, setShowFindPw] = useState(false);
  
  const [users, setUsers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("GH_REGISTERED_USERS_V3");
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [
      { id: "sys01", loginId: "sys01", name: "홍길동", role: "SYS_ADMIN", company: "그립", dept: "그립", zones: "ALL", tel: "010-1111-0001", password: "123", status: "ACTIVE" },
      { id: "super01", loginId: "super01", name: "김경기", role: "SUPER_ADMIN", company: "GH", dept: "GH안전관리센터", zones: "ALL", tel: "010-2222-0002", password: "123", status: "ACTIVE" },
      { id: "site01", loginId: "site01", name: "이현장", role: "SITE_MGR", company: "현대건설", site: "왕숙1구역", dept: "현대건설", zones: "z1", tel: "010-3333-0003", password: "123", status: "ACTIVE" },
      { id: "admin", loginId: "admin", name: "김관수", role: "SUPER_ADMIN", company: "GH", dept: "GH안전관리센터", zones: "ALL", tel: "010-1111-2222", password: "123", status: "ACTIVE" },
    ];
  });

  // 회원가입용 state
  const [signUpForm, setSignUpForm] = useState({
    name: "",
    phone: "",
    code: "",
    loginId: "",
    password: "",
    dept: "발주처",
    role: "WORKER",
    agreeTerms: false,
    agreePrivacy: false,
  });
  const [smsSent, setSmsSent] = useState(false);
  const [smsCode, setSmsCode] = useState("");
  const [isSmsVerified, setIsSmsVerified] = useState(false);
  const [signUpErr, setSignUpErr] = useState("");
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // 비밀번호 찾기용 state
  const [findPwForm, setFindPwForm] = useState({
    name: "",
    phone: "",
    loginId: "",
  });
  const [findPwMsg, setFindPwMsg] = useState("");
  const [findPwErr, setFindPwErr] = useState("");

  // 🧭 3. Router state
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [pageParams, setPageParams] = useState<any>(null);
  const [currentZoneFilter, setCurrentZoneFilter] = useState("ALL");

  // ⏱ 4. Ticking clocks & weather
  const [timeStr, setTimeStr] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // 🚨 5. Alarm events state & active simulations
  const [events, dispatch] = useReducer(eventsReducer, INIT_EVENTS);
  const [showModal, setShowModal] = useState(false);
  const [modalEvent, setModalEvent] = useState<SafetyEvent | null>(null);
  const lastPopupTimeRef = useRef<number>(0);

  // 📝 6. TBM list state
  const [tbmList, setTbmList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("saferx_tbm_list_v2");
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    const todayStr = (() => {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    })();

    return [
      {
        id: "t0",
        zoneId: "z1",
        zone: "왕숙1구역",
        date: todayStr,
        time: "07:30",
        manager: "김관수",
        hasRiskAssessment: "예",
        workContent: "철근 조립 및 비계 설치 작업",
        hazard1: "작업 비계에서의 추락 위험",
        measure1: "안전모 및 안전대 착용 필수",
        hazard2: "자재 낙하 위험",
        measure2: "하부 출입 통제구역 설정",
        hazard3: "무더위 온열 질환",
        measure3: "1시간 작업 후 10분 휴식 준수",
        total: 142,
        completed: 139,
        rate: 97.9,
        memo: "금일 폭염주의보 발령 예정 - 온열질환 예방 관리 철저"
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("saferx_tbm_list_v2", JSON.stringify(tbmList));
  }, [tbmList]);

  const [zonesList, setZonesList] = useState<Zone[]>(() => {
    try {
      const saved = localStorage.getItem("saferx_zones_list_v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ZONES;
  });

  useEffect(() => {
    localStorage.setItem("saferx_zones_list_v1", JSON.stringify(zonesList));
  }, [zonesList]);

  const [noticesList, setNoticesList] = useState<Notice[]>(() => {
    try {
      const saved = localStorage.getItem("saferx_notices_list_v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INIT_NOTICES;
  });

  useEffect(() => {
    localStorage.setItem("saferx_notices_list_v1", JSON.stringify(noticesList));
  }, [noticesList]);

  const [companiesList, setCompaniesList] = useState<Company[]>(() => {
    try {
      const saved = localStorage.getItem("saferx_companies_list_v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return COMPANIES;
  });

  useEffect(() => {
    localStorage.setItem("saferx_companies_list_v1", JSON.stringify(companiesList));
  }, [companiesList]);

  // Active current user profile lookup
  const currentUser = users.find(u => u.loginId.toLowerCase() === username.trim().toLowerCase()) || {
    id: "super01",
    loginId: "super01",
    name: "김경기",
    role: "SUPER_ADMIN",
    company: "GH",
    dept: "GH안전관리센터",
    zones: "ALL",
    tel: "010-2222-0002",
    status: "ACTIVE"
  };

  const currentRole = currentUser?.role || "SUPER_ADMIN";
  const isSiteManager = currentRole === "SITE_MGR";

  const userZonesList: string[] = (() => {
    if (!currentUser?.zones) return [];
    if (Array.isArray(currentUser.zones)) return currentUser.zones;
    if (typeof currentUser.zones === "string") {
      if (currentUser.zones === "ALL") return [];
      return currentUser.zones.split(",").map(z => z.trim());
    }
    return [];
  })();

  const availableZones = isSiteManager 
    ? zonesList.filter(z => userZonesList.includes(z.id))
    : zonesList;

  useEffect(() => {
    if (currentZoneFilter !== "ALL" && !availableZones.some(z => z.id === currentZoneFilter)) {
      setCurrentZoneFilter("ALL");
    }
  }, [username, currentZoneFilter, availableZones]);

  // Clock runner
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString("ko-KR", { hour12: false }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Splash timeout interval
  useEffect(() => {
    const t = setTimeout(() => {
      setIsSplash(false);
    }, 850);
    return () => clearTimeout(t);
  }, []);

  // Modal Timer logic
  useEffect(() => {
    if (!isLoggedIn) return;

    const POPUP_INTERVAL = 600000;
    const timer = setInterval(() => {
      const now = Date.now();
      if (now - lastPopupTimeRef.current >= POPUP_INTERVAL) {
        const activeEvents = events.filter(e => e.status === "ACTIVE");
        if (activeEvents.length > 0) {
          const sorted = [...activeEvents].sort((a, b) => {
            if (a.severity === "CRITICAL" && b.severity !== "CRITICAL") return -1;
            if (b.severity === "CRITICAL" && a.severity !== "CRITICAL") return 1;
            if (a.severity === "HIGH" && b.severity !== "HIGH") return -1;
            if (b.severity === "HIGH" && a.severity !== "HIGH") return 1;
            return 0;
          });
          setModalEvent(sorted[0]);
          setShowModal(true);
          lastPopupTimeRef.current = now;
        }
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [isLoggedIn, events]);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedUser = users.find(u => u.loginId.toLowerCase() === username.trim().toLowerCase());
    
    if (matchedUser) {
      setIsLoggedIn(true);
      setAuthError("");
    } else {
      setAuthError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  const handleDemoLogin = (role: string) => {
    let demoUser: any;
    if (role === "SYS_ADMIN") {
      demoUser = { id: "sys01", loginId: "sys01", name: "홍길동", role: "SYS_ADMIN", company: "그립", dept: "그립", zones: "ALL", tel: "010-1111-0001", password: "123", status: "ACTIVE" };
    } else if (role === "SUPER_ADMIN") {
      demoUser = { id: "super01", loginId: "super01", name: "김경기", role: "SUPER_ADMIN", company: "GH", dept: "GH안전관리센터", zones: "ALL", tel: "010-2222-0002", password: "123", status: "ACTIVE" };
    } else if (role === "SITE_MGR") {
      demoUser = { id: "site01", loginId: "site01", name: "이현장", role: "SITE_MGR", company: "현대건설", site: "왕숙1구역", dept: "현대건설", zones: "z1", tel: "010-3333-0003", password: "123", status: "ACTIVE" };
    } else {
      demoUser = { id: "super01", loginId: "super01", name: "김경기", role: "SUPER_ADMIN", company: "GH", dept: "GH안전관리센터", zones: "ALL", tel: "010-2222-0002", password: "123", status: "ACTIVE" };
    }

    setUsers(prev => {
      const idx = prev.findIndex(u => u.loginId === demoUser.loginId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...demoUser };
        return copy;
      }
      return [...prev, demoUser];
    });

    setUsername(demoUser.loginId);
    setPassword("123");
    setIsLoggedIn(true);
    setAuthError("");
    setCurrentPage("dashboard");
  };

  const handleUpdateUser = (updatedData: Partial<any>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedData };
    setUsers(prev => prev.map(u => u.loginId === currentUser.loginId ? updated : u));
  };

  const handleSendSms = () => {
    if (!signUpForm.phone.trim()) {
      setSignUpErr("휴대전화번호를 입력해주세요.");
      return;
    }
    const generatedCode = "7723";
    setSmsCode(generatedCode);
    setSmsSent(true);
    setSignUpErr("");
    alert(`[인증번호 전송 완료]\n인증번호: ${generatedCode} 가 발송되었습니다.`);
  };

  const handleVerifySmsCode = () => {
    if (signUpForm.code === smsCode) {
      setIsSmsVerified(true);
      setSignUpErr("");
    } else {
      setSignUpErr("인증번호가 일치하지 않습니다.");
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpErr("");

    if (!signUpForm.name.trim()) return setSignUpErr("이름을 입력해주세요.");
    if (!isSmsVerified) return setSignUpErr("휴대전화 인증을 완료해주세요.");
    if (!signUpForm.loginId.trim()) return setSignUpErr("아이디를 입력해주세요.");
    if (!signUpForm.password.trim()) return setSignUpErr("비밀번호를 입력해주세요.");
    if (!signUpForm.agreeTerms) return setSignUpErr("이용약관 동의가 필요합니다.");
    if (!signUpForm.agreePrivacy) return setSignUpErr("개인정보 수집 및 이용 동의가 필요합니다.");

    const exists = users.some(u => u.loginId.toLowerCase() === signUpForm.loginId.trim().toLowerCase());
    if (exists) {
      setSignUpErr("이미 가입된 아이디입니다.");
      return;
    }

    const newUser = {
      id: "u-" + Date.now(),
      loginId: signUpForm.loginId.trim(),
      name: signUpForm.name.trim(),
      password: signUpForm.password,
      role: signUpForm.role,
      dept: signUpForm.dept,
      tel: signUpForm.phone.trim(),
      status: "ACTIVE"
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("GH_REGISTERED_USERS_V3", JSON.stringify(updatedUsers));

    setSignUpSuccess(true);
    setTimeout(() => {
      setUsername(signUpForm.loginId.trim());
      setPassword("");
      setSignUpSuccess(false);
      setShowSignUp(false);
      setSignUpForm({
        name: "",
        phone: "",
        code: "",
        loginId: "",
        password: "",
        dept: "발주처",
        role: "WORKER",
        agreeTerms: false,
        agreePrivacy: false,
      });
      setIsSmsVerified(false);
      setSmsSent(false);
    }, 1200);
  };

  const handleFindPwSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFindPwErr("");
    setFindPwMsg("");

    const matched = users.find(
      u => u.name === findPwForm.name.trim() && u.loginId === findPwForm.loginId.trim()
    );

    if (matched) {
      setFindPwMsg(`조회된 비밀번호: ${matched.password || "1234"}\n(안전을 위해 로그인 후 비밀번호를 변경하세요)`);
    } else {
      setFindPwErr("일치하는 회원 정보를 찾을 수 없습니다.");
    }
  };

  const navigate = (page: string, params: any = null) => {
    setCurrentPage(page);
    setPageParams(params);
  };

  const handlePendingClick = (id: string) => {
    const timeNow = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    dispatch({ 
      type: 'PENDING', 
      payload: { id, time: timeNow, user: username || "관리자" } 
    });
    setShowModal(false);
  };

  const handleSopClick = (id: string) => {
    navigate("event-detail", { eventId: id });
    setShowModal(false);
  };

  const handleCloseModalClick = () => {
    setShowModal(false);
  };

  const activeWarningCount = events.filter(e => e.status === "ACTIVE").length;

  if (isSplash) {
    return (
      <div className="fixed inset-0 bg-[#111113] flex flex-col items-center justify-center font-sans z-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-18 relative flex items-center justify-center animate-pulse">
            <svg viewBox="0 0 100 100" className="w-[60px] h-[60px] text-[#00D1E8] fill-none stroke-current stroke-[3]">
              <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" />
              <text x="50" y="58" fontSize="26" textAnchor="middle" fill="#00D1E8" className="font-extrabold stroke-none">안전</text>
            </svg>
          </div>
          <div className="text-center space-y-1">
            <h4 className="text-[#8A8A96] font-semibold text-xs tracking-wider">통합안전관리</h4>
            <h3 className="font-extrabold tracking-widest text-[#00D1E8] text-base">건설안전관제시스템</h3>
            <p className="text-[11px] text-[#8A8A96] font-mono mt-2">INTEGRATED MONITORING CONSOLE</p>
          </div>
          <div className="w-24 h-1.5 bg-[#2A2A2F] rounded-full overflow-hidden relative">
            <div className="w-1/2 bg-[#00D1E8] h-full rounded-full absolute left-0 animate-infinite-scroll"></div>
          </div>
        </div>
      </div>
    );
  }

  // Render Login Screen
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-[#111113] flex flex-col items-center justify-center p-4 font-sans overflow-y-auto">
        {showSignUp ? (
          <div className="w-full max-w-[460px] bg-[#222226] border border-[#2A2A2F] rounded-xl p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200 flex flex-col my-4 text-[#ECECEC]">
            <div className="flex flex-col items-center space-y-1.5 text-center">
              <h2 className="text-lg font-bold text-white tracking-wide">회원가입</h2>
              <p className="text-[11px] text-[#8A8A96]">회원가입 정보를 입력해 주세요.</p>
            </div>

            {signUpSuccess ? (
              <div className="bg-[#22C55E]/10 border border-[#22C55E]/40 px-4 py-8 rounded-lg text-center space-y-3">
                <div className="w-12 h-12 bg-[#22C55E]/20 text-[#22C55E] rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                <h4 className="font-bold text-sm text-white">회원가입 완료!</h4>
                <p className="text-xs text-[#8A8A96]">회원등록이 완료되었습니다.<br />잠시 후 로그인 화면으로 이동합니다.</p>
              </div>
            ) : (
              <form onSubmit={handleSignUpSubmit} className="space-y-4 text-xs">
                {signUpErr && (
                  <div className="bg-[#EF4444]/10 border border-[#EF4444]/40 px-3 py-2 rounded text-[#EF4444] text-center font-bold">
                    ⚠️ {signUpErr}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[#8A8A96] font-semibold">이름</label>
                  <input
                    type="text"
                    required
                    value={signUpForm.name}
                    onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                    placeholder="실명 입력"
                    className="w-full bg-[#111113] border border-[#2A2A2F] focus:border-[#00D1E8] text-white px-3 py-2.5 rounded-lg outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#8A8A96] font-semibold">휴대전화번호</label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      required
                      disabled={isSmsVerified}
                      value={signUpForm.phone}
                      onChange={(e) => setSignUpForm({ ...signUpForm, phone: e.target.value })}
                      placeholder="010-XXXX-XXXX"
                      className="flex-1 bg-[#111113] border border-[#2A2A2F] focus:border-[#00D1E8] text-white px-3 py-2.5 rounded-lg outline-none disabled:opacity-50"
                    />
                    <button
                      type="button"
                      disabled={isSmsVerified}
                      onClick={handleSendSms}
                      className="px-3 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg text-[11px] cursor-pointer whitespace-nowrap disabled:opacity-50"
                    >
                      {smsSent ? "재전송" : "인증번호 전송"}
                    </button>
                  </div>
                </div>

                {smsSent && !isSmsVerified && (
                  <div className="p-3 bg-[#00D1E8]/5 border border-[#00D1E8]/30 rounded-lg space-y-2">
                    <span className="text-[10px] text-[#00D1E8] block">인증코드가 발송되었습니다.</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={signUpForm.code}
                        onChange={(e) => setSignUpForm({ ...signUpForm, code: e.target.value })}
                        placeholder="인증코드 4자리 입력"
                        className="flex-1 bg-[#111113] border border-[#2A2A2F] text-white px-3 py-1.5 rounded outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleVerifySmsCode}
                        className="px-3 bg-[#22C55E] hover:bg-[#22C55E]/90 text-white font-bold rounded text-[11px] cursor-pointer"
                      >
                        확인
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[#8A8A96] font-semibold">아이디</label>
                  <input
                    type="text"
                    required
                    value={signUpForm.loginId}
                    onChange={(e) => setSignUpForm({ ...signUpForm, loginId: e.target.value })}
                    placeholder="아이디 입력"
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2.5 rounded-lg outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#8A8A96] font-semibold">비밀번호</label>
                  <input
                    type="password"
                    required
                    value={signUpForm.password}
                    onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                    placeholder="비밀번호 입력"
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2.5 rounded-lg outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#8A8A96] font-semibold">권한</label>
                  <select
                    value={signUpForm.role}
                    onChange={(e) => setSignUpForm({ ...signUpForm, role: e.target.value })}
                    className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2.5 rounded-lg outline-none"
                  >
                    <option value="SUPER_ADMIN">통합관리자</option>
                    <option value="SITE_MGR">현장관리자</option>
                    <option value="WORKER">현장근로자</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSignUp(false)}
                    className="flex-1 py-3 bg-[#2A2A2F] hover:bg-[#3A3A40] text-white font-bold rounded-lg cursor-pointer"
                  >
                    이전으로
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg cursor-pointer"
                  >
                    회원가입 완료
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : showFindPw ? (
          <div className="w-full max-w-[420px] bg-[#222226] border border-[#2A2A2F] rounded-xl p-7 shadow-2xl relative space-y-5 text-[#ECECEC]">
            <div className="flex flex-col items-center space-y-1 text-center">
              <h2 className="text-lg font-bold text-white tracking-wide">비밀번호 찾기</h2>
              <p className="text-xs text-[#8A8A96]">가입 시 입력했던 정보를 입력해 주세요.</p>
            </div>

            <form onSubmit={handleFindPwSubmit} className="space-y-4 text-xs">
              {findPwErr && (
                <div className="bg-[#EF4444]/10 border border-[#EF4444]/40 px-3 py-2 rounded text-[#EF4444] text-center font-bold">
                  ⚠️ {findPwErr}
                </div>
              )}
              {findPwMsg && (
                <div className="bg-[#22C55E]/10 border border-[#22C55E]/40 px-3 py-3 rounded text-[#22C55E] font-bold text-center leading-relaxed">
                  {findPwMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[#8A8A96] font-semibold">이름</label>
                <input
                  type="text"
                  required
                  value={findPwForm.name}
                  onChange={(e) => setFindPwForm({ ...findPwForm, name: e.target.value })}
                  placeholder="실명 입력"
                  className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2.5 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#8A8A96] font-semibold">아이디</label>
                <input
                  type="text"
                  required
                  value={findPwForm.loginId}
                  onChange={(e) => setFindPwForm({ ...findPwForm, loginId: e.target.value })}
                  placeholder="아이디 입력"
                  className="w-full bg-[#111113] border border-[#2A2A2F] text-white px-3 py-2.5 rounded-lg outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowFindPw(false);
                    setFindPwMsg("");
                    setFindPwErr("");
                    setFindPwForm({ name: "", phone: "", loginId: "" });
                  }}
                  className="flex-1 py-3 bg-[#2A2A2F] hover:bg-[#3A3A40] text-white font-bold rounded-lg cursor-pointer"
                >
                  이전으로
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-bold rounded-lg cursor-pointer"
                >
                  비밀번호 찾기
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* LOGIN CARD SCREEN */
          <div className="w-full max-w-[440px] bg-[#222226] border border-[#2A2A2F] rounded-xl p-8 shadow-2xl relative space-y-6 flex flex-col text-[#ECECEC]">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="w-16 h-16 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#00D1E8]" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M48 15 L22 30 V58 L48 43 V15Z" fill="#00b4d8" />
                  <path d="M52 15 L52 43 L78 58 V30 L52 15Z" fill="#0077b6" />
                  <path d="M22 62 L48 77 V91 L22 76 V62Z" fill="#03045e" />
                  <path d="M52 77 L78 62 V76 L52 91 V77Z" fill="#00b4d8" />
                </svg>
              </div>
              <div className="space-y-0.5 mt-1">
                <h4 className="text-[12px] text-[#00D1E8] font-semibold tracking-wider">통합안전관리</h4>
                <h2 className="text-[20px] font-extrabold text-white tracking-widest uppercase">건설안전관제시스템</h2>
                <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-[#8A8A96] block pt-0.5">
                  INTEGRATED MONITORING CONSOLE
                </span>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-1 text-xs">
                <label className="text-[#8A8A96] font-semibold block tracking-wide">아이디</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-[#8A8A96] absolute left-3.5 z-10" />
                  <input
                    type="text"
                    autoFocus
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="아이디 입력"
                    className="w-full bg-[#111113] border border-[#2A2A2F] hover:border-[#00D1E8]/50 focus:border-[#00D1E8] text-white pl-10 pr-4 py-3 rounded-lg text-xs outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-[#8A8A96] font-semibold block tracking-wide">비밀번호</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#8A8A96] absolute left-3.5 z-10" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호 입력"
                    className="w-full bg-[#111113] border border-[#2A2A2F] hover:border-[#00D1E8]/50 focus:border-[#00D1E8] text-white pl-10 pr-4 py-3 rounded-lg text-xs outline-none transition-all"
                  />
                </div>
              </div>

              {authError && (
                <div className="bg-[#EF4444]/10 border border-[#EF4444]/40 px-3 py-2 rounded text-[11px] text-[#EF4444] text-center font-bold">
                  ⚠️ {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#00D1E8] hover:bg-[#00D1E8]/90 text-[#111113] font-extrabold py-3.5 rounded-lg text-xs transition-colors shadow-lg tracking-widest text-center cursor-pointer"
              >
                로그인
              </button>
            </form>

            <div className="flex gap-4 justify-center text-xs mt-1 select-none text-[#8A8A96]">
              <button
                type="button"
                onClick={() => setShowSignUp(true)}
                className="hover:text-[#00D1E8] font-bold transition-all underline cursor-pointer"
              >
                회원가입
              </button>
              <span className="text-[#2A2A2F]">|</span>
              <button
                type="button"
                onClick={() => setShowFindPw(true)}
                className="hover:text-[#00D1E8] font-bold transition-all underline cursor-pointer"
              >
                비밀번호 찾기
              </button>
            </div>

            <hr className="border-[#2A2A2F] opacity-50 !my-4" />

            {/* 3개의 데모 버튼 (Requirement 2 & 3) */}
            <div className="space-y-2.5">
              <span className="text-[10px] text-[#8A8A96] font-mono tracking-widest text-center block uppercase font-bold">
                데모용 계정 선택
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin("SYS_ADMIN")}
                  className="bg-[#222226] border border-[#2A2A2F] hover:border-[#8A8A96] text-[#8A8A96] py-2.5 px-1.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer truncate"
                >
                  시스템관리자
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin("SUPER_ADMIN")}
                  className="bg-[#222226] border border-[#2A2A2F] hover:border-[#00D1E8] text-[#00D1E8] py-2.5 px-1.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer truncate"
                >
                  통합관리자
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin("SITE_MGR")}
                  className="bg-[#222226] border border-[#2A2A2F] hover:border-[#ECECEC] text-[#ECECEC] py-2.5 px-1.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer truncate"
                >
                  현장관리자
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="text-[9px] font-mono tracking-wider text-[#8A8A96] text-center mt-6 uppercase">
          통합건설안전관제시스템 @ 2026
        </p>
      </div>
    );
  }

  const renderLnbButton = (link: { id: string; label: string; icon: any; badgeCount?: number; badgeType?: string }) => {
    const Icon = link.icon;
    const isActive = currentPage === link.id || (link.id === "events" && currentPage === "event-detail");

    return (
      <button
        key={link.id}
        onClick={() => navigate(link.id)}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition-all group cursor-pointer ${
          isActive 
            ? "bg-[#00D1E8] text-[#111113] font-bold shadow-md" 
            : "text-[#8A8A96] hover:bg-[#2A2A2F] hover:text-[#ECECEC]"
        }`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${isActive ? "text-[#111113]" : "text-[#00D1E8]"}`} />
          <span className="truncate">{link.label}</span>
        </div>

        {link.badgeCount !== undefined && link.badgeCount > 0 && (
          <span className={`px-1.5 py-0.5 text-[9px] font-mono leading-none rounded-full font-bold ${
            link.badgeType === "red" ? "bg-[#EF4444] text-white animate-pulse" : "bg-[#00D1E8] text-[#111113]"
          }`}>
            {link.badgeCount}
          </span>
        )}
      </button>
    );
  };

  const renderLnbMenuByRole = () => {
    if (currentRole === "SYS_ADMIN") {
      return (
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-[#00D1E8] font-bold block pb-1 border-b border-[#2A2A2F] mb-1">
              ── 대시보드 ──
            </span>
            {renderLnbButton({ id: "dashboard", label: "대시보드", icon: LayoutDashboard })}
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono text-[#00D1E8] font-bold block pb-1 border-b border-[#2A2A2F] mb-1">
              ── 고객사 관리 ──
            </span>
            {renderLnbButton({ id: "sys-customers", label: "고객사 목록", icon: Building2 })}
            {renderLnbButton({ id: "sys-contracts", label: "계약 관리", icon: FileText })}
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono text-[#00D1E8] font-bold block pb-1 border-b border-[#2A2A2F] mb-1">
              ── 계정 관리 ──
            </span>
            {renderLnbButton({ id: "sys-accounts", label: "통합관리자 계정", icon: User })}
            {renderLnbButton({ id: "sys-roles", label: "권한 관리", icon: Shield })}
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono text-[#00D1E8] font-bold block pb-1 border-b border-[#2A2A2F] mb-1">
              ── 디바이스 관리 ──
            </span>
            {renderLnbButton({ id: "sys-devices", label: "디바이스 목록", icon: HardDrive })}
            {renderLnbButton({ id: "sys-devices-assign", label: "고객사 배정", icon: Settings })}
            {renderLnbButton({ id: "sys-fota", label: "FOTA 관리", icon: Cpu })}
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono text-[#00D1E8] font-bold block pb-1 border-b border-[#2A2A2F] mb-1">
              ── 인프라 모니터링 ──
            </span>
            {renderLnbButton({ id: "sys-servers", label: "서버 관리", icon: Server })}
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono text-[#00D1E8] font-bold block pb-1 border-b border-[#2A2A2F] mb-1">
              ── 시스템 운영 ──
            </span>
            {renderLnbButton({ id: "sys-logs", label: "접속 로그", icon: Clock })}
            {renderLnbButton({ id: "sys-alerts", label: "알림 설정", icon: Bell })}
            {renderLnbButton({ id: "sys-notice", label: "공지사항 관리", icon: Megaphone })}
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono text-[#00D1E8] font-bold block pb-1 border-b border-[#2A2A2F] mb-1">
              ── 마이페이지 ──
            </span>
            {renderLnbButton({ id: "mypage", label: "마이페이지", icon: User })}
          </div>
        </div>
      );
    }

    if (currentRole === "SITE_MGR") {
      return (
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-[#00D1E8] font-bold block pb-1 border-b border-[#2A2A2F] mb-1">
              ── 대시보드 ──
            </span>
            {renderLnbButton({ id: "dashboard", label: "대시보드", icon: LayoutDashboard })}
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono text-[#00D1E8] font-bold block pb-1 border-b border-[#2A2A2F] mb-1">
              ── 현장 관제 ──
            </span>
            {renderLnbButton({ id: "cctv", label: "CCTV 관제", icon: Eye })}
            {renderLnbButton({ id: "events", label: "이벤트 관리", icon: Bell, badgeCount: activeWarningCount, badgeType: "red" })}
            {renderLnbButton({ id: "sensors", label: "센서 모니터링", icon: Radio })}
            {renderLnbButton({ id: "workers", label: "작업자 위치", icon: MapPin })}
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono text-[#00D1E8] font-bold block pb-1 border-b border-[#2A2A2F] mb-1">
              ── 현장 운영 ──
            </span>
            {renderLnbButton({ id: "tbm", label: "TBM 관리", icon: Tv })}
            {renderLnbButton({ id: "users", label: "사용자 관리", icon: User })}
            {renderLnbButton({ id: "site-zones", label: "작업 구역(Zone) 관리", icon: MapPin })}
            {renderLnbButton({ id: "site-devices", label: "디바이스 관리", icon: HardDrive })}
            {renderLnbButton({ id: "companies", label: "협력사 관리", icon: Building2 })}
            {renderLnbButton({ id: "notice", label: "공지사항", icon: Megaphone })}
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono text-[#00D1E8] font-bold block pb-1 border-b border-[#2A2A2F] mb-1">
              ── 마이페이지 ──
            </span>
            {renderLnbButton({ id: "mypage", label: "마이페이지", icon: User })}
          </div>
        </div>
      );
    }

    // Default: SUPER_ADMIN
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <span className="text-[9px] font-mono text-[#00D1E8] font-bold block pb-1 border-b border-[#2A2A2F] mb-1">
            ── 대시보드 ──
          </span>
          {renderLnbButton({ id: "dashboard", label: "대시보드", icon: LayoutDashboard })}
        </div>

        <div className="space-y-1">
          <span className="text-[9px] font-mono text-[#00D1E8] font-bold block pb-1 border-b border-[#2A2A2F] mb-1">
            ── 현장 관제 ──
          </span>
          {renderLnbButton({ id: "cctv", label: "CCTV 관제", icon: Eye })}
          {renderLnbButton({ id: "sensors", label: "센서 모니터링", icon: Radio })}
          {renderLnbButton({ id: "workers", label: "작업자 위치", icon: MapPin })}
        </div>

        <div className="space-y-1">
          <span className="text-[9px] font-mono text-[#00D1E8] font-bold block pb-1 border-b border-[#2A2A2F] mb-1">
            ── 현장 & 조직 ──
          </span>
          {renderLnbButton({ id: "sites", label: "현장 관리", icon: MapPin })}
          {renderLnbButton({ id: "companies", label: "협력사 관리", icon: Building2 })}
          {renderLnbButton({ id: "users", label: "사용자 관리", icon: User })}
        </div>

        <div className="space-y-1">
          <span className="text-[9px] font-mono text-[#00D1E8] font-bold block pb-1 border-b border-[#2A2A2F] mb-1">
            ── 이벤트 & 디바이스 ──
          </span>
          {renderLnbButton({ id: "events", label: "이벤트 관리", icon: Bell, badgeCount: activeWarningCount, badgeType: "red" })}
          {renderLnbButton({ id: "event-stats", label: "이벤트 통계", icon: Activity })}
          {renderLnbButton({ id: "devices-status", label: "디바이스 현황", icon: HardDrive })}
        </div>

        <div className="space-y-1">
          <span className="text-[9px] font-mono text-[#00D1E8] font-bold block pb-1 border-b border-[#2A2A2F] mb-1">
            ── 시스템 & 기록 ──
          </span>
          {renderLnbButton({ id: "notice", label: "공지사항", icon: Megaphone })}
          {renderLnbButton({ id: "audit-logs", label: "감사 로그", icon: FileText })}
          {renderLnbButton({ id: "mypage", label: "마이페이지", icon: User })}
        </div>
      </div>
    );
  };

  const roleLabel = 
    currentRole === "SYS_ADMIN" ? "시스템관리자" :
    currentRole === "SUPER_ADMIN" ? "통합관리자" :
    currentRole === "SITE_MGR" ? "현장관리자" : currentRole;

  return (
    <div className="app-root bg-[#111113] text-[#ECECEC] font-sans relative antialiased leading-normal">
      {/* 🚀 TOPBAR */}
      <header className="topbar bg-[#222226] border-b border-[#2A2A2F] flex items-center justify-between px-4 z-20 relative select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-7 text-[#00D1E8] shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#00D1E8] fill-none stroke-current stroke-[4]">
              <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" />
              <text x="50" y="58" fontSize="24" textAnchor="middle" fill="#00D1E8" className="font-extrabold stroke-none">안전</text>
            </svg>
          </div>
          <div>
            <h1 className="text-xs font-black tracking-tight flex items-center gap-1.5 text-white leading-none">
              <span>통합건설안전관제시스템</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#00D1E8]/10 text-[#00D1E8] border border-[#00D1E8]/30 font-mono font-bold">
                {roleLabel}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-1 text-[11px] text-[#8A8A96] border-r border-[#2A2A2F] pr-4 font-mono">
            <CloudSun className="w-4 h-4 text-[#00D1E8]" />
            <span>남양주 금곡동: 28.4°C 맑음</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#00D1E8] font-bold bg-[#00D1E8]/10 px-2 py-0.5 rounded border border-[#00D1E8]/25 shrink-0">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>{timeStr}</span>
          </div>

          <button 
            onClick={() => {
              setIsRefreshing(true);
              setTimeout(() => setIsRefreshing(false), 800);
            }}
            className="p-1 hover:bg-[#2A2A2F] text-[#8A8A96] hover:text-[#00D1E8] rounded transition-all shrink-0 cursor-pointer"
            title="새로고침"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#00D1E8]" : ""}`} />
          </button>

          <button 
            onClick={handleToggleFullscreen}
            className="p-1 hover:bg-[#2A2A2F] text-[#8A8A96] hover:text-[#00D1E8] rounded transition-all shrink-0 cursor-pointer"
            title="전체화면"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* 사용자 드롭다운: [마이페이지] [로그아웃] */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#111113] hover:bg-[#2A2A2F] border border-[#2A2A2F] rounded-lg text-xs font-bold text-white transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#00D1E8]" />
              <span>{currentUser?.name || "사용자"}</span>
              <span className="text-[10px] text-[#8A8A96] hidden sm:inline">({roleLabel})</span>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-[#222226] border border-[#2A2A2F] rounded-lg shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    navigate("mypage");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#2A2A2F] text-white flex items-center gap-2 font-medium cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#00D1E8]" />
                  마이페이지
                </button>
                <div className="border-t border-[#2A2A2F] my-1"></div>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    setIsLoggedIn(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#EF4444]/10 text-[#EF4444] flex items-center gap-2 font-bold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 🧭 MIDDLE WORKSPACE */}
      <div className="main-body relative">
        <aside className="lnb bg-[#222226] border-r border-[#2A2A2F] flex flex-col justify-between select-none z-10">
          <div className="p-3 space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-[#00D1E8] font-bold uppercase tracking-wider block">
                공사 현장 Filter
              </span>
              {isSiteManager ? (
                <div className="w-full bg-[#111113] border border-[#2A2A2F] text-white text-xs px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 select-none">
                  <MapPin className="w-3.5 h-3.5 text-[#00D1E8] shrink-0" />
                  <span className="truncate">
                    {availableZones.map(z => z.name).join(", ") || "왕숙1구역"}
                  </span>
                </div>
              ) : (
                <select
                  value={currentZoneFilter}
                  onChange={(e) => setCurrentZoneFilter(e.target.value)}
                  className="w-full bg-[#111113] border border-[#2A2A2F] text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                >
                  <option value="ALL">전체 지구 [전체]</option>
                  {availableZones.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              )}
            </div>

            <nav className="space-y-4">
              {renderLnbMenuByRole()}
            </nav>
          </div>

          <div className="p-3 border-t border-[#2A2A2F] bg-[#111113]/40 text-[9px] text-[#8A8A96] space-y-1 font-mono">
            <div className="flex justify-between">
              <span>SYSTEM:</span>
              <span className="text-[#22C55E] font-bold">● ONLINE</span>
            </div>
            <div>
              <span>접속자: </span>
              <span className="text-white font-semibold">{currentUser?.name || "사용자"} ({roleLabel})</span>
            </div>
          </div>
        </aside>

        {/* 📋 CENTRAL DYNAMIC ROTATION PAGE */}
        <main className="content relative space-y-4 bg-[#111113]">
          {(currentPage === "dashboard" || currentPage === "overall-monitoring") && (
            <DashboardView 
              currentZoneFilter={currentZoneFilter} 
              setCurrentZoneFilter={setCurrentZoneFilter}
              events={events} 
              navigate={navigate} 
              tbmList={tbmList}
              availableZones={availableZones}
              userRole={currentRole}
            />
          )}

          {currentPage === "cctv" && (
            <CCTVView 
              currentZoneFilter={currentZoneFilter} 
              availableZones={availableZones}
            />
          )}

          {(currentPage === "events" || currentPage === "event-detail") && (
            <EventsView
              events={events}
              dispatch={dispatch}
              currentPage={currentPage}
              pageParams={pageParams}
              navigate={navigate}
              currentZoneFilter={currentZoneFilter}
              availableZones={availableZones}
            />
          )}

          {currentPage === "sensors" && (
            <SensorsView 
              currentZoneFilter={currentZoneFilter} 
              navigate={navigate}
              availableZones={availableZones}
            />
          )}

          {currentPage === "workers" && (
            <WorkersView 
              currentZoneFilter={currentZoneFilter} 
              availableZones={availableZones}
            />
          )}

          {["sys-customers", "sys-contracts", "sys-accounts", "sys-roles", "sys-devices", "sys-device-assign", "sys-devices-assign", "sys-fota", "sys-servers", "sys-infra", "infra-vms", "infra-ai", "infra-thingx", "infra-db", "infra-net", "sys-logs", "sys-alerts", "sys-notice"].includes(currentPage) && (
            <SysAdminViews
              currentPage={currentPage}
              navigate={navigate}
            />
          )}

          {["event-stats", "devices-status", "audit-logs"].includes(currentPage) && (
            <SuperAdminViews
              currentPage={currentPage}
              navigate={navigate}
              events={events}
              availableZones={availableZones}
            />
          )}

          {["site-zones", "site-devices"].includes(currentPage) && (
            <SiteMgrViews
              currentPage={currentPage}
              navigate={navigate}
              availableZones={availableZones}
            />
          )}

          {currentPage === "mypage" && (
            <MyPageView
              user={currentUser}
              onLogout={() => setIsLoggedIn(false)}
              onUpdateUser={handleUpdateUser}
            />
          )}

          {["tbm", "users", "sites", "notice", "companies"].includes(currentPage) && (
            <OtherViews 
              currentPage={currentPage} 
              navigate={navigate} 
              events={events}
              tbmList={tbmList}
              setTbmList={setTbmList}
              availableZones={availableZones}
              currentZoneFilter={currentZoneFilter}
              zonesList={zonesList}
              setZonesList={setZonesList}
              noticesList={noticesList}
              setNoticesList={setNoticesList}
              companiesList={companiesList}
              setCompaniesList={setCompaniesList}
              isSiteManager={isSiteManager}
              currentUserName={username}
            />
          )}
        </main>
      </div>

      {/* 🚀 CENTRAL ALARM MODAL */}
      {showModal && modalEvent && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] backdrop-blur-sm" 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999 }}
        >
          <div 
            className="relative w-[440px] bg-[#222226] border-2 border-[#EF4444] rounded-xl p-6 shadow-2xl flex flex-col space-y-5 font-sans text-[#ECECEC]"
          >
            <div className="flex justify-center -mt-1">
              <div className="w-14 h-14 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444]">
                <AlertTriangle className="w-7 h-7" />
              </div>
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-white tracking-wide">긴급 구조 (SOS) 발생</h3>
              <p className="text-xs font-bold text-[#EF4444] tracking-wider animate-pulse">
                SOS 긴급 신호 발생 - 근로자 ID: W-0842
              </p>
            </div>

            <div className="bg-[#111113] border border-[#2A2A2F] rounded-lg p-4 space-y-3.5 text-xs">
              <div className="flex justify-between items-center pb-2.5 border-b border-[#2A2A2F]">
                <span className="text-[#8A8A96] font-semibold">발생 현장</span>
                <span className="text-white font-bold">
                  {modalEvent.zoneId === "z1" ? "왕숙1구역" : modalEvent.zoneId === "z2" ? "왕숙2구역" : "왕숙3구역"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-[#2A2A2F]">
                <span className="text-[#8A8A96] font-semibold">발생 시간</span>
                <span className="text-white font-mono font-bold">{modalEvent.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8A8A96] font-semibold">관련 장비/위치</span>
                <span className="text-white font-bold">시스템 감지</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <button
                onClick={() => handlePendingClick(modalEvent.id)}
                className="py-3 px-4 bg-[#2A2A2F] hover:bg-[#3A3A40] border border-[#2A2A2F] text-xs font-bold text-[#ECECEC] rounded-lg cursor-pointer text-center"
              >
                15분 보류
              </button>
              <button
                onClick={() => handleSopClick(modalEvent.id)}
                className="py-3 px-4 bg-[#EF4444] hover:bg-[#EF4444]/90 text-xs font-extrabold text-white rounded-lg shadow-lg cursor-pointer text-center"
              >
                확인 및 상세보기
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                onClick={handleCloseModalClick}
                className="text-[11px] text-[#8A8A96] hover:text-[#00D1E8] underline transition-colors cursor-pointer"
              >
                팝업만 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
