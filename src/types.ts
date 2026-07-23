/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Zone {
  id: string;
  name: string;
  company: string;
  lat: number;
  lng: number;
  workers: number;
  risk: number;
  events: number;
  status: '위험' | '주의' | '보통';
  pm: string;
  tel: string;
}

export type EventType = 'AI' | 'SOS' | '센서' | 'DEVICE';
export type SeverityType = 'CRITICAL' | 'HIGH' | 'LOW';
export type EventStatus = 'ACTIVE' | 'CONFIRMED' | 'PENDING' | 'SNOOZED';

export interface SopHistoryItem {
  time: string;
  action: string;
  user: string;
  memo: string;
}

export interface SafetyEvent {
  id: string;
  zoneId: string;
  type: EventType;
  subtype: string;
  severity: SeverityType;
  time: string;
  status: EventStatus;
  worker: string | null;
  camera: string | null;
  desc: string;
  confirmedBy: string | null;
  confirmedAt?: string | null;
  memo?: string;
  sopHistory: SopHistoryItem[];
  result?: '탐지' | '오탐' | null;
  isImportant?: boolean;
}

export interface Camera {
  id: string;
  zoneId: string;
  name: string;
  type: '고정' | '회전' | '이동형';
  status: 'ONLINE' | 'ERROR';
  hasAI: boolean;
}

export interface Sensor {
  id: string;
  zoneId: string;
  zone: string;
  type: 'CO' | 'TEMP' | 'HUMID' | 'INCLINE' | 'CO2' | 'DUST' | 'VIBRATION';
  name: string;
  value: number | null;
  unit: string;
  threshold: number;
  status: 'NORMAL' | 'WARNING' | 'OFFLINE';
}

export interface CollapseSensor {
  id: string;
  zoneId: string;
  location: string;
  value: number;
  threshold: number;
  status: 'NORMAL' | 'WARNING' | 'DANGER';
  lastUpdate: string;
}

export interface Company {
  id: string;
  name: string;
  zones: string[];
  workers: number;
  pm: string;
  tel: string;
  safetyMgr: string;
  rating: 'A' | 'B' | 'C';
}

export interface User {
  id: string;
  loginId: string;
  name: string;
  role: 'GH_ADMIN' | 'SITE_MGR' | 'SAFETY' | 'VIEWER';
  dept: string;
  zones: string;
  tel: string;
  lastLogin: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface TbmItem {
  id: string;
  zoneId: string;
  date: string;
  zone: string;
  total: number;
  completed: number;
  rate: number;
  manager: string;
  time: string;
  workContent?: string;
  hazards?: string;
  rules?: string;
  attendees?: any[];
  hasRiskAssessment?: string;
  hazard1?: string;
  measure1?: string;
  hazard2?: string;
  measure2?: string;
  hazard3?: string;
  measure3?: string;
  primaryHazardIndex?: number;
  status?: 'BEFORE' | 'ONGOING' | 'COMPLETED';
  completedAt?: string;
  leaderSignature?: string;
}

export interface WorkerLoc {
  id: string;
  name: string;
  job: string;
  zoneId: string;
  area: string;
  tag: 'ON' | 'OFF';
  lat: number;
  lng: number;
  lastUpdate: string;
  vulnerable: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  groundingLinks?: Array<{ title: string; uri: string }>;
  coordinates?: { lat: number; lng: number; label?: string };
}
