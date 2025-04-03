
import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DepartmentPersonView = () => {
  const { kpis, departments, people, kpiDataEntries, calculateKpiValue } = useData();
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    departments.length > 0 ? departments[0].id : ""
  );

  // Filter people by selected department
  const departmentPeople = people.filter(
    person => person.departmentId === selectedDepartment
  );

  // Calculate person performance for the selected department
  const personPerformance = departmentPeople.map(person => {
    const personEntries = kpiDataEntries.filter(entry => entry.personId === person.id);
    
    // Get KPIs associated with this department
    const department = departments.find(d => d.id === selectedDepartment);
    const departmentKpis = department 
      ? kpis.filter(kpi => department.kpiIds.includes(kpi.id))
      : [];
    
    let totalScore = 0;
    let totalWeight = 0;
    const kpiResults: Array<{kpi: typeof kpis[0], score: number, value: number | null}> = [];
    
    departmentKpis.forEach(kpi => {
      const entries = personEntries.filter(entry => entry.kpiId === kpi.id);
      
      if (entries.length > 0) {
        let sum = 0;
        let count = 0;
        let latestValue = null;
        
        // Find the most recent entry
        const latestEntry = entries.sort((a, b) => 
          new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime()
        )[0];
        
        latestValue = calculateKpiValue(kpi, latestEntry.variableValues);
        
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
          
          // Simple normalization between 0-100
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
          
          kpiResults.push({
            kpi,
            score: normalizedScore,
            value: latestValue
          });
          
          totalScore += normalizedScore;
          totalWeight++;
        }
      } else {
        kpiResults.push({
          kpi,
          score: 0,
          value: null
        });
      }
    });
    
    return {
      person,
      score: totalWeight > 0 ? totalScore / totalWeight : 0,
      kpiResults,
      lastEntry: personEntries.length > 0 
        ? new Date(Math.max(...personEntries.map(e => new Date(e.dateRecorded).getTime())))
        : null
    };
  });
  
  const getStatusIcon = (score: number) => {
    if (score >= 70) return <ChevronUp className="text-green-500" />;
    if (score >= 40) return <Minus className="text-yellow-500" />;
    return <ChevronDown className="text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Department:</span>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map(dept => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedDepartment ? (
        departmentPeople.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {departments.find(d => d.id === selectedDepartment)?.name} - Team Performance
              </CardTitle>
              <CardDescription>
                Individual performance for team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Last Update</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {personPerformance.map((item) => (
                      <TableRow key={item.person.id}>
                        <TableCell className="font-medium">{item.person.name}</TableCell>
                        <TableCell>{item.score.toFixed(1)}%</TableCell>
                        <TableCell>
                          {item.lastEntry 
                            ? item.lastEntry.toLocaleDateString() 
                            : "No data"}
                        </TableCell>
                        <TableCell className="flex items-center">
                          {getStatusIcon(item.score)}
                          <span className="ml-1">
                            {item.score >= 70 
                              ? "Good" 
                              : item.score >= 40 
                                ? "Average" 
                                : "Needs Improvement"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* KPI breakdown for the department */}
              <div className="mt-6">
                <h4 className="font-medium mb-2">KPI Breakdown by Person</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Person</TableHead>
                        {departments.find(d => d.id === selectedDepartment)?.kpiIds.map(kpiId => {
                          const kpi = kpis.find(k => k.id === kpiId);
                          return kpi ? (
                            <TableHead key={kpi.id} title={kpi.description}>
                              {kpi.name}
                            </TableHead>
                          ) : null;
                        })}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {personPerformance.map(person => (
                        <TableRow key={person.person.id}>
                          <TableCell>{person.person.name}</TableCell>
                          {departments.find(d => d.id === selectedDepartment)?.kpiIds.map(kpiId => {
                            const result = person.kpiResults.find(r => r.kpi.id === kpiId);
                            return (
                              <TableCell key={kpiId}>
                                {result?.value !== null 
                                  ? `${result?.value?.toFixed(1)} ${result?.kpi.unit}`
                                  : "-"
                                }
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">
                No people assigned to this department
              </p>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">
              Please select a department
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DepartmentPersonView;
