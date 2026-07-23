/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Zone, SafetyEvent, Camera, Sensor, CollapseSensor, Company, User, TbmItem, WorkerLoc } from "./types";

export const MOCK_LOGIN_USERS = [
  { id: "admin", pw: "gh1234", name: "김관수", role: "GH_ADMIN", zones: "ALL", dept: "GH안전관리센터" },
  { id: "site1", pw: "site1234", name: "이현장", role: "SITE_MGR", zones: ["z1", "z2"], dept: "현대건설" },
  { id: "site2", pw: "site2234", name: "박현장", role: "SITE_MGR", zones: ["z3", "z4"], dept: "삼성물산" },
];

export const ZONES: Zone[] = [
  { id: "z1", name: "왕숙1구역", company: "현대건설", lat: 37.6478, lng: 127.2156, workers: 142, risk: 46.2, events: 3, status: "위험", pm: "홍길동", tel: "010-1234-5678" },
  { id: "z2", name: "왕숙2구역", company: "삼성물산", lat: 37.6512, lng: 127.2234, workers: 98, risk: 44.9, events: 2, status: "주의", pm: "김철수", tel: "010-2345-6789" },
  { id: "z3", name: "왕숙3구역", company: "대우건설", lat: 37.6445, lng: 127.2089, workers: 115, risk: 41.6, events: 1, status: "주의", pm: "이영희", tel: "010-3456-7890" },
  { id: "z4", name: "왕숙4구역", company: "GS건설", lat: 37.6501, lng: 127.2178, workers: 87, risk: 38.2, events: 1, status: "주의", pm: "박민수", tel: "010-4567-8901" },
  { id: "z5", name: "왕숙5구역", company: "롯데건설", lat: 37.6389, lng: 127.2267, workers: 204, risk: 22.1, events: 0, status: "보통", pm: "최지원", tel: "010-5678-9012" },
  { id: "z6", name: "왕숙6구역", company: "포스코건설", lat: 37.6423, lng: 127.2312, workers: 176, risk: 18.5, events: 0, status: "보통", pm: "정수빈", tel: "010-6789-0123" },
  { id: "z7", name: "왕숙7구역", company: "현대건설", lat: 37.6367, lng: 127.2145, workers: 133, risk: 15.3, events: 0, status: "보통", pm: "강다은", tel: "010-7890-1234" },
  { id: "z8", name: "왕숙8구역", company: "대림건설", lat: 37.6334, lng: 127.2198, workers: 89, risk: 12.8, events: 0, status: "보통", pm: "윤서준", tel: "010-8901-2345" },
  { id: "z9", name: "왕숙9구역", company: "SK건설", lat: 37.6456, lng: 127.2378, workers: 167, risk: 9.4, events: 0, status: "보통", pm: "임채원", tel: "010-9012-3456" },
  { id: "z10", name: "왕숙10구역", company: "한화건설", lat: 37.6489, lng: 127.2423, workers: 145, risk: 7.2, events: 0, status: "보통", pm: "송민준", tel: "010-0123-4567" },
  { id: "z11", name: "왕숙11구역", company: "삼성물산", lat: 37.6312, lng: 127.2289, workers: 78, risk: 5.1, events: 0, status: "보통", pm: "오지수", tel: "010-1234-9876" },
  { id: "z12", name: "왕숙12구역", company: "GS건설", lat: 37.6278, lng: 127.2334, workers: 92, risk: 3.8, events: 0, status: "보통", pm: "유하은", tel: "010-2345-0987" },
  { id: "z13", name: "왕숙13구역", company: "롯데건설", lat: 37.6256, lng: 127.2267, workers: 110, risk: 0.0, events: 0, status: "보통", pm: "나성민", tel: "010-3456-1098" },
];

export const INIT_EVENTS: SafetyEvent[] = [
  {
    id: "EVT-001",
    zoneId: "z1",
    type: "AI",
    subtype: "안전모미착용",
    severity: "HIGH",
    time: "2025-05-27 14:32",
    status: "ACTIVE",
    worker: "박민준",
    camera: "CAM-001",
    desc: "안전모 미착용 감지",
    confirmedBy: null,
    confirmedAt: null,
    memo: "",
    isImportant: true,
    result: null,
    sopHistory: [{ time: "14:32", action: "이벤트 감지", user: "시스템", memo: "" }],
  },
  {
    id: "EVT-002",
    zoneId: "z1",
    type: "AI",
    subtype: "안전조끼미착용",
    severity: "HIGH",
    time: "2025-05-27 14:28",
    status: "ACTIVE",
    worker: "김상훈",
    camera: "CAM-003",
    desc: "안전조끼 미착용 감지",
    confirmedBy: null,
    confirmedAt: null,
    memo: "",
    isImportant: false,
    result: null,
    sopHistory: [{ time: "14:28", action: "이벤트 감지", user: "시스템", memo: "" }],
  },
  {
    id: "EVT-003",
    zoneId: "z2",
    type: "센서",
    subtype: "유해가스초과",
    severity: "CRITICAL",
    time: "2025-05-27 14:15",
    status: "CONFIRMED",
    worker: null,
    camera: null,
    desc: "유해가스 농도 초과",
    confirmedBy: "김관수",
    confirmedAt: "14:17",
    memo: "",
    isImportant: true,
    result: "탐지",
    sopHistory: [
      { time: "14:15", action: "이벤트 감지", user: "시스템", memo: "" },
      { time: "14:17", action: "확인 조치 서명", user: "김관수", memo: "" },
    ],
  },
  {
    id: "EVT-004",
    zoneId: "z2",
    type: "SOS",
    subtype: "긴급구조요청",
    severity: "CRITICAL",
    time: "2025-05-27 13:55",
    status: "ACTIVE",
    worker: "최동현",
    camera: null,
    desc: "스마트 안전조끼 SOS 신호",
    confirmedBy: null,
    confirmedAt: null,
    memo: "",
    isImportant: true,
    result: null,
    sopHistory: [{ time: "13:55", action: "이벤트 감지", user: "시스템", memo: "" }],
  },
  {
    id: "EVT-005",
    zoneId: "z3",
    type: "센서",
    subtype: "흙막이경사",
    severity: "HIGH",
    time: "2025-05-27 13:40",
    status: "PENDING",
    worker: null,
    camera: "CAM-005",
    desc: "흙막이 경사 한계 돌파",
    confirmedBy: "이현장",
    confirmedAt: null,
    memo: "",
    isImportant: false,
    result: null,
    sopHistory: [
      { time: "13:40", action: "이벤트 감지", user: "시스템", memo: "" },
      { time: "13:42", action: "조치 보류", user: "이현장", memo: "" },
    ],
  },
  {
    id: "EVT-006",
    zoneId: "z1",
    type: "AI",
    subtype: "위험구역진입",
    severity: "LOW",
    time: "2025-05-27 13:22",
    status: "CONFIRMED",
    worker: "정재원",
    camera: "CAM-002",
    desc: "A구역 크레인 하부 무단 진입 감지",
    confirmedBy: "김관수",
    confirmedAt: "13:25",
    memo: "",
    isImportant: false,
    result: "오탐",
    sopHistory: [
      { time: "13:22", action: "이벤트 감지", user: "시스템", memo: "" },
      { time: "13:25", action: "오탐 처리", user: "김관수", memo: "" },
    ],
  },
];

export const CAMERAS: Camera[] = [
  { id: "CAM-001", zoneId: "z1", name: "A구역 정문", type: "고정", status: "ONLINE", hasAI: true },
  { id: "CAM-002", zoneId: "z1", name: "B구역 작업장", type: "회전", status: "ONLINE", hasAI: true },
  { id: "CAM-003", zoneId: "z1", name: "C구역 자재창고", type: "고정", status: "ONLINE", hasAI: false },
  { id: "CAM-004", zoneId: "z1", name: "D구역 이동형", type: "이동형", status: "ONLINE", hasAI: true },
  { id: "CAM-005", zoneId: "z2", name: "A구역 정문", type: "고정", status: "ONLINE", hasAI: true },
  { id: "CAM-006", zoneId: "z2", name: "B구역 작업장", type: "회전", status: "ONLINE", hasAI: false },
  { id: "CAM-ERR", zoneId: "z2", name: "C구역 외곽", type: "고정", status: "ERROR", hasAI: false },
  { id: "CAM-007", zoneId: "z3", name: "A구역 정문", type: "고정", status: "ONLINE", hasAI: true },
];

export const SENSORS: Sensor[] = [
  { id: "S-001", zoneId: "z1", zone: "A구역", type: "CO", name: "일산화탄소", value: 12, unit: "ppm", threshold: 20, status: "NORMAL" },
  { id: "S-002", zoneId: "z1", zone: "B구역", type: "TEMP", name: "온도", value: 32, unit: "°C", threshold: 38, status: "WARNING" },
  { id: "S-003", zoneId: "z1", zone: "B구역", type: "HUMID", name: "습도", value: 78, unit: "%", threshold: 90, status: "NORMAL" },
  { id: "S-004", zoneId: "z2", zone: "C구역", type: "INCLINE", name: "변위·경사", value: 0.82, unit: "°", threshold: 1.0, status: "WARNING" },
  { id: "S-005", zoneId: "z2", zone: "터널", type: "CO2", name: "이산화탄소", value: 850, unit: "ppm", threshold: 1000, status: "WARNING" },
  { id: "S-006", zoneId: "z3", zone: "A구역", type: "DUST", name: "미세먼지", value: 45, unit: "㎍/m³", threshold: 75, status: "NORMAL" },
  { id: "S-007", zoneId: "z3", zone: "A구역", type: "VIBRATION", name: "진동", value: 2.1, unit: "mm/s", threshold: 5.0, status: "NORMAL" },
  { id: "S-008", zoneId: "z4", zone: "B구역", type: "CO", name: "일산화탄소", value: 18, unit: "ppm", threshold: 20, status: "WARNING" },
  { id: "S-ERR", zoneId: "z1", zone: "D구역", type: "CO", name: "일산화탄소", value: null, unit: "ppm", threshold: 20, status: "OFFLINE" },
];

export const COLLAPSE_SENSORS: CollapseSensor[] = [
  { id: "CS-001", zoneId: "z1", location: "흙막이A-1", value: 0.23, threshold: 0.5, status: "NORMAL", lastUpdate: "14:33" },
  { id: "CS-002", zoneId: "z1", location: "흙막이A-2", value: 0.45, threshold: 0.5, status: "WARNING", lastUpdate: "14:33" },
  { id: "CS-003", zoneId: "z2", location: "흙막이B-1", value: 0.82, threshold: 0.5, status: "DANGER", lastUpdate: "14:28" },
  { id: "CS-004", zoneId: "z3", location: "흙막이C-1", value: 0.12, threshold: 0.5, status: "NORMAL", lastUpdate: "14:30" },
];

export const COMPANIES: Company[] = [
  { id: "c1", name: "현대건설", zones: ["z1", "z7"], workers: 275, pm: "홍길동", tel: "02-1234-5678", safetyMgr: "김안전", rating: "A" },
  { id: "c2", name: "삼성물산", zones: ["z2", "z11"], workers: 176, pm: "김철수", tel: "02-2345-6789", safetyMgr: "박안전", rating: "A" },
  { id: "c3", name: "대우건설", zones: ["z3"], workers: 115, pm: "이영희", tel: "02-3456-7890", safetyMgr: "정안전", rating: "B" },
  { id: "c4", name: "GS건설", zones: ["z4", "z12"], workers: 179, pm: "박민수", tel: "02-4567-8901", safetyMgr: "강안전", rating: "B" },
  { id: "c5", name: "롯데건설", zones: ["z5", "z13"], workers: 314, pm: "최지원", tel: "02-5678-9012", safetyMgr: "윤안전", rating: "A" },
  { id: "c6", name: "포스코건설", zones: ["z6"], workers: 176, pm: "정수빈", tel: "02-6789-0123", safetyMgr: "임안전", rating: "B" },
];

export const USERS: User[] = [
  { id: "u1", loginId: "admin", name: "김관수", role: "GH_ADMIN", dept: "GH안전관리센터", zones: "ALL", tel: "010-1111-2222", lastLogin: "2025-05-27 14:30", status: "ACTIVE" },
  { id: "u2", loginId: "site1", name: "이현장", role: "SITE_MGR", dept: "현대건설", zones: "z1,z7", tel: "010-2222-3333", lastLogin: "2025-05-27 13:45", status: "ACTIVE" },
  { id: "u3", loginId: "site2", name: "박현장", role: "SITE_MGR", dept: "삼성물산", zones: "z2,z11", tel: "010-3333-4444", lastLogin: "2025-05-27 12:00", status: "ACTIVE" },
  { id: "u4", loginId: "safety1", name: "최안전", role: "SAFETY", dept: "대우건설", zones: "z3", tel: "010-4444-5555", lastLogin: "2025-05-26 18:00", status: "ACTIVE" },
  { id: "u5", loginId: "viewer1", name: "정보기", role: "VIEWER", dept: "GH본사", zones: "ALL", tel: "010-5555-6666", lastLogin: "2025-05-27 09:00", status: "INACTIVE" },
];

export const TBM_LIST: TbmItem[] = [
  { id: "t1", zoneId: "z1", date: "2025-05-27", zone: "왕숙1구역", total: 142, completed: 139, rate: 97.9, manager: "김관수", time: "07:30" },
  { id: "t2", zoneId: "z2", date: "2025-05-26", zone: "왕숙2구역", total: 98, completed: 95, rate: 96.9, manager: "이현장", time: "07:45" },
  { id: "t3", zoneId: "z3", date: "2025-05-25", zone: "왕숙3구역", total: 115, completed: 108, rate: 93.9, manager: "최안전", time: "08:00" },
  { id: "t4", zoneId: "z1", date: "2025-05-24", zone: "왕숙1구역", total: 138, completed: 138, rate: 100, manager: "김관수", time: "07:30" },
  { id: "t5", zoneId: "z2", date: "2025-05-23", zone: "왕숙2구역", total: 95, completed: 93, rate: 97.9, manager: "이현장", time: "07:45" },
  { id: "t6", zoneId: "z3", date: "2025-05-22", zone: "왕숙3구역", total: 110, completed: 104, rate: 94.5, manager: "박현장", time: "07:50" },
  { id: "t7", zoneId: "z1", date: "2025-05-21", zone: "왕숙1구역", total: 130, completed: 128, rate: 98.4, manager: "최안전", time: "07:40" },
  { id: "t8", zoneId: "z2", date: "2025-05-20", zone: "왕숙2구역", total: 90, completed: 88, rate: 97.7, manager: "김관수", time: "07:35" },
  { id: "t9", zoneId: "z3", date: "2025-05-19", zone: "왕숙3구역", total: 120, completed: 118, rate: 98.3, manager: "이현장", time: "08:05" },
  { id: "t10", zoneId: "z1", date: "2025-05-18", zone: "왕숙1구역", total: 125, completed: 122, rate: 97.6, manager: "박현장", time: "07:45" },
];

export const WORKERS_LOC: WorkerLoc[] = [
  { id: "W-001", name: "박민준", job: "철근공", zoneId: "z1", area: "A구역", tag: "ON", lat: 37.6480, lng: 127.2160, lastUpdate: "14:33", vulnerable: false },
  { id: "W-002", name: "김상훈", job: "형틀목공", zoneId: "z1", area: "B구역", tag: "OFF", lat: 37.6483, lng: 127.2165, lastUpdate: "14:33", vulnerable: false },
  { id: "W-003", name: "이순자", job: "미장공", zoneId: "z1", area: "A구역", tag: "ON", lat: 37.6479, lng: 127.2158, lastUpdate: "14:33", vulnerable: true },
  { id: "W-004", name: "최동현", job: "용접공", zoneId: "z2", area: "C구역", tag: "OFF", lat: 37.6515, lng: 127.2240, lastUpdate: "13:55", vulnerable: false },
  { id: "W-005", name: "정재원", job: "전기공", zoneId: "z2", area: "D구역", tag: "ON", lat: 37.6510, lng: 127.2238, lastUpdate: "14:30", vulnerable: false },
];

export const HOURLY = [0, 0, 0, 1, 0, 0, 1, 3, 6, 9, 8, 6, 10, 7, 12, 9, 5, 3, 2, 1, 0, 0, 0, 0];
export const MONTHLY = [8, 12, 9, 15, 18, 11, 0, 0, 0, 0, 0, 0];

export const DUMMY_ANNOUNCEMENTS = [
  "왕숙1구역 타워크레인 해체 작업 15:00 예정 - 현장 출입 통제 및 무전 철저",
  "전 구역 현대건설 및 삼성물산 안전관리담당자 안전 전략 회의 소집 내일 10:00",
  "태풍 주의보 대비 외곽 차수 및 사면 피복 상태 전면 긴급점검 지시",
  "밀폐공간 일산화탄소(CO) 경고 수치 초과 시 즉각 가동 정지 후 환기 SOP 가동"
];

export const SPA_RANDOM_EVENT_TEMP = [
  { subtype: "안전모미착용", type: "AI", severity: "HIGH", desc: "안전모 미사용 감지", camera: "CAM-001" },
  { subtype: "위험구역진입", type: "AI", severity: "HIGH", desc: "장비 반경 무단 진입", camera: "CAM-004" },
  { subtype: "쓰러짐감지", type: "AI", severity: "CRITICAL", desc: "고소작업대 지상 쓰러짐 감지", camera: "CAM-002" },
  { subtype: "긴급구조요청", type: "SOS", severity: "CRITICAL", desc: "스마트 안전조끼 긴급 SOS 구조 신호", camera: null },
  { subtype: "화재연기감지", type: "AI", severity: "CRITICAL", desc: "제2자재창고 인근 흰색 연기 감지", camera: "CAM-005" },
  { subtype: "변위이상", type: "DEVICE", severity: "HIGH", desc: "흙막이 인클라인 경사 오차 한계 돌파", camera: null },
  { subtype: "가스누출감지", type: "DEVICE", severity: "CRITICAL", desc: "지하터널 메탄 가스 잔여 2.5% 돌파", camera: null }
];
