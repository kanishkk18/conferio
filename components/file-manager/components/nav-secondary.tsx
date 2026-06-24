import * as React from 'react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  AnalyticsCard,
  AnimatedCard,
  CardBody,
  CardDescription,
  CardTitle,
  CardVisual,
} from 'components/ui/animated-card-chart';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function NavSecondary({ ...props }) {
  const [isDark, setIsDark] = React.useState(false);
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem className=" gap-y-1 ">
            <SidebarMenuButton
              asChild
              size="default"
              className="dark:hover:bg-black/25"
            >
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className="w-full rounded-lg hover:dark:bg-[#222]">
                      View Analytics
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="p-0 ml-2 bg-transparent border-none">
                    <AnimatedCard className="z-50 w-72">
                      <CardVisual>
                        <AnalyticsCard
                          mainColor="#3b82f6"
                          secondaryColor="#10b981"
                        />
                      </CardVisual>
                      <CardBody>
                        <CardTitle>Upload Activity</CardTitle>
                        <CardDescription>
                          visualization of your upload activity
                        </CardDescription>
                      </CardBody>
                    </AnimatedCard>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
