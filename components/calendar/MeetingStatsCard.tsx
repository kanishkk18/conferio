import { useState } from 'react';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/animate-ui/components/animate/tooltip';
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  RadialBarChart,
  RadialBar,
  PolarGrid,
  PolarRadiusAxis,
  Label,
} from "recharts";
import { useQuery } from '@tanstack/react-query';

interface MeetingStatsCardProps {
  userId: string;
}

export default function MeetingStatsCard({ userId }: MeetingStatsCardProps) {
  const [hovered, setHovered] = useState(false);

  // Fetch meeting stats for the current month
  const { data: stats } = useQuery({
    queryKey: ['meeting-stats', userId],
    queryFn: async () => {
      const response = await fetch(`/api/meetings/stats?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const totalMeetings = stats?.totalMeetings || 0;
  const joinedMeetings = stats?.joinedMeetings || 0;
  const percentage = totalMeetings > 0 ? Math.round((joinedMeetings / totalMeetings) * 100) : 0;

  const chartData = [
    { name: 'attendance', value: percentage, fill: percentage >= 75 ? '#22c55e' : percentage >= 50 ? '#eab308' : '#ef4444' },
  ];

  const chartConfig = {
    attendance: {
      label: 'Attendance',
      color: percentage >= 75 ? '#22c55e' : percentage >= 50 ? '#eab308' : '#ef4444',
    },
  } satisfies ChartConfig;

  return (
    <TooltipProvider>
      <div className="dark:bg-neutral-900 bg-[#F4F4F5] px-8 p-6 rounded-xl flex items-center justify-center h-full relative">
        {/* Info Icon */}
        <Tooltip side="left">
          <TooltipTrigger>
            <div className="absolute top-2 right-2 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <Info className="size-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent  className="max-w-[200px] text-xs">
              <p>Shows your meeting attendance rate for this month.</p>
              <p className="text-gray-400 mt-1">Tracked when you click Join Meeting</p>
            </TooltipContent>
        </Tooltip>

        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[81px] max-h-[81px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={250}
            innerRadius={44}
            outerRadius={33}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-transparent last:fill-transparent"
              polarRadius={[30, 44]}
            />
            <RadialBar
              dataKey="value"
              background
              cornerRadius={10}
              fill={chartData[0].fill}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="flex"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-md font-semibold"
                        >
                          {hovered ? `${joinedMeetings}/${totalMeetings}` : `${percentage}%`}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </div>
    </TooltipProvider>
  );
}
