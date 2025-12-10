import { useState, useMemo } from 'react';
import { Calendar, Check, X, Plus, Clock } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { SearchInput } from '@/components/ui/search-input';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const LEAVE_REASONS = [
  'Sick Leave',
  'Vacation',
  'Personal',
  'Family Responsibility',
  'Bereavement',
  'Medical Appointment',
  'Childcare'
];

export default function AttendancePage() {
  const { attendance, employees, updateLeaveRequest, addLeaveRequest } = useData();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    reason: ''
  });

  const filteredAttendance = useMemo(() => {
    return attendance.filter(a => 
      a.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [attendance, search]);

  const pendingRequests = useMemo(() => {
    return attendance
      .flatMap(a => a.leaveRequests
        .filter(lr => lr.status === 'Pending')
        .map(lr => ({ ...lr, employeeId: a.employeeId, employeeName: a.name }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendance]);

  const allRequests = useMemo(() => {
    return attendance
      .flatMap(a => a.leaveRequests.map(lr => ({ 
        ...lr, 
        employeeId: a.employeeId, 
        employeeName: a.name 
      })))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendance]);

  const handleApprove = (employeeId: number, requestId: string) => {
    updateLeaveRequest(employeeId, requestId, 'Approved');
    toast.success('Leave request approved');
  };

  const handleDeny = (employeeId: number, requestId: string) => {
    updateLeaveRequest(employeeId, requestId, 'Denied');
    toast.success('Leave request denied');
  };

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.date || !formData.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    addLeaveRequest(parseInt(formData.employeeId), {
      date: formData.date,
      reason: formData.reason,
      status: 'Pending'
    });

    toast.success('Leave request submitted');
    setIsAddOpen(false);
    setFormData({ employeeId: '', date: '', reason: '' });
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Attendance & Leave"
        description="Track attendance and manage leave requests"
        actions={
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Leave Request
          </Button>
        }
      />

      <Tabs defaultValue="attendance" className="space-y-4 md:space-y-6">
        <TabsList className="bg-muted/50 w-full flex-wrap h-auto p-1 gap-1">
          <TabsTrigger value="attendance" className="text-xs sm:text-sm flex-1 sm:flex-none">Attendance</TabsTrigger>
          <TabsTrigger value="pending" className="relative text-xs sm:text-sm flex-1 sm:flex-none">
            Pending
            {pendingRequests.length > 0 && (
              <span className="ml-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs sm:text-sm flex-1 sm:flex-none">All</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search employees..."
            className="w-full sm:max-w-md"
          />

          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            {filteredAttendance.map((record, index) => {
              const presentCount = record.attendance.filter(a => a.status === 'Present').length;
              const totalDays = record.attendance.length;
              const attendanceRate = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

              return (
                <Card 
                  key={record.employeeId} 
                  className="card-elevated animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {record.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-base">{record.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {attendanceRate}% attendance rate
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">{presentCount}/{totalDays}</p>
                        <p className="text-xs text-muted-foreground">Days present</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {record.attendance.map((att, i) => (
                        <div 
                          key={i}
                          className={`flex flex-col items-center p-2 rounded-lg text-xs ${
                            att.status === 'Present' 
                              ? 'bg-success/10 text-success' 
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          <span className="font-medium">
                            {new Date(att.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span>{new Date(att.date).getDate()}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card className="card-elevated">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-1">No pending requests</h3>
                <p className="text-muted-foreground text-sm">All leave requests have been processed</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request, index) => (
                <Card 
                  key={request.id} 
                  className="card-elevated animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-lg font-semibold text-primary">
                            {request.employeeName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{request.employeeName}</p>
                          <p className="text-sm text-muted-foreground">{request.reason}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(request.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeny(request.employeeId, request.id)}
                        >
                          <X className="h-4 w-4" />
                          Deny
                        </Button>
                        <Button
                          size="sm"
                          className="gap-1"
                          onClick={() => handleApprove(request.employeeId, request.id)}
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th className="hidden sm:table-cell">Date</th>
                  <th className="hidden md:table-cell">Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allRequests.map((request, index) => (
                  <tr 
                    key={request.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-primary">
                            {request.employeeName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-sm block truncate">{request.employeeName}</span>
                          <span className="text-xs text-muted-foreground sm:hidden">{new Date(request.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell text-sm">{new Date(request.date).toLocaleDateString()}</td>
                    <td className="hidden md:table-cell text-sm">{request.reason}</td>
                    <td><StatusBadge status={request.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Leave Request Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Leave Request</DialogTitle>
            <DialogDescription>Submit a leave request for an employee</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddRequest}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="employee">Employee</Label>
                <Select 
                  value={formData.employeeId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.employeeId} value={emp.employeeId.toString()}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reason">Reason</Label>
                <Select 
                  value={formData.reason} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAVE_REASONS.map(reason => (
                      <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
