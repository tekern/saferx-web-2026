/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Zone } from "../types";
import { ZONES } from "../data";
import { 
  MonitorPlay, ShieldAlert, Volume2, MapPin, Play, Pause, 
  Settings, Maximize2, Calendar, Clock, Video, Radio, 
  ChevronDown, AlertTriangle, Eye, CheckCircle2, Sliders 
} from "lucide-react";

interface CCTVViewProps {
  currentZoneFilter: string;
  availableZones?: Zone[];
}

interface CameraHierarchyItem {
  id: string;
  zoneId: string;
  zoneName: string;
  group: string;
  floor: string;
  numCode: string;
  name: string;
  type: string;
  status: "ONLINE" | "ERROR";
  hasAI: boolean;
  coords: [number, number];
}

// Complete mock dataset for HQ ("본사") and other Wangsuk sites
const HIERARCHY_CAMERAS: CameraHierarchyItem[] = [
  // 🏢 본사 (z0)
  { id: "CAM-001", zoneId: "z0", zoneName: "본사", group: "A구역", floor: "CAM-001", numCode: "CAM-001", name: "본사 CAM-001 (A구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6468, 127.2140] },
  { id: "CAM-002", zoneId: "z0", zoneName: "본사", group: "A구역", floor: "CAM-002", numCode: "CAM-002", name: "본사 CAM-002 (A구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6472, 127.2145] },
  { id: "CAM-003", zoneId: "z0", zoneName: "본사", group: "A구역", floor: "CAM-003", numCode: "CAM-003", name: "본사 CAM-003 (A구역)", type: "회전", status: "ONLINE", hasAI: false, coords: [37.6476, 127.2150] },
  { id: "CAM-004", zoneId: "z0", zoneName: "본사", group: "A구역", floor: "CAM-004", numCode: "CAM-004", name: "본사 CAM-004 (A구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6480, 127.2155] },
  { id: "CAM-005", zoneId: "z0", zoneName: "본사", group: "A구역", floor: "CAM-005", numCode: "CAM-005", name: "본사 CAM-005 (A구역)", type: "회전", status: "ONLINE", hasAI: false, coords: [37.6484, 127.2160] },
  { id: "CAM-006", zoneId: "z0", zoneName: "본사", group: "A구역", floor: "CAM-006", numCode: "CAM-006", name: "본사 CAM-006 (A구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6488, 127.2165] },

  { id: "CAM-007", zoneId: "z0", zoneName: "본사", group: "B구역", floor: "CAM-007", numCode: "CAM-007", name: "본사 CAM-007 (B구역)", type: "고정", status: "ONLINE", hasAI: false, coords: [37.6492, 127.2170] },
  { id: "CAM-008", zoneId: "z0", zoneName: "본사", group: "B구역", floor: "CAM-008", numCode: "CAM-008", name: "본사 CAM-008 (B구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6496, 127.2175] },
  { id: "CAM-009", zoneId: "z0", zoneName: "본사", group: "B구역", floor: "CAM-009", numCode: "CAM-009", name: "본사 CAM-009 (B구역)", type: "회전", status: "ONLINE", hasAI: true, coords: [37.6500, 127.2180] },
  { id: "CAM-010", zoneId: "z0", zoneName: "본사", group: "B구역", floor: "CAM-010", numCode: "CAM-010", name: "본사 CAM-010 (B구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6504, 127.2185] },
  { id: "CAM-011", zoneId: "z0", zoneName: "본사", group: "B구역", floor: "CAM-011", numCode: "CAM-011", name: "본사 CAM-011 (B구역)", type: "회전", status: "ONLINE", hasAI: false, coords: [37.6508, 127.2190] },
  { id: "CAM-012", zoneId: "z0", zoneName: "본사", group: "B구역", floor: "CAM-012", numCode: "CAM-012", name: "본사 CAM-012 (B구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6512, 127.2195] },
  { id: "CAM-013", zoneId: "z0", zoneName: "본사", group: "B구역", floor: "CAM-013", numCode: "CAM-013", name: "본사 CAM-013 (B구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6516, 127.2200] },
  { id: "CAM-014", zoneId: "z0", zoneName: "본사", group: "B구역", floor: "CAM-014", numCode: "CAM-014", name: "본사 CAM-014 (B구역)", type: "고정", status: "ERROR", hasAI: false, coords: [37.6520, 127.2205] },

  { id: "CAM-015", zoneId: "z0", zoneName: "본사", group: "C구역", floor: "CAM-015", numCode: "CAM-015", name: "본사 CAM-015 (C구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6455, 127.2195] },
  { id: "CAM-016", zoneId: "z0", zoneName: "본사", group: "C구역", floor: "CAM-016", numCode: "CAM-016", name: "본사 CAM-016 (C구역)", type: "고정", status: "ONLINE", hasAI: false, coords: [37.6450, 127.2190] },
  { id: "CAM-017", zoneId: "z0", zoneName: "본사", group: "C구역", floor: "CAM-017", numCode: "CAM-017", name: "본사 CAM-017 (C구역)", type: "회전", status: "ONLINE", hasAI: true, coords: [37.6445, 127.2185] },
  { id: "CAM-018", zoneId: "z0", zoneName: "본사", group: "C구역", floor: "CAM-018", numCode: "CAM-018", name: "본사 CAM-018 (C구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6440, 127.2180] },

  { id: "CAM-019", zoneId: "z0", zoneName: "본사", group: "D구역", floor: "CAM-019", numCode: "CAM-019", name: "본사 CAM-019 (D구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6465, 127.2135] },
  { id: "CAM-020", zoneId: "z0", zoneName: "본사", group: "D구역", floor: "CAM-020", numCode: "CAM-020", name: "본사 CAM-020 (D구역)", type: "고정", status: "ONLINE", hasAI: false, coords: [37.6460, 127.2130] },
  { id: "CAM-021", zoneId: "z0", zoneName: "본사", group: "D구역", floor: "CAM-021", numCode: "CAM-021", name: "본사 CAM-021 (D구역)", type: "회전", status: "ONLINE", hasAI: true, coords: [37.6455, 127.2125] },
  { id: "CAM-022", zoneId: "z0", zoneName: "본사", group: "D구역", floor: "CAM-022", numCode: "CAM-022", name: "본사 CAM-022 (D구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6450, 127.2120] },

  { id: "CAM-023", zoneId: "z0", zoneName: "본사", group: "E구역", floor: "CAM-023", numCode: "CAM-023", name: "본사 CAM-023 (E구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6480, 127.2125] },

  { id: "CAM-024", zoneId: "z0", zoneName: "본사", group: "F구역", floor: "CAM-024", numCode: "CAM-024", name: "본사 CAM-024 (F구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6485, 127.2130] },
  { id: "CAM-025", zoneId: "z0", zoneName: "본사", group: "F구역", floor: "CAM-025", numCode: "CAM-025", name: "본사 CAM-025 (F구역)", type: "고정", status: "ONLINE", hasAI: false, coords: [37.6490, 127.2135] },

  { id: "CAM-026", zoneId: "z0", zoneName: "본사", group: "G구역", floor: "CAM-026", numCode: "CAM-026", name: "본사 CAM-026 (G구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6440, 127.2184] },
  { id: "CAM-027", zoneId: "z0", zoneName: "본사", group: "G구역", floor: "CAM-027", numCode: "CAM-027", name: "본사 CAM-027 (G구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6442, 127.2190] },

  // 🚧 왕숙1구역 (z1)
  { id: "CAM-Z1-1", zoneId: "z1", zoneName: "왕숙1구역", group: "A구역", floor: "CAM-001", numCode: "CAM-001", name: "왕숙1구역 CAM-001 (A구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6468, 127.2140] },
  { id: "CAM-Z1-2", zoneId: "z1", zoneName: "왕숙1구역", group: "A구역", floor: "CAM-002", numCode: "CAM-002", name: "왕숙1구역 CAM-002 (A구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6472, 127.2145] },
  { id: "CAM-Z1-3", zoneId: "z1", zoneName: "왕숙1구역", group: "B구역", floor: "CAM-007", numCode: "CAM-007", name: "왕숙1구역 CAM-007 (B구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6480, 127.2155] },
  { id: "CAM-Z1-4", zoneId: "z1", zoneName: "왕숙1구역", group: "C구역", floor: "CAM-015", numCode: "CAM-015", name: "왕숙1구역 CAM-015 (C구역)", type: "고정", status: "ONLINE", hasAI: false, coords: [37.6492, 127.2170] },
  { id: "CAM-Z1-5", zoneId: "z1", zoneName: "왕숙1구역", group: "G구역", floor: "CAM-026", numCode: "CAM-026", name: "왕숙1구역 CAM-026 (G구역)", type: "회전", status: "ONLINE", hasAI: true, coords: [37.6475, 127.2125] },

  // 🚧 왕숙2구역 (z2)
  { id: "CAM-Z2-1", zoneId: "z2", zoneName: "왕숙2구역", group: "A구역", floor: "CAM-001", numCode: "CAM-001", name: "왕숙2구역 CAM-001 (A구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6455, 127.2195] },
  { id: "CAM-Z2-2", zoneId: "z2", zoneName: "왕숙2구역", group: "C구역", floor: "CAM-015", numCode: "CAM-015", name: "왕숙2구역 CAM-015 (C구역)", type: "고정", status: "ONLINE", hasAI: false, coords: [37.6500, 127.2145] },
  { id: "CAM-Z2-3", zoneId: "z2", zoneName: "왕숙2구역", group: "G구역", floor: "CAM-026", numCode: "CAM-026", name: "왕숙2구역 CAM-026 (G구역)", type: "고정", status: "ERROR", hasAI: false, coords: [37.6440, 127.2184] },

  // 🚧 왕숙3구역 (z3)
  { id: "CAM-Z3-1", zoneId: "z3", zoneName: "왕숙3구역", group: "A구역", floor: "CAM-001", numCode: "CAM-001", name: "왕숙3구역 CAM-001 (A구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6488, 127.2210] },
  { id: "CAM-Z3-2", zoneId: "z3", zoneName: "왕숙3구역", group: "G구역", floor: "CAM-026", numCode: "CAM-026", name: "왕숙3구역 CAM-026 (G구역)", type: "고정", status: "ONLINE", hasAI: true, coords: [37.6480, 127.2155] }
];

// Left Hierarchy layout groups
const HIERARCHY_GROUPS = [
  { name: "A구역", floors: ["CAM-001", "CAM-002", "CAM-003", "CAM-004", "CAM-005", "CAM-006"] },
  { name: "B구역", floors: ["CAM-007", "CAM-008", "CAM-009", "CAM-010", "CAM-011", "CAM-012", "CAM-013", "CAM-014"] },
  { name: "C구역", floors: ["CAM-015", "CAM-016", "CAM-017", "CAM-018"] },
  { name: "D구역", floors: ["CAM-019", "CAM-020", "CAM-021", "CAM-022"] },
  { name: "E구역", floors: ["CAM-023"] },
  { name: "F구역", floors: ["CAM-024", "CAM-025"] },
  { name: "G구역", floors: ["CAM-026", "CAM-027"] }
];

export default function CCTVView({ currentZoneFilter, availableZones }: CCTVViewProps) {
  const [activeZone, setActiveZone] = useState<string>("z0");
  const [selectedGroup, setSelectedGroup] = useState<string>("A구역");
  const [selectedFloor, setSelectedFloor] = useState<string>("CAM-001");
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");

  const zoneList = availableZones || ZONES;

  // Video states
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [videoProgress, setVideoProgress] = useState<number>(34);
  const [broadcastText, setBroadcastText] = useState<string>("");
  const [showBroadcastSuccess, setShowBroadcastSuccess] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Clock state
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  // Leaflet references
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInst = useRef<any>(null);
  const camerasLayerGroupRef = useRef<any>(null);

  // Clock dynamic ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync external filters with local active zone selection
  useEffect(() => {
    if (currentZoneFilter && currentZoneFilter !== "ALL") {
      setActiveZone(currentZoneFilter);
    }
  }, [currentZoneFilter]);

  // Handle active camera resolution based on selections
  const getCameraForSelection = (zone: string, group: string, floor: string, customId?: string): CameraHierarchyItem => {
    if (customId) {
      const found = HIERARCHY_CAMERAS.find(c => c.zoneId === zone && c.id === customId);
      if (found) return found;
    }

    const matches = HIERARCHY_CAMERAS.filter(c => c.zoneId === zone && c.group === group && c.floor === floor);
    if (matches.length > 0) {
      return matches[0];
    }

    // Dynamic bulletproof fallback for unspecified grid/node selections
    const fallbackCoords: Record<string, [number, number]> = {
      "A구역": [37.6468, 127.2140],
      "B구역": [37.6492, 127.2170],
      "C구역": [37.6455, 127.2195],
      "D구역": [37.6465, 127.2135],
      "E구역": [37.6480, 127.2125],
      "F구역": [37.6485, 127.2130],
      "G구역": [37.6440, 127.2184],
    };

    const coords = fallbackCoords[group] || [37.6478, 127.2160];
    const hasAI = ["A구역", "C구역", "G구역"].includes(group);
    const status = floor === "CAM-014" ? "ERROR" : "ONLINE";

    return {
      id: `CAM-GEN-${group}-${floor}`,
      zoneId: zone,
      zoneName: zone === "z0" ? "본사" : zone === "z1" ? "왕숙1구역" : zone === "z2" ? "왕숙2구역" : "왕숙3구역",
      group,
      floor,
      numCode: floor,
      name: `${group} ${floor} 채널`,
      type: "고정",
      status,
      hasAI,
      coords
    };
  };

  const selectedCamera = getCameraForSelection(activeZone, selectedGroup, selectedFloor, selectedCameraId);

  // Available camera list matching selected zone + group + floor for the dropdown
  const availableCamerasInSelection = HIERARCHY_CAMERAS.filter(
    c => c.zoneId === activeZone && c.group === selectedGroup && c.floor === selectedFloor
  );

  // If hierarchy state matches map click, update dropdown selection
  const selectCameraFromMap = (cam: CameraHierarchyItem) => {
    setActiveZone(cam.zoneId);
    setSelectedGroup(cam.group);
    setSelectedFloor(cam.floor);
    setSelectedCameraId(cam.id);
    setIsModalOpen(true);
  };

  // Setup Leaflet map once
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    if (!leafletInst.current) {
      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false
      }).setView([37.6478, 127.2160], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      leafletInst.current = map;
      camerasLayerGroupRef.current = L.layerGroup().addTo(map);
    }

    // Invalidate size to ensure map rendering inside flex containers
    setTimeout(() => {
      leafletInst.current?.invalidateSize();
    }, 150);
  }, []);

  // Update map markers when activeZone or selectedCamera changes
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !leafletInst.current || !camerasLayerGroupRef.current) return;

    const map = leafletInst.current;
    const camerasLayerGroup = camerasLayerGroupRef.current;
    camerasLayerGroup.clearLayers();

    // Show cameras belonging to the active zone
    const zoneCameras = HIERARCHY_CAMERAS.filter(c => c.zoneId === activeZone);

    zoneCameras.forEach((cam) => {
      const isSelected = selectedCamera.id === cam.id || (selectedCamera.group === cam.group && selectedCamera.floor === cam.floor);
      const color = cam.status === "ERROR" ? "#EF4444" : isSelected ? "#00D1E8" : "#3b82f6";
      const borderGlow = isSelected ? "box-shadow: 0 0 14px #00D1E8; transform: scale(1.1);" : "box-shadow: 0 0 5px rgba(59,130,246,0.3);";

      const customIcon = L.divIcon({
        className: 'custom-camera-marker-cctv',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: all 0.2s;">
            <div style="
              width: 24px; 
              height: 24px; 
              background: #111113; 
              border: 2px solid ${color}; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              ${borderGlow}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </div>
            <div style="
              background: rgba(9, 20, 36, 0.95); 
              color: ${color}; 
              font-size: 8px; 
              font-weight: bold;
              padding: 1px 4px; 
              border-radius: 4px; 
              border: 1px solid ${color}44; 
              margin-top: 2px;
              white-space: nowrap;
              box-shadow: 0 2px 4px rgba(0,0,0,0.5);"
            >
              ${cam.name.replace(cam.zoneName + " ", "")}
            </div>
          </div>
        `,
        iconSize: [44, 52],
        iconAnchor: [22, 26]
      });

      const marker = L.marker(cam.coords, { icon: customIcon }).addTo(camerasLayerGroup);
      marker.on('click', () => {
        selectCameraFromMap(cam);
      });
    });

    // Pan map to the selected camera
    if (selectedCamera && selectedCamera.coords) {
      map.panTo(selectedCamera.coords);
    }
  }, [activeZone, selectedCamera.id, selectedCamera.group, selectedCamera.floor]);

  // Canvas drawing loop for heavy industry molten ladle animation
  useEffect(() => {
    let animationFrameId: number;
    let particleArr: Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number }> = [];

    const canvas = document.getElementById("main-player-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = Date.now();
    let streamPulse = 0;

    const drawFrame = () => {
      const W = canvas.width;
      const H = canvas.height;
      
      if (!isPlaying) {
        // Even when paused, allow the canvas to render a frozen overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.01)"; // freeze overlay
        ctx.fillRect(0, 0, W, H);
        animationFrameId = requestAnimationFrame(drawFrame);
        return;
      }

      streamPulse += 0.12;
      const t = Date.now() / 1000;

      // 1. Dark core background
      ctx.fillStyle = "#111113";
      ctx.fillRect(0, 0, W, H);

      // Subtle video scanlines / guidelines
      ctx.strokeStyle = "rgba(0, 209, 232, 0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let y = 40; y < H; y += 40) {
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
      }
      for (let x = 80; x < W; x += 80) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
      }
      ctx.stroke();

      // Check if selected camera is in ERROR state
      if (selectedCamera.status === "ERROR") {
        ctx.fillStyle = "#0c0d0f";
        ctx.fillRect(0, 0, W, H);

        // Drawing beautiful custom grey static television noise
        const imgData = ctx.createImageData(W, H);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const noise = Math.floor(Math.random() * 255);
          data[i] = noise;     // R
          data[i+1] = noise;   // G
          data[i+2] = noise;   // B
          data[i+3] = 65;      // alpha noise intensity
        }
        ctx.putImageData(imgData, 0, 0);

        // Warning overlays
        ctx.fillStyle = "rgba(239, 68, 68, 0.12)";
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(16, 16, W - 32, H - 32);

        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 15px monospace";
        ctx.textAlign = "center";
        ctx.fillText("⚠️ CCTV 신호 연계 실패 (CCTV SIGNAL LOSS)", W / 2, H * 0.44);
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "11px system-ui, sans-serif";
        ctx.fillText("해당 노선 허브의 무선 전원 연결 및 AP 전파 수신율 상태 확인을 요청합니다.", W / 2, H * 0.54);

        ctx.font = "bold 9px monospace";
        ctx.fillStyle = "#64748b";
        ctx.fillText("CODE: RF_RECV_TIMED_OUT", W / 2, H * 0.65);

        animationFrameId = requestAnimationFrame(drawFrame);
        return;
      }

      // --- ONLINE INDUSTRIAL CCTV SIMULATION: Steel Ladle pouring molten iron ---
      ctx.textAlign = "left";

      // 1. Draw Factory Hall background silhouette
      ctx.fillStyle = "#080e18";
      ctx.fillRect(W * 0.05, H * 0.25, W * 0.9, H * 0.7);

      // Steel pillars
      ctx.fillStyle = "#121926";
      ctx.fillRect(W * 0.12, H * 0.25, W * 0.06, H * 0.7);
      ctx.fillRect(W * 0.82, H * 0.25, W * 0.06, H * 0.7);

      // Scaffolding lines
      ctx.strokeStyle = "#1d293d";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W * 0.18, H * 0.35); ctx.lineTo(W * 0.82, H * 0.35);
      ctx.moveTo(W * 0.18, H * 0.65); ctx.lineTo(W * 0.82, H * 0.65);
      ctx.stroke();

      // 2. Crane Pulley Systems
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W * 0.44, 0); ctx.lineTo(W * 0.44, H * 0.38);
      ctx.moveTo(W * 0.52, 0); ctx.lineTo(W * 0.52, H * 0.38);
      ctx.stroke();

      // Pulley Head Box
      ctx.fillStyle = "#334155";
      ctx.fillRect(W * 0.42, H * 0.38, W * 0.12, H * 0.07);
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1;
      ctx.strokeRect(W * 0.42, H * 0.38, W * 0.12, H * 0.07);

      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(W * 0.45, H * 0.41, 6, 0, Math.PI * 2);
      ctx.arc(W * 0.51, H * 0.41, 6, 0, Math.PI * 2);
      ctx.fill();

      // Heavy lifting Hook holding ladle
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(W * 0.48, H * 0.45);
      ctx.quadraticCurveTo(W * 0.48, H * 0.51, W * 0.51, H * 0.53);
      ctx.stroke();

      // 3. Molten Steel Ladle Bucket
      const ldlX = W * 0.5;
      const ldlY = H * 0.53;
      
      ctx.fillStyle = "#1e293b"; // heavy steel bucket
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ldlX - 45, ldlY);
      ctx.lineTo(ldlX + 45, ldlY);
      ctx.lineTo(ldlX + 35, ldlY + 75);
      ctx.lineTo(ldlX - 35, ldlY + 75);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Steel girder hoops on ladle
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ldlX - 42, ldlY + 25); ctx.lineTo(ldlX + 42, ldlY + 25);
      ctx.moveTo(ldlX - 38, ldlY + 52); ctx.lineTo(ldlX + 38, ldlY + 52);
      ctx.stroke();

      // 4. Glowing liquid metal surface inside the ladle
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.ellipse(ldlX, ldlY, 43, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fef08a"; // intense white-hot core
      ctx.beginPath();
      ctx.ellipse(ldlX - 8, ldlY, 20, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // 5. Blazing Spout Pouring Stream
      const pourX = ldlX + 35;
      const pourY = ldlY + 12;
      const streamW = 7 + Math.sin(streamPulse) * 1.5;

      // Volcanic dynamic ambient glow in background
      const ambientGlow = ctx.createRadialGradient(pourX, H * 0.65, 5, pourX, H * 0.65, 230);
      ambientGlow.addColorStop(0, "rgba(249, 115, 22, 0.32)");
      ambientGlow.addColorStop(0.4, "rgba(234, 88, 12, 0.12)");
      ambientGlow.addColorStop(1, "transparent");
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, W, H);

      // Glowing liquid column
      const streamGrad = ctx.createLinearGradient(pourX, pourY, pourX, H);
      streamGrad.addColorStop(0, "#ffffff");
      streamGrad.addColorStop(0.15, "#fef08a");
      streamGrad.addColorStop(0.6, "#ea580c");
      streamGrad.addColorStop(1, "#7c2d12");

      ctx.fillStyle = streamGrad;
      ctx.beginPath();
      ctx.moveTo(pourX - streamW/2, pourY);
      ctx.lineTo(pourX + streamW/2, pourY);
      ctx.quadraticCurveTo(pourX + streamW/2 + 6, H * 0.72, pourX + streamW/2 + 10, H);
      ctx.lineTo(pourX - streamW/2 - 12, H);
      ctx.quadraticCurveTo(pourX - streamW/2 - 6, H * 0.72, pourX - streamW/2, pourY);
      ctx.fill();

      // 6. Falling Spark System
      // Generate sparks
      if (Math.random() < 0.75) {
        particleArr.push({
          x: pourX + (Math.random() - 0.5) * streamW,
          y: pourY + 15 + Math.random() * 40,
          vx: (Math.random() - 0.25) * 60 + 20,
          vy: Math.random() * 40 + 20,
          life: 0,
          maxLife: 35 + Math.random() * 35
        });
      }
      // Splatter on hitting bottom base
      if (Math.random() < 0.85) {
        particleArr.push({
          x: pourX + 8 + (Math.random() - 0.5) * 26,
          y: H - 15,
          vx: (Math.random() - 0.5) * 140,
          vy: -(Math.random() * 90 + 30),
          life: 0,
          maxLife: 20 + Math.random() * 25
        });
      }

      // Draw active sparks
      particleArr.forEach((p) => {
        p.life++;
        p.vy += 4.5 * 0.5; // low-gravity acceleration
        p.x += p.vx * 0.016;
        p.y += p.vy * 0.016;

        const size = Math.max(0.6, 2.2 * (1 - p.life / p.maxLife));
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);

        const ratio = p.life / p.maxLife;
        if (ratio < 0.25) {
          ctx.fillStyle = "#ffffff";
        } else if (ratio < 0.65) {
          ctx.fillStyle = "#fde047";
        } else {
          ctx.fillStyle = "#f97316";
        }
        ctx.fill();
      });

      // Maintain particle size under limits
      particleArr = particleArr.filter(p => p.life < p.maxLife && p.y < H && p.x > 0 && p.x < W);

      // 7. Scaffoldings & railing in foreground
      ctx.strokeStyle = "rgba(71, 85, 105, 0.4)";
      ctx.lineWidth = 2;
      ctx.strokeRect(W * 0.72, H * 0.5, W * 0.22, H * 0.45);
      ctx.beginPath();
      ctx.moveTo(W * 0.72, H * 0.5); ctx.lineTo(W * 0.94, H * 0.95);
      ctx.moveTo(W * 0.94, H * 0.5); ctx.lineTo(W * 0.72, H * 0.95);
      ctx.stroke();

      // 8. AI computer vision analysis boxes (if hasAI is active)
      if (selectedCamera.hasAI) {
        // AI thermal bounds tracking on molten pouring spout
        const aiBoxX = pourX - 22;
        const aiBoxY = pourY - 10;
        const aiBoxW = 46;
        const aiBoxH = 95;

        ctx.strokeStyle = "#00D1E8";
        ctx.lineWidth = 2;
        ctx.strokeRect(aiBoxX, aiBoxY, aiBoxW, aiBoxH);

        // Neon corners
        const cornerL = 8;
        ctx.fillStyle = "#00D1E8";
        // top-left
        ctx.fillRect(aiBoxX - 1, aiBoxY - 1, cornerL, 2);
        ctx.fillRect(aiBoxX - 1, aiBoxY - 1, 2, cornerL);
        // top-right
        ctx.fillRect(aiBoxX + aiBoxW - cornerL + 1, aiBoxY - 1, cornerL, 2);
        ctx.fillRect(aiBoxX + aiBoxW - 1, aiBoxY - 1, 2, cornerL);
        // bottom-left
        ctx.fillRect(aiBoxX - 1, aiBoxY + aiBoxH - 1, cornerL, 2);
        ctx.fillRect(aiBoxX - 1, aiBoxY + aiBoxH - cornerL + 1, 2, cornerL);
        // bottom-right
        ctx.fillRect(aiBoxX + aiBoxW - cornerL + 1, aiBoxY + aiBoxH - 1, cornerL, 2);
        ctx.fillRect(aiBoxX + aiBoxW - 1, aiBoxY + aiBoxH - cornerL + 1, 2, cornerL);

        // AI classification tag
        ctx.fillStyle = "rgba(0, 209, 232, 0.85)";
        ctx.fillRect(aiBoxX - 1, aiBoxY - 20, aiBoxW + 2, 18);
        ctx.fillStyle = "#070e17";
        ctx.font = "bold 9px system-ui";
        ctx.fillText("TEMP_STD: 1540℃", aiBoxX + 2, aiBoxY - 8);

        // Sweeping scanner line
        const scanY = aiBoxY + ((t * 70) % aiBoxH);
        ctx.strokeStyle = "rgba(0, 209, 232, 0.45)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(aiBoxX, scanY);
        ctx.lineTo(aiBoxX + aiBoxW, scanY);
        ctx.stroke();
      }

      // 9. Camera Feed Overlays (HUD)
      // Top left bar
      ctx.fillStyle = "rgba(7, 14, 25, 0.7)";
      ctx.fillRect(15, 15, 235, 24);
      
      const blinkingRed = Math.floor(t * 2) % 2 === 0;
      ctx.fillStyle = blinkingRed ? "#EF4444" : "#991b1b";
      ctx.beginPath();
      ctx.arc(28, 27, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px monospace";
      ctx.fillText(`LIVE ● ${selectedCamera.name}`, 40, 31);

      // Top right timestamp
      ctx.fillStyle = "rgba(7, 14, 25, 0.7)";
      ctx.fillRect(W - 195, 15, 180, 24);
      ctx.fillStyle = "#00D1E8";
      ctx.font = "bold 10px monospace";
      ctx.fillText(new Date().toLocaleString("ko-KR"), W - 185, 31);

      // Bottom spec panel
      ctx.fillStyle = "rgba(7, 14, 25, 0.45)";
      ctx.fillRect(15, H - 35, 125, 20);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "9px system-ui, sans-serif";
      ctx.fillText(`RATE: 30 FPS / MD: ${selectedCamera.type}`, 22, H - 22);

      animationFrameId = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedCamera, isPlaying, isModalOpen]);

  // Audio mic submission handler
  const handleVoiceBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    setShowBroadcastSuccess(true);
    setBroadcastText("");
    setTimeout(() => {
      setShowBroadcastSuccess(false);
    }, 3000);
  };

  // Human legible current clock pieces
  const year = currentDateTime.getFullYear();
  const month = currentDateTime.getMonth() + 1;
  const day = currentDateTime.getDate();
  const dateString = `${year}년 ${month}월 ${day}일`;
  const hours = String(currentDateTime.getHours()).padStart(2, "0");
  const minutes = String(currentDateTime.getMinutes()).padStart(2, "0");
  const seconds = String(currentDateTime.getSeconds()).padStart(2, "0");

  const zoneNames: Record<string, string> = {
    "z0": "본사",
    "z1": "왕숙1구역",
    "z2": "왕숙2구역",
    "z3": "왕숙3구역"
  };

  return (
    <div className="space-y-4 page-transition select-none min-h-[calc(100vh-100px)] flex flex-col">
      {/* 행 1: 페이지 제목 영역 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[18px] font-semibold text-[#ECECEC]">CCTV 관제</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        
        {/* 1. LEFT SIDEBAR: Hierarchy Selection Module */}
        <div className="lg:col-span-3 flex flex-col space-y-4 bg-[#19191C] border-r border-[#2A2A2F] p-4 rounded-xl">
          
          {/* Group and controls card */}
          <div className="bg-transparent border-none p-0 flex flex-col space-y-4 shadow-none">
            
            {/* 1) 메뉴명 : 영상 검색으로 서브 타이틀 추가 */}
            <div className="flex items-center justify-between border-b border-[#2A2A2F] pb-2">
              <span className="text-xs font-black text-[#00D1E8] tracking-wider uppercase">
                영상 검색
              </span>
            </div>

            {/* Dropdown for active headquarters/site */}
            <div>
              <div className="relative">
                <select
                  value={activeZone}
                  onChange={(e) => {
                    setActiveZone(e.target.value);
                    // Reset to A구역 when site shifts to prevent empty states
                    setSelectedGroup("A구역");
                    setSelectedFloor("CAM-001");
                    setSelectedCameraId("");
                  }}
                  className="w-full bg-[#222226] border border-[#333338] text-xs text-[#ECECEC] font-semibold p-3 pr-10 rounded-lg outline-none appearance-none hover:border-[#00D1E8]/50 focus:border-[#00D1E8] transition-all cursor-pointer shadow-inner"
                >
                  <option value="z0">본사</option>
                  {zoneList.map(z => (
                    <option key={z.id} value={z.id}>{z.name} ({z.company})</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-text-dim">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Structured hierarchical camera grouping list */}
            <div className="space-y-4 max-h-[390px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#333338] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#00D1E8]/50 transition-colors">
              {HIERARCHY_GROUPS.map((grp) => {
                const isGroupActive = selectedGroup === grp.name;
                return (
                  <div key={grp.name} className="space-y-1.5 border-b border-[#2A2A2F] pb-3 last:border-none last:pb-0">
                    {/* Header of specific channel group */}
                    <div className="flex items-center gap-1.5">
                      <Radio className={`w-3.5 h-3.5 ${isGroupActive ? "text-[#00D1E8] animate-pulse" : "text-[#8A8A96]"}`} />
                      <span className={`text-[13px] font-semibold transition-colors ${isGroupActive ? "text-[#00D1E8]" : "text-[#ECECEC]"}`}>
                        {grp.name}
                      </span>
                    </div>

                    {/* Floor and structural buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {grp.floors.map((fl) => {
                        const isBtnActive = selectedGroup === grp.name && selectedFloor === fl;
                        return (
                          <button
                            key={fl}
                            onClick={() => {
                              setSelectedGroup(grp.name);
                              setSelectedFloor(fl);
                              setSelectedCameraId(""); // auto reset custom id inside group
                            }}
                            className={`text-[10px] font-semibold rounded-[5px] transition-all cursor-pointer ${
                              isBtnActive 
                                ? "bg-[#00D1E8] text-[#0A0A0C] py-[3px] px-[10px]" 
                                : "bg-[#2A2A2F] text-[#8A8A96] py-[3px] px-[10px]"
                            }`}
                          >
                            {fl}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Camera ID Picker Dropdown */}
            <div className="pt-2 border-t border-[#2A2A2F]">
              <span className="block text-[10px] text-[#8A8A96] font-bold mb-1.5 uppercase tracking-wider">
                카메라 번호를 선택하세요
              </span>
              <div className="relative">
                <select
                  value={selectedCameraId || selectedCamera.id}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                  className="w-full bg-[#222226] border border-[#333338] text-xs text-[#ECECEC] p-2 pr-10 rounded-lg outline-none appearance-none hover:border-[#00D1E8]/50 focus:border-[#00D1E8] transition-all cursor-pointer"
                >
                  {availableCamerasInSelection.length > 0 ? (
                    availableCamerasInSelection.map((cam) => (
                      <option key={cam.id} value={cam.id}>
                        {cam.numCode} ({cam.name.replace(cam.zoneName + " ", "")})
                      </option>
                    ))
                  ) : (
                    <option value={selectedCamera.id}>
                      {selectedCamera.numCode} ({selectedCamera.name})
                    </option>
                  )}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-text-dim">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

          </div>

          {/* 📅 Analog / Digital Ticking Calendar Clock exactly matching the mockup */}
          <div className="bg-[#19191C] border border-[#2A2A2F] rounded-lg p-4 shadow-xl select-none">
            <div className="flex items-center gap-1.5 text-[10px] text-[#8A8A96] font-bold uppercase tracking-wider border-b border-[#2A2A2F] pb-2 mb-3">
              <Clock className="w-3.5 h-3.5 text-[#00D1E8] animate-pulse" />
              <span>관제센터 표준시</span>
            </div>
            <div className="space-y-1.5 text-center">
              <span className="text-[12px] text-[#8A8A96] font-mono font-bold block">
                {dateString}
              </span>
              <div className="font-mono text-[28px] font-bold text-[#00D1E8] bg-[#111113] py-2 rounded-lg border border-[#2A2A2F] flex justify-center items-center gap-1">
                <span className="text-[#00D1E8]">{hours}</span>
                <span className="animate-pulse text-[#00D1E8]/70">:</span>
                <span className="text-[#00D1E8]">{minutes}</span>
                <span className="animate-pulse text-[#00D1E8]/70">:</span>
                <span className="text-[#00D1E8]">{seconds}</span>
              </div>
            </div>
          </div>

        </div>

        {/* 2. RIGHT PANEL: Immersive GIS Placement Map + Active Camera Info HUD */}
        <div className="lg:col-span-9 flex flex-col space-y-4">
          
          {/* Main Map Card */}
          <div className="bg-panel border border-border-main rounded-xl p-5 flex flex-col space-y-4 shadow-xl flex-1">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-main/50 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan animate-bounce" />
                <span className="text-sm font-black text-text-main tracking-wider uppercase">
                  CCTV 지도
                </span>
              </div>
            </div>

            {/* Selected Camera Details HUD Banner */}
            <div className="bg-card border border-border-main/80 rounded-xl p-4 shadow-inner">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 bg-outer border border-border-main text-text-sub font-mono font-bold rounded">
                    {selectedCamera.id}
                  </span>
                  <span className="text-text-dim">/</span>
                  <span className="text-text-main font-bold">
                    {zoneNames[activeZone] || activeZone}
                  </span>
                  <span className="text-text-dim">/</span>
                  <span className="text-text-sub">{selectedCamera.group}</span>
                  <span className="text-text-dim">/</span>
                  <span className="text-text-sub">{selectedCamera.floor}</span>
                  <span className="text-text-dim">/</span>
                  <span className="text-cyan font-black">{selectedCamera.numCode}</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-text-dim">
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${selectedCamera.status === "ONLINE" ? "bg-green animate-pulse" : "bg-red"}`}></span>
                    <span className="font-mono uppercase font-bold text-text-sub">
                      {selectedCamera.status === "ONLINE" ? "온라인" : "에러"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-text-sub">타입:</span> {selectedCamera.type}
                  </div>
                  <div>
                    <span className="font-semibold text-text-sub">좌표:</span> {selectedCamera.coords[0].toFixed(5)}, {selectedCamera.coords[1].toFixed(5)}
                  </div>
                </div>
              </div>
            </div>

            {/* Actual Leaflet Map Canvas container */}
            <div 
              ref={mapRef} 
              className="rounded-xl border border-border-main bg-outer overflow-hidden shadow-inner relative z-10"
              id="cctv-placement-map"
              style={{
                width: '100%',
                height: '480px',
                minHeight: '480px',
              }}
            />

            <p className="text-[10.5px] text-text-dim leading-relaxed font-sans text-center bg-card/45 py-2 px-4 rounded-lg border border-border-main/50">
              * 지도 위에 배치된 CCTV 카메라 마커 아이콘을 클릭하시면 해당 위치의 <strong>실시간 비디오 채널이 즉시 팝업창으로 재생</strong>됩니다.
            </p>
          </div>

        </div>

      </div>

      {/* ==================== 🎥 CCTV LIVE VIDEO POPUP MODAL ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-panel border border-border-main rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl relative flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-card border-b border-border-main px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MonitorPlay className="w-5 h-5 text-cyan animate-pulse" />
                <div className="text-xs font-bold text-text-sub flex items-center gap-1">
                  <span className="text-text-main">{zoneNames[activeZone] || activeZone}</span>
                  <span className="text-text-dim">/</span>
                  <span>{selectedGroup}</span>
                  <span className="text-text-dim">/</span>
                  <span>{selectedFloor}</span>
                  <span className="text-text-dim">/</span>
                  <span className="text-cyan font-black">{selectedCamera.numCode}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${selectedCamera.status === "ONLINE" ? "bg-green animate-pulse" : "bg-red"}`}></span>
                  <span className="text-[10px] font-mono text-text-sub font-bold uppercase">
                    {selectedCamera.status === "ONLINE" ? "온라인" : "에러"}
                  </span>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg bg-outer border border-border-main text-text-dim hover:text-white hover:bg-hover transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 max-h-[85vh] overflow-y-auto scrollbar-thin">
              
              {/* Animated Canvas Player Frame */}
              <div className="w-full bg-black aspect-video max-h-[480px] rounded-xl border border-[var(--border-default)] overflow-hidden relative shadow-inner group">
                <canvas
                  id="main-player-canvas"
                  width="840"
                  height="470"
                  className="w-full h-full object-cover block"
                />
                {/* Glowing overlay filter for immersive camera vibe */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              </div>

              {/* Video Controls and timeline bar */}
              <div className="bg-card border border-border-main rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4 select-none">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 bg-outer border border-border-main rounded-lg text-cyan hover:bg-hover hover:text-white transition-all cursor-pointer"
                    title={isPlaying ? "일시정지" : "재생"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-cyan" /> : <Play className="w-4 h-4 fill-cyan" />}
                  </button>
                  <div className="text-[11px] font-mono text-text-sub">
                    <span>02:44</span>
                    <span className="text-text-dim mx-1">/</span>
                    <span className="text-text-dim">10:00</span>
                  </div>
                </div>

                {/* Interactive custom stylized timeline slider */}
                <div className="flex-1 min-w-[200px] flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={videoProgress}
                    onChange={(e) => setVideoProgress(Number(e.target.value))}
                    className="w-full h-1 bg-outer rounded-lg appearance-none cursor-pointer accent-cyan"
                    style={{
                      background: `linear-gradient(to right, #00D1E8 0%, #00D1E8 ${videoProgress}%, #111113 ${videoProgress}%, #111113 100%)`
                    }}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button className="p-1.5 text-text-sub hover:text-cyan transition-colors" title="화면 설정">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-text-sub hover:text-cyan transition-colors" title="전체화면">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Real-time emergency voice speaker broadcast console inside the player widget */}
              <form onSubmit={handleVoiceBroadcast} className="bg-cyan-dim/10 border border-cyan/15 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-cyan font-extrabold tracking-wide uppercase">
                    <Volume2 className="w-4 h-4 animate-bounce" />
                    <span>📢 원격 방송</span>
                  </div>
                  <span className="text-[9.5px] text-text-dim font-mono uppercase">TARGET CAMERA ID: {selectedCamera.id}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={broadcastText}
                    onChange={(e) => setBroadcastText(e.target.value)}
                    placeholder="대피 알림 또는 직접 방송하고 싶은 비상 안전 경고문을 입력해 주세요..."
                    className="flex-1 bg-outer border border-border-main text-xs p-2.5 rounded-lg focus:outline-none focus:border-cyan text-text-main placeholder-text-dim/80"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-cyan text-outer font-black text-xs rounded-lg hover:bg-cyan/95 transition-all cursor-pointer shadow-md shadow-cyan/10"
                  >
                    방송 전송
                  </button>
                </div>
                {showBroadcastSuccess && (
                  <div className="p-2 bg-green/10 border border-green/35 rounded text-[10.5px] text-green text-center font-bold animate-pulse">
                    ✓ 현장 스피커 무선 방송 전송 완료 - "[{selectedCamera.name}] 인근 고출력 스피커 송출 승인되었습니다"
                  </div>
                )}
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
