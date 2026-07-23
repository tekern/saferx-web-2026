/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Sensor, Zone } from "../types";
import { ZONES } from "../data";
import { 
  Wifi, WifiOff, AlertTriangle, CheckCircle, BarChart3, X, 
  Wind, Thermometer, Droplets, Compass, BellRing
} from "lucide-react";

interface SensorsViewProps {
  currentZoneFilter: string;
  navigate: (page: string, params?: any) => void;
  availableZones?: Zone[];
}

export interface SensorDevice {
  id: string; // "S-002/S-003" or "S-004", etc.
  name: string;
  zoneId: string;
  zone: string; // e.g. "B구역" or "C구역"
  status: 'NORMAL' | 'WARNING' | 'DANGER' | 'OFFLINE';
  type: 'TEMP_HUMID' | 'INCLINE' | 'CO2' | 'VIBRATION' | 'GASS';
  isIntegrated: boolean;
  lastUpdate?: string;
  
  // Single sensor type attributes
  value?: number;
  unit?: string;
  threshold?: number;

  // Integrated sensor type attributes
  temp?: {
    value: number;
    unit: string;
    threshold: number;
    status: 'NORMAL' | 'WARNING' | 'OFFLINE';
    id: string;
  };
  humid?: {
    value: number;
    unit: string;
    threshold: number;
    status: 'NORMAL' | 'WARNING' | 'OFFLINE';
    id: string;
  };

  // Gass attributes
  gass?: {
    o2: { value: number };
    co: { value: number };
    h2s: { value: number };
    ch4: { value: number };
    co2: { value: number };
  };
}

const DEVICES: SensorDevice[] = [
  {
    id: "S-002/S-003",
    name: "온습도 센서",
    zoneId: "z1",
    zone: "B구역",
    status: "WARNING",
    type: "TEMP_HUMID",
    isIntegrated: true,
    temp: {
      id: "S-002",
      value: 32,
      unit: "°C",
      threshold: 38,
      status: "WARNING"
    },
    humid: {
      id: "S-003",
      value: 78,
      unit: "%",
      threshold: 90,
      status: "NORMAL"
    }
  },
  {
    id: "S-004",
    name: "변위·경사 센서",
    zoneId: "z2",
    zone: "C구역",
    status: "WARNING",
    type: "INCLINE",
    isIntegrated: false,
    value: 0.82,
    unit: "°",
    threshold: 1.0
  },
  {
    id: "S-007",
    name: "진동 센서",
    zoneId: "z3",
    zone: "A구역",
    status: "NORMAL",
    type: "VIBRATION",
    isIntegrated: false,
    value: 2.1,
    unit: "mm/s",
    threshold: 5.0
  },
  {
    id: "S-009",
    name: "변위·경사 센서",
    zoneId: "z3",
    zone: "B구역",
    status: "NORMAL",
    type: "INCLINE",
    isIntegrated: false,
    value: 0.12,
    unit: "°",
    threshold: 1.0
  },
  {
    id: "S-011",
    name: "에어 가스 센서 #1",
    zoneId: "z1",
    zone: "D구역",
    status: "WARNING",
    type: "GASS",
    isIntegrated: false,
    lastUpdate: "금일 14:35",
    gass: {
      o2: { value: 19.1 },
      co: { value: 28 },
      h2s: { value: 0.3 },
      ch4: { value: 5 },
      co2: { value: 890 }
    }
  },
  {
    id: "S-012",
    name: "에어 가스 센서 #2",
    zoneId: "z2",
    zone: "E구역",
    status: "NORMAL",
    type: "GASS",
    isIntegrated: false,
    lastUpdate: "금일 14:33",
    gass: {
      o2: { value: 20.9 },
      co: { value: 5 },
      h2s: { value: 0 },
      ch4: { value: 2 },
      co2: { value: 420 }
    }
  }
];

interface MockEventHistory {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  time: string;
  value: string;
  eventId: string;
}

const DEVICE_HISTORIES: Record<string, MockEventHistory[]> = {
  "S-002/S-003": [
    {
      severity: "HIGH",
      title: "주의 값 도달 알림",
      time: "13:55:20 발생",
      value: "온도: 32°C",
      eventId: "EVT-001"
    }
  ],
  "S-004": [
    {
      severity: "CRITICAL",
      title: "임계치 초과 알림",
      time: "14:22:15 발생",
      value: "0.95°",
      eventId: "EVT-006"
    },
    {
      severity: "HIGH",
      title: "주의 값 도달 알림",
      time: "09:12:44 발생",
      value: "0.78°",
      eventId: "EVT-006"
    }
  ],
  "S-005": [
    {
      severity: "HIGH",
      title: "주의 값 도달 알림",
      time: "10:15:30 발생",
      value: "850 ppm",
      eventId: "EVT-001"
    }
  ],
  "S-007": [],
  "S-009": [],
  "S-011": [
    {
      severity: "CRITICAL",
      title: "O2 산소결핍 경보",
      time: "14:22:15 발생",
      value: "17.2%",
      eventId: "EVT-011"
    },
    {
      severity: "HIGH",
      title: "CO 주의값 도달",
      time: "09:12:44 발생",
      value: "28ppm",
      eventId: "EVT-012"
    }
  ],
  "S-012": []
};

interface GasMeta {
  label: string;
  unit: string;
  warnThreshold: number;
  dangerThreshold: number;
  direction: 'down' | 'up';
}

export const GAS_METAS: Record<string, GasMeta> = {
  O2: { label: "O2 (산소)", unit: "%", warnThreshold: 19.5, dangerThreshold: 18.0, direction: 'down' },
  CO: { label: "CO (일산화탄소)", unit: "ppm", warnThreshold: 25, dangerThreshold: 50, direction: 'up' },
  H2S: { label: "H2S (황화수소)", unit: "ppm", warnThreshold: 1, dangerThreshold: 5, direction: 'up' },
  CH4: { label: "CH4 (가연성가스)", unit: "%LEL", warnThreshold: 10, dangerThreshold: 25, direction: 'up' },
  CO2: { label: "CO2 (이산화탄소)", unit: "ppm", warnThreshold: 1000, dangerThreshold: 2000, direction: 'up' }
};

export function getGasStatus(gasKey: string, val: number): 'NORMAL' | 'WARNING' | 'DANGER' {
  const meta = GAS_METAS[gasKey];
  if (!meta) return 'NORMAL';
  if (meta.direction === 'down') {
    if (val < meta.dangerThreshold) return 'DANGER';
    if (val < meta.warnThreshold) return 'WARNING';
    return 'NORMAL';
  } else {
    if (val >= meta.dangerThreshold) return 'DANGER';
    if (val >= meta.warnThreshold) return 'WARNING';
    return 'NORMAL';
  }
}

// Generates deterministic mock data based on seed
const getMockData = (device: SensorDevice, timeframe: 'daily' | 'weekly' | 'monthly', selectedGas: string = 'CO') => {
  const baseValue = device.isIntegrated 
    ? (device.temp?.value || 30) 
    : device.type === 'GASS'
      ? (device.gass?.[selectedGas.toLowerCase() as 'o2' | 'co' | 'h2s' | 'ch4' | 'co2']?.value || 10)
      : (device.value || 0.5);
  
  const count = timeframe === 'daily' ? 24 : timeframe === 'weekly' ? 7 : 30;

  const getRand = (index: number) => {
    const s = Math.sin(index + (device.id === 'S-002/S-003' ? 1.5 : 0.8)) * 10000;
    return s - Math.floor(s);
  };

  return Array.from({ length: count }, (_, i) => {
    const rand = getRand(i);
    let val = baseValue * (0.8 + rand * 0.4);
    if (device.type === 'GASS' && selectedGas === 'O2') {
      val = baseValue * (0.95 + rand * 0.1);
      val = Math.min(22, Math.max(16, val));
    }
    
    let timeLabel = "";
    if (timeframe === 'daily') {
      timeLabel = `${String(i).padStart(2, '0')}:00`;
    } else if (timeframe === 'weekly') {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      timeLabel = days[i % 7];
    } else {
      timeLabel = `${i + 1}일`;
    }

    return { time: timeLabel, value: Number(val.toFixed(2)) };
  });
};

const getBezierPath = (pts: {x: number, y: number}[]) => {
  if (pts.length === 0) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const cpX1 = p0.x + (p1.x - p0.x) / 3;
    const cpY1 = p0.y;
    const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
    const cpY2 = p1.y;
    d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }
  return d;
};

function SensorTrendChart({ device, timeframe, selectedGas = "CO" }: { device: SensorDevice, timeframe: 'daily' | 'weekly' | 'monthly', selectedGas?: string }) {
  const data = getMockData(device, timeframe, selectedGas);
  
  const isGas = device.type === 'GASS';
  const meta = isGas ? GAS_METAS[selectedGas] : null;

  const threshold = isGas
    ? (meta?.warnThreshold || 25)
    : device.isIntegrated 
      ? (device.temp?.threshold || 38) 
      : (device.threshold || 1.0);

  const unit = isGas
    ? (meta?.unit || "ppm")
    : device.isIntegrated 
      ? (device.temp?.unit || "°C") 
      : (device.unit || "°");

  const W = 340;
  const H = 140;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 25;

  const chartWidth = W - paddingLeft - paddingRight;
  const chartHeight = H - paddingTop - paddingBottom;

  const maxValInData = Math.max(...data.map(d => d.value), isGas && meta ? meta.dangerThreshold : threshold);
  const maxY = maxValInData * 1.25 || 1;

  const pts = data.map((item, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = H - paddingBottom - (item.value / maxY) * chartHeight;
    return { x, y, ...item };
  });

  const pathD = getBezierPath(pts);
  const thresholdY = H - paddingBottom - (threshold / maxY) * chartHeight;

  let strokeColor = "#00c853"; // NORMAL
  let currentStatus = device.status;
  if (isGas && device.gass) {
    const gasVal = device.gass[selectedGas.toLowerCase() as 'o2' | 'co' | 'h2s' | 'ch4' | 'co2']?.value || 0;
    currentStatus = getGasStatus(selectedGas, gasVal);
  }

  if (currentStatus === "WARNING") {
    strokeColor = "#d4780a"; // WARNING
  } else if (currentStatus === "DANGER") {
    strokeColor = "#e03030"; // DANGER
  } else if (currentStatus === "OFFLINE") {
    strokeColor = "#7a8a99"; // OFFLINE
  }

  // Y Axis ticks
  const yGrids = isGas
    ? [0, 0.3, 0.6, 0.9].map(v => maxY * v)
    : [0, 0.5, 1.0, 1.3].map(v => threshold * v);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[140px] overflow-visible select-none">
        {/* Horizontal grid lines */}
        {yGrids.map((gVal, idx) => {
          const y = H - paddingBottom - (gVal / maxY) * chartHeight;
          if (y < paddingTop || y > H - paddingBottom) return null;
          return (
            <g key={idx}>
              <line 
                x1={paddingLeft} 
                y1={y} 
                x2={W - paddingRight} 
                y2={y} 
                stroke="rgba(255,255,255,0.05)" 
                strokeWidth="1" 
              />
              <text 
                x={paddingLeft - 6} 
                y={y + 3} 
                fill="#8f9cae" 
                fontSize="8" 
                textAnchor="end" 
                className="font-mono opacity-80"
              >
                {gVal.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* X axis ticks */}
        {pts.map((pt, idx) => {
          const skip = timeframe === 'daily' ? (idx % 6 === 0) : timeframe === 'weekly' ? true : (idx % 7 === 0 || idx === data.length - 1);
          if (!skip) return null;

          return (
            <text 
              key={idx} 
              x={pt.x} 
              y={H - 8} 
              fill="#8f9cae" 
              fontSize="8" 
              textAnchor="middle" 
              className="font-mono opacity-80"
            >
              {pt.time}
            </text>
          );
        })}

        {/* Dashed Threshold lines */}
        {isGas && meta ? (
          <>
            {/* Warning Threshold */}
            <line 
              x1={paddingLeft} 
              y1={H - paddingBottom - (meta.warnThreshold / maxY) * chartHeight} 
              x2={W - paddingRight} 
              y2={H - paddingBottom - (meta.warnThreshold / maxY) * chartHeight} 
              stroke="#d4780a" 
              strokeDasharray="4,4" 
              strokeWidth="1.0" 
            />
            <text 
              x={W - paddingRight} 
              y={(H - paddingBottom - (meta.warnThreshold / maxY) * chartHeight) - 3} 
              fill="#d4780a" 
              fontSize="7" 
              textAnchor="end" 
              className="font-mono font-medium"
            >
              주의 ({meta.warnThreshold}{unit})
            </text>

            {/* Danger Threshold */}
            <line 
              x1={paddingLeft} 
              y1={H - paddingBottom - (meta.dangerThreshold / maxY) * chartHeight} 
              x2={W - paddingRight} 
              y2={H - paddingBottom - (meta.dangerThreshold / maxY) * chartHeight} 
              stroke="#e03030" 
              strokeDasharray="4,4" 
              strokeWidth="1.0" 
            />
            <text 
              x={W - paddingRight} 
              y={(H - paddingBottom - (meta.dangerThreshold / maxY) * chartHeight) - 3} 
              fill="#e03030" 
              fontSize="7" 
              textAnchor="end" 
              className="font-mono font-medium"
            >
              위험 ({meta.dangerThreshold}{unit})
            </text>
          </>
        ) : (
          <>
            <line 
              x1={paddingLeft} 
              y1={thresholdY} 
              x2={W - paddingRight} 
              y2={thresholdY} 
              stroke="#e03030" 
              strokeDasharray="5,5" 
              strokeWidth="1.2" 
            />
            <text 
              x={W - paddingRight} 
              y={thresholdY - 4} 
              fill="#e03030" 
              fontSize="8" 
              textAnchor="end" 
              className="font-mono font-medium"
            >
              임계치 ({threshold} {unit})
            </text>
          </>
        )}

        {/* Shaded background gradient Area */}
        {pts.length > 0 && (
          <path
            d={`M ${pts[0].x} ${H - paddingBottom} ${pathD.replace('M', 'L')} L ${pts[pts.length - 1].x} ${H - paddingBottom} Z`}
            fill={`url(#lineGrad-${device.id})`}
            opacity="0.12"
          />
        )}

        {/* Beautiful continuous line */}
        <path 
          d={pathD} 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="2" 
        />

        {/* Interactive nodes */}
        {pts.map((pt, idx) => {
          const skipDot = timeframe === 'daily' ? (idx % 2 === 0) : true;
          if (!skipDot) return null;
          return (
            <circle 
              key={idx} 
              cx={pt.x} 
              cy={pt.y} 
              r="3" 
              fill={strokeColor} 
              stroke="#0b1528" 
              strokeWidth="1" 
              className="hover:scale-150 transition-transform cursor-pointer"
            />
          );
        })}

        <defs>
          <linearGradient id={`lineGrad-${device.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function SensorsView({ currentZoneFilter, navigate, availableZones }: SensorsViewProps) {
  const [filterZone, setFilterZone] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [excludeOffline, setExcludeOffline] = useState(false);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedGas, setSelectedGas] = useState<'O2' | 'CO' | 'H2S' | 'CH4' | 'CO2'>('CO');

  const zoneList = availableZones || ZONES;

  const selectedZone = filterZone === "ALL" ? currentZoneFilter : filterZone;

  // Compute metrics
  const totalCount = DEVICES.length;
  const normalCount = DEVICES.filter(d => d.status === "NORMAL").length;
  const warningCount = DEVICES.filter(d => d.status === "WARNING" || d.status === "DANGER").length;
  const offlineCount = DEVICES.filter(d => d.status === "OFFLINE").length;

  const filteredDevices = DEVICES.filter((d) => {
    if (selectedZone !== "ALL") {
      if (d.zoneId !== selectedZone) return false;
    } else {
      if (!zoneList.some(z => z.id === d.zoneId)) return false;
    }
    if (filterType !== "ALL" && d.type !== filterType) return false;
    if (excludeOffline && d.status === "OFFLINE") return false;
    return true;
  });

  const getStatusBadge = (status: 'NORMAL' | 'WARNING' | 'DANGER' | 'OFFLINE') => {
    switch (status) {
      case "NORMAL":
        return (
          <span 
            className="px-2 py-0.5 bg-[rgba(34,197,94,0.10)] text-[#22C55E] border border-[rgba(34,197,94,0.20)] rounded-[5px] text-[11px] font-semibold"
          >
            NORMAL
          </span>
        );
      case "WARNING":
        return (
          <span 
            className="px-2 py-0.5 bg-[rgba(245,158,11,0.10)] text-[#F59E0B] border border-[rgba(245,158,11,0.20)] rounded-[5px] text-[11px] font-semibold animate-pulse"
          >
            WARNING
          </span>
        );
      case "DANGER":
        return (
          <span 
            className="px-2 py-0.5 bg-[rgba(239,68,68,0.10)] text-[#EF4444] border border-[rgba(239,68,68,0.20)] rounded-[5px] text-[11px] font-semibold animate-pulse"
          >
            DANGER
          </span>
        );
      case "OFFLINE":
        return (
          <span 
            className="px-2 py-0.5 bg-[rgba(42,42,47,0.80)] text-[#8A8A96] border border-[#333338] rounded-[5px] text-[11px] font-semibold"
          >
            OFFLINE
          </span>
        );
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case "TEMP_HUMID":
        return <Thermometer className="w-4.5 h-4.5 text-orange" />;
      case "CO2":
        return <Wind className="w-4.5 h-4.5 text-cyan" />;
      case "INCLINE":
        return <Compass className="w-4.5 h-4.5 text-purple-400" />;
      case "VIBRATION":
        return <BellRing className="w-4.5 h-4.5 text-green" />;
      case "GASS":
        return <Wind className="w-4.5 h-4.5 text-cyan animate-pulse" />;
      default:
        return <Wifi className="w-4.5 h-4.5 text-cyan" />;
    }
  };

  const getZoneName = (zoneId: string) => {
    const found = ZONES.find(z => z.id === zoneId);
    return found ? found.name : zoneId;
  };

  const activeDevice = DEVICES.find(d => d.id === selectedSensorId) || null;
  const activeHistories = selectedSensorId ? (DEVICE_HISTORIES[selectedSensorId] || []) : [];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-4 page-transition relative min-h-screen bg-[#111113]">
      {/* 🏷 KPIs Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#19191C] border border-[#2A2A2F] rounded-[10px] px-5 py-4 flex items-center justify-between">
          <div>
            <span className="text-[12px] text-[#8A8A96] block">전체 장비</span>
            <span className="block text-[26px] font-bold text-[#ECECEC] mt-0.5">{totalCount}개</span>
          </div>
          <Wifi className="w-8 h-8 text-[#00D1E8]" />
        </div>

        <div className="bg-[#19191C] border border-[#2A2A2F] rounded-[10px] px-5 py-4 flex items-center justify-between">
          <div>
            <span className="text-[12px] text-[#8A8A96] block">정상 가동</span>
            <span className="block text-[26px] font-bold text-[#22C55E] mt-0.5">{normalCount}개</span>
          </div>
          <CheckCircle className="w-8 h-8 text-[#22C55E]" />
        </div>

        <div className="bg-[#19191C] border border-[#2A2A2F] rounded-[10px] px-5 py-4 flex items-center justify-between">
          <div>
            <span className="text-[12px] text-[#8A8A96] block">주의/경고</span>
            <span className="block text-[26px] font-bold text-[#F59E0B] mt-0.5">{warningCount}개</span>
          </div>
          <AlertTriangle className="w-8 h-8 text-[#F59E0B]" />
        </div>

        <div className="bg-[#19191C] border border-[#2A2A2F] rounded-[10px] px-5 py-4 flex items-center justify-between">
          <div>
            <span className="text-[12px] text-[#8A8A96] block">연결끊김</span>
            <span className="block text-[26px] font-bold text-[#EF4444] mt-0.5">{offlineCount}개</span>
          </div>
          <WifiOff className="w-8 h-8 text-[#EF4444]" />
        </div>
      </div>

      {/* 🛠 Filters toolbar */}
      <div className="bg-[#19191C] border border-[#2A2A2F] rounded-lg px-4 py-3 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Zone filter */}
          <div className="flex flex-col">
            <span className="text-[12px] text-[#8A8A96] font-bold mb-1">설치 현장</span>
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="bg-[#222226] border border-[#333338] text-[#ECECEC] text-xs px-2.5 py-1.5 rounded-[6px] focus:outline-none"
            >
              <option value="ALL">전체 현장 구역</option>
              {zoneList.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>

          {/* Type filter */}
          <div className="flex flex-col">
            <span className="text-[12px] text-[#8A8A96] font-bold mb-1">센서 종류</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#222226] border border-[#333338] text-[#ECECEC] text-xs px-2.5 py-1.5 rounded-[6px] focus:outline-none"
            >
              <option value="ALL">전체</option>
              <option value="TEMP_HUMID">온습도</option>
              <option value="INCLINE">변위·경사</option>
              <option value="VIBRATION">진동</option>
              <option value="GASS">가스감지</option>
            </select>
          </div>

          {/* Exclude offline */}
          <label className="flex items-center gap-2 text-xs text-[#C8C8D0] cursor-pointer hover:text-[#ECECEC] pt-4 select-none">
            <input
              type="checkbox"
              checked={excludeOffline}
              onChange={(e) => setExcludeOffline(e.target.checked)}
              className="accent-cyan w-4 h-4 rounded border-border-main"
            />
            <span>연결끊김 기기 제외</span>
          </label>
        </div>
      </div>

      {/* Cards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((device) => {
          const isSelected = selectedSensorId === device.id;
          
          if (device.isIntegrated) {
            // 온습도 integrated layout
            return (
              <div
                key={device.id}
                onClick={() => setSelectedSensorId(device.id)}
                className={`bg-[#222226] rounded-xl px-4 py-3.5 cursor-pointer transition-all flex flex-col justify-between space-y-3.5 ${
                  isSelected 
                    ? "border border-[#00D1E8] shadow-[0_0_12px_rgba(0,209,232,0.2)]" 
                    : "border border-[#333338] hover:border-[#00A8BC]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#19191C] border border-[#2A2A2F] rounded-lg shrink-0">
                      {getSensorIcon("TEMP_HUMID")}
                    </div>
                    <div>
                      <h5 className="font-semibold text-[13px] text-[#ECECEC]">🌡 {device.name}</h5>
                      <p className="text-[11px] text-[#8A8A96] mt-0.5">
                        구역: {getZoneName(device.zoneId)} | {device.zone}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(device.status)}
                </div>

                <div className="space-y-3 py-1">
                  {/* Temp */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-[#C8C8D0]">온도 <span className="font-semibold text-[#F59E0B]">32°C</span></span>
                      <span className="text-[#8A8A96]">임계치: 38°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#2A2A2F] h-[3px] rounded-[2px] overflow-hidden relative">
                        <div 
                          style={{ width: '84.2%' }} 
                          className="h-full bg-[#F59E0B] animate-pulse transition-all duration-500"
                        />
                      </div>
                      <span className="text-[9px] text-[#F59E0B] font-bold font-mono min-w-[24px] text-right">84%</span>
                    </div>
                  </div>

                  {/* Humidity */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-[#C8C8D0]">습도 <span className="font-semibold text-[#22C55E]">78%</span></span>
                      <span className="text-[#8A8A96]">임계치: 90%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#2A2A2F] h-[3px] rounded-[2px] overflow-hidden relative">
                        <div 
                          style={{ width: '86.7%' }} 
                          className="h-full bg-[#22C55E] transition-all duration-500"
                        />
                      </div>
                      <span className="text-[9px] text-[#22C55E] font-bold font-mono min-w-[24px] text-right">87%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#2A2A2F] flex items-center justify-between text-[11px] text-[#8A8A96]">
                  <span>센서 ID: <span className="font-mono text-[#00D1E8]">{device.id}</span></span>
                  <span>업데이트: 금일 14:33</span>
                </div>
              </div>
            );
          }

          if (device.type === 'GASS' && device.gass) {
            return (
              <div
                key={device.id}
                onClick={() => setSelectedSensorId(device.id)}
                className={`bg-[#222226] rounded-xl px-4 py-3.5 cursor-pointer transition-all flex flex-col justify-between space-y-3.5 ${
                  isSelected 
                    ? "border border-[#00D1E8] shadow-[0_0_12px_rgba(0,209,232,0.2)]" 
                    : "border border-[#333338] hover:border-[#00A8BC]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#19191C] border border-[#2A2A2F] rounded-lg shrink-0">
                      {getSensorIcon(device.type)}
                    </div>
                    <div>
                      <h5 className="font-semibold text-[13px] text-[#ECECEC]">💨 {device.name}</h5>
                      <p className="text-[11px] text-[#8A8A96] mt-0.5">
                        구역: {getZoneName(device.zoneId)} | {device.zone}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(device.status)}
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-1">
                  {Object.entries(GAS_METAS).map(([key, meta]) => {
                    const gasData = device.gass![key.toLowerCase() as 'o2' | 'co' | 'h2s' | 'ch4' | 'co2'];
                    if (!gasData) return null;
                    const gasVal = gasData.value;
                    const gasStatus = getGasStatus(key, gasVal);

                    const maxProgressRange = key === 'O2' ? 25 : key === 'CO' ? 60 : key === 'H2S' ? 10 : key === 'CH4' ? 50 : 3000;
                    const progressPercent = Math.min(100, Math.max(0, (gasVal / maxProgressRange) * 100));

                    let barColor = "bg-[#22C55E]";
                    let textColor = "text-[#22C55E]";
                    if (gasStatus === "WARNING") {
                      barColor = "bg-[#F59E0B] animate-pulse";
                      textColor = "text-[#F59E0B]";
                    } else if (gasStatus === "DANGER") {
                      barColor = "bg-[#EF4444] animate-pulse";
                      textColor = "text-[#EF4444]";
                    }

                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-[#C8C8D0]">{meta.label.split(' ')[0]}</span>
                          <span className={`font-bold ${textColor}`}>{gasVal} {meta.unit}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 bg-[#2A2A2F] h-[3px] rounded-[2px] overflow-hidden relative">
                            <div 
                              style={{ width: `${progressPercent}%` }} 
                              className={`h-full ${barColor} transition-all duration-500`}
                            />
                          </div>
                          <span className="text-[8px] text-[#8A8A96] font-mono min-w-[20px] text-right">
                            {Math.round(progressPercent)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-[#2A2A2F] flex items-center justify-between text-[11px] text-[#8A8A96]">
                  <span>센서 ID: <span className="font-mono text-[#00D1E8]">{device.id}</span></span>
                  <span>업데이트: {device.lastUpdate || "금일 14:33"}</span>
                </div>
              </div>
            );
          }

          // Single sensor layout
          return (
            <div
              key={device.id}
              onClick={() => setSelectedSensorId(device.id)}
              className={`bg-[#222226] rounded-xl px-4 py-3.5 cursor-pointer transition-all flex flex-col justify-between space-y-3.5 ${
                isSelected 
                  ? "border border-[#00D1E8] shadow-[0_0_12px_rgba(0,209,232,0.2)]" 
                  : "border border-[#333338] hover:border-[#00A8BC]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#19191C] border border-[#2A2A2F] rounded-lg shrink-0">
                    {getSensorIcon(device.type)}
                  </div>
                  <div>
                    <h5 className="font-semibold text-[13px] text-[#ECECEC]">{device.name}</h5>
                    <p className="text-[11px] text-[#8A8A96] mt-0.5">
                      구역: {getZoneName(device.zoneId)} | {device.zone}
                    </p>
                  </div>
                </div>
                {getStatusBadge(device.status)}
              </div>

              <div className="flex items-baseline justify-between">
                <div className="font-display font-extrabold text-2xl tracking-tight">
                  <span className={device.status === "WARNING" ? "text-[#F59E0B]" : device.status === "DANGER" ? "text-[#EF4444]" : "text-[#00D1E8]"}>
                    {device.value?.toLocaleString()}
                  </span>
                  <span className="text-[12px] text-[#8A8A96] font-normal ml-1 font-mono">{device.unit}</span>
                </div>
                <div className="text-[11px] text-[#8A8A96] font-mono">
                  임계치: {device.threshold} {device.unit}
                </div>
              </div>

              <div className="space-y-1">
                <div className="w-full bg-[#2A2A2F] h-[3px] rounded-[2px] overflow-hidden relative">
                  <div
                    style={{ width: `${Math.min(100, Math.max(0, ((device.value || 0) / (device.threshold || 1)) * 100))}%` }}
                    className={`h-full ${device.status === 'WARNING' ? 'bg-[#F59E0B] animate-pulse' : device.status === 'DANGER' ? 'bg-[#EF4444] animate-pulse' : 'bg-[#22C55E]'} transition-all duration-500`}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-[#8A8A96] font-mono">
                  <span>정상치</span>
                  <span>임계치</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#2A2A2F] flex items-center justify-between text-[11px] text-[#8A8A96]">
                <span>센서 ID: <span className="font-mono text-[#00D1E8]">{device.id}</span></span>
                <span>업데이트: 금일 14:33</span>
              </div>
            </div>
          );
        })}

        {filteredDevices.length === 0 && (
          <div className="col-span-full py-16 text-center text-text-dim border border-dashed border-border-main rounded-xl flex flex-col items-center justify-center gap-2">
            <WifiOff className="w-8 h-8 text-text-dim" />
            <p className="text-sm">관측 필터에 부합하는 활성 기기가 등록되어 있지 않습니다.</p>
          </div>
        )}
      </div>

      {/* Slide-out Panel */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-[380px] h-screen m-0 p-0 rounded-none shadow-none z-[500] transform transition-transform duration-300 flex flex-col justify-between ${
          activeDevice ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ 
          background: '#19191C', 
          borderLeft: '1px solid #2A2A2F',
          borderTop: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          margin: 0,
          padding: 0,
          paddingTop: 0,
          borderRadius: 0,
          boxShadow: 'none'
        }}
      >
        {activeDevice && (
          <>
            {/* TopBar spacer */}
            <div style={{ height: '48px', flexShrink: 0 }} />

            {/* Header */}
            <div className="sticky top-0 bg-[#19191C] px-4 py-3 border-b border-[#2A2A2F] z-20 flex items-center justify-between select-none shrink-0">
              <div className="flex items-center gap-1.5 text-[#00D1E8]">
                <BarChart3 className="w-4.5 h-4.5 animate-pulse text-[#00D1E8]" />
                <span className="font-bold text-sm text-[#ECECEC]">📊 센서 상세 정보</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => triggerToast("다운로드 준비 중...")}
                  className="text-xs text-[#C8C8D0] hover:text-[#ECECEC] border border-[#333338] px-2 py-1 rounded bg-[#222226] transition-colors"
                >
                  csv 다운로드
                </button>
                <button 
                  onClick={() => setSelectedSensorId(null)}
                  className="text-[#8A8A96] hover:text-[#ECECEC] p-1 rounded hover:bg-[#222226] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Basic Meta fields */}
              <div className="bg-[#222226] border border-[#2A2A2F] p-4 rounded-xl space-y-3 select-none">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#00D1E8]">{activeDevice.id}</span>
                  {getStatusBadge(activeDevice.status)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#ECECEC] leading-tight">{activeDevice.name}</h3>
                  <p className="text-xs text-[#8A8A96] mt-1">
                    {getZoneName(activeDevice.zoneId)} | {activeDevice.zone}
                  </p>
                </div>
                <hr className="border-[#2A2A2F]" />

                {/* Values mapping */}
                {activeDevice.type === 'GASS' ? (
                  <div className="space-y-2.5">
                    <span className="text-[11px] text-[#8A8A96] block mb-1 font-semibold">5종 가스 측정값 상세 (클릭하여 트렌드 조회)</span>
                    <div className="space-y-1.5">
                      {Object.entries(GAS_METAS).map(([key, meta]) => {
                        const isGasSelected = selectedGas === key;
                        const gasData = activeDevice.gass![key.toLowerCase() as 'o2' | 'co' | 'h2s' | 'ch4' | 'co2'];
                        if (!gasData) return null;
                        const gasVal = gasData.value;
                        const gasStatus = getGasStatus(key, gasVal);

                        const maxProgressRange = key === 'O2' ? 25 : key === 'CO' ? 60 : key === 'H2S' ? 10 : key === 'CH4' ? 50 : 3000;
                        const progressPercent = Math.min(100, Math.max(0, (gasVal / maxProgressRange) * 100));

                        let barColor = "bg-[#22C55E]";
                        let textColor = "text-[#22C55E]";
                        let bgHighlight = isGasSelected 
                          ? "bg-[rgba(0,209,232,0.1)] border border-[#00D1E8]" 
                          : "bg-[#19191C]/40 hover:bg-[#19191C]/80 border border-[#2A2A2F]";
                        
                        if (gasStatus === "WARNING") {
                          barColor = "bg-[#F59E0B] animate-pulse";
                          textColor = "text-[#F59E0B]";
                          if (isGasSelected) bgHighlight = "bg-[rgba(245,158,11,0.15)] border border-[#F59E0B]";
                        } else if (gasStatus === "DANGER") {
                          barColor = "bg-[#EF4444] animate-pulse";
                          textColor = "text-[#EF4444]";
                          if (isGasSelected) bgHighlight = "bg-[rgba(239,68,68,0.15)] border border-[#EF4444]";
                        }

                        return (
                          <div
                            key={key}
                            onClick={() => setSelectedGas(key as any)}
                            className={`p-2.5 rounded-lg cursor-pointer transition-all ${bgHighlight} flex flex-col space-y-1`}
                          >
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#ECECEC] text-[12px] font-mono">{key}</span>
                                <span className="text-[11px] text-[#8A8A96]">({meta.label})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-[#8A8A96] font-mono">기준: {meta.warnThreshold} / {meta.dangerThreshold} {meta.unit}</span>
                                <span className={`font-mono font-extrabold text-[12px] ${textColor}`}>{gasVal} {meta.unit}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-[#2A2A2F] h-[3px] rounded-[2px] overflow-hidden relative">
                                <div 
                                  style={{ width: `${progressPercent}%` }} 
                                  className={`h-full ${barColor} transition-all duration-500`}
                                />
                              </div>
                              <span className="text-[9px] text-[#8A8A96] font-mono min-w-[24px] text-right">
                                {Math.round(progressPercent)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : activeDevice.isIntegrated ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[11px] text-[#8A8A96] block">현재 측정값</span>
                        <div className="text-2xl font-black text-[#F59E0B] mt-1">
                          🌡 {activeDevice.temp?.value}°C 
                        </div>
                        <div className="text-xl font-bold text-[#22C55E] mt-1">
                          💧 {activeDevice.humid?.value}%
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <span className="text-[11px] text-[#8A8A96] block">금일 최고치</span>
                        <div className="text-[#C8C8D0] mt-1 font-semibold">
                          최고: 34.5°C
                        </div>
                        <div className="text-[#8A8A96] text-[10px]">
                          14:15 발생
                        </div>
                        <div className="text-[#C8C8D0] mt-1.5 font-semibold">
                          최고: 80%
                        </div>
                        <div className="text-[#8A8A96] text-[10px]">
                          11:30 발생
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[11px] text-[#8A8A96] block">현재 측정값</span>
                      <div className="text-2xl font-black text-[#F59E0B] mt-1">
                        {activeDevice.value?.toLocaleString()} {activeDevice.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-[#8A8A96] block">금일 최고치</span>
                      <div className="text-sm font-bold text-[#ECECEC] mt-1">
                        {(activeDevice.value ? activeDevice.value * 1.15 : 0.95).toFixed(2)} {activeDevice.unit}
                      </div>
                      <div className="text-[10px] text-[#8A8A96] mt-0.5">
                        14:15 발생
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chart tabs */}
              <div className="space-y-2 select-none">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#ECECEC]">
                    📈 {activeDevice.type === 'GASS' ? `${selectedGas} 데이터 추이` : '센서 데이터 추이'}
                  </span>
                  <div className="flex gap-1">
                    {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setTimeframe(tab)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                          timeframe === tab 
                            ? "bg-[#00D1E8] text-[#111113] border-[#00D1E8]" 
                            : "bg-[#222226] text-[#C8C8D0] border-[#333338] hover:text-[#ECECEC]"
                        }`}
                      >
                        {tab === 'daily' ? '일간' : tab === 'weekly' ? '주간' : '월간'}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="p-3 bg-[#111113] border border-[#2A2A2F] rounded-xl flex items-center justify-center">
                  <SensorTrendChart device={activeDevice} timeframe={timeframe} selectedGas={selectedGas} />
                </div>
              </div>

              {/* Event Logs history */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs select-none">
                  <span className="font-bold text-[#ECECEC] text-[13px]">📋 금일 감지 이력</span>
                  <span className="text-[#8A8A96] text-[11px]">최신순 정렬</span>
                </div>

                {activeHistories.length === 0 ? (
                  <div className="bg-[#111113] rounded-xl py-8 text-center text-[#8A8A96] border border-dashed border-[#2A2A2F] text-xs">
                    금일 감지 이력이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    {activeHistories.map((hist, idx) => {
                      const isCritical = hist.severity === 'CRITICAL';
                      return (
                        <div 
                          key={idx}
                          className={`p-3 rounded-lg border flex flex-col justify-between space-y-1.5 ${
                            isCritical 
                              ? "bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)] text-[#EF4444]" 
                              : "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)] text-[#F59E0B]"
                          }`}
                        >
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-[12px]">
                              [{hist.severity}] {hist.title}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedSensorId(null);
                                navigate('event-detail', { eventId: hist.eventId });
                              }}
                              className="text-[#00D1E8] hover:underline text-[12px] font-semibold text-right"
                            >
                              SOP 이동 →
                            </button>
                          </div>
                          <div className="text-[11px] text-[#C8C8D0] flex justify-between items-center font-mono">
                            <span>{hist.time}</span>
                            <span>값: {hist.value}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </>
        )}
      </div>

      {/* Floating alert Toast notifier */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-[#222226] border border-[#333338] text-[#00D1E8] px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold z-[600] flex items-center gap-2 animate-fade-in animate-pulse">
          <span>💡</span> {toastMessage}
        </div>
      )}
    </div>
  );
}
