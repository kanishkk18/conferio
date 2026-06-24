"use client";

import * as React from "react";
import { useState } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useQuery } from "@tanstack/react-query";

// --- Utility Function ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Card Components ---
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AnimatedCard({ className, ...props }: CardProps) {
  return (
    <div
      role="region"
      aria-labelledby="card-title"
      aria-describedby="card-description"
      className={cn(
        "group/animated-card relative w-[356px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-900 dark:bg-black",
        className
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: CardProps) {
  return (
    <div
      role="group"
      className={cn(
        "flex flex-col gap-y-1.5 border-t border-zinc-200 p-4 dark:border-zinc-900",
        className
      )}
      {...props}
    />
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-black dark:text-white",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      className={cn(
        "text-sm text-neutral-500 dark:text-neutral-400",
        className
      )}
      {...props}
    />
  );
}

export function CardVisual({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("h-[180px] w-[356px] overflow-hidden", className)}
      {...props}
    />
  );
}

// --- Analytics Card Component ---
interface AnalyticsCardProps {
  mainColor?: string;
  secondaryColor?: string;
  gridColor?: string;
}

export function AnalyticsCard({
  mainColor = "#8b5cf6",
  secondaryColor = "#fbbf24",
  gridColor = "#80808015",
}: AnalyticsCardProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/user');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
  });

  const analytics = data || {};
  const storage = analytics.storageUsageSummary || {};
  const usagePercentage = storage.quota > 0 ? (storage.totalUsage / storage.quota) * 100 : 0;

  if (isLoading) {
    return (
      <AnimatedCard>
        <CardVisual>
          <div className="flex h-full items-center justify-center">
            <div className="text-sm text-neutral-500">Loading analytics&hellip;</div>
          </div>
        </CardVisual>
        <CardBody>
          <CardTitle>Storage Analytics</CardTitle>
          <CardDescription>Loading your storage data&hellip;</CardDescription>
        </CardBody>
      </AnimatedCard>
    );
  }

  if (error) {
    return (
      <AnimatedCard>
        <CardVisual>
          <div className="flex h-full items-center justify-center">
            <div className="text-sm text-red-500">Error loading analytics</div>
          </div>
        </CardVisual>
        <CardBody>
          <CardTitle>Storage Analytics</CardTitle>
          <CardDescription>Failed to load storage data</CardDescription>
        </CardBody>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard>
      <CardVisual>
        <AnalyticsVisual
          mainColor={mainColor}
          secondaryColor={secondaryColor}
          gridColor={gridColor}
          usagePercentage={usagePercentage}
          chartData={analytics.chart || []}
        />
      </CardVisual>
      <CardBody>
        <CardTitle>Storage Analytics</CardTitle>
        <CardDescription>
          {storage.totalUsage ? `Used ${formatBytes(storage.totalUsage)} of ${formatBytes(storage.quota)}` : 'Your storage usage overview'}
        </CardDescription>
        {storage.totalUsage && (
          <div className="mt-2 w-full bg-zinc-200 rounded-full h-2 dark:bg-zinc-700">
            <div 
              className="h-2 rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${Math.min(usagePercentage, 100)}%`,
                backgroundColor: mainColor
              }}
            />
          </div>
        )}
      </CardBody>
    </AnimatedCard>
  );
}

// --- Analytics Visual Component ---
interface AnalyticsVisualProps {
  mainColor?: string;
  secondaryColor?: string;
  gridColor?: string;
  usagePercentage: number;
  chartData: Array<{ date: string; uploadedFiles: number }>;
}

function AnalyticsVisual({
  mainColor = "#8b5cf6",
  secondaryColor = "#fbbf24",
  gridColor = "#80808015",
  usagePercentage,
  chartData
}: AnalyticsVisualProps) {
  const [hovered, setHovered] = useState(false);
  const hasChartData = chartData && chartData.length > 0;

  return (
    <>
      <div
        className="absolute inset-0 z-20"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={
          {
            "--color": mainColor,
            "--secondary-color": secondaryColor,
          } as React.CSSProperties
        }
      />

      <div className="relative h-[180px] w-[356px] overflow-hidden rounded-t-lg">
        <AnalyticsLayer4
          color={mainColor}
          secondaryColor={secondaryColor}
          hovered={hovered}
          usagePercentage={usagePercentage}
          hasData={hasChartData}
        />
        <AnalyticsLayer3 color={mainColor} hasData={hasChartData} />
        <AnalyticsLayer2 color={mainColor} usagePercentage={usagePercentage} />
        <AnalyticsLayer1 
          color={mainColor} 
          secondaryColor={secondaryColor} 
          chartData={chartData}
        />
        <EllipseGradient color={mainColor} />
        <GridLayer color={gridColor} />
      </div>
    </>
  );
}

// --- Updated Layer Components with Analytics Data ---

interface AnalyticsLayerProps {
  color: string;
  secondaryColor?: string;
  hovered?: boolean;
  usagePercentage?: number;
  chartData?: Array<{ date: string; uploadedFiles: number }>;
  hasData?: boolean;
}

const GridLayer: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div
      style={{ "--grid-color": color } as React.CSSProperties}
      className="pointer-events-none absolute inset-0 z-[4] h-full w-full bg-transparent bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-[size:20px_20px] bg-center opacity-70 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"
    />
  );
};

const EllipseGradient: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div className="absolute inset-0 z-[5] flex h-full w-full items-center justify-center">
      <svg
        width="356"
        height="196"
        viewBox="0 0 356 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="356" height="180" fill="url(#paint0_radial_12_207)" />
        <defs>
          <radialGradient
            id="paint0_radial_12_207"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(178 98) rotate(90) scale(98 178)"
          >
            <stop stopColor={color} stopOpacity="0.25" />
            <stop offset="0.34" stopColor={color} stopOpacity="0.15" />
            <stop offset="1" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

const AnalyticsLayer1: React.FC<AnalyticsLayerProps> = ({ color, secondaryColor, chartData }) => {
  const totalFiles = chartData?.reduce((sum, day) => sum + day.uploadedFiles, 0) || 0;
  const growthRate = chartData && chartData.length > 1 ? 
    ((chartData[chartData.length - 1].uploadedFiles - chartData[0].uploadedFiles) / chartData[0].uploadedFiles * 100) : 15.2;

  return (
    <div
      className="absolute top-4 left-4 z-[8] flex items-center gap-1"
      style={
        {
          "--color": color,
          "--secondary-color": secondaryColor,
        } as React.CSSProperties
      }
    >
      <div className="flex shrink-0 items-center rounded-full border border-zinc-200 bg-white/25 px-1.5 py-0.5 backdrop-blur-sm transition-opacity duration-300 ease-in-out group-hover/animated-card:opacity-0 dark:border-zinc-800 dark:bg-black/25">
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--color)]" />
        <span className="ml-1 text-[10px] text-black dark:text-white">
          +{growthRate.toFixed(1)}%
        </span>
      </div>
      <div className="flex shrink-0 items-center rounded-full border border-zinc-200 bg-white/25 px-1.5 py-0.5 backdrop-blur-sm transition-opacity duration-300 ease-in-out group-hover/animated-card:opacity-0 dark:border-zinc-800 dark:bg-black/25">
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--secondary-color)]" />
        <span className="ml-1 text-[10px] text-black dark:text-white">
          {totalFiles} files
        </span>
      </div>
    </div>
  );
};

const AnalyticsLayer2: React.FC<{ color: string; usagePercentage: number }> = ({ color, usagePercentage }) => {
  return (
    <div
      className="group relative h-full w-[356px]"
      style={{ "--color": color } as React.CSSProperties}
    >
      <div className="ease-[cubic-bezier(0.6, 0.6, 0, 1)] absolute inset-0 z-[7] flex w-[356px] translate-y-full items-start justify-center bg-transparent p-4 transition-transform duration-500 group-hover/animated-card:translate-y-0">
        <div className="ease-[cubic-bezier(0.6, 0, 1)] rounded-md border border-zinc-200 bg-white/25 p-1.5 opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover/animated-card:opacity-100 dark:border-zinc-800 dark:bg-black/25">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 shrink-0 rounded-full bg-[var(--color)]" />
            <p className="text-xs text-black dark:text-white">
              Storage Usage: {usagePercentage.toFixed(1)}%
            </p>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Monitor your storage capacity
          </p>
        </div>
      </div>
    </div>
  );
};

const AnalyticsLayer3: React.FC<{ color: string; hasData?: boolean }> = ({ color, hasData }) => {
  return (
    <div className="ease-[cubic-bezier(0.6, 0.6, 0, 1)] absolute inset-0 z-[6] flex translate-y-full items-center justify-center opacity-0 transition-all duration-500 group-hover/animated-card:translate-y-0 group-hover/animated-card:opacity-100">
      {hasData ? (
        <svg
          width="356"
          height="180"
          viewBox="0 0 356 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="356" height="180" fill="url(#paint0_linear_29_3)" />
          <defs>
            <linearGradient
              id="paint0_linear_29_3"
              x1="178"
              y1="0"
              x2="178"
              y2="180"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.35" stopColor={color} stopOpacity="0" />
              <stop offset="1" stopColor={color} stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      ) : (
        <div className="text-center">
          <div className="text-sm text-neutral-500 mb-2">No data available</div>
          <div className="text-xs text-neutral-400">Start uploading files to see analytics</div>
        </div>
      )}
    </div>
  );
};

const AnalyticsLayer4: React.FC<AnalyticsLayerProps> = ({
  color,
  secondaryColor,
  hovered,
  usagePercentage = 0,
  hasData
}) => {
  // Generate bar heights based on usage percentage and analytics data
  const baseHeight = 20;
  const maxHeight = 90;
  
  const rectsData = [
    {
      width: 15,
      height: baseHeight + (usagePercentage * 0.7),
      y: 110,
      hoverHeight: baseHeight + (usagePercentage * 0.8),
      hoverY: 130 - (usagePercentage * 0.4),
      x: 40,
      fill: "currentColor",
      hoverFill: secondaryColor,
    },
    {
      width: 15,
      height: baseHeight + (usagePercentage * 0.5),
      y: 90,
      hoverHeight: baseHeight + (usagePercentage * 0.9),
      hoverY: 130 - (usagePercentage * 0.5),
      x: 60,
      fill: color,
      hoverFill: color,
    },
    {
      width: 15,
      height: baseHeight + (usagePercentage * 0.9),
      y: 70,
      hoverHeight: baseHeight + (usagePercentage * 0.6),
      hoverY: 120 - (usagePercentage * 0.3),
      x: 80,
      fill: color,
      hoverFill: color,
    },
    {
      width: 15,
      height: baseHeight + (usagePercentage * 0.6),
      y: 80,
      hoverHeight: baseHeight + (usagePercentage * 1.0),
      hoverY: 100 - (usagePercentage * 0.2),
      x: 100,
      fill: color,
      hoverFill: color,
    },
    {
      width: 15,
      height: baseHeight + (usagePercentage * 0.4),
      y: 110,
      hoverHeight: baseHeight + (usagePercentage * 0.7),
      hoverY: 110 - (usagePercentage * 0.1),
      x: 120,
      fill: "currentColor",
      hoverFill: secondaryColor,
    },
    {
      width: 15,
      height: baseHeight + (usagePercentage * 0.8),
      y: 110,
      hoverHeight: baseHeight + (usagePercentage * 0.5),
      hoverY: 130 - (usagePercentage * 0.2),
      x: 140,
      fill: "currentColor",
      hoverFill: secondaryColor,
    },
    {
      width: 15,
      height: baseHeight + (usagePercentage * 1.0),
      y: 60,
      hoverHeight: baseHeight + (usagePercentage * 0.6),
      hoverY: 120 - (usagePercentage * 0.4),
      x: 160,
      fill: color,
      hoverFill: color,
    },
    {
      width: 15,
      height: baseHeight + (usagePercentage * 0.5),
      y: 80,
      hoverHeight: baseHeight + (usagePercentage * 0.8),
      hoverY: 130 - (usagePercentage * 0.3),
      x: 180,
      fill: color,
      hoverFill: color,
    },
    {
      width: 15,
      height: baseHeight + (usagePercentage * 0.3),
      y: 110,
      hoverHeight: baseHeight + (usagePercentage * 0.7),
      hoverY: 110 - (usagePercentage * 0.2),
      x: 200,
      fill: "currentColor",
      hoverFill: secondaryColor,
    },
    {
      width: 15,
      height: baseHeight + (usagePercentage * 0.7),
      y: 70,
      hoverHeight: baseHeight + (usagePercentage * 0.9),
      hoverY: 90 - (usagePercentage * 0.1),
      x: 220,
      fill: color,
      hoverFill: color,
    },
    {
      width: 15,
      height: baseHeight + (usagePercentage * 0.2),
      y: 110,
      hoverHeight: baseHeight + (usagePercentage * 1.1),
      hoverY: 80 - (usagePercentage * 0.1),
      x: 240,
      fill: "currentColor",
      hoverFill: secondaryColor,
    },
    {
      width: 15,
      height: baseHeight + (usagePercentage * 0.9),
      y: 110,
      hoverHeight: baseHeight + (usagePercentage * 0.8),
      hoverY: 100 - (usagePercentage * 0.2),
      x: 260,
      fill: "currentColor",
      hoverFill: secondaryColor,
    },
    {
      width: 15,
      height: baseHeight + (usagePercentage * 0.1),
      y: 110,
      hoverHeight: baseHeight + (usagePercentage * 1.2),
      hoverY: 70 - (usagePercentage * 0.1),
      x: 280,
      fill: "currentColor",
      hoverFill: secondaryColor,
    },
    {
      width: 15,
      height: baseHeight + (usagePercentage * 0.6),
      y: 80,
      hoverHeight: baseHeight + (usagePercentage * 1.3),
      hoverY: 60 - (usagePercentage * 0.2),
      x: 300,
      fill: color,
      hoverFill: color,
    },
  ];

  if (!hasData) {
    return (
      <div className="absolute inset-0 z-[8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm text-neutral-500 mb-1">No Analytics Data</div>
          <div className="text-xs text-neutral-400">Upload files to see visualization</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ease-[cubic-bezier(0.6, 0.6, 0, 1)] absolute inset-0 z-[8] flex h-[180px] w-[356px] items-center justify-center text-neutral-800/10 transition-transform duration-500 group-hover/animated-card:scale-150 dark:text-white/15">
      <svg width="356" height="180" xmlns="http://www.w3.org/2000/svg">
        {rectsData.map((rect, index) => (
          <rect
            key={index}
            width={rect.width}
            height={hovered ? Math.min(rect.hoverHeight, maxHeight) : Math.min(rect.height, maxHeight)}
            x={rect.x}
            y={hovered ? rect.hoverY : rect.y}
            fill={hovered ? rect.hoverFill : rect.fill}
            rx="2"
            ry="2"
            className="ease-[cubic-bezier(0.6, 0.6, 0, 1)] transition-all duration-500"
          />
        ))}
      </svg>
    </div>
  );
};

// --- Utility Function ---
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Keep the original Visual3 component for backward compatibility
export function Visual3({
  mainColor = "#8b5cf6",
  secondaryColor = "#fbbf24",
  gridColor = "#80808015",
}: AnalyticsCardProps) {
  return (
    <AnalyticsCard 
      mainColor={mainColor}
      secondaryColor={secondaryColor}
      gridColor={gridColor}
    />
  );
}
