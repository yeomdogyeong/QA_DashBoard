import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Papa from "papaparse";
import {
  FileSpreadsheet,
  LayoutDashboard,
  BrainCircuit,
  Settings,
  Table,
  Printer,
  FileCheck2,
  HelpCircle,
  TrendingUp,
  Download,
  Terminal,
  RefreshCw,
  Loader2
} from "lucide-react";

import { QARecord, ReleaseCriteria, MetricAnalysis } from "./types";
import { sampleDatasets } from "./mockData";
import { analyzeCsvData } from "./utils";

import CsvUploader from "./components/CsvUploader";
import ReportMetrics from "./components/ReportMetrics";
import ReportCharts from "./components/ReportCharts";
import ReportSettings from "./components/ReportSettings";
import AiAssistant from "./components/AiAssistant";

export default function App() {
  // App-wide state
  const [appTitle, setAppTitle] = useState("SaaS Web Regression Platform");
  const [appVersion, setAppVersion] = useState("3.2.0");
  const [csvData, setCsvData] = useState<QARecord[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dataType, setDataType] = useState<"tests" | "defects">("tests");
  const [activeTab, setActiveTab] = useState<"dashboard" | "ai" | "table" | "settings">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  // Quality gate release criteria
  const [criteria, setCriteria] = useState<ReleaseCriteria>({
    minPassRate: 95,
    maxCriticalBugs: 0,
    maxHighBugs: 2,
    blockedAllowed: false
  });

  // Checklist of custom manual verification items
  const [checklist, setChecklist] = useState([
    { id: "1", text: "상용 배포계(Production) 전임 카나리 모니터링 수립", checked: true },
    { id: "2", text: "신규 패치 기능 단위 인수 테스트(UAT) 최종 고객 승인", checked: true },
    { id: "3", text: "서버 취약점 포트 스캔 및 SSL 갱신 검증 완료", checked: false },
    { id: "4", text: "데이터베이스 영구 백업 스케줄러 정상 구동 확인", checked: true }
  ]);

  // Derived analysis state
  const [analysis, setAnalysis] = useState<MetricAnalysis | null>(null);

  // Load the default sample dataset on first boot so the screen is never empty
  useEffect(() => {
    const defaultSample = sampleDatasets[0]; // Regression test log
    Papa.parse(defaultSample.csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          handleDataLoaded(results.data as QARecord[], defaultSample.name, defaultSample.type);
        }
      }
    });
  }, []);

  const handleDataLoaded = (records: QARecord[], name: string, type: "tests" | "defects") => {
    setCsvData(records);
    setFileName(name);
    setDataType(type);
    
    // Auto-update title if it matches a sample
    if (name.includes("Web App")) {
      setAppTitle("SaaS Web Regression Platform");
      setAppVersion("3.2.0");
    } else if (name.includes("Mobile App")) {
      setAppTitle("FinTech Mobile Launch");
      setAppVersion("1.4.2");
    } else if (name.includes("ISO/IEC")) {
      setAppTitle("Enterprise Compliance Audit");
      setAppVersion("2026.1");
    } else {
      setAppTitle(name.replace(".csv", ""));
    }
    
    // Re-calculate analysis
    const parsedAnalysis = analyzeCsvData(records);
    setAnalysis(parsedAnalysis);
  };

  // Recalculate analysis when CSV data changes
  useEffect(() => {
    if (csvData.length > 0) {
      setAnalysis(analyzeCsvData(csvData));
    }
  }, [csvData]);

  // Export parsed data back to a raw clean CSV as a nice utility
  const handleExportCsv = () => {
    if (csvData.length === 0) return;
    const csvContent = Papa.unparse(csvData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${appTitle.replace(/\s+/g, "_")}_QA_report_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter csv records for table display
  const filteredData = csvData.filter(row => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans selection:bg-indigo-600 selection:text-white">
      {/* 1. Global Navigation Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50 no-print shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              QA
            </div>
            <div>
              <span className="text-xs font-semibold tracking-widest text-indigo-600 block leading-none mb-1 font-mono uppercase">QA Portfolio Lab</span>
              <span className="text-base font-bold font-display text-slate-900 leading-none">AI CSV QA Report Engine</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
              title="출력(Print) 또는 PDF 다운로드용 깔끔한 리포트 서식을 인쇄합니다"
            >
              <Printer className="w-4 h-4" />
              <span>PDF/인쇄 출력</span>
            </button>
            
            {csvData.length > 0 && (
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer border-none shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>CSV 내보내기</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* CSV Upload Section (Always available, hidden in Print) */}
        <CsvUploader onDataLoaded={handleDataLoaded} currentFileName={fileName} />

        {analysis ? (
          <div className="space-y-8">
            {/* 3. Tab Menu controls */}
            <div className="border-b border-slate-200 flex justify-between items-center no-print pt-2">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`pb-3 font-semibold text-xs flex items-center gap-1.5 transition-all relative cursor-pointer ${
                    activeTab === "dashboard" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  종합 대시보드
                  {activeTab === "dashboard" && (
                    <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("ai")}
                  className={`pb-3 font-semibold text-xs flex items-center gap-1.5 transition-all relative cursor-pointer ${
                    activeTab === "ai" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <BrainCircuit className="w-4 h-4" />
                  AI 품질 브리핑 & 챗
                  <span className="bg-indigo-50 text-indigo-600 font-extrabold px-1.5 py-0.5 rounded-full text-[9px] scale-90 border border-indigo-100 font-mono">Gemini</span>
                  {activeTab === "ai" && (
                    <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("table")}
                  className={`pb-3 font-semibold text-xs flex items-center gap-1.5 transition-all relative cursor-pointer ${
                    activeTab === "table" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Table className="w-4 h-4" />
                  데이터 테이블 ({filteredData.length})
                  {activeTab === "table" && (
                    <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`pb-3 font-semibold text-xs flex items-center gap-1.5 transition-all relative cursor-pointer ${
                    activeTab === "settings" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  게이트 조건 설정
                  {activeTab === "settings" && (
                    <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                  )}
                </button>
              </div>

              <div className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Loaded: {fileName || "N/A"}
              </div>
            </div>

            {/* 4. Tab Body Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                
                {/* A. DASHBOARD VIEW (Visible in Print by default) */}
                {(activeTab === "dashboard" || window.matchMedia("print").matches) && (
                  <div className="space-y-6">
                    {/* Render standard visual chart widgets - DRAGGED TO THE VERY TOP FOR PRESTIGE VISIBILITY! */}
                    <ReportCharts analysis={analysis} dataType={dataType} />

                    {/* Quality Gate Metrics Block - Positioned beneath charts for visual flow */}
                    <ReportMetrics
                      analysis={analysis}
                      criteria={criteria}
                      dataType={dataType}
                      appTitle={appTitle}
                      appVersion={appVersion}
                    />
                    
                    {/* Compact Checklist Display */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm print-card">
                      <h3 className="text-sm font-semibold text-slate-800 font-display mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <FileCheck2 className="w-4 h-4 text-emerald-500" />
                        추가 정성적 검격 체크리스트 현황
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {checklist.map(item => (
                          <div key={item.id} className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                            <input
                              type="checkbox"
                              checked={item.checked}
                              readOnly
                              className="rounded border-slate-300 text-indigo-600 focus:ring-0 pointer-events-none"
                            />
                            <span className={`text-xs font-semibold ${item.checked ? "text-slate-400 line-through" : "text-slate-700"}`}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* B. AI BREIFING TAB */}
                {activeTab === "ai" && (
                  <AiAssistant
                    csvData={csvData}
                    criteria={criteria}
                    appTitle={appTitle}
                  />
                )}

                {/* C. RAW DATA TABLE VIEW */}
                {activeTab === "table" && (
                  <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden p-5">
                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 font-display">분석용 원본 데이터 대장</h3>
                        <p className="text-[11px] text-slate-500 leading-none mt-1">CSV 파일에서 파싱된 완전한 행과 릴리즈 목록입니다.</p>
                      </div>
                      
                      <div className="w-full sm:w-64">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="검색어를 입력해 필터링..."
                          className="w-full text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[500px]">
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-600 uppercase font-mono border-b border-slate-200 sticky top-0 z-10">
                          <tr>
                            {Object.keys(csvData[0]).map((key) => (
                              <th key={key} className="px-4 py-3 font-semibold text-slate-700 tracking-wider">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredData.length > 0 ? (
                            filteredData.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/80 transition font-mono">
                                {Object.values(row).map((val, colIdx) => {
                                  const textVal = String(val).toLowerCase();
                                  const isPass = textVal.includes("pass") || textVal.includes("success") || textVal.includes("resolved") || textVal.includes("fixed");
                                  const isFail = textVal.includes("fail") || textVal.includes("error") || textVal.includes("active") || textVal.includes("critical") || textVal.includes("high");
                                  const isWarn = textVal.includes("block") || textVal.includes("warn") || textVal.includes("medium");
                                  return (
                                    <td key={colIdx} className="px-4 py-2.5 truncate max-w-[200px]" title={String(val)}>
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                        isPass ? "bg-emerald-50 text-emerald-700 font-bold border border-emerald-100" :
                                        isFail ? "bg-rose-50 text-rose-700 font-bold border border-rose-100" :
                                        isWarn ? "bg-amber-50 text-amber-700 font-bold border border-amber-100" : "text-slate-600"
                                      }`}>
                                        {String(val)}
                                      </span>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={Object.keys(csvData[0]).length} className="text-center py-10 text-slate-400 font-medium bg-slate-50">
                                검색어에 부합하는 레코드가 없습니다.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* D. QUALITY GATE CONFIG TAB */}
                {activeTab === "settings" && (
                  <ReportSettings
                    appTitle={appTitle}
                    setAppTitle={setAppTitle}
                    appVersion={appVersion}
                    setAppVersion={setAppVersion}
                    criteria={criteria}
                    setCriteria={setCriteria}
                    checklist={checklist}
                    setChecklist={setChecklist}
                  />
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-500">데이터 구조를 로드하고 가공하는 중입니다...</p>
          </div>
        )}
      </main>

      {/* Elegant minimalist footer */}
      <footer className="border-t border-slate-200 mt-16 py-6 text-center text-xs text-slate-400 font-mono no-print">
        <p>© 2026 AI CSV Quality Report Analyzer Blueprint • Built for Software QA Portfolios</p>
      </footer>
    </div>
  );
}
