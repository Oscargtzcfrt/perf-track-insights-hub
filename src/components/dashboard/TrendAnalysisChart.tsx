
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Legend,
  Tooltip,
  ReferenceLine
} from "recharts";

interface TrendAnalysisChartProps {
  title: string;
  description?: string;
  data: Array<any>;
  kpis: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
  timeRanges?: Array<{
    value: string;
    label: string;
  }>;
  className?: string;
}

const TrendAnalysisChart = ({
  title,
  description,
  data,
  kpis,
  timeRanges = [
    { value: "1M", label: "1 Month" },
    { value: "3M", label: "3 Months" },
    { value: "6M", label: "6 Months" },
    { value: "1Y", label: "1 Year" },
  ],
  className,
}: TrendAnalysisChartProps) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRanges[0]?.value);
  
  // Default colors for lines if not specified
  const defaultColors = [
    "#3f9ae0", // Blue
    "#10b981", // Green
    "#f59e0b", // Yellow
    "#ef4444", // Red
    "#8b5cf6", // Purple
  ];
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-col sm:flex-row justify-between gap-2">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <Tabs 
          defaultValue={selectedTimeRange} 
          onValueChange={setSelectedTimeRange}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-4 sm:w-[300px]">
            {timeRanges.map(range => (
              <TabsTrigger key={range.value} value={range.value}>
                {range.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={
              Object.fromEntries(
                kpis.map((kpi, index) => [
                  kpi.id,
                  { color: kpi.color || defaultColors[index % defaultColors.length] }
                ])
              )
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                {kpis.map((kpi, index) => (
                  <Line
                    key={kpi.id}
                    type="monotone"
                    dataKey={kpi.id}
                    name={kpi.name}
                    stroke={`var(--color-${kpi.id})`}
                    activeDot={{ r: 6 }}
                    strokeWidth={2}
                  />
                ))}
                <ReferenceLine
                  y={100}
                  label="Target"
                  stroke="#8884d8"
                  strokeDasharray="3 3"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendAnalysisChart;
