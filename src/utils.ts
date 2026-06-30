import { QARecord, MetricAnalysis } from "./types";

// Helper to check substring match
const findKeyMatch = (keys: string[], keywords: string[]): string | undefined => {
  return keys.find(key => {
    const lowerKey = key.toLowerCase();
    return keywords.some(kw => lowerKey.includes(kw));
  });
};

export function detectColumns(records: QARecord[]): {
  idKey?: string;
  titleKey?: string;
  statusKey?: string;
  severityKey?: string;
  priorityKey?: string;
  moduleKey?: string;
  dateKey?: string;
  testerKey?: string;
} {
  if (!records || records.length === 0) return {};
  
  const keys = Object.keys(records[0]);
  
  return {
    idKey: findKeyMatch(keys, ["id", "key", "number"]),
    titleKey: findKeyMatch(keys, ["title", "summary", "name", "desc"]),
    statusKey: findKeyMatch(keys, ["status", "result", "state", "outcome"]),
    severityKey: findKeyMatch(keys, ["severity", "sev", "risk level", "impact"]),
    priorityKey: findKeyMatch(keys, ["priority", "pri"]),
    moduleKey: findKeyMatch(keys, ["module", "component", "area", "domain", "feature"]),
    dateKey: findKeyMatch(keys, ["date", "time", "logged", "executed", "created"]),
    testerKey: findKeyMatch(keys, ["tester", "reporter", "owner", "developer", "assigned", "author"])
  };
}

export function analyzeCsvData(records: QARecord[]): MetricAnalysis {
  const keys = detectColumns(records);
  
  let passCount = 0;
  let failCount = 0;
  let blockedCount = 0;
  let skippedCount = 0;
  
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  const moduleCounts: { [module: string]: { total: number; failed: number; bugs: number } } = {};
  const severityCounts: { [severity: string]: number } = {};
  const priorityCounts: { [priority: string]: number } = {};
  const statusCounts: { [status: string]: number } = {};
  
  // For time-series trend grouping
  const dateMap: { [date: string]: { total: number; failed: number; bugs: number } } = {};

  records.forEach(row => {
    // 1. Status Analysis
    let statusVal = "Unknown";
    if (keys.statusKey && row[keys.statusKey] !== undefined) {
      statusVal = String(row[keys.statusKey]).trim();
    }
    
    // Normalize status values
    const statusLower = statusVal.toLowerCase();
    
    // Check standard QA status values
    if (statusLower.includes("pass") || statusLower === "ok" || statusLower === "success" || statusLower === "resolved" || statusLower === "closed" || statusLower === "complete") {
      passCount++;
      statusCounts["Pass"] = (statusCounts["Pass"] || 0) + 1;
    } else if (statusLower.includes("fail") || statusLower === "failed" || statusLower === "error" || statusLower === "bug" || statusLower === "defect" || statusLower === "open" || statusLower === "reopened") {
      failCount++;
      statusCounts["Fail"] = (statusCounts["Fail"] || 0) + 1;
    } else if (statusLower.includes("block") || statusLower === "unresolved" || statusLower === "hold") {
      blockedCount++;
      statusCounts["Blocked"] = (statusCounts["Blocked"] || 0) + 1;
    } else if (statusLower.includes("skip") || statusLower.includes("pending") || statusLower === "in progress" || statusLower === "scheduled") {
      skippedCount++;
      statusCounts["Skipped"] = (statusCounts["Skipped"] || 0) + 1;
    } else {
      // General fallback categorization
      statusCounts[statusVal] = (statusCounts[statusVal] || 0) + 1;
      // Classify generic statuses based on standard dashboard styles
      if (statusLower.includes("resolved") || statusLower.includes("done")) {
        passCount++;
      } else if (statusLower.includes("in progress")) {
        skippedCount++;
      } else {
        blockedCount++;
      }
    }

    // 2. Severity Analysis
    let severityVal = "Medium";
    if (keys.severityKey && row[keys.severityKey] !== undefined) {
      severityVal = String(row[keys.severityKey]).trim();
    }
    
    const sevLower = severityVal.toLowerCase();
    if (sevLower.includes("critical") || sevLower.includes("blocker") || sevLower === "s1" || sevLower === "extreme") {
      criticalCount++;
      severityCounts["Critical"] = (severityCounts["Critical"] || 0) + 1;
    } else if (sevLower.includes("high") || sevLower === "s2" || sevLower === "major") {
      highCount++;
      severityCounts["High"] = (severityCounts["High"] || 0) + 1;
    } else if (sevLower.includes("medium") || sevLower.includes("moderate") || sevLower === "s3" || sevLower === "average") {
      mediumCount++;
      severityCounts["Medium"] = (severityCounts["Medium"] || 0) + 1;
    } else if (sevLower.includes("low") || sevLower.includes("minor") || sevLower === "s4" || sevLower === "trivial") {
      lowCount++;
      severityCounts["Low"] = (severityCounts["Low"] || 0) + 1;
    } else {
      severityCounts[severityVal] = (severityCounts[severityVal] || 0) + 1;
    }

    // 3. Priority Analysis
    let priorityVal = "P2";
    if (keys.priorityKey && row[keys.priorityKey] !== undefined) {
      priorityVal = String(row[keys.priorityKey]).trim();
    }
    priorityCounts[priorityVal] = (priorityCounts[priorityVal] || 0) + 1;

    // 4. Module Analysis
    let moduleVal = "General/Core";
    if (keys.moduleKey && row[keys.moduleKey] !== undefined) {
      moduleVal = String(row[keys.moduleKey]).trim() || "General/Core";
    }
    
    if (!moduleCounts[moduleVal]) {
      moduleCounts[moduleVal] = { total: 0, failed: 0, bugs: 0 };
    }
    moduleCounts[moduleVal].total++;
    
    // Check if the current row was a failed case or registered defect
    const isFailed = statusLower.includes("fail") || statusLower === "failed" || statusLower === "error" || statusLower === "open" || statusLower === "reopened";
    if (isFailed) {
      moduleCounts[moduleVal].failed++;
    }
    const isBug = sevLower.includes("critical") || sevLower.includes("high") || isFailed;
    if (isBug) {
      moduleCounts[moduleVal].bugs++;
    }

    // 5. Trend Analysis (Date-based)
    let dateVal = "2026-06-15"; // default fallback
    if (keys.dateKey && row[keys.dateKey] !== undefined) {
      const parsedDate = String(row[keys.dateKey]).split("T")[0].trim();
      if (parsedDate && parsedDate.length >= 8) {
        dateVal = parsedDate;
      }
    }
    
    if (!dateMap[dateVal]) {
      dateMap[dateVal] = { total: 0, failed: 0, bugs: 0 };
    }
    dateMap[dateVal].total++;
    if (isFailed) dateMap[dateVal].failed++;
    if (isBug) dateMap[dateVal].bugs++;
  });

  // Convert Trend Date Map to Sorted Array
  const trendData = Object.keys(dateMap)
    .sort()
    .map(date => ({
      date,
      total: dateMap[date].total,
      failed: dateMap[date].failed,
      bugs: dateMap[date].bugs
    }));

  const totalCount = records.length;
  const passRate = totalCount > 0 ? Math.round((passCount / (totalCount - skippedCount)) * 100) : 100;

  return {
    totalCount,
    passCount,
    failCount,
    blockedCount,
    skippedCount,
    passRate,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    moduleCounts,
    severityCounts,
    priorityCounts,
    statusCounts,
    trendData
  };
}
