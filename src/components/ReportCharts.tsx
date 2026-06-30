import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { MetricAnalysis } from "../types";
import { PieChartIcon, BarChart2, ShieldAlert, LineChart } from "lucide-react";

interface ReportChartsProps {
  analysis: MetricAnalysis;
  dataType: "tests" | "defects";
}

export default function ReportCharts({ analysis, dataType }: ReportChartsProps) {
  // 1. Data for Status Pie Chart (Sleek Interface Colors)
  const statusData = [
    { name: "Pass / Resolved", value: analysis.passCount, color: "#10b981" },
    { name: "Fail / Active Bugs", value: analysis.failCount, color: "#f43f5e" },
    { name: "Blocked", value: analysis.blockedCount, color: "#f59e0b" },
    { name: "Skipped / Pending", value: analysis.skippedCount, color: "#64748b" }
  ].filter(item => item.value > 0);

  // 2. Data for Severity Distribution
  const severityData = [
    { name: "Critical", count: analysis.criticalCount, fill: "#f43f5e" },
    { name: "High", count: analysis.highCount, fill: "#f97316" },
    { name: "Medium", count: analysis.mediumCount, fill: "#f59e0b" },
    { name: "Low", count: analysis.lowCount, fill: "#10b981" }
  ];

  // 3. Data for Module QA Performance (Sort by most failed or most bugs)
  const moduleData = Object.entries(analysis.moduleCounts)
    .map(([moduleName, stats]) => ({
      name: moduleName,
      "전체 케이스 / 결함": stats.total,
      "실패 / 활성 버그": dataType === "tests" ? stats.failed : stats.bugs
    }))
    .sort((a, b) => b["실패 / 활성 버그"] - a["실패 / 활성 버그"])
    .slice(0, 8); // Top 8 modules for clarity

  // Custom tooltips to look clean and professional (Sleek Interface Light)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white text-slate-800 p-3 rounded-lg text-xs font-mono border border-slate-200 shadow-lg">
          <p className="font-bold mb-1 font-display text-slate-900">{label || payload[0].name}</p>
          <div className="space-y-1">
            {payload.map((pld: any) => (
              <p key={pld.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: pld.fill || pld.color }} />
                <span className="text-slate-500 font-semibold">{pld.name}:</span>
                <span className="font-bold text-slate-900">{pld.value}</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="dashboard-charts">
      {/* 1. Status Proportion Pie Chart */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs print-card">
        <h3 className="text-sm font-bold text-slate-800 font-display mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <PieChartIcon className="w-4 h-4 text-indigo-600" />
          {dataType === "tests" ? "테스트 실행 상태 비중" : "결함 해결 상태 비중"}
        </h3>
        
        <div className="h-64 flex flex-col justify-center relative">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-slate-400 text-xs py-10 font-medium">데이터가 존재하지 않습니다.</div>
          )}
          
          {/* Inner Text overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">PASS RATE</span>
            <span className="text-2xl font-bold text-slate-800 font-mono leading-none">{analysis.passRate}%</span>
          </div>
        </div>

        {/* Legend Custom */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-3 text-xs font-semibold text-slate-500">
          {statusData.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.name}: <span className="text-slate-800 font-bold">{item.value}개</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Severity Distribution Bar Chart */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs print-card">
        <h3 className="text-sm font-bold text-slate-800 font-display mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          중요도(Severity) 기준 결함 분포
        </h3>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={severityData}
              margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} />
              <YAxis tickLine={false} tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <p className="text-[10px] text-slate-400 text-center mt-3 font-mono font-medium">
          🚨 Critical 및 High 등급 결함은 출시 블로커(Blocker)이므로 조속한 조치가 필요합니다.
        </p>
      </div>

      {/* 3. Module Performance Stacked Bar Chart */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs md:col-span-2 print-card">
        <h3 className="text-sm font-bold text-slate-800 font-display mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <BarChart2 className="w-4 h-4 text-indigo-600" />
          모듈(Module)별 품질 분석 및 오류 발생 비중 (Top 8)
        </h3>

        <div className="h-72">
          {moduleData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={moduleData}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tickLine={false} tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} />
                <YAxis dataKey="name" type="category" tickLine={false} tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10, fontWeight: 600 }} />
                <Bar dataKey="전체 케이스 / 결함" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
                <Bar dataKey="실패 / 활성 버그" fill="#f43f5e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-slate-400 text-xs py-20 font-medium">모듈 데이터가 존재하지 않습니다.</div>
          )}
        </div>
      </div>

      {/* 4. Trend Over Time Line Chart */}
      {analysis.trendData.length > 1 && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs md:col-span-2 print-card">
          <h3 className="text-sm font-bold text-slate-800 font-display mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <LineChart className="w-4 h-4 text-emerald-500" />
            타임라인 추이분석 (Trend Line by Date)
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analysis.trendData}
                margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorBugs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} />
                <YAxis tickLine={false} tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10, fontWeight: 600 }} />
                <Area type="monotone" dataKey="total" name="전체 실행 / 로그" stroke="#4f46e5" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
                <Area type="monotone" dataKey="bugs" name="실패 및 주요 결함" stroke="#f43f5e" fillOpacity={1} fill="url(#colorBugs)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
