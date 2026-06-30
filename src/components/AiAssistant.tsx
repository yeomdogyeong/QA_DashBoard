import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Bot, Send, User, Loader2, FileCheck2, ShieldAlert, BadgeHelp, RefreshCw } from "lucide-react";
import { QARecord, AiReportResponse, ChatMessage, ReleaseCriteria } from "../types";

interface AiAssistantProps {
  csvData: QARecord[];
  criteria: ReleaseCriteria;
  appTitle: string;
}

// Simple bulletproof Markdown to HTML helper to render AI responses elegantly without breaking React 19 builds
function renderSimpleMarkdown(text: string): string {
  if (!text) return "";
  
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
    
  // Headers
  html = html.replace(/^### (.*?)$/gm, "<h4 class='text-sm font-bold text-slate-900 mt-3 mb-1.5 font-display'>$1</h4>");
  html = html.replace(/^## (.*?)$/gm, "<h3 class='text-base font-bold text-slate-900 mt-4 mb-2 font-display'>$1</h3>");
  html = html.replace(/^# (.*?)$/gm, "<h2 class='text-lg font-bold text-slate-900 mt-5 mb-2.5 font-display'>$1</h2>");
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-slate-900'>$1</strong>");
  
  // Lists
  html = html.replace(/^\s*-\s+(.*?)$/gm, "<li class='list-disc ml-5 mb-1 text-slate-600 font-medium'>$1</li>");
  html = html.replace(/^\s*\*\s+(.*?)$/gm, "<li class='list-disc ml-5 mb-1 text-slate-600 font-medium'>$1</li>");
  
  // Code block
  html = html.replace(/```([\s\S]*?)```/g, "<pre class='bg-slate-50 border border-slate-200 text-slate-800 p-3 rounded-lg text-[11px] font-mono my-2.5 overflow-x-auto whitespace-pre-wrap font-medium'>$1</pre>");
  
  // Inline code
  html = html.replace(/`(.*?)`/g, "<code class='bg-slate-100 text-indigo-600 font-semibold px-1 rounded font-mono text-[11px]'>$1</code>");
  
  // Paragraph split
  html = html.split("\n\n").map(para => {
    if (para.trim().startsWith("<li") || para.trim().startsWith("<pre") || para.trim().startsWith("<h")) {
      return para;
    }
    return `<p class="mb-2 leading-relaxed text-slate-600 font-medium">${para}</p>`;
  }).join("\n");
  
  return html;
}

export default function AiAssistant({ csvData, criteria, appTitle }: AiAssistantProps) {
  const [activeTab, setActiveTab] = useState<"report" | "chat">("report");
  
  // AI Report State
  const [report, setReport] = useState<AiReportResponse | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportLoadingStage, setReportLoadingStage] = useState("");

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "안녕하세요! 업로드하신 QA 데이터를 학습한 AI QA 어시스턴트입니다. 특정 모듈의 오류 패턴, 품질 위험 항목, 또는 배포 준비도에 대해 무엇이든 여쭤보세요! 💬",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSendingMessage]);

  const generateAiReport = async () => {
    if (!csvData || csvData.length === 0) return;
    
    setIsGeneratingReport(true);
    setReportError(null);
    setReport(null);
    
    const stages = [
      "QA 대장 레코드 파싱 중...",
      "릴리즈 합격 게이트 검증 조건 맵핑 중...",
      "Gemini AI 모델 연산 가동 중 (gemini-3.5-flash)...",
      "품질 보고서 레이아웃 고도화 중..."
    ];
    
    let currentStage = 0;
    setReportLoadingStage(stages[0]);
    const stageInterval = setInterval(() => {
      if (currentStage < stages.length - 1) {
        currentStage++;
        setReportLoadingStage(stages[currentStage]);
      }
    }, 1500);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvData,
          customCriteria: `최소 Pass율: ${criteria.minPassRate}%, 최대 Critical: ${criteria.maxCriticalBugs}개, 최대 High: ${criteria.maxHighBugs}개, Blocked 허용여부: ${criteria.blockedAllowed ? "허용" : "비허용"}`
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "리포트 생성 도중 오류가 발생했습니다.");
      }

      const reportData = await response.json();
      setReport(reportData);
    } catch (err: any) {
      console.error(err);
      setReportError(err.message || "서버 통신 실패 또는 API 키가 누락되었습니다.");
    } finally {
      clearInterval(stageInterval);
      setIsGeneratingReport(false);
    }
  };

  const sendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isSendingMessage) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsSendingMessage(true);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvData,
          history: chatHistory,
          message: textToSend
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "메시지 전송 중 오류가 발생했습니다.");
      }

      const replyData = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: replyData.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `❌ 오류가 발생했습니다: ${err.message || "네트워크 통신 장행입니다."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status ? status.toLowerCase() : "";
    if (s.includes("ready") && !s.includes("not")) return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    if (s.includes("conditional")) return "bg-amber-50 text-amber-700 border-amber-200/80";
    return "bg-rose-50 text-rose-700 border-rose-200/80";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden print-card text-slate-800">
      {/* Assistant Tab Header */}
      <div className="bg-slate-50 text-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-200 no-print">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
          <div>
            <h2 className="text-base font-bold font-display text-slate-800">Gemini AI 품질 보고 기획가</h2>
            <p className="text-[10px] text-slate-500 font-semibold">데이터를 독해해 임원 보고 및 릴리즈 준비를 돕습니다.</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("report")}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              activeTab === "report" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            AI 종합 보고서
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              activeTab === "chat" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            QA AI 어시스턴트
          </button>
        </div>
      </div>

      {/* RENDER REPORT TAB */}
      {activeTab === "report" && (
        <div className="p-6">
          {!report && !isGeneratingReport && (
            <div className="text-center py-10 no-print">
              <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                <Bot className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">인공지능 대시보드 브리핑</h3>
              <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto mb-5 leading-normal">
                현재 업로드된 CSV 품질 데이터 전체를 파싱해 릴리즈 게이트 조건 충족 여부, 최우선 조치 모듈, 리스크 요소를 담은 원페이지 보고서를 초안으로 작성해 드립니다.
              </p>
              <button
                onClick={generateAiReport}
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition shadow-xs border-none cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                AI 종합 보고서 초안 생성 시작
              </button>
            </div>
          )}

          {isGeneratingReport && (
            <div className="text-center py-16 no-print">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
              <h3 className="text-sm font-bold text-slate-700 mb-1">QA 보고 자료 기획 중...</h3>
              <p className="text-xs text-slate-400 font-mono font-semibold animate-pulse">{reportLoadingStage}</p>
            </div>
          )}

          {reportError && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex flex-col gap-3 items-center text-center max-w-md mx-auto my-6 no-print">
              <ShieldAlert className="w-8 h-8 text-rose-600" />
              <div>
                <h4 className="text-xs font-bold text-rose-800">보고서 작성 실패</h4>
                <p className="text-[11px] text-rose-600 font-semibold mt-1 leading-normal">{reportError}</p>
              </div>
              <button
                onClick={generateAiReport}
                className="flex items-center gap-1 text-[11px] font-bold bg-transparent border border-rose-200 text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> 다시 시도
              </button>
            </div>
          )}

          {report && (
            <div className="space-y-6">
              {/* Header inside Report view - always visible in print */}
              <div className="hidden print:block border-b border-slate-200 pb-3 mb-4">
                <h2 className="text-lg font-bold text-slate-900">Gemini AI 생성 릴리즈 승인 보고서</h2>
                <p className="text-xs text-slate-500 font-semibold">데이터 기반 자동 도출 레포트 • 대상: {appTitle}</p>
              </div>

              {/* Status Header Block */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Executive Summary</span>
                  <p className="text-xs font-semibold text-slate-600 mt-1.5 leading-relaxed">
                    {report.executiveSummary}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">종합 릴리즈 준비도</span>
                  <div className="text-3xl font-extrabold text-slate-800 font-mono">{report.releaseReadinessScore}%</div>
                  <div className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusColor(report.releaseStatus)}`}>
                    {report.releaseStatus}
                  </div>
                </div>
              </div>

              {/* Release Justification */}
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <h4 className="text-xs font-bold text-indigo-700 flex items-center gap-1.5 mb-1.5 font-display">
                  <FileCheck2 className="w-4 h-4 text-indigo-600" />
                  릴리즈 도출 근거 및 타당성 (Justification)
                </h4>
                <p className="text-xs text-indigo-900/90 font-medium leading-relaxed">
                  {report.releaseJustification}
                </p>
              </div>

              {/* Two Column Section: Top Risks & Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Risks */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
                  <h4 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider font-display">⚠️ 품질 임계 위험요소 (Critical Risks)</h4>
                  <div className="space-y-3">
                    {report.topRisks.map((risk, index) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-800">{risk.risk}</span>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                            risk.impact === "High" ? "bg-rose-50 text-rose-700 border-rose-200" :
                            risk.impact === "Medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-slate-100 text-slate-600 border-slate-200"
                          }`}>
                            {risk.impact} Risk
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-normal font-semibold">
                          <strong className="text-slate-600 font-extrabold">완화 조치:</strong> {risk.mitigation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
                  <h4 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider font-display">🚀 권장 액션 가이드라인 (Recommendations)</h4>
                  <ul className="space-y-2">
                    {report.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-slate-600 font-semibold leading-normal">
                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 font-mono">
                          {index + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Module-by-Module Analytics Insights */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
                <h4 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider font-display">📦 컴포넌트 단위 품질 진단 및 의견 (Module Insights)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {report.moduleInsights.map((insight, index) => (
                    <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-slate-800 font-display truncate pr-2">{insight.module}</span>
                        <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-extrabold shrink-0 border border-rose-200">
                          버그 {insight.issueCount}개
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                        {insight.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Re-generate button no-print */}
              <div className="flex justify-end pt-2 no-print">
                <button
                  onClick={generateAiReport}
                  className="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-2xs cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  리포트 갱신 (다시 분석)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER CHAT TAB */}
      {activeTab === "chat" && (
        <div className="flex flex-col h-[520px] no-print bg-slate-50/50">
          {/* Chat Window Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                  msg.role === "user"
                    ? "bg-slate-100 border border-slate-200 text-slate-700"
                    : "bg-indigo-50 border border-indigo-200 text-indigo-600"
                }`}>
                  {msg.role === "user" ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1">
                  <div className={`rounded-2xl p-3 shadow-2xs text-xs ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none font-medium"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-none leading-relaxed shadow-3xs font-medium"
                  }`}>
                    {msg.role === "user" ? (
                      msg.content
                    ) : (
                      <div 
                        className="markdown-body space-y-1"
                        dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(msg.content) }} 
                      />
                    )}
                  </div>
                  <div className={`text-[10px] text-slate-400 font-bold ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isSendingMessage && (
              <div className="flex gap-3 max-w-[85%] mr-auto">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-3xs text-xs flex items-center gap-1.5 text-slate-500 font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  답변을 기안하는 중...
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick Ask Helpers */}
          <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex gap-1.5 overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => sendMessage("현재 릴리즈가 보류되는 주요 사유를 세 가지만 핵심 요약해줘")}
              className="text-[10px] bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold shadow-3xs cursor-pointer"
            >
              📋 보류 사유 핵심 요약
            </button>
            <button
              onClick={() => sendMessage("가장 장애/오류가 빈번한 취약 모듈과 그 구체적인 이유를 가르쳐줘")}
              className="text-[10px] bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold shadow-3xs cursor-pointer"
            >
              📦 가장 취약한 모듈 분석
            </button>
            <button
              onClick={() => sendMessage("개발팀 슬랙(Slack) 채널에 전파할 수 있는 엄격하고 예의 바른 품질 현황 공지 요약본 작성해줘")}
              className="text-[10px] bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold shadow-3xs cursor-pointer"
            >
              💬 슬랙 전파용 품질 공유글
            </button>
          </div>

          {/* Chat Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="p-3 border-t border-slate-200 bg-slate-50 flex gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="QA 데이터에 관해 질문을 입력해 보세요... (예: Alice가 실행한 테스트의 통과율은?)"
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 text-slate-800 font-semibold shadow-3xs"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSendingMessage}
              className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition shrink-0 cursor-pointer border-none shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
