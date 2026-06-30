export interface QARecord {
  [key: string]: any;
}

export interface ReleaseCriteria {
  minPassRate: number;
  maxCriticalBugs: number;
  maxHighBugs: number;
  blockedAllowed: boolean;
}

export interface MetricAnalysis {
  totalCount: number;
  passCount: number;
  failCount: number;
  blockedCount: number;
  skippedCount: number;
  passRate: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  moduleCounts: { [module: string]: { total: number; failed: number; bugs: number } };
  severityCounts: { [severity: string]: number };
  priorityCounts: { [priority: string]: number };
  statusCounts: { [status: string]: number };
  trendData: { date: string; total: number; failed: number; bugs: number }[];
}

export interface AiReportRisk {
  risk: string;
  impact: "High" | "Medium" | "Low" | string;
  mitigation: string;
}

export interface AiReportModuleInsight {
  module: string;
  issueCount: number;
  summary: string;
}

export interface AiReportResponse {
  executiveSummary: string;
  releaseStatus: "Ready" | "Conditional Release" | "Not Ready" | string;
  releaseJustification: string;
  keyMetrics?: {
    totalTests?: string;
    passRate?: string;
    defectDensity?: string;
  };
  topRisks: AiReportRisk[];
  moduleInsights: AiReportModuleInsight[];
  recommendations: string[];
  releaseReadinessScore: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
