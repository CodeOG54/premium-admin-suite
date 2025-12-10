import { useMemo } from 'react';
import { Users, Calendar, DollarSign, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function Dashboard() {
  const { employees, attendance, payroll } = useData();

  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const totalPayroll = payroll.reduce((sum, p) => sum + p.finalSalary, 0);
    
    const allLeaveRequests = attendance.flatMap(a => a.leaveRequests);
    const pendingLeaves = allLeaveRequests.filter(l => l.status === 'Pending').length;
    
    const allAttendance = attendance.flatMap(a => a.attendance);
    const presentCount = allAttendance.filter(a => a.status === 'Present').length;
    const attendanceRate = allAttendance.length > 0 
      ? Math.round((presentCount / allAttendance.length) * 100) 
      : 0;

    return {
      totalEmployees,
      totalPayroll,
      pendingLeaves,
      attendanceRate
    };
  }, [employees, attendance, payroll]);

  // Department distribution for chart
  const departmentData = useMemo(() => {
    const deptCounts: Record<string, number> = {};
    employees.forEach(e => {
      deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
    });
    return Object.entries(deptCounts).map(([name, value]) => ({ name, value }));
  }, [employees]);

  // Salary by department for bar chart
  const salaryData = useMemo(() => {
    const deptSalaries: Record<string, { total: number; count: number }> = {};
    employees.forEach(e => {
      if (!deptSalaries[e.department]) {
        deptSalaries[e.department] = { total: 0, count: 0 };
      }
      deptSalaries[e.department].total += e.salary;
      deptSalaries[e.department].count += 1;
    });
    return Object.entries(deptSalaries).map(([name, data]) => ({
      name,
      average: Math.round(data.total / data.count)
    }));
  }, [employees]);

  // Recent leave requests
  const recentLeaveRequests = useMemo(() => {
    return attendance
      .flatMap(a => a.leaveRequests.map(lr => ({ ...lr, employeeName: a.name })))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [attendance]);

  const COLORS = ['hsl(173, 58%, 39%)', 'hsl(199, 89%, 48%)', 'hsl(38, 92%, 50%)', 'hsl(152, 69%, 40%)', 'hsl(280, 65%, 60%)', 'hsl(340, 75%, 55%)'];

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your HR metrics."
      />

      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
        <StatCard
          title="Employees"
          value={stats.totalEmployees}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          className="stagger-1"
        />
        <StatCard
          title="Payroll"
          value={`R${stats.totalPayroll.toLocaleString()}`}
          icon={DollarSign}
          className="stagger-2"
        />
        <StatCard
          title="Pending"
          value={stats.pendingLeaves}
          icon={Clock}
          className="stagger-3"
        />
        <StatCard
          title="Attendance"
          value={`${stats.attendanceRate}%`}
          icon={CheckCircle2}
          trend={{ value: 2.5, isPositive: true }}
          className="stagger-4"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2 mb-6 md:mb-8">
        {/* Average Salary by Department */}
        <Card className="card-elevated animate-fade-in overflow-hidden">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0" />
              <span className="truncate">Avg Salary by Dept</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6 pt-0">
            <div className="h-[250px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    className="text-muted-foreground"
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`}
                    className="text-muted-foreground"
                    width={50}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`R${value.toLocaleString()}`, 'Average']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar 
                    dataKey="average" 
                    fill="hsl(173, 58%, 39%)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="card-elevated animate-fade-in overflow-hidden">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0" />
              <span className="truncate">Department Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6 pt-0">
            <div className="h-[250px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {departmentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px' }}
                    layout="horizontal"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leave Requests */}
      <Card className="card-elevated animate-fade-in overflow-hidden">
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0" />
            Recent Leave Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="space-y-3">
            {recentLeaveRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">No leave requests found</p>
            ) : (
              recentLeaveRequests.map((request, index) => (
                <div 
                  key={request.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted/30 border border-border/50 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs md:text-sm font-semibold text-primary">
                        {request.employeeName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm truncate">{request.employeeName}</p>
                      <p className="text-xs text-muted-foreground truncate">{request.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-11 sm:ml-0">
                    <span className="text-xs text-muted-foreground">
                      {new Date(request.date).toLocaleDateString()}
                    </span>
                    <StatusBadge status={request.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
