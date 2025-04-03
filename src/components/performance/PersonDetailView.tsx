
import React from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown, Minus, User } from "lucide-react";
import { useParams } from "react-router-dom";
import { PerformanceResult } from "@/types/models";

const PersonDetailView = () => {
  const { personId } = useParams();
  const { kpis, people, departments, kpiDataEntries, calculateKpiValue } = useData();
  
  // Find the person
  const person = people.find(p => p.id === personId);
  if (!person) return <div>Person not found</div>;
  
  // Find their department
  const department = departments.find(d => d.id === person.departmentId);
  
  // Get all KPI data for this person
  const personEntries = kpiDataEntries.filter(entry => entry.personId === person.id);
  
  // Calculate performance for each KPI
  const kpiResults: PerformanceResult[] = [];
  let totalScore = 0;
  let totalWeight = 0;
  
  kpis.forEach(kpi => {
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
          latestValue = result; // We'll use the latest result
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
        
        kpiResults.push({
          kpiId: kpi.id,
          kpiName: kpi.name,
          rawValue: latestValue,
          normalizedScore: normalizedScore,
          unit: kpi.unit
        });
        
        totalScore += normalizedScore;
        totalWeight++;
      }
    } else {
      // Add KPI with null value if no entries exist
      kpiResults.push({
        kpiId: kpi.id,
        kpiName: kpi.name,
        rawValue: null,
        normalizedScore: 0,
        unit: kpi.unit
      });
    }
  });
  
  // Calculate overall score
  const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;
  
  // Determine performance status
  const getStatusIcon = (score: number) => {
    if (score >= 70) return <ChevronUp className="text-green-500" />;
    if (score >= 40) return <Minus className="text-yellow-500" />;
    return <ChevronDown className="text-red-500" />;
  };
  
  const getStatusText = (score: number) => {
    if (score >= 70) return "Good";
    if (score >= 40) return "Average";
    return "Needs Improvement";
  };
  
  // Sort KPIs by normalized score (descending)
  kpiResults.sort((a, b) => b.normalizedScore - a.normalizedScore);
  
  // Get last entry date
  const lastEntryDate = personEntries.length > 0
    ? new Date(Math.max(...personEntries.map(e => new Date(e.dateRecorded).getTime())))
    : null;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{person.name}</h1>
            <p className="text-muted-foreground">{department?.name || "No Department"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-md border">
          <span className="text-sm text-muted-foreground">Overall Performance:</span>
          <div className="flex items-center">
            {getStatusIcon(overallScore)}
            <span className="font-medium ml-1">{overallScore.toFixed(1)}%</span>
            <span className="ml-2 text-sm text-muted-foreground">
              ({getStatusText(overallScore)})
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{person.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p>{department?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">KPIs Tracked</p>
                  <p>{kpiResults.filter(kr => kr.rawValue !== null).length} / {kpiResults.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Update</p>
                  <p>{lastEntryDate ? lastEntryDate.toLocaleDateString() : "Never"}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      overallScore >= 70 ? "bg-green-500" : 
                      overallScore >= 40 ? "bg-yellow-500" : "bg-red-500"
                    }`} 
                    style={{ width: `${overallScore}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top KPIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpiResults.slice(0, 4).map(result => (
                <div key={result.kpiId} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{result.kpiName}</p>
                    <p className="text-sm text-muted-foreground">
                      {result.rawValue !== null 
                        ? `${result.rawValue.toFixed(1)} ${result.unit}`
                        : "No data"}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(result.normalizedScore)}
                    <span className="ml-2">{result.normalizedScore.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All KPI Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>KPI Name</TableHead>
                  <TableHead>Raw Value</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Performance Score</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kpiResults.map((result) => (
                  <TableRow key={result.kpiId}>
                    <TableCell className="font-medium">{result.kpiName}</TableCell>
                    <TableCell>
                      {result.rawValue !== null ? result.rawValue.toFixed(1) : "No data"}
                    </TableCell>
                    <TableCell>{result.unit}</TableCell>
                    <TableCell>{result.normalizedScore.toFixed(1)}%</TableCell>
                    <TableCell className="flex items-center">
                      {getStatusIcon(result.normalizedScore)}
                      <span className="ml-1">
                        {getStatusText(result.normalizedScore)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonDetailView;
