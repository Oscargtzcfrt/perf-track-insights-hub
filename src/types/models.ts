
export interface Person {
  id: string;
  name: string;
  email: string;
  departmentId: string;
}

export interface Department {
  id: string;
  name: string;
  kpiIds: string[];
}

export interface KpiVariable {
  name: string;
  label: string;
}

export type KpiOptimumType = "higher" | "lower" | "target";

export interface Kpi {
  id: string;
  name: string;
  description: string;
  unit: string;
  optimumType: KpiOptimumType;
  variables: KpiVariable[];
  formula: string;
}

export interface PeriodType {
  year: number;
  month?: number;
  quarter?: number;
}

export interface KpiDataEntry {
  id: string;
  personId?: string;
  departmentId?: string;
  kpiId: string;
  period: PeriodType;
  variableValues: Record<string, number>;
  dateRecorded: string;
}

// New types for performance analysis

export interface PerformanceResult {
  kpiId: string;
  kpiName: string;
  rawValue: number | null;
  normalizedScore: number;
  unit: string;
}

export interface PersonPerformance {
  personId: string;
  personName: string;
  departmentId: string;
  departmentName: string;
  overallScore: number;
  kpiResults: PerformanceResult[];
  lastUpdated: Date | null;
}

export interface DepartmentPerformance {
  departmentId: string;
  departmentName: string;
  overallScore: number;
  kpiResults: PerformanceResult[];
  peopleCount: number;
  kpiCount: number;
}

