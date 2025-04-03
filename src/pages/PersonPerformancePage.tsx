
import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import { Link, Outlet } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown, Minus, Search, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PersonPerformance } from "@/types/models";

const PersonPerformancePage = () => {
  const { kpis, people, departments, kpiDataEntries, calculateKpiValue } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  
  // Calculate performance for each person
  const personPerformances: PersonPerformance[] = people.map(person => {
    const personEntries = kpiDataEntries.filter(entry => entry.personId === person.id);
    const department = departments.find(d => d.id === person.departmentId);
    const departmentName = department ? department.name : "No Department";
    
    const kpiResults = kpis.map(kpi => {
      const entries = personEntries.filter(entry => entry.kpiId === kpi.id);
      
      if (entries.length > 0) {
        let sum = 0;
        let count = 0;
        let latestValue = null;
        
        for (const entry of entries) {
          const result = calculateKpiValue(kpi, entry.variableValues);
          if (result !== null) {
            sum += result;
            count++;
            latestValue = result;
          }
        }
        
        if (count > 0) {
          const avg = sum / count;
          // Normalize score based on optimum type
          let normalizedScore = 0;
          
          switch (kpi.optimumType) {
            case 'higher':
              normalizedScore = Math.min(avg, 100);
              break;
            case 'lower':
              normalizedScore = Math.max(0, 100 - avg);
              break;
            case 'target':
              normalizedScore = 100 - Math.abs(100 - avg);
              break;
          }
          
          return {
            kpiId: kpi.id,
            kpiName: kpi.name,
            rawValue: latestValue,
            normalizedScore: normalizedScore,
            unit: kpi.unit
          };
        }
      }
      
      return {
        kpiId: kpi.id,
        kpiName: kpi.name,
        rawValue: null,
        normalizedScore: 0,
        unit: kpi.unit
      };
    });
    
    // Calculate overall score
    const totalScore = kpiResults.reduce((sum, kpi) => sum + kpi.normalizedScore, 0);
    const validKpis = kpiResults.filter(kpi => kpi.rawValue !== null);
    const overallScore = validKpis.length > 0 ? totalScore / validKpis.length : 0;
    
    // Get last entry date
    const lastUpdated = personEntries.length > 0
      ? new Date(Math.max(...personEntries.map(e => new Date(e.dateRecorded).getTime())))
      : null;
    
    return {
      personId: person.id,
      personName: person.name,
      departmentId: person.departmentId,
      departmentName,
      overallScore,
      kpiResults,
      lastUpdated
    };
  });
  
  // Filter by department and search term
  const filteredPerformances = personPerformances.filter(person => {
    const matchesSearch = person.personName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || person.departmentId === departmentFilter;
    return matchesSearch && matchesDepartment;
  });
  
  // Sort by performance score (descending)
  filteredPerformances.sort((a, b) => b.overallScore - a.overallScore);
  
  // Helper functions for displaying status
  const getStatusIcon = (score: number) => {
    if (score >= 70) return <ChevronUp className="text-green-500" />;
    if (score >= 40) return <Minus className="text-yellow-500" />;
    return <ChevronDown className="text-red-500" />;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Individual Performance</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>KPIs Tracked</TableHead>
                  <TableHead>Performance Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPerformances.map((performance) => (
                  <TableRow key={performance.personId} className="hover:bg-muted/50">
                    <TableCell>
                      <Link 
                        to={`/performance/person/${performance.personId}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <div className="bg-primary/10 p-1 rounded-full">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{performance.personName}</span>
                      </Link>
                    </TableCell>
                    <TableCell>{performance.departmentName}</TableCell>
                    <TableCell>
                      {performance.kpiResults.filter(k => k.rawValue !== null).length} / {performance.kpiResults.length}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 items-center">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              performance.overallScore >= 70 ? "bg-green-500" : 
                              performance.overallScore >= 40 ? "bg-yellow-500" : "bg-red-500"
                            }`} 
                            style={{ width: `${performance.overallScore}%` }}
                          />
                        </div>
                        <span>{performance.overallScore.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="flex items-center">
                      {getStatusIcon(performance.overallScore)}
                      <span className="ml-1">
                        {performance.overallScore >= 70 
                          ? "Good" 
                          : performance.overallScore >= 40 
                            ? "Average" 
                            : "Needs Improvement"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {performance.lastUpdated 
                        ? performance.lastUpdated.toLocaleDateString() 
                        : "No data"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredPerformances.length === 0 && (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">
                No matching employees found. Try adjusting your filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Outlet />
    </div>
  );
};

export default PersonPerformancePage;
