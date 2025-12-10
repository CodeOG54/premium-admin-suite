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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          className="stagger-1"
        />
        <StatCard
          title="Total Payroll"
          value={`R${stats.totalPayroll.toLocaleString()}`}
          icon={DollarSign}
          className="stagger-2"
        />
        <StatCard
          title="Pending Leaves"
          value={stats.pendingLeaves}
          icon={Clock}
          className="stagger-3"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          icon={CheckCircle2}
          trend={{ value: 2.5, isPositive: true }}
          className="stagger-4"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Average Salary by Department */}
        <Card className="card-elevated animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Average Salary by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`}
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    formatter={(value: number) => [`R${value.toLocaleString()}`, 'Average']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
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
        <Card className="card-elevated animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Department Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
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
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leave Requests */}
      <Card className="card-elevated animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Recent Leave Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLeaveRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No leave requests found</p>
            ) : (
              recentLeaveRequests.map((request, index) => (
                <div 
                  key={request.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {request.employeeName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{request.employeeName}</p>
                      <p className="text-sm text-muted-foreground">{request.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground hidden sm:block">
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
