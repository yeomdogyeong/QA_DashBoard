import React from "react";
import { motion } from "motion/react";
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, Activity, ShieldCheck, Milestone } from "lucide-react";
import { MetricAnalysis, ReleaseCriteria } from "../types";

interface ReportMetricsProps {
  analysis: MetricAnalysis;
  criteria: ReleaseCriteria;
  dataType: "tests" | "defects";
  appTitle: string;
  appVersion: string;
}

export default function ReportMetrics({ analysis, criteria, dataType, appTitle, appVersion }: ReportMetricsProps) {
  // Check if current metrics meet the target criteria
  const meetsPassRate = analysis.passRate >= criteria.minPassRate;
  const meetsCriticalBugs = analysis.criticalCount <= criteria.maxCriticalBugs;
  const meetsHighBugs = analysis.highCount <= criteria.maxHighBugs;
  const meetsBlocked = criteria.blockedAllowed || analysis.blockedCount === 0;

  const isReleased = meetsPassRate && meetsCriticalBugs && meetsHighBugs && meetsBlocked;

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Release Audit Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        id="release-audit-banner"
        className={`rounded-2xl border p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isReleased
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-widest ${
              isReleased ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
            }`}>
              {dataType === "tests" ? "TEST RUN SUMMARY" : "DEFECT AUDIT"}
            </span>
            <span className="text-slate-500 font-mono text-xs font-semibold">v{appVersion}</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            {appTitle} QA Audit Report
          </h1>
          <p className="text-xs text-slate-500 leading-normal font-medium">
            설정된 품질 게이트 지표를 기반으로 한 실시간 릴리즈 합격 여부입니다.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs shrink-0 print:border-slate-200">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isReleased ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
          }`}>
            {isReleased ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">배포 가능 상태</div>
            <div className={`text-base font-extrabold font-display ${
              isReleased ? "text-emerald-600" : "text-rose-600"
            }`}>
              {isReleased ? "GO (승인)" : "NO GO (보류)"}
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Total Records */}
        <motion.div
          variants={itemVariants}
          id="kpi-card-total"
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs print-card"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">전체 케이스 수</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-800">
            {analysis.totalCount}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            분석 대상 CSV 레코드
          </div>
        </motion.div>

        {/* Pass Rate or Defect Clearance */}
        <motion.div
          variants={itemVariants}
          id="kpi-card-pass"
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs print-card"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">
              {dataType === "tests" ? "테스트 통과율" : "결함 해결율"}
            </span>
            {meetsPassRate ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div className="text-2xl font-bold font-mono text-slate-800 flex items-baseline gap-1">
            <span className={meetsPassRate ? "text-emerald-600" : "text-rose-600"}>{analysis.passRate}%</span>
            <span className="text-xs font-normal text-slate-400">/ {criteria.minPassRate}%</span>
          </div>
          <div className="text-[10px] mt-1 flex items-center gap-1 font-semibold">
            <span className={`w-1.5 h-1.5 rounded-full ${meetsPassRate ? "bg-emerald-500" : "bg-rose-500"}`} />
            <span className={meetsPassRate ? "text-emerald-600" : "text-rose-600"}>
              {meetsPassRate ? "목표 충족" : `${criteria.minPassRate - analysis.passRate}%p 부족`}
            </span>
          </div>
        </motion.div>

        {/* Critical/Blocker count */}
        <motion.div
          variants={itemVariants}
          id="kpi-card-critical"
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs print-card"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">Critical 결함 수</span>
            {meetsCriticalBugs ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div className="text-2xl font-bold font-mono text-slate-800 flex items-baseline gap-1">
            <span className={analysis.criticalCount === 0 ? "text-slate-700" : "text-rose-600"}>{analysis.criticalCount}</span>
            <span className="text-xs font-normal text-slate-400">/ Max {criteria.maxCriticalBugs}</span>
          </div>
          <div className="text-[10px] mt-1 flex items-center gap-1 font-semibold">
            <span className={`w-1.5 h-1.5 rounded-full ${meetsCriticalBugs ? "bg-emerald-500" : "bg-rose-500"}`} />
            <span className={meetsCriticalBugs ? "text-emerald-600" : "text-rose-600"}>
              {meetsCriticalBugs ? "기준 합격" : `${analysis.criticalCount - criteria.maxCriticalBugs}개 초과`}
            </span>
          </div>
        </motion.div>

        {/* High severity count */}
        <motion.div
          variants={itemVariants}
          id="kpi-card-high"
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs print-card"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">High Severity 결함</span>
            {meetsHighBugs ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div className="text-2xl font-bold font-mono text-slate-800 flex items-baseline gap-1">
            <span className={meetsHighBugs ? "text-slate-700" : "text-rose-600"}>{analysis.highCount}</span>
            <span className="text-xs font-normal text-slate-400">/ Max {criteria.maxHighBugs}</span>
          </div>
          <div className="text-[10px] mt-1 flex items-center gap-1 font-semibold">
            <span className={`w-1.5 h-1.5 rounded-full ${meetsHighBugs ? "bg-emerald-500" : "bg-rose-500"}`} />
            <span className={meetsHighBugs ? "text-emerald-600" : "text-rose-600"}>
              {meetsHighBugs ? "기준 합격" : `${analysis.highCount - criteria.maxHighBugs}개 초과`}
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Criteria Checklist Grid */}
      <div className="bg-slate-100 border border-slate-200/80 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center no-print shadow-2xs">
        <div className="flex items-center gap-2">
          <Milestone className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-xs font-bold text-slate-500">릴리즈 품질 게이트 준수 현황:</span>
        </div>
        
        <div className="grid grid-cols-2 md:flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            {meetsPassRate ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="text-slate-700">통과율 {criteria.minPassRate}% 이상</span>
          </div>

          <div className="flex items-center gap-1.5">
            {meetsCriticalBugs ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="text-slate-700">Critical 결함 {criteria.maxCriticalBugs}개 이하</span>
          </div>

          <div className="flex items-center gap-1.5">
            {meetsHighBugs ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="text-slate-700">High 결함 {criteria.maxHighBugs}개 이하</span>
          </div>

          <div className="flex items-center gap-1.5">
            {meetsBlocked ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="text-slate-700">Blocked 허용 여부 ({criteria.blockedAllowed ? "허용" : "차단"})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
