import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, ResponsiveContainer, XAxis, YAxis, Bar, CartesianGrid, Tooltip, Legend, Line } from "recharts";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonPerformanceView from "@/components/dashboard/PersonPerformanceView";
import DepartmentPersonView from "@/components/dashboard/DepartmentPersonView";

const Dashboard = () => {
  const { kpis, departments, people, kpiDataEntries, calculateKpiValue } = useData();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("departments");
  
  // Calculate stats
  const totalPeople = people.length;
  const totalDepartments = departments.length;
  const totalKpis = kpis.length;
  
  // Get KPI results for charts
  const kpiResults = kpis.map(kpi => {
    const entries = kpiDataEntries.filter(entry => entry.kpiId === kpi.id);
    let filteredEntries = entries;
    
    // Filter by department if selected
    if (selectedDepartment !== "all") {
      filteredEntries = entries.filter(entry => {
        if (entry.departmentId) {
          return entry.departmentId === selectedDepartment;
        }
        if (entry.personId) {
          const person = people.find(p => p.id === entry.personId);
          return person?.departmentId === selectedDepartment;
        }
        return false;
      });
    }
    
    if (filteredEntries.length === 0) {
      return {
        kpi,
        result: null
      };
    }
    
    // Calculate average result
    let sum = 0;
    let count = 0;
    
    for (const entry of filteredEntries) {
      const result = calculateKpiValue(kpi, entry.variableValues);
      if (result !== null) {
        sum += result;
        count++;
      }
    }
    
    return {
      kpi,
      result: count > 0 ? sum / count : null
    };
  }).filter(item => item.result !== null);
  
  // Prepare chart data
  const barChartData = kpiResults.map(item => ({
    name: item.kpi.name,
    value: item.result,
    unit: item.kpi.unit
  }));
  
  // Prepare data for trend chart
  const trendData = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  // Get last 6 months
  for (let i = 5; i >= 0; i--) {
    let month = currentMonth - i;
    let year = currentYear;
    
    if (month <= 0) {
      month += 12;
      year -= 1;
    }
    
    const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'short' });
    
    const monthData: any = {
      month: `${monthName} ${year}`,
    };
    
    // Add KPI values for this month
    kpis.forEach(kpi => {
      const entriesForMonth = kpiDataEntries.filter(entry => 
        entry.kpiId === kpi.id && 
        entry.period.year === year && 
        entry.period.month === month
      );
      
      if (entriesForMonth.length > 0) {
        let sum = 0;
        let count = 0;
        
        for (const entry of entriesForMonth) {
          const result = calculateKpiValue(kpi, entry.variableValues);
          if (result !== null) {
            sum += result;
            count++;
          }
        }
        
        if (count > 0) {
          monthData[kpi.name] = sum / count;
        }
      }
    });
    
    trendData.push(monthData);
  }
  
  // Get top performing departments
  const departmentPerformance = departments.map(dept => {
    const deptKpis = kpis.filter(kpi => dept.kpiIds.includes(kpi.id));
    let totalScore = 0;
    let totalWeight = 0;
    
    deptKpis.forEach(kpi => {
      const entries = kpiDataEntries.filter(entry => 
        entry.kpiId === kpi.id &&
        (entry.departmentId === dept.id || 
         (entry.personId && people.find(p => p.id === entry.personId)?.departmentId === dept.id))
      );
      
      if (entries.length > 0) {
        let sum = 0;
        let count = 0;
        
        for (const entry of entries) {
          const result = calculateKpiValue(kpi, entry.variableValues);
          if (result !== null) {
            sum += result;
            count++;
          }
        }
        
        if (count > 0) {
          const avg = sum / count;
          // Normalize score based on optimum type
          let normalizedScore = 0;
          
          // For simplicity, normalize between 0-100
          // More sophisticated normalization would be based on target ranges
          switch (kpi.optimumType) {
            case 'higher':
              normalizedScore = Math.min(avg, 100);
              break;
            case 'lower':
              normalizedScore = Math.max(0, 100 - avg);
              break;
            case 'target':
              // Assuming target is 100 and we calculate distance from target
              normalizedScore = 100 - Math.abs(100 - avg);
              break;
          }
          
          totalScore += normalizedScore;
          totalWeight++;
        }
      }
    });
    
    return {
      department: dept,
      score: totalWeight > 0 ? totalScore / totalWeight : 0,
      kpiCount: deptKpis.length,
      peopleCount: people.filter(p => p.departmentId === dept.id).length
    };
  });
  
  // Sort department performance
  departmentPerformance.sort((a, b) => b.score - a.score);
  
  // Status icon helper function (used across various components)
  const getStatusIcon = (score: number) => {
    if (score >= 70) return <ChevronUp className="text-green-500" />;
    if (score >= 40) return <Minus className="text-yellow-500" />;
    return <ChevronDown className="text-red-500" />;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        {activeTab === "departments" && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Department:</span>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px]">
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
        )}
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDepartments}</div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              People
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPeople}</div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active KPIs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKpis}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Views Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="departments">Department View</TabsTrigger>
          <TabsTrigger value="people">People View</TabsTrigger>
          <TabsTrigger value="dept-people">Dept-Person View</TabsTrigger>
        </TabsList>
        
        {/* Department View Tab */}
        <TabsContent value="departments" className="space-y-6">
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>KPI Performance</CardTitle>
                <CardDescription>Current period average values</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {barChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name, props) => [`${value} ${props.payload.unit}`, name]}
                        />
                        <Legend />
                        <Bar dataKey="value" fill="#3f9ae0" name="Value" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No KPI data available for the selected department
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* KPI Trends Chart */}
            {trendData.some(item => Object.keys(item).length > 1) ? (
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>KPI Trends</CardTitle>
                  <CardDescription>Last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {kpis.slice(0, 3).map((kpi, index) => (
                          <Line
                            key={kpi.id}
                            type="monotone"
                            dataKey={kpi.name}
                            stroke={index === 0 ? "#3f9ae0" : index === 1 ? "#10b981" : "#f59e0b"}
                            activeDot={{ r: 8 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No historical KPI data available
              </div>
            )}
            
            {/* Department Performance Table */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>Overall KPI achievement by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left">Department</th>
                        <th className="py-3 px-4 text-left">People</th>
                        <th className="py-3 px-4 text-left">KPIs</th>
                        <th className="py-3 px-4 text-left">Performance</th>
                        <th className="py-3 px-4 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentPerformance.map((dept) => (
                        <tr key={dept.department.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{dept.department.name}</td>
                          <td className="py-3 px-4">{dept.peopleCount}</td>
                          <td className="py-3 px-4">{dept.kpiCount}</td>
                          <td className="py-3 px-4">{dept.score.toFixed(1)}%</td>
                          <td className="py-3 px-4 flex items-center">
                            {getStatusIcon(dept.score)}
                            <span className="ml-1">
                              {dept.score >= 70 ? "Good" : dept.score >= 40 ? "Average" : "Needs Improvement"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* People View Tab */}
        <TabsContent value="people">
          <PersonPerformanceView />
        </TabsContent>
        
        {/* Department-Person View Tab */}
        <TabsContent value="dept-people">
          <DepartmentPersonView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
