
import React, { useState, useMemo } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import KpiSummaryCard from "./KpiSummaryCard";
import KpiRadarChart from "./KpiRadarChart";
import TrendAnalysisChart from "./TrendAnalysisChart";

const EnhancedDashboardView = () => {
  const { kpis, departments, people, kpiDataEntries, calculateKpiValue } = useData();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  // Calculate the current period (this month)
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Calculate previous period (last month)
  const prevDate = new Date(currentDate);
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevYear = prevDate.getFullYear();
  const prevMonth = prevDate.getMonth() + 1;

  // Calculate KPI values for current period
  const kpiResults = useMemo(() => {
    return kpis.map(kpi => {
      // Filter entries for the current period
      const entries = kpiDataEntries.filter(entry => 
        entry.kpiId === kpi.id && 
        entry.period.year === currentYear && 
        entry.period.month === currentMonth
      );

      // Filter by department if selected
      const filteredEntries = selectedDepartment !== "all" 
        ? entries.filter(entry => {
            if (entry.departmentId) {
              return entry.departmentId === selectedDepartment;
            }
            if (entry.personId) {
              const person = people.find(p => p.id === entry.personId);
              return person?.departmentId === selectedDepartment;
            }
            return false;
          })
        : entries;
      
      if (filteredEntries.length === 0) {
        return {
          kpi,
          currentValue: null,
          previousValue: null
        };
      }
      
      // Calculate average for current period
      let currentSum = 0;
      let currentCount = 0;
      
      for (const entry of filteredEntries) {
        const result = calculateKpiValue(kpi, entry.variableValues);
        if (result !== null) {
          currentSum += result;
          currentCount++;
        }
      }
      
      const currentValue = currentCount > 0 ? currentSum / currentCount : null;
      
      // Calculate previous period value
      const prevEntries = kpiDataEntries.filter(entry => 
        entry.kpiId === kpi.id && 
        entry.period.year === prevYear && 
        entry.period.month === prevMonth
      );
      
      const prevFilteredEntries = selectedDepartment !== "all" 
        ? prevEntries.filter(entry => {
            if (entry.departmentId) {
              return entry.departmentId === selectedDepartment;
            }
            if (entry.personId) {
              const person = people.find(p => p.id === entry.personId);
              return person?.departmentId === selectedDepartment;
            }
            return false;
          })
        : prevEntries;
      
      let prevSum = 0;
      let prevCount = 0;
      
      for (const entry of prevFilteredEntries) {
        const result = calculateKpiValue(kpi, entry.variableValues);
        if (result !== null) {
          prevSum += result;
          prevCount++;
        }
      }
      
      const previousValue = prevCount > 0 ? prevSum / prevCount : null;
      
      return {
        kpi,
        currentValue,
        previousValue
      };
    }).filter(item => item.currentValue !== null);
  }, [kpis, kpiDataEntries, selectedDepartment, currentYear, currentMonth, prevYear, prevMonth, people, calculateKpiValue]);

  // Prepare data for radar chart
  const radarData = useMemo(() => {
    return kpiResults.map(item => ({
      name: item.kpi.name,
      value: item.kpi.optimumType === "lower" 
        ? Math.max(0, 100 - (item.currentValue || 0)) 
        : Math.min(100, item.currentValue || 0),
      fullMark: 100
    }));
  }, [kpiResults]);

  // Prepare trend data for the last 6 months
  const trendData = useMemo(() => {
    const data = [];
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      let month = currentMonth - i;
      let year = currentYear;
      
      if (month <= 0) {
        month += 12;
        year -= 1;
      }
      
      const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'short' });
      
      const periodData: any = {
        period: `${monthName} ${year}`,
      };
      
      // Add KPI values for this month
      kpis.forEach(kpi => {
        const entriesForMonth = kpiDataEntries.filter(entry => 
          entry.kpiId === kpi.id && 
          entry.period.year === year && 
          entry.period.month === month
        );
        
        // Filter by department if selected
        const filteredEntries = selectedDepartment !== "all" 
          ? entriesForMonth.filter(entry => {
              if (entry.departmentId) {
                return entry.departmentId === selectedDepartment;
              }
              if (entry.personId) {
                const person = people.find(p => p.id === entry.personId);
                return person?.departmentId === selectedDepartment;
              }
              return false;
            })
          : entriesForMonth;
        
        if (filteredEntries.length > 0) {
          let sum = 0;
          let count = 0;
          
          for (const entry of filteredEntries) {
            const result = calculateKpiValue(kpi, entry.variableValues);
            if (result !== null) {
              sum += result;
              count++;
            }
          }
          
          if (count > 0) {
            periodData[kpi.id] = sum / count;
          }
        }
      });
      
      data.push(periodData);
    }
    
    return data;
  }, [kpis, kpiDataEntries, selectedDepartment, currentMonth, currentYear, people, calculateKpiValue]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Enhanced KPI Dashboard</h2>
          <p className="text-muted-foreground">
            Interactive visualizations of key performance indicators
          </p>
        </div>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {kpiResults.slice(0, 6).map(item => (
          item.currentValue !== null && (
            <KpiSummaryCard
              key={item.kpi.id}
              title={item.kpi.name}
              value={item.currentValue}
              unit={item.kpi.unit}
              optimumType={item.kpi.optimumType}
              previousValue={item.previousValue || undefined}
              target={100} // Assuming a default target of 100 for simplicity
            />
          )
        ))}
      </div>

      {/* Advanced Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart for KPI Performance Comparison */}
        {radarData.length > 2 && (
          <KpiRadarChart
            title="KPI Performance Overview"
            description="Multi-dimensional comparison of KPI achievement levels"
            data={radarData}
          />
        )}
        
        {/* Trend Analysis Chart */}
        <TrendAnalysisChart
          title="KPI Trends Analysis"
          description="Historical performance with 6-month data"
          data={trendData}
          kpis={kpis.map(kpi => ({ id: kpi.id, name: kpi.name }))}
        />
      </div>
    </div>
  );
};

export default EnhancedDashboardView;
