import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Mail, Briefcase, Building } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Employee, departments } from '@/data/employees';

export default function EmployeesPage() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useData();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    salary: '',
    employmentHistory: '',
    contact: ''
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.position.toLowerCase().includes(search.toLowerCase()) ||
        emp.contact.toLowerCase().includes(search.toLowerCase());
      const matchesDept = deptFilter === 'all' || emp.department === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [employees, search, deptFilter]);

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      department: '',
      salary: '',
      employmentHistory: '',
      contact: ''
    });
  };

  const handleAddClick = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleEditClick = (employee: Employee) => {
    setFormData({
      name: employee.name,
      position: employee.position,
      department: employee.department,
      salary: employee.salary.toString(),
      employmentHistory: employee.employmentHistory,
      contact: employee.contact
    });
    setEditEmployee(employee);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.position || !formData.department || !formData.salary || !formData.contact) {
      toast.error('Please fill in all required fields');
      return;
    }

    const employeeData = {
      name: formData.name,
      position: formData.position,
      department: formData.department,
      salary: parseFloat(formData.salary),
      employmentHistory: formData.employmentHistory,
      contact: formData.contact
    };

    if (editEmployee) {
      updateEmployee(editEmployee.employeeId, employeeData);
      toast.success('Employee updated successfully');
      setEditEmployee(null);
    } else {
      addEmployee(employeeData);
      toast.success('Employee added successfully');
      setIsAddOpen(false);
    }
    
    resetForm();
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteEmployee(deleteId);
      toast.success('Employee deleted successfully');
      setDeleteId(null);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Employees"
        description="Manage your organization's employee records"
        actions={
          <Button onClick={handleAddClick} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 md:mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search employees..."
          className="flex-1 w-full sm:max-w-md"
        />
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Depts</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employee Grid */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((employee, index) => (
          <Card 
            key={employee.employeeId} 
            className="card-interactive animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between gap-2 mb-3 md:mb-4">
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm md:text-lg font-semibold text-primary">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate text-sm md:text-base">{employee.name}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{employee.position}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 md:h-8 md:w-8"
                    onClick={() => handleEditClick(employee)}
                  >
                    <Pencil className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 md:h-8 md:w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(employee.employeeId)}
                  >
                    <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs md:text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                  <span className="truncate">{employee.department}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                  <span className="truncate">{employee.contact}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                  <span className="truncate">{employee.employmentHistory}</span>
                </div>
              </div>

              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
                <p className="text-base md:text-lg font-semibold text-foreground">
                  R{employee.salary.toLocaleString()}
                  <span className="text-xs md:text-sm font-normal text-muted-foreground">/month</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No employees found</h3>
          <p className="text-muted-foreground text-sm">
            {search || deptFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Add your first employee to get started'}
          </p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={isAddOpen || !!editEmployee} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditEmployee(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
            <DialogDescription>
              {editEmployee 
                ? 'Update the employee information below' 
                : 'Fill in the details for the new employee'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Software Engineer"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select 
                    value={formData.department} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="salary">Salary (R) *</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                    placeholder="50000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact">Email *</Label>
                  <Input
                    id="contact"
                    type="email"
                    value={formData.contact}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="john@moderntech.com"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="history">Employment History</Label>
                <Textarea
                  id="history"
                  value={formData.employmentHistory}
                  onChange={(e) => setFormData(prev => ({ ...prev, employmentHistory: e.target.value }))}
                  placeholder="Joined in 2024..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsAddOpen(false);
                  setEditEmployee(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editEmployee ? 'Save Changes' : 'Add Employee'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone and will also remove their attendance and payroll records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
