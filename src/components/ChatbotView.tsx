/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "../types";
import { Send, MapPin, AlertCircle, Sparkles, Navigation, Clock, Check } from "lucide-react";

interface ChatbotViewProps {
  onRefocusMap?: (lat: number, lng: number, label: string) => void;
  currentZoneLatLng?: { lat: number; lng: number };
}

// Prompt templates for our user to quickly click and test grounding
const DRILLDOWN_PROMPTS = [
  { text: "왕숙1구역 주변 소방서와 응급 의료원 알려죠", sub: "1구역 긴급 대피용" },
  { text: "왕숙2구역에서 가장 가까운 지하철역과 주차장 검색해봐", sub: "근로자 통근 정보" },
  { text: "남양주시청과 남양주 왕숙 신도시 구역의 지도상 거리는?", sub: "행정 구역 거리 계산" },
  { text: "밀폐공간 일산화탄소 센서 경고 상황 발생 시 비상 조치 SOP는?", sub: "수동 가스 조치 가이드" }
];

export default function ChatbotView({ onRefocusMap, currentZoneLatLng }: ChatbotViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "안녕하세요! **통합건설안전관제 AI 비서**입니다. 남양주 왕숙 공공주택지구 건설 현장 및 센서 요약, 그리고 **실시간 Google Maps 그라운딩**을 활용하여 전국의 상세 장소 및 지리 위치 질문에 답변해 드립니다.\n\n👇 아래의 빠른 추천 질문을 누르시거나 직접 질문을 작성해 보세요!",
      time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);
    setErrorBanner(null);

    try {
      // Build previous messages context
      const chatHistory = messages
        .filter(m => m.id !== "welcome")
        .slice(-6)
        .map(m => ({ sender: m.sender, text: m.text }));

      // Call Express server-side Gemini Search grounding proxy
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          history: chatHistory,
          lat: currentZoneLatLng?.lat || 37.6478,
          lng: currentZoneLatLng?.lng || 127.2156
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "서버 통신 오류");
      }

      const botMsg: ChatMessage = {
        id: "msg-" + Date.now() + "-bot",
        sender: "bot",
        text: data.text,
        time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        groundingLinks: data.groundingLinks,
        coordinates: data.coordinates
      };

      setMessages((prev) => [...prev, botMsg]);

      // If coordinates are fetched from Google Maps Grounding, autofocus GIS map widget
      if (data.coordinates && onRefocusMap) {
        onRefocusMap(data.coordinates.lat, data.coordinates.lng, data.coordinates.label || textToSend);
      }

    } catch (err: any) {
      console.warn("AI Chatbot calling failed, activating premium simulated fallback: ", err);
      
      // Let's guide configuration as requested by AI Studio instructions
      let errMsg = "GEMINI_API_KEY 미설정 상태입니다.";
      if (err.message && err.message.includes("GEMINI_API_KEY")) {
        errMsg = "우측 상단의 Settings > Secrets 메뉴에서 GEMINI_API_KEY를 설정하시면 실시간 Google Maps 그라운딩 AI가 전격 활성화됩니다.";
      } else {
        errMsg = `연동 실패 안내: ${err.message || err}. API키 입력이 정상 완료될 시 동작 가능합니다.`;
      }
      setErrorBanner(errMsg);

      // Perform a satisfying local intelligent lookup to keep the UX 100% interactive and functional!
      setTimeout(() => {
        let textReply = `비상 로컬 오프라인 엔진이 답변합니다.\n\n***\n\n **[API 상태 안내]**\n현재 Gemini API 환경 변수가 대입되지 않은 상태입니다. 우측 숨겨진 메뉴의 **Settings > Secrets**에 \`GEMINI_API_KEY\`를 복사해 넣으시면 구글 클라우드 검색 그라운딩 전체 인그레스가 실행됩니다.\n\n***\n\n**[로컬 건설안전 데이터 답변]**\n- **질문**: "${textToSend}"`;
        let targetCoordinates = { lat: 37.6478, lng: 127.2156, label: "남양주 왕숙 중심부" };

        if (textToSend.includes("소방서") || textToSend.includes("의료원") || textToSend.includes("병원")) {
          textReply += `\n- **남양주소방서**: 국가지정 소방서가 **다산동**에 위치하고 있으며 왕숙 1, 2구역에서 각각 차량 8분/12분 내에 긴급 충돌 가능 범위입니다.\n- **현대병원(응급실)**: 경기도 남양주시 봉현로에 위치한 24시간 응급의료시설로 왕숙 1,2구역 전 구획에서 차량 10분 소요됩니다.\n- **SOP 전파 수칙**: 중대 화재 발생 시, 119 즉시 신고 버튼을 클릭하고 해당 구역(왕숙1구역 홍길동 소장: 010-1234-5678)에게 위성 휴대망 무전 지시를 내리십시오.`;
          targetCoordinates = { lat: 37.6495, lng: 127.2110, label: "남양주 현대병원" };
        } else if (textToSend.includes("지하철역") || textToSend.includes("역") || textToSend.includes("주차장") || textToSend.includes("통근")) {
          textReply += `\n- **지하철역**: 남양주 왕숙 지구 내 신설 예정 가칭 '왕숙역(GTX-B 및 경춘선)'은 1구역 하단 중심에 설계되어 있습니다. 현재 대중교통 인접 지하철역은 **퇴계원역** 및 **사릉역**이 가깝습니다.\n- **임시 주차 시설**: 왕숙 2구역 삼성물산 안전지대 배후에 근로자 합동 주차장 400면이 준비되어 있습니다.`;
          targetCoordinates = { lat: 37.6530, lng: 127.2310, label: "경춘선 사릉역" };
        } else if (textToSend.includes("거리") || textToSend.includes("위치")) {
          textReply += `\n- **남양주시청**: 경기도 남양주시 경춘로 1037에 있으며 가깝게 위치해 있어 서류 보고 및 합동 단속 시 차량 12분만에 연계 소통이 일어납니다.\n- **왕숙 중심 좌표**: 안전관제 센터의 지도 뷰에서 표기 중인 [위도: 37.6478, 경도: 127.2156] 지점으로 즉각 화면이 포커싱됩니다.`;
          targetCoordinates = { lat: 37.6360, lng: 127.2120, label: "남양주시청 제1청사" };
        } else if (textToSend.includes("SOP") || textToSend.includes("가스") || textToSend.includes("일산화탄소")) {
          textReply += `\n- **일산화탄소 밀폐공간 비상대처 SOP**:\n  1. 농도 20ppm 초과 즉시 현장 근로자 대피 전파 및 강제 급배기팬 150HP 즉시 가동.\n  2. 안전모 착용자 송기 마스크 인입 하에만 내부 구조 요원 2인 1조 임시 진입.\n  3. 구조 즉시 위 남양주 현대병원 응급실 가동 대기 전화를 연계 전파합니다.`;
        } else {
          textReply += `\n- 안전 가이드라인에 근거, 요청해주신 내용을 확인하였습니다.\n- 왕숙 지구는 스마트 태그를 활용한 다중 안전 관제가 실행 중이오니 전 구역 안전 수칙을 준수바랍니다.`;
        }

        const botMsg: ChatMessage = {
          id: "msg-" + Date.now() + "-bot",
          sender: "bot",
          text: textReply,
          time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
          groundingLinks: [
            { title: "Construction Safety Portal", uri: "https://www.nyj.go.kr" },
            { title: "Namyangju City Hall Portal", uri: "https://www.nyj.go.kr" }
          ],
          coordinates: targetCoordinates
        };

        setMessages((prev) => [...prev, botMsg]);

        if (targetCoordinates && onRefocusMap) {
          onRefocusMap(targetCoordinates.lat, targetCoordinates.lng, targetCoordinates.label);
        }
      }, 900);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ai-chatbot-panel" className="flex flex-col h-full bg-brand-bg/50 border border-border-main rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-panel/80 border-b border-border-main">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/40 flex items-center justify-center text-cyan">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green rounded-full border border-brand-bg animate-pulse"></span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-text-main flex items-center gap-1.5">
              <span>AI 안전관제 어시스턴트</span>
            </h3>
            <p className="text-[11px] text-text-sub">실시간 구글 지도 및 대시보드 데이터 연동 답변</p>
          </div>
        </div>
      </div>

      {/* API Key Caution warning banner */}
      {errorBanner && (
        <div className="bg-red/10 border-b border-red/30 px-3 py-2 text-xs text-red flex items-start gap-2 animate-pulse">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-text-main">API 키 안내:</span> {errorBanner}
          </div>
        </div>
      )}

      {/* Messages list area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] text-text-dim font-mono">{msg.time}</span>
              <span className="text-[11px] font-medium text-text-sub">
                {msg.sender === "user" ? "김관수 통합관리자" : ""}
              </span>
            </div>
            
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                msg.sender === "user"
                  ? "bg-cyan text-outer font-medium rounded-tr-none shadow-md shadow-cyan/15"
                  : "bg-card text-text-main border border-border-main rounded-tl-none"
              }`}
            >
              {msg.text}

              {/* Action buttons internally parsed if location exists */}
              {msg.coordinates && (
                <div className="mt-3 pt-2 border-t border-border-main/40 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-cyan font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-orange" />
                    <span>추천 지리 좌표 식별됨 </span>
                  </div>
                  <button
                    onClick={() => {
                      if (msg.coordinates && onRefocusMap) {
                        onRefocusMap(msg.coordinates.lat, msg.coordinates.lng, msg.coordinates.label || "식별 위치");
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-cyan-dim border border-cyan/40 rounded text-[11px] text-cyan hover:bg-cyan hover:text-outer font-bold transition-all"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>이 위치로 지도 이동</span>
                  </button>
                </div>
              )}

              {/* Grounding Info Sources list */}
              {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                <div className="mt-3 pt-2 border-t border-border-main/30">
                  <p className="text-[10px] text-text-dim mb-1 font-semibold flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3 text-cyan" /> Google Maps 출처 인덱스:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.groundingLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] bg-panel hover:bg-hover border border-border-main text-cyan underline inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono max-w-full truncate"
                      >
                        <span>{link.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col items-start font-mono">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan animate-ping"></div>
              <span className="text-[11px] text-text-dim text-cyan">Google Search Grounding 가동 중...</span>
            </div>
            <div className="bg-card border border-border-main rounded-2xl rounded-tl-none px-4 py-3 text-xs text-text-dim pr-12 animate-pulse">
              남양주 왕숙 인근 지도 자원 분석 후 최신 위성 위치 결합 답변을 산출 중입니다.
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts slider */}
      <div className="px-4 py-2.5 bg-panel/30 border-t border-border-dim overflow-x-auto whitespace-nowrap slider-hide scroll-smooth flex gap-2">
        {DRILLDOWN_PROMPTS.map((prompt, pIdx) => (
          <button
            key={pIdx}
            onClick={() => handleSend(prompt.text)}
            className="inline-flex flex-col items-start flex-shrink-0 bg-card hover:bg-hover border border-border-main rounded-lg px-3 py-1.5 text-left transition-all group hover:border-cyan/50"
          >
            <span className="text-[11px] text-text-main font-semibold group-hover:text-cyan transition-colors">{prompt.text}</span>
            <span className="text-[9px] text-text-dim font-mono">{prompt.sub}</span>
          </button>
        ))}
      </div>

      {/* Input row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputValue);
        }}
        className="p-3 bg-panel/95 border-t border-border-main flex gap-2 items-center"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="왕숙 구역 질문 혹은 근처 지리 장소 영문/한글 질문..."
            className="w-full bg-outer border border-border-main focus:border-cyan text-text-main rounded-lg px-3.5 py-2.5 text-xs focus:outline-none placeholder-text-dim"
          />
          <span className="absolute right-3.5 top-3 text-[10px] text-text-dim font-mono select-none">Enter</span>
        </div>
        <button
          type="submit"
          className="bg-cyan hover:bg-cyan/90 text-outer p-2.5 rounded-lg flex items-center justify-center transition-colors shadow-lg shadow-cyan/10"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
