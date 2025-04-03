
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";

interface KpiSummaryCardProps {
  title: string;
  value: number;
  target?: number;
  unit: string;
  optimumType: "higher" | "lower" | "target";
  previousValue?: number;
  className?: string;
}

const KpiSummaryCard = ({
  title,
  value,
  target = 100,
  unit,
  optimumType,
  previousValue,
  className,
}: KpiSummaryCardProps) => {
  // Calculate percentage based on optimum type
  const calculatePercentage = () => {
    switch (optimumType) {
      case "higher":
        return Math.min(100, (value / target) * 100);
      case "lower":
        // Lower is better, so 100% when value is 0, 0% when value reaches or exceeds target
        return Math.max(0, 100 - (value / target) * 100);
      case "target":
        // 100% when value equals target, decreasing as it moves away
        return Math.max(0, 100 - Math.abs(((value - target) / target) * 100));
    }
  };

  const percentage = calculatePercentage();
  
  // Calculate trend percentage if previous value exists
  const trendPercentage = previousValue !== undefined 
    ? ((value - previousValue) / previousValue) * 100
    : null;
  
  // Determine color based on percentage and optimum type
  const getColor = () => {
    if (percentage >= 70) return "#10b981"; // Green
    if (percentage >= 40) return "#f59e0b"; // Yellow/Orange
    return "#ef4444"; // Red
  };

  const getStatusIcon = (score: number) => {
    if (score >= 70) return <ChevronUp className="text-green-500" />;
    if (score >= 40) return <Minus className="text-yellow-500" />;
    return <ChevronDown className="text-red-500" />;
  };

  // Data for gauge chart
  const data = [
    { name: "Progress", value: percentage },
    { name: "Remaining", value: 100 - percentage }
  ];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {value.toLocaleString()} {unit}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Target: {target.toLocaleString()} {unit}
            </div>
            
            {trendPercentage !== null && (
              <div className="flex items-center mt-1">
                {trendPercentage > 0 ? (
                  <ChevronUp className={cn("h-4 w-4", optimumType === "lower" ? "text-red-500" : "text-green-500")} />
                ) : trendPercentage < 0 ? (
                  <ChevronDown className={cn("h-4 w-4", optimumType === "lower" ? "text-green-500" : "text-red-500")} />
                ) : (
                  <Minus className="h-4 w-4 text-gray-500" />
                )}
                <span className={cn("text-xs ml-1", 
                  (trendPercentage > 0 && optimumType !== "lower") || (trendPercentage < 0 && optimumType === "lower") 
                    ? "text-green-500" 
                    : (trendPercentage !== 0) ? "text-red-500" : "text-gray-500"
                )}>
                  {Math.abs(trendPercentage || 0).toFixed(1)}% from previous
                </span>
              </div>
            )}
          </div>
          
          <div className="h-24 w-24">
            <ChartContainer
              config={{
                progress: {
                  color: getColor(),
                },
                remaining: {
                  color: "#e5e7eb",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius="70%"
                    outerRadius="100%"
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell key="progress" fill="var(--color-progress)" />
                    <Cell key="remaining" fill="var(--color-remaining)" />
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent formatter={(value) => [`${value}%`]} />} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-xl font-bold">{Math.round(percentage)}%</span>
                  <div className="flex justify-center mt-1">
                    {getStatusIcon(percentage)}
                  </div>
                </div>
              </div>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KpiSummaryCard;
