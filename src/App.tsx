/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useReducer, useEffect, useState, useRef } from "react";
import { SafetyEvent, EventStatus } from "./types";
import { INIT_EVENTS, SPA_RANDOM_EVENT_TEMP as SIMULATED_TEMPLATES, ZONES } from "./data";

// Sub views
import DashboardView from "./components/DashboardView";
import CCTVView from "./components/CCTVView";
import EventsView from "./components/EventsView";
import SensorsView from "./components/SensorsView";
import WorkersView from "./components/WorkersView";
import OtherViews from "./components/OtherViews";
import ChatbotView from "./components/ChatbotView";

// Icons
import { 
  Tv, Database, Bell, LayoutDashboard, Eye, AlertTriangle, Cpu, Radio, 
  MapPin, Clock, CloudSun, LogOut, ChevronRight, Play, Maximize2, ShieldAlert, Settings, RefreshCw,
  User, Lock
} from "lucide-react";

const SURNAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권", "황", "안", "송", "전", "홍"];
const GIVEN_NAMES = ["철수", "영호", "민수", "광수", "태현", "정우", "준호", "성민", "재호", "영진", "성식", "재욱", "병헌", "동근", "정식", "현우", "지훈", "동현", "민석", "진수", "상훈", "동진", "영우", "민기", "준식", "태영", "영철", "기태", "영민", "승우"];

// Reducer for safety alerts state
function eventsReducer(state: SafetyEvent[], action: any): SafetyEvent[] {
  switch (action.type) {
    case "ADD_EVENT":
      // Avoid duplicate keys
      if (state.some(e => e.id === action.payload.id)) return state;
      return [action.payload, ...state];

    case "CONFIRM":
      return state.map((e) => {
        if (e.id === action.payload.id) {
          const updatedSop = [
            ...e.sopHistory,
            { time: action.payload.time, action: "확인 처리", user: action.payload.user, memo: action.payload.memo || "" }
          ];
          return {
            ...e,
            status: "CONFIRMED" as EventStatus,
            confirmedBy: action.payload.user,
            result: (action.payload.result || "탐지") as '탐지' | '오탐',
            sopHistory: updatedSop
          };
        }
        return e;
      });

    case "SNOOZE":
    case "PENDING":
      return state.map((e) => {
        if (e.id === action.payload.id) {
          const updatedSop = [
            ...e.sopHistory,
            { time: action.payload.time, action: "보류 처리", user: action.payload.user, memo: action.payload.memo || "" }
          ];
          return {
            ...e,
            status: "PENDING" as EventStatus,
            confirmedBy: action.payload.user || e.confirmedBy,
            sopHistory: updatedSop
          };
        }
        return e;
      });

    case "FALSE_ALARM":
      return state.map((e) => {
        if (e.id === action.payload.id) {
          const updatedSop = [
            ...e.sopHistory,
            { time: action.payload.time, action: "오탐 처리", user: action.payload.user, memo: action.payload.memo || "" }
          ];
          return {
            ...e,
            status: "CONFIRMED" as EventStatus,
            confirmedBy: action.payload.user,
            result: "오탐" as '오탐',
            sopHistory: updatedSop
          };
        }
        return e;
      });

    case "TOGGLE_IMPORTANT":
      return state.map((e) => {
        if (e.id === action.payload.id) {
          return { ...e, isImportant: !e.isImportant };
        }
        return e;
      });

    case "CALL119":
      return state.map((e) => {
        if (e.id === action.payload.id) {
          const updatedSop = [
            ...e.sopHistory,
            { time: action.payload.time, action: "119 비상 신고 전파", user: action.payload.user, memo: `소방 무선 즉지 핑 접수 (접수번호: ${action.payload.ticket})` }
          ];
          return {
            ...e,
            sopHistory: updatedSop
          };
        }
        return e;
      });

    default:
      return state;
  }
}

const NOTICES = [
  "📢 [공지] 2025-05-27: 왕숙2구역 크레인 작업 15:00 진행 예정 — 해당 구역 접근 통제 필요",
  "📢 [공지] 2025-05-27: 전 구역 안전관리자 회의 내일(5/28) 오전 10:00 통합안전관리센터",
  "📢 [안전] 오늘 최고기온 28.4°C 예상 — 온열질환 예방을 위해 충분한 수분 섭취 권고",
  "📢 [장비] 왕숙1구역 타워크레인(TC-02) 정기점검 5/29 예정 — 해당 일 운행 중단",
];

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
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem("GH_REGISTERED_USERS");
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [
      { loginId: "admin", name: "김관수", password: "123", role: "GH_ADMIN", dept: "발주처", tel: "010-1111-2222" },
      { loginId: "admin1", name: "김관수", password: "123", role: "GH_ADMIN", dept: "발주처", tel: "010-1111-2222" },
      { loginId: "gh_safety", name: "이현장", password: "123", role: "SITE_MGR", dept: "현대건설", tel: "010-2222-3333" },
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
        measure3: "적정 휴식 시간 및 음용수 제공",
        primaryHazardIndex: 1,
        total: 145,
        completed: 0,
        rate: 0,
        status: "BEFORE",
        attendees: Array.from({ length: 145 }, (_, i) => {
          const surname = SURNAMES[i % SURNAMES.length];
          const givenName = GIVEN_NAMES[(i * 3) % GIVEN_NAMES.length];
          return {
            name: `${surname}${givenName}`,
            job: i % 4 === 0 ? "형틀목공" : i % 4 === 1 ? "철근공" : i % 4 === 2 ? "용접공" : "전기공",
            signed: false
          };
        })
      },
      {
        id: "t1",
        zoneId: "z1",
        zone: "왕숙1구역",
        date: "2025-05-27",
        time: "07:30",
        manager: "김관수",
        hasRiskAssessment: "예",
        workContent: "철근 조립 및 거푸집 설치 작업",
        hazard1: "고소작업 낙하 위험",
        measure1: "안전모·안전벨트 착용 필수, 작업발판 점검",
        hazard2: "중장비 협착 위험",
        measure2: "중장비 작업 반경 내 접근 금지, 신호수 배치",
        hazard3: "감전 위험",
        measure3: "전기 작업 전 차단기 확인, 절연장갑 착용",
        primaryHazardIndex: 1,
        total: 142,
        completed: 139,
        rate: 97.9,
        status: "COMPLETED",
        completedAt: "2025-05-27 08:15",
        leaderSignature: "김관수",
        attendees: [
          { name: "김상훈", job: "형틀목공", signed: false },
          { name: "최동현", job: "용접공", signed: false },
          { name: "정재원", job: "전기공", signed: false },
          ...Array.from({ length: 139 }, (_, i) => {
            const surname = SURNAMES[i % SURNAMES.length];
            const givenName = GIVEN_NAMES[(i * 3 + 1) % GIVEN_NAMES.length];
            return {
              name: `${surname}`,
              fullName: `${surname}${givenName}`,
              job: i % 3 === 0 ? "철근공" : i % 3 === 1 ? "형틀목공" : "비계공",
              signed: true
            };
          }).map(x => ({ name: x.fullName, job: x.job, signed: x.signed }))
        ]
      },
      {
        id: "t2",
        zoneId: "z2",
        zone: "왕숙2구역",
        date: "2025-05-26",
        time: "07:45",
        manager: "이현장",
        hasRiskAssessment: "예",
        workContent: "거푸집 조립 및 콘크리트 타설 작업",
        hazard1: "콘크리트 펌프카 붐대 타격 위험",
        measure1: "통제구역 설정 및 신호수 배치",
        hazard2: "작업발판 붕괴 위험",
        measure2: "비계 설치 상태 점검 및 안전대 체결",
        hazard3: "비산분진 흡입 위험",
        measure3: "방진마스크 착용 필수",
        primaryHazardIndex: 1,
        total: 98,
        completed: 95,
        rate: 96.9,
        status: "COMPLETED",
        completedAt: "2025-05-26 08:30",
        leaderSignature: "이현장",
        attendees: [
          { name: "이현우", job: "철근공", signed: false },
          { name: "박민석", job: "조적공", signed: false },
          { name: "최진수", job: "비계공", signed: false },
          ...Array.from({ length: 95 }, (_, i) => {
            const surname = SURNAMES[(i + 5) % SURNAMES.length];
            const givenName = GIVEN_NAMES[(i * 7 + 3) % GIVEN_NAMES.length];
            return {
              name: `${surname}${givenName}`,
              job: i % 3 === 0 ? "형틀목공" : i % 3 === 1 ? "용접공" : "전기공",
              signed: true
            };
          })
        ]
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("saferx_tbm_list_v2", JSON.stringify(tbmList));
  }, [tbmList]);

  // Compute available zones depending on account type (Construction Company demo vs Admin)
  const currentUser = users.find(u => u.loginId.toLowerCase() === username.trim().toLowerCase());
  const isConstructionCompany = 
    username.toLowerCase() === "gh_safety" || 
    currentUser?.role === "SITE_MGR" || 
    currentUser?.dept === "시공사" || 
    currentUser?.dept === "협력사" || 
    currentUser?.dept === "현대건설" ||
    currentUser?.dept === "삼성물산" ||
    currentUser?.dept === "대우건설";

  const availableZones = isConstructionCompany ? ZONES.slice(0, 2) : ZONES;

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

  // ⏱ Modal Timer logic (Runs every 5s, pops critical/high events once every 10 minutes / 600s)
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
          const topEvent = sorted[0];
          setModalEvent(topEvent);
          setShowModal(true);
          lastPopupTimeRef.current = now;
        }
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [events, isLoggedIn]);

  // 🔄 12-Second simulated hazard event loop
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      // Choose template at random
      const rIdx = Math.floor(Math.random() * SIMULATED_TEMPLATES.length);
      const tpl = SIMULATED_TEMPLATES[rIdx];

      const newId = `EVT-${Math.floor(200 + Math.random() * 799)}`;
      const timeNow = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

      const simulatedEvent: SafetyEvent = {
        id: newId,
        time: timeNow,
        zoneId: (tpl as any).zoneId || "z1",
        type: tpl.type as any,
        subtype: tpl.subtype,
        desc: tpl.desc,
        severity: tpl.severity as any,
        status: "ACTIVE",
        camera: tpl.camera,
        worker: (tpl as any).worker || null,
        confirmedBy: "",
        sopHistory: [
          { time: timeNow, action: "실시간 에지 디텍션", user: "통합 AI 관제센터", memo: "지능형 센서 감지선 즉각 알람 유발" }
        ]
      };

      // Dispatch into reducer
      dispatch({ type: "ADD_EVENT", payload: simulatedEvent });
    }, 12000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Authentication Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setAuthError("아이디 및 비밀번호를 전부 입력해주십시오.");
      return;
    }

    const matchedUser = users.find(u => u.loginId.toLowerCase() === username.trim().toLowerCase() && u.password === password);
    const legacyAccounts = ["admin1", "admin2", "admin3", "gh_safety", "gh_control"];
    const legacyMatched = legacyAccounts.includes(username.trim().toLowerCase()) && password === "1234";

    if (matchedUser || legacyMatched) {
      setIsLoggedIn(true);
      setAuthError("");
    } else {
      setAuthError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  // Helper quick access selector
  const handleQuickAccessLogin = (accName: string) => {
    setUsername(accName);
    const matchedUser = users.find(u => u.loginId.toLowerCase() === accName.toLowerCase());
    if (matchedUser) {
      setPassword(matchedUser.password);
    } else {
      setPassword("1234");
    }
    setIsLoggedIn(true);
    setAuthError("");
  };

  // SMS 인증코드 전송 시뮬레이션
  const handleSendSms = () => {
    if (!signUpForm.phone.trim()) {
      setSignUpErr("휴대전화번호를 입력해주세요.");
      return;
    }
    const generatedCode = "7723"; // Fixed simple code for demo
    setSmsCode(generatedCode);
    setSmsSent(true);
    setSignUpErr("");
    alert(`[인증번호 전송 완료]\n인증번호: ${generatedCode} 가 발송되었습니다.`);
  };

  // SMS 인증코드 확인
  const handleVerifySmsCode = () => {
    if (signUpForm.code === smsCode) {
      setIsSmsVerified(true);
      setSignUpErr("");
    } else {
      setSignUpErr("인증번호가 일치하지 않습니다.");
    }
  };

  // 회원가입 전송
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpErr("");

    if (!signUpForm.name.trim()) return setSignUpErr("이름을 입력해주세요.");
    if (!isSmsVerified) return setSignUpErr("휴대전화 인증을 완료해주세요.");
    if (!signUpForm.loginId.trim()) return setSignUpErr("아이디를 입력해주세요.");
    if (!signUpForm.password.trim()) return setSignUpErr("비밀번호를 입력해주세요.");
    if (!signUpForm.agreeTerms) return setSignUpErr("이용약관 동의가 필요합니다.");
    if (!signUpForm.agreePrivacy) return setSignUpErr("개인정보 수집 및 이용 동의가 필요합니다.");

    // ID 중복 검사
    const exists = users.some(u => u.loginId.toLowerCase() === signUpForm.loginId.trim().toLowerCase());
    if (exists) {
      setSignUpErr("이미 가입된 아이디입니다.");
      return;
    }

    // 새 유저 생성
    const newUser = {
      loginId: signUpForm.loginId.trim(),
      name: signUpForm.name.trim(),
      password: signUpForm.password,
      role: signUpForm.role, // "GH_ADMIN", "SITE_MGR", "WORKER"
      dept: signUpForm.dept,
      tel: signUpForm.phone.trim()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("GH_REGISTERED_USERS", JSON.stringify(updatedUsers));

    // 성공 처리
    setSignUpSuccess(true);
    setTimeout(() => {
      // 가입된 ID를 로그인 화면 아이디 칸에 자동 기입해주기
      setUsername(signUpForm.loginId.trim());
      setPassword("");
      setSignUpSuccess(false);
      setShowSignUp(false);
      // Reset form
      setSignUpForm({
        name: "",
        phone: "",
        code: "",
        loginId: "",
        password: "",
        dept: "경기주택도시공사",
        role: "WORKER",
        agreeTerms: false,
        agreePrivacy: false,
      });
      setSmsSent(false);
      setIsSmsVerified(false);
    }, 2000);
  };

  // 비밀번호 찾기 처리
  const handleFindPwSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFindPwErr("");
    setFindPwMsg("");

    const matched = users.find(
      u => u.name.trim() === findPwForm.name.trim() &&
           u.tel.replace(/-/g, "") === findPwForm.phone.replace(/-/g, "") &&
           u.loginId.toLowerCase() === findPwForm.loginId.trim().toLowerCase()
    );

    if (matched) {
      setFindPwMsg(`확인 완료: ${matched.name}님의 비밀번호는 [ ${matched.password} ] 입니다.`);
    } else {
      setFindPwErr("일치하는 회원 정보가 없습니다.");
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
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

  // Active warning aggregate
  const activeWarningCount = events.filter(e => e.status === "ACTIVE").length;
  const criticalCount = events.filter(e => e.status === "ACTIVE" && e.severity === "CRITICAL").length;

  // Render Splash layout
  if (isSplash) {
    return (
      <div className="fixed inset-0 bg-[var(--bg-base)] flex flex-col items-center justify-center font-sans z-50">
        <div className="flex flex-col items-center space-y-4">
          {/* Hexagonal construction logo animation */}
          <div className="w-16 h-18 relative flex items-center justify-center animate-pulse">
            <svg viewBox="0 0 100 100" className="w-[60px] h-[60px] text-cyan fill-none stroke-current stroke-[3]">
              <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" />
              <text x="50" y="58" fontSize="26" textAnchor="middle" fill="var(--cyan)" className="font-extrabold stroke-none">안전</text>
            </svg>
          </div>
          <div className="text-center space-y-1">
            <h4 className="text-text-sub font-semibold text-xs tracking-wider">통합안전관리</h4>
            <h3 className="font-extrabold tracking-widest text-[var(--cyan)] text-base">건설안전관제시스템</h3>
            <p className="text-[11px] text-text-dim font-mono mt-2">INTEGRATED MONITORING CONSOLE</p>
          </div>
          {/* Circular spinner */}
          <div className="w-24 h-1.5 bg-[var(--border-subtle)] rounded-full overflow-hidden relative">
            <div className="w-1/2 bg-cyan h-full rounded-full absolute left-0 animate-infinite-scroll"></div>
          </div>
        </div>
      </div>
    );
  }

  // Render Login Card screen
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-[var(--bg-base)] flex flex-col items-center justify-center p-4 font-sans overflow-y-auto">
        
        {/* 1. SIGN UP SCREEN */}
        {showSignUp ? (
          <div className="w-full max-w-[460px] bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-6.5 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200 flex flex-col my-4">
            <div className="flex flex-col items-center space-y-1.5 text-center">
              <h2 className="text-lg font-bold text-white tracking-wide">회원가입</h2>
              <p className="text-[11px] text-text-dim">회원가입 정보를 입력해 주세요.</p>
            </div>

            {signUpSuccess ? (
              <div className="bg-green/10 border border-green/40 px-4 py-8 rounded-lg text-center space-y-3">
                <div className="w-12 h-12 bg-green/20 text-green rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                <h4 className="font-bold text-sm text-text-main">회원가입 완료!</h4>
                <p className="text-xs text-text-sub">회원등록이 완료되었습니다.<br />잠시 후 로그인 화면으로 이동합니다.</p>
              </div>
            ) : (
              <form onSubmit={handleSignUpSubmit} className="space-y-4 text-xs">
                {signUpErr && (
                  <div className="bg-red/10 border border-red/40 px-3 py-2 rounded text-red text-center font-bold">
                    ⚠️ {signUpErr}
                  </div>
                )}

                {/* 이름 */}
                <div className="space-y-1">
                  <label className="text-text-sub font-semibold">이름</label>
                  <input
                    type="text"
                    required
                    value={signUpForm.name}
                    onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                    placeholder="실명 입력"
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] focus:border-[var(--cyan)] text-text-main px-3 py-2.5 rounded-lg outline-none transition-all"
                  />
                </div>

                {/* 휴대전화번호 (인증) */}
                <div className="space-y-1">
                  <label className="text-text-sub font-semibold">휴대전화번호</label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      required
                      disabled={isSmsVerified}
                      value={signUpForm.phone}
                      onChange={(e) => setSignUpForm({ ...signUpForm, phone: e.target.value })}
                      placeholder="010-XXXX-XXXX"
                      className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] focus:border-[var(--cyan)] text-text-main px-3 py-2.5 rounded-lg outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      disabled={isSmsVerified}
                      onClick={handleSendSms}
                      className="px-3 bg-cyan hover:bg-cyan/90 text-outer font-bold rounded-lg text-[11px] transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {smsSent ? "재전송" : "인증번호 전송"}
                    </button>
                  </div>
                </div>

                {/* SMS인증코드 입력 */}
                {smsSent && !isSmsVerified && (
                  <div className="p-3 bg-cyan/5 border border-cyan/30 rounded-lg space-y-2">
                    <span className="text-[10px] text-cyan block">인증코드가 발송되었습니다.</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={signUpForm.code}
                        onChange={(e) => setSignUpForm({ ...signUpForm, code: e.target.value })}
                        placeholder="인증코드 4자리 입력"
                        className="flex-1 bg-[var(--bg-base)] border border-[var(--border-default)] text-text-main px-3 py-1.5 rounded outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleVerifySmsCode}
                        className="px-3 bg-cyan text-outer font-bold rounded"
                      >
                        확인
                      </button>
                    </div>
                  </div>
                )}

                {/* 휴대전화인증완료 메세지 */}
                {isSmsVerified && (
                  <div className="text-green font-bold text-[11px] flex items-center gap-1">
                    ✓ 휴대전화 인증이 완료되었습니다.
                  </div>
                )}

                {/* 아이디 */}
                <div className="space-y-1">
                  <label className="text-text-sub font-semibold">아이디</label>
                  <input
                    type="text"
                    required
                    value={signUpForm.loginId}
                    onChange={(e) => setSignUpForm({ ...signUpForm, loginId: e.target.value })}
                    placeholder="사용할 아이디"
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] focus:border-[var(--cyan)] text-text-main px-3 py-2.5 rounded-lg outline-none transition-all"
                  />
                </div>

                {/* 비밀번호 */}
                <div className="space-y-1">
                  <label className="text-text-sub font-semibold">비밀번호</label>
                  <input
                    type="password"
                    required
                    value={signUpForm.password}
                    onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                    placeholder="비밀번호 입력"
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] focus:border-[var(--cyan)] text-text-main px-3 py-2.5 rounded-lg outline-none transition-all"
                  />
                </div>

                {/* 소속 셀렉트 */}
                <div className="space-y-1">
                  <label className="text-text-sub font-semibold">소속</label>
                  <select
                    value={signUpForm.dept}
                    onChange={(e) => setSignUpForm({ ...signUpForm, dept: e.target.value })}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] text-text-main px-3 py-2.5 rounded-lg outline-none"
                  >
                    <option value="발주처">발주처</option>
                    <option value="현대건설">현대건설</option>
                    <option value="삼성물산">삼성물산</option>
                    <option value="대우건설">대우건설</option>
                    <option value="포스코이앤씨">포스코이앤씨</option>
                    <option value="태영건설">태영건설</option>
                  </select>
                </div>

                {/* 권한 셀렉트 */}
                <div className="space-y-1">
                  <label className="text-text-sub font-semibold">권한</label>
                  <select
                    value={signUpForm.role}
                    onChange={(e) => setSignUpForm({ ...signUpForm, role: e.target.value })}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] text-text-main px-3 py-2.5 rounded-lg outline-none"
                  >
                    <option value="GH_ADMIN">통합관리자</option>
                    <option value="SITE_MGR">현장관리자</option>
                    <option value="WORKER">현장근로자</option>
                  </select>
                </div>

                {/* 동의 목록 */}
                <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={signUpForm.agreeTerms}
                      onChange={(e) => setSignUpForm({ ...signUpForm, agreeTerms: e.target.checked })}
                      className="mt-0.5"
                    />
                    <span className="text-text-sub leading-tight">이용약관 동의 (필수)</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={signUpForm.agreePrivacy}
                      onChange={(e) => setSignUpForm({ ...signUpForm, agreePrivacy: e.target.checked })}
                      className="mt-0.5"
                    />
                    <span className="text-text-sub leading-tight">개인정보 수집 및 이용 동의 (필수)</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSignUp(false)}
                    className="flex-1 py-3 bg-[var(--bg-hover)] hover:bg-[var(--bg-active)] text-text-main font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    이전으로
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-cyan hover:bg-cyan/90 text-outer font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    회원가입 완료
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : showFindPw ? (
          /* 2. FORGOT PASSWORD SCREEN */
          <div className="w-full max-w-[420px] bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-7 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex flex-col items-center space-y-1 text-center">
              <h2 className="text-lg font-bold text-white tracking-wide">비밀번호 찾기</h2>
              <p className="text-xs text-text-dim">가입 시 입력했던 정보를 입력해 주세요.</p>
            </div>

            <form onSubmit={handleFindPwSubmit} className="space-y-4 text-xs">
              {findPwErr && (
                <div className="bg-red/10 border border-red/40 px-3 py-2 rounded text-red text-center font-bold">
                  ⚠️ {findPwErr}
                </div>
              )}
              {findPwMsg && (
                <div className="bg-green/10 border border-green/40 px-3 py-3 rounded text-green font-bold text-center leading-relaxed">
                  {findPwMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-text-sub font-semibold">이름</label>
                <input
                  type="text"
                  required
                  value={findPwForm.name}
                  onChange={(e) => setFindPwForm({ ...findPwForm, name: e.target.value })}
                  placeholder="가입자 성명"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] focus:border-[var(--cyan)] text-text-main px-3 py-2.5 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-sub font-semibold">휴대전화번호</label>
                <input
                  type="tel"
                  required
                  value={findPwForm.phone}
                  onChange={(e) => setFindPwForm({ ...findPwForm, phone: e.target.value })}
                  placeholder="010-XXXX-XXXX"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] focus:border-[var(--cyan)] text-text-main px-3 py-2.5 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-sub font-semibold">아이디</label>
                <input
                  type="text"
                  required
                  value={findPwForm.loginId}
                  onChange={(e) => setFindPwForm({ ...findPwForm, loginId: e.target.value })}
                  placeholder="가입한 아이디"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] focus:border-[var(--cyan)] text-text-main px-3 py-2.5 rounded-lg outline-none"
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
                  className="flex-1 py-3 bg-[var(--bg-hover)] hover:bg-[var(--bg-active)] text-text-main font-bold rounded-lg cursor-pointer"
                >
                  이전으로
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-cyan hover:bg-cyan/90 text-outer font-bold rounded-lg cursor-pointer"
                >
                  비밀번호 찾기
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* 3. ORIGINAL PORTAL LOGIN SCREEN */
          <div className="w-full max-w-[440px] bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-8 shadow-2xl relative space-y-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Top Logo and main portal header */}
            <div className="flex flex-col items-center space-y-2 text-center">
              {/* Elegant 3D Isometric Styled Logo */}
              <div className="w-16 h-16 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-cyan" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M48 15 L22 30 V58 L48 43 V15Z" fill="#00b4d8" />
                  <path d="M52 15 L52 43 L78 58 V30 L52 15Z" fill="#0077b6" />
                  <path d="M22 62 L48 77 V91 L22 76 V62Z" fill="#03045e" />
                  <path d="M52 77 L78 62 V76 L52 91 V77Z" fill="#00b4d8" />
                </svg>
              </div>
              <div className="space-y-0.5 mt-1">
                <h4 className="text-[12px] text-text-sub font-semibold tracking-wider text-cyan">통합안전관리</h4>
                <h2 className="text-[20px] font-extrabold text-white tracking-widest uppercase">건설안전관제시스템</h2>
                <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-text-dim block pt-0.5">
                  INTEGRATED MONITORING CONSOLE
                </span>
              </div>
            </div>

            {/* Core Validator Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-1 text-xs">
                <label className="text-text-sub font-semibold block tracking-wide">아이디</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-text-dim absolute left-3.5 z-10" />
                  <input
                    type="text"
                    autoFocus
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="아이디 입력"
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-[var(--cyan)]/50 focus:border-[var(--cyan)] text-text-main pl-10 pr-4 py-3 rounded-lg text-xs placeholder-text-dim/80 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-text-sub font-semibold block tracking-wide">비밀번호</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-text-dim absolute left-3.5 z-10" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호 입력"
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-[var(--cyan)]/50 focus:border-[var(--cyan)] text-text-main pl-10 pr-4 py-3 rounded-lg text-xs placeholder-text-dim/80 outline-none transition-all"
                  />
                </div>
              </div>

              {authError && (
                <div className="bg-red/10 border border-red/40 px-3 py-2 rounded text-[11px] text-red text-center font-bold">
                  ⚠️ {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-cyan hover:bg-[#00e1ff] text-[var(--bg-base)] font-extrabold py-3.5 rounded-lg text-xs transition-colors shadow-lg shadow-cyan/10 tracking-widest text-center cursor-pointer"
              >
                로그인
              </button>
            </form>

            {/* 회원가입 및 비밀번호 찾기 바로가기 */}
            <div className="flex gap-4 justify-center text-xs mt-1 select-none text-text-sub">
              <button
                type="button"
                onClick={() => setShowSignUp(true)}
                className="hover:text-cyan font-bold transition-all underline cursor-pointer"
              >
                회원가입
              </button>
              <span className="text-[var(--border-default)]">|</span>
              <button
                type="button"
                onClick={() => setShowFindPw(true)}
                className="hover:text-cyan font-bold transition-all underline cursor-pointer"
              >
                비밀번호 찾기
              </button>
            </div>

            {/* Line Divider */}
            <hr className="border-[var(--border-subtle)] opacity-50 !my-4" />

            {/* Quick-Access Admin Roster Block */}
            <div className="space-y-2.5">
              <span className="text-[10px] text-text-dim font-mono tracking-widest text-center block uppercase">
                데모용 계정
              </span>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "통합 관리자", acc: "admin1" },
                  { label: "건설사", acc: "gh_safety" }
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleQuickAccessLogin(item.acc)}
                    className="bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-cyan hover:text-cyan py-2.5 px-3 rounded-lg text-xs font-bold text-text-sub text-center transition-all cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer notice */}
        <p className="text-[9px] font-mono tracking-wider text-text-dim text-center mt-6 uppercase">
          통합건설안전관제시스템 @ 2026
        </p>
      </div>
    );
  }

  const renderLnbButton = (link: { id: string; label: string; icon: any; badgeCount?: number; badgeType?: string; isChat?: boolean }) => {
    const Icon = link.icon;
    const isActive = currentPage === link.id || (link.id === "events" && currentPage === "event-detail");

    return (
      <button
        key={link.id}
        onClick={() => navigate(link.id)}
        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg font-medium transition-all group cursor-pointer ${
          isActive 
            ? "bg-cyan text-outer font-bold shadow-md shadow-cyan/10" 
            : "text-text-sub hover:bg-hover hover:text-text-main"
        }`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${isActive ? "text-outer" : "text-cyan"}`} />
          <span className="truncate">{link.label}</span>
        </div>

        {link.badgeCount !== undefined && link.badgeCount > 0 && (
          <span className={`px-1.5 py-0.5 text-[9px] font-mono leading-none rounded-full font-bold ${
            link.badgeType === "red" ? "bg-red text-text-main animate-pulse" : "bg-cyan text-outer"
          }`}>
            {link.badgeCount}
          </span>
        )}

        {link.isChat && (
          <span className="text-[8px] px-1 bg-cyan text-outer rounded font-extrabold uppercase animate-pulse shrink-0">
            WANGSUK AI
          </span>
        )}
      </button>
    );
  };

  // Render core Full-screen GIS layout inside Dashboard
  return (
    <div className="app-root bg-outer text-text-main font-sans relative antialiased leading-normal">
      
      {/* 🚀 1. TOPBAR COMPONENT */}
      <header className="topbar bg-panel border-b border-border-main flex items-center justify-between px-4 z-20 relative select-none">
        
        {/* Left branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-7 text-cyan shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full text-cyan fill-none stroke-current stroke-[4]">
              <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" />
              <text x="50" y="58" fontSize="24" textAnchor="middle" fill="#4f46e5" className="font-extrabold stroke-none">안전</text>
            </svg>
          </div>
          <div>
            <h1 className="text-xs font-black tracking-tight flex items-center gap-1.5 text-text-main leading-none">
              <span>통합건설안전관제시스템</span>
            </h1>
          </div>
        </div>

        {/* Right tools widget */}
        <div className="flex items-center gap-4">
          {/* Namyangju live weather mockup */}
          <div className="hidden lg:flex items-center gap-1 text-[11px] text-text-sub border-r border-border-dim pr-4 font-mono">
            <CloudSun className="w-4 h-4 text-cyan" />
            <span>남양주 금곡동: 18.2°C 맑음</span>
          </div>

          {/* Digital clocks ticking */}
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan font-bold bg-cyan-dim px-2 py-0.5 rounded border border-cyan/25 shrink-0">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>{timeStr}</span>
          </div>

          {/* Refresh button */}
          <button 
            onClick={() => {
              setIsRefreshing(true);
              setTimeout(() => setIsRefreshing(false), 800);
            }}
            className="p-1 hover:bg-hover text-text-dim hover:text-cyan rounded transition-all shrink-0 cursor-pointer"
            title="새로고침"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan" : ""}`} />
          </button>

          {/* Fullscreen trig */}
          <button 
            onClick={handleToggleFullscreen}
            className="p-1 hover:bg-hover text-text-dim hover:text-cyan rounded transition-all shrink-0"
            title="SOP 관제 전체화면"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Log Out */}
          <button
            onClick={() => setIsLoggedIn(false)}
            className="p-1 hover:bg-red/10 text-text-dim hover:text-red rounded transition-all shrink-0"
            title="안전 단말 탈퇴"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 🧭 2. MIDDLE SPLIT WORKSPACE: LNB SIDEBAR + CONTENT FRAME */}
      <div className="main-body relative">
        
        {/* LNB Sidebar (220px fixed) */}
        <aside className="lnb bg-panel border-r border-border-main flex flex-col justify-between select-none z-10">
          
          {/* Top navigational items groups */}
          <div className="p-3 space-y-4">
            
            {/* Zone filters layout dropdown */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-cyan font-bold uppercase tracking-wider block">
                공사 현장
              </span>
              <select
                value={currentZoneFilter}
                onChange={(e) => setCurrentZoneFilter(e.target.value)}
                className="w-full bg-card border border-border-main text-text-main text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
              >
                <option value="ALL">전체 지구 [전체]</option>
                {availableZones.map(z => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>

            {/* Core Navigation Sheets list */}
            <nav className="space-y-4">
              {/* 그룹 1: 현장 관제 */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-cyan font-bold block pb-1 border-b border-border-dim/40 mb-1">
                  ── 현장 관제 ──
                </span>
                {[
                  { id: "dashboard", label: "통합관제", icon: LayoutDashboard },
                  { id: "cctv", label: "CCTV 관제", icon: Eye },
                  { id: "events", label: "이벤트 관리", icon: Bell, badgeCount: activeWarningCount, badgeType: "red" }
                ].map((link) => renderLnbButton(link))}
              </div>

              {/* 그룹 2: 안전 모니터링 */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-cyan font-bold block pb-1 border-b border-border-dim/40 mb-1">
                  ── 안전 모니터링 ──
                </span>
                {[
                  { id: "sensors", label: "센서 모니터링", icon: Radio }
                ].map((link) => renderLnbButton(link))}
              </div>

              {/* 그룹 3: 작업자 */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-cyan font-bold block pb-1 border-b border-border-dim/40 mb-1">
                  ── 작업자 ──
                </span>
                {[
                  { id: "workers", label: "작업자 위치", icon: MapPin },
                  { id: "tbm", label: "TBM 관리", icon: Tv }
                ].map((link) => renderLnbButton(link))}
              </div>

              {/* 그룹 4: 관리 */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-cyan font-bold block pb-1 border-b border-border-dim/40 mb-1">
                  ── 관리 ──
                </span>
                {[
                  { id: "users", label: "사용자 관리", icon: Tv }
                ].map((link) => renderLnbButton(link))}
              </div>
            </nav>
          </div>

          {/* Footer stats stamp inside sidebar */}
          <div className="p-3 border-t border-border-dim/40 bg-card/40 text-[9px] text-text-dim space-y-1 font-mono">
            <div className="flex justify-between">
              <span>ONLINE:</span>
              <span className="text-green font-bold">● ONLINE</span>
            </div>
            <div>
              <span>관리자: </span>
              <span className="text-text-sub font-semibold">홍길동 ({username})</span>
            </div>
          </div>
        </aside>

        {/* 📋 3. CENTRAL DYNAMIC ROTATION PAGE */}
        <main className="content relative space-y-4 bg-outer">
          {/* Dashboard Sheet Router */}
          {currentPage === "dashboard" && (
            <DashboardView 
              currentZoneFilter={currentZoneFilter} 
              setCurrentZoneFilter={setCurrentZoneFilter}
              events={events} 
              navigate={navigate} 
              tbmList={tbmList}
              availableZones={availableZones}
            />
          )}

          {/* CCTV view */}
          {currentPage === "cctv" && (
            <CCTVView 
              currentZoneFilter={currentZoneFilter} 
              availableZones={availableZones}
            />
          )}

          {/* Events logger list & SOP response sheet */}
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

          {/* SensorsView */}
          {currentPage === "sensors" && (
            <SensorsView 
              currentZoneFilter={currentZoneFilter} 
              navigate={navigate}
              availableZones={availableZones}
            />
          )}

          {/* Workers Loc */}
          {currentPage === "workers" && (
            <WorkersView 
              currentZoneFilter={currentZoneFilter} 
              availableZones={availableZones}
            />
          )}

          {/* Grounding AI maps chatbot integration */}
          {currentPage === "chatbot" && (
            <ChatbotView />
          )}

          {/* Auxiliary administrative lists (Users, Heavy etc.) */}
          {["tbm", "users"].includes(currentPage) && (
            <OtherViews 
              currentPage={currentPage} 
              navigate={navigate} 
              events={events}
              tbmList={tbmList}
              setTbmList={setTbmList}
            />
          )}
        </main>
      </div>

      {/* 🚀 4. CENTRAL HIGH-PRIORITY ALARM MODAL POPUP */}
      {showModal && modalEvent && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] backdrop-blur-sm" 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999 }}
        >
          <div 
            className="relative w-[440px] bg-[var(--bg-card)] border-2 border-red rounded-xl p-6 shadow-2xl flex flex-col space-y-5 font-sans text-text-main"
          >
            {/* Centered Warning Icon representing urgency */}
            <div className="flex justify-center -mt-1">
              <div className="w-14 h-14 rounded-full bg-red/10 border border-red/40 flex items-center justify-center text-red">
                <AlertTriangle className="w-7 h-7" />
              </div>
            </div>

            {/* Title & Subtitle Info */}
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-white tracking-wide">긴급 구조 (SOS) 발생</h3>
              <p className="text-xs font-bold text-red tracking-wider animate-pulse">
                SOS 긴급 신호 발생 - 근로자 ID: W-0842
              </p>
            </div>

            {/* Table layout inside dark card border */}
            <div className="bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg p-4 space-y-3.5 text-xs">
              <div className="flex justify-between items-center pb-2.5 border-b border-[var(--border-subtle)]">
                <span className="text-text-dim font-semibold">발생 현장</span>
                <span className="text-text-main font-bold">
                  {modalEvent.zoneId === "z1" ? "왕숙1구역" : modalEvent.zoneId === "z2" ? "왕숙2구역" : "세종-천안 1공구"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-[var(--border-subtle)]">
                <span className="text-text-dim font-semibold">발생 시간</span>
                <span className="text-white font-mono font-bold">{modalEvent.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-dim font-semibold">관련 장비/위치</span>
                <span className="text-text-main font-bold">시스템 감지</span>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <button
                onClick={() => handlePendingClick(modalEvent.id)}
                className="py-3 px-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:bg-hover hover:border-cyan text-xs font-bold text-text-sub rounded-lg transition-all cursor-pointer text-center"
              >
                15분 감지 유예
              </button>
              <button
                onClick={() => handleSopClick(modalEvent.id)}
                className="py-3 px-4 bg-red hover:bg-[#ff4d4d] text-xs font-extrabold text-white rounded-lg transition-all shadow-lg shadow-red/20 cursor-pointer text-center"
              >
                확인 및 상세보기
              </button>
            </div>

            {/* Bottom inline dim button to dismiss modal only */}
            <div className="text-center pt-1">
              <button
                onClick={handleCloseModalClick}
                className="text-[11px] text-text-dim hover:text-cyan underline hover:no-underline transition-colors cursor-pointer"
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
