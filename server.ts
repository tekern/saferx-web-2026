import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client utility safely avoiding crashes if key is omitted
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in AI Studio Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Injected static context about GH Wangsuk Zones to align general maps grounding with our safety portal
const GH_SYSTEM_CONTEXT = `
당신은 경기주택도시공사(GH) 통합건설안전관제시스템의 일원인 'GH AI 안전관제 어시스턴트'입니다.
남양주 왕숙 공공주택지구 건설 현장(1~13구역) 및 주변 지리 관련 질문에 친절하고 정교하게 답변해야 합니다.
사용자는 경기주택도시공사 직원, 현대건설/삼성물산 등 협력사 현장 소장 및 작업자들입니다.

[GH 남양주 왕숙 건설현장 핵심 현황 참고 데이터]
- 왕숙1구역 (현대건설): 홍길동 소장 (010-1234-5678), 인원 142명, 위험도 46.2% (상태: 위험, 안전모 미착용 및 위험지대 접근 잦음)
- 왕숙2구역 (삼성물산): 김철수 소장 (010-2345-6789), 인원 98명, 위험도 44.9% (상태: 주의, 쓰러짐 감지 등)
- 왕숙3구역 (대우건설): 이영희 소장 (010-3456-7890), 인원 115명, 위험도 41.6% (상태: 주의, 센서 경고)
- 왕숙4구역 (GS건설): 박민수 소장 (010-4567-8901), 인원 87명, 위험도 38.2% (상태: 주의)
- 왕숙5구역 (롯데건설): 최지원 소장 (010-5678-9012), 인원 204명, 위험도 22.1% (상태: 보통)
- 왕숙6구역 (포스코건설): 정수빈 소장 (010-6789-0123), 인원 176명, 위험도 18.5% (상태: 보통)
- 왕숙7구역 (현대건설): 강다은 소장 (010-7890-1234), 인원 133명, 위험도 15.3% (상태: 보통)
- 왕숙8구역 (대림건설): 윤서준 소장 (010-8901-2345), 인원 89명, 위험도 12.8% (상태: 보통)
- 왕숙9구역 (SK건설): 임채원 소장 (010-9012-3456), 인원 167명, 위험도 9.4% (상태: 보통)
- 왕숙10구역 (한화건설): 송민준 소장 (010-0123-4567), 인원 145명, 위험도 7.2% (상태: 보통)
- 왕숙11구역 (삼성물산): 오지수 소장 (010-1234-9876), 인원 78명, 위험도 5.1% (상태: 보통)
- 왕숙12구역 (GS건설): 유하은 소장 (010-2345-0987), 인원 92명, 위험도 3.8% (상태: 보통)
- 왕숙13구역 (롯데건설): 나성민 소장 (010-3456-1098), 인원 110명, 위험도 0.0% (상태: 보통)

[지리 정보 및 답변 수칙]
1. 사용자가 특정 구역(예: 왕숙2구역) 주변 명소, 병원, 소방서, 주차장, 편의시설 혹은 교통 정보 등을 질문하면, 구글 맵스 그라운딩(googleMaps Tool) 결과를 결합하여 실제 실시간 장소 위치, 영업 정보, 지도 링크(URI)와 함께 설명해주세요.
2. 답변 마지막에는 반드시 답변 신뢰를 돕기 위해 Grounding 결과 URL을 제공하고, 해당 관심 구역의 담당 소장 연락처나 안전 관리 주의 메시지를 스마트하게 연계해 제시하세요.
3. 구글 지도가 반환하는 실시간 위치 좌표(lat, lng)나 검색된 주요 시설 정보가 그라운딩 리스트에 있다면 한글로 유용하게 전달하십시오.
`;

// Helper to sanitize chat response metadata
interface GroundingChunk {
  web?: { uri: string; title: string };
  maps?: { uri: string; title: string };
}

// 🤖 Chat API with real-time Google Maps Grounding
app.post("/api/chat", async (req, res) => {
  const { prompt, history, lat, lng } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    const ai = getAiClient();
    
    // Map existing system instruction & history
    const contents = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg) => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }

    // Append last user prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    // Invoke Gemini 3.5 Flash with Grounded Google Maps Search lookup!
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: GH_SYSTEM_CONTEXT,
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat || 37.6478, // Namyangju Wangsuk center default latitude
              longitude: lng || 127.2156 // Namyangju Wangsuk center default longitude
            }
          }
        }
      }
    });

    const text = response.text || "죄송합니다, 답변을 생성하지 못했습니다.";
    
    // Extract Grounding Chunks to pass interactively to frontend maps
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingLinks: Array<{ title: string; uri: string }> = [];

    groundingChunks.forEach((chunk: any) => {
      if (chunk.web) {
        groundingLinks.push({ title: chunk.web.title, uri: chunk.web.uri });
      } else if (chunk.maps) {
        groundingLinks.push({ title: chunk.maps.title || "구글 맵 상세 정보", uri: chunk.maps.uri });
      }
    });

    // Try to extract coordinates from generated text or maps grounding to dynamically focus the client map widget!
    let coordinates: { lat: number; lng: number; label?: string } | undefined = undefined;
    
    // Fallback regex parsers to detect if model mentioned any coordinates
    const geoMatch = text.match(/위도\s*:\s*([0-9.]+),\s*경도\s*:\s*([0-9.]+)/i) || 
                     text.match(/([0-9.]+)\s*,\s*([0-9.]+)/i);
    if (geoMatch && geoMatch[1] && geoMatch[2]) {
      const parsedLat = parseFloat(geoMatch[1]);
      const parsedLng = parseFloat(geoMatch[2]);
      if (parsedLat > 33 && parsedLat < 39 && parsedLng > 124 && parsedLng < 131) {
        coordinates = { lat: parsedLat, lng: parsedLng, label: "추천 추천 위치" };
      }
    }

    res.json({
      text,
      groundingLinks,
      coordinates
    });

  } catch (error: any) {
    console.error("Gemini grounding agent error:", error);
    res.status(500).json({ 
      error: "AI 챗봇 서비스 연동 실패", 
      details: error.message || error 
    });
  }
});

// Configure Vite integration inside main routing module
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[GH SAFETY CONTROL] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
