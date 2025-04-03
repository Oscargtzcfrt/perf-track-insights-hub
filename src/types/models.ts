
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
