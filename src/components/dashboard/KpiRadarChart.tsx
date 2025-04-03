
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer, 
  Legend 
} from "recharts";

interface KpiRadarChartProps {
  title: string;
  description?: string;
  data: Array<{
    name: string;
    value: number;
    fullMark: number;
  }>;
  className?: string;
}

const KpiRadarChart = ({ 
  title, 
  description, 
  data,
  className 
}: KpiRadarChartProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              performance: {
                color: "#3f9ae0",
              },
              target: {
                color: "rgba(63, 154, 224, 0.2)",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="var(--color-performance)"
                  fill="var(--color-performance)"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Target"
                  dataKey="fullMark"
                  stroke="var(--color-target)"
                  fill="var(--color-target)"
                  fillOpacity={0.3}
                />
                <Legend />
                <ChartTooltip 
                  content={<ChartTooltipContent formatter={(value) => [`${value}%`]} />} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default KpiRadarChart;
