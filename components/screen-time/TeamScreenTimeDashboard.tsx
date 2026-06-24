import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import LazyLoader from '../loader/lazyloader';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57'];

interface TeamScreenTimeProps {
  teamId: string;
}

interface RouteAnalytics {
  id: string;
  route: string;
  routeLabel: string | null;
  totalDuration: number;
  viewCount: number;
  lastViewedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface UserSummary {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  totalDuration: number;
  sessionCount: number;
}

interface RouteSummary {
  route: string;
  routeLabel: string | null;
  _sum: {
    totalDuration: number | null;
    viewCount: number | null;
  };
  _count: {
    userId: number;
  };
}

interface DailyBreakdown {
  date: string;
  totalDuration: number;
  activeUsers: number;
}

export function TeamScreenTimeDashboard({ teamId }: TeamScreenTimeProps) {
  const [period, setPeriod] = useState('7d');
  const [data, setData] = useState<{
    routeAnalytics: RouteAnalytics[];
    userSummary: UserSummary[];
    routeSummary: RouteSummary[];
    dailyBreakdown: DailyBreakdown[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [teamId, period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/screen-time/admin/team-analytics?teamId=${teamId}&period=${period}`);
      if (res.ok) {
        const analytics = await res.json();
        setData(analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) return <div className="h-screen w-screen flex items-center justify-center"><LazyLoader /></div>;
  if (!data) return <div className="p-8 text-center">No data available</div>;

  const maxUserDuration = Math.max(...data.userSummary.map(u => u.totalDuration), 1);

  // Prepare pie chart data for route distribution
  const pieData = data.routeSummary.slice(0, 10).map(r => ({
    name: r.routeLabel || r.route,
    value: r._sum.totalDuration || 0
  }));

  return (
    <Tabs defaultValue="overview" className="">
      <div className="flex items-center justify-between px-2 py-1 border-b dark:border-[#222]">
        <TabsList className='!bg-transparent'>
          <TabsTrigger value="overview" className='!bg-transparent rounded-none data-[state=active]:border-b dark:border-white'>Overview</TabsTrigger>
          <TabsTrigger value="users" className='!bg-transparent rounded-none data-[state=active]:border-b dark:border-white'>By User</TabsTrigger>
          <TabsTrigger value="routes" className='!bg-transparent rounded-none data-[state=active]:border-b dark:border-white'>By Route</TabsTrigger>
          <TabsTrigger value="timeline" className='!bg-transparent rounded-none data-[state=active]:border-b dark:border-white'>Timeline</TabsTrigger>
        </TabsList>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-md border px-2 py-1 dark:border-[#222]"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      <div className="space-y-4 p-6">
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className='dark:bg-[#111111]'>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Screen Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(data.userSummary.reduce((acc, u) => acc + u.totalDuration, 0))}
                </div>
              </CardContent>
            </Card>
            <Card className='dark:bg-[#111111]'>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.userSummary.length}</div>
              </CardContent>
            </Card>
            <Card className='dark:bg-[#111111]'>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.userSummary.reduce((acc, u) => acc + u.sessionCount, 0)}
                </div>
              </CardContent>
            </Card>
            <Card className='dark:bg-[#111111]'>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Routes Visited</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.routeSummary.length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className='dark:bg-[#111111]'>
              <CardHeader>
                <CardTitle>Top Users by Screen Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.userSummary.slice(0, 5).map((user) => (
                  <div key={user.user.id} className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.user.image || undefined} />
                      <AvatarFallback>{user.user.name?.[0] || user.user.email[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{user.user.name || user.user.email}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDuration(user.totalDuration)}
                        </span>
                      </div>
                      <Progress 
                        value={(user.totalDuration / maxUserDuration) * 100} 
                        className="h-2"
                      />
                    </div>
                    <Badge variant="secondary">{user.sessionCount} sessions</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className='dark:bg-[#111111]'>
              <CardHeader>
                <CardTitle>Time by Route</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatDuration(value)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1 text-xs">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{entry.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className='dark:bg-[#111111]'>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
            </CardHeader>
            <CardContent >
              <div className="space-y-4">
                {data.userSummary.map((user) => (
                  <div 
                    key={user.user.id} 
                    className="flex items-center justify-between p-4 rounded-lg border dark:border-[#222] hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => setSelectedUser(selectedUser === user.user.id ? null : user.user.id)}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.user.image || undefined} />
                        <AvatarFallback>{user.user.name?.[0] || user.user.email[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.user.name || user.user.email}</p>
                        <p className="text-sm text-muted-foreground">{user.sessionCount} sessions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatDuration(user.totalDuration)}</p>
                      <p className="text-sm text-muted-foreground">total time</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {selectedUser && <UserDetailModal userId={selectedUser} teamId={teamId} period={period} />}
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card className='dark:bg-[#111111]'>
            <CardHeader>
              <CardTitle>Most Visited Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.routeSummary.map((route) => (
                  <div key={route.route} className="flex items-center justify-between p-4 rounded-lg border dark:border-[#222]">
                    <div>
                      <p className="font-medium">{route.routeLabel || route.route}</p>
                      <p className="text-sm text-muted-foreground">{route.route}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatDuration(route._sum.totalDuration || 0)}</p>
                      <p className="text-sm text-muted-foreground">
                        {route._sum.viewCount || 0} visits · {route._count.userId} users
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card className='dark:bg-[#111111]'>
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.dailyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tickFormatter={(value) => `${Math.floor(value / 60)}m`} />
                  <Tooltip 
                    formatter={(value: number) => formatDuration(value)}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalDuration" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Screen Time"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activeUsers" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Active Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
     </Tabs>
   
  );
}

function UserDetailModal({ userId, teamId, period }: { userId: string; teamId: string; period: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetail();
  }, [userId, teamId, period]);

  const fetchUserDetail = async () => {
    try {
      const res = await fetch(`/api/screen-time/admin/user-detail?teamId=${teamId}&userId=${userId}&period=${period}`);
      if (res.ok) {
        const detail = await res.json();
        setData(detail);
      }
    } catch (error) {
      console.error('Failed to fetch user detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) return <Card className="mt-4 p-6"><div>Loading user details...</div></Card>;
  if (!data) return null;

  return (
    <Card className="mt-4 dark:bg-[#111111]">
      <CardHeader>
        <CardTitle>User Route Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.userRoutes.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <span className="font-medium">{item.routeLabel || item.route}</span>
                <p className="text-xs text-muted-foreground">{item.route}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatDuration(item.totalDuration)}</p>
                <p className="text-sm text-muted-foreground">{item.viewCount} visits</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}