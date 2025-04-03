
import React from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";

const PersonPerformanceView = () => {
  const { kpis, people, kpiDataEntries, calculateKpiValue } = useData();

  // Calculate person performance
  const personPerformance = people.map(person => {
    const personEntries = kpiDataEntries.filter(entry => entry.personId === person.id);
    const personKpis = kpis.filter(kpi => 
      personEntries.some(entry => entry.kpiId === kpi.id)
    );
    
    let totalScore = 0;
    let totalWeight = 0;
    
    personKpis.forEach(kpi => {
      const entries = personEntries.filter(entry => entry.kpiId === kpi.id);
      
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
          
          totalScore += normalizedScore;
          totalWeight++;
        }
      }
    });
    
    return {
      person,
      score: totalWeight > 0 ? totalScore / totalWeight : 0,
      kpiCount: personKpis.length,
      lastEntry: personEntries.length > 0 
        ? new Date(Math.max(...personEntries.map(e => new Date(e.dateRecorded).getTime())))
        : null
    };
  });
  
  // Sort by score (descending)
  personPerformance.sort((a, b) => b.score - a.score);
  
  const getStatusIcon = (score: number) => {
    if (score >= 70) return <ChevronUp className="text-green-500" />;
    if (score >= 40) return <Minus className="text-yellow-500" />;
    return <ChevronDown className="text-red-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Individual Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>KPIs</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personPerformance.map((item) => (
                <TableRow key={item.person.id}>
                  <TableCell className="font-medium">{item.person.name}</TableCell>
                  <TableCell>{item.kpiCount}</TableCell>
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
      </CardContent>
    </Card>
  );
};

export default PersonPerformanceView;
