import { useState, useMemo, useRef } from 'react';
import { FileDown, Receipt, Eye, DollarSign, Clock, Minus } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { SearchInput } from '@/components/ui/search-input';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PayslipData {
  employeeId: number;
  name: string;
  position: string;
  department: string;
  baseSalary: number;
  hoursWorked: number;
  leaveDeductions: number;
  finalSalary: number;
}

export default function PayrollPage() {
  const { employees, payroll } = useData();
  const [search, setSearch] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipData | null>(null);

  const payrollData = useMemo(() => {
    return employees.map(emp => {
      const pr = payroll.find(p => p.employeeId === emp.employeeId);
      return {
        employeeId: emp.employeeId,
        name: emp.name,
        position: emp.position,
        department: emp.department,
        baseSalary: emp.salary,
        hoursWorked: pr?.hoursWorked || 0,
        leaveDeductions: pr?.leaveDeductions || 0,
        finalSalary: pr?.finalSalary || emp.salary
      };
    });
  }, [employees, payroll]);

  const filteredData = useMemo(() => {
    return payrollData.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase())
    );
  }, [payrollData, search]);

  const stats = useMemo(() => {
    const totalPayroll = payrollData.reduce((sum, p) => sum + p.finalSalary, 0);
    const avgSalary = payrollData.length > 0 ? totalPayroll / payrollData.length : 0;
    const totalHours = payrollData.reduce((sum, p) => sum + p.hoursWorked, 0);
    const totalDeductions = payrollData.reduce((sum, p) => sum + (p.baseSalary - p.finalSalary), 0);

    return { totalPayroll, avgSalary, totalHours, totalDeductions };
  }, [payrollData]);

  const generatePayslipPDF = (data: PayslipData) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ModernTech Solutions', 20, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Digital Payslip', 20, 35);
    
    // Employee Info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Information', 20, 65);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${data.name}`, 20, 75);
    doc.text(`Employee ID: ${data.employeeId}`, 20, 82);
    doc.text(`Position: ${data.position}`, 20, 89);
    doc.text(`Department: ${data.department}`, 20, 96);
    doc.text(`Pay Period: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`, 20, 103);

    // Salary Breakdown
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Salary Breakdown', 20, 120);

    autoTable(doc, {
      startY: 125,
      head: [['Description', 'Amount (R)']],
      body: [
        ['Base Salary', data.baseSalary.toLocaleString()],
        ['Hours Worked', data.hoursWorked.toString()],
        ['Leave Deductions', `-${(data.baseSalary - data.finalSalary).toLocaleString()}`],
      ],
      foot: [['Final Salary', data.finalSalary.toLocaleString()]],
      theme: 'striped',
      headStyles: { fillColor: [45, 139, 126] },
      footStyles: { fillColor: [45, 139, 126], fontStyle: 'bold' },
      margin: { left: 20, right: 20 }
    });

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('This is a computer-generated document. No signature is required.', 20, pageHeight - 20);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, pageHeight - 15);

    doc.save(`payslip_${data.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 7)}.pdf`);
    toast.success('Payslip downloaded successfully');
  };

  const exportAllPayroll = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ModernTech Solutions', 20, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Payroll Report - ' + new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), 20, 30);

    // Summary
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 20, 55);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Employees: ${payrollData.length}`, 20, 65);
    doc.text(`Total Payroll: R${stats.totalPayroll.toLocaleString()}`, 20, 72);
    doc.text(`Average Salary: R${Math.round(stats.avgSalary).toLocaleString()}`, 20, 79);

    // Table
    autoTable(doc, {
      startY: 90,
      head: [['Name', 'Department', 'Position', 'Hours', 'Deductions', 'Final Salary']],
      body: payrollData.map(p => [
        p.name,
        p.department,
        p.position,
        p.hoursWorked.toString(),
        `R${(p.baseSalary - p.finalSalary).toLocaleString()}`,
        `R${p.finalSalary.toLocaleString()}`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [45, 139, 126] },
      margin: { left: 15, right: 15 },
      styles: { fontSize: 8 }
    });

    doc.save(`payroll_report_${new Date().toISOString().slice(0, 7)}.pdf`);
    toast.success('Payroll report exported successfully');
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Payroll"
        description="Process payroll and generate digital payslips"
        actions={
          <Button onClick={exportAllPayroll} className="gap-2">
            <FileDown className="h-4 w-4" />
            Export Report
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Payroll"
          value={`R${stats.totalPayroll.toLocaleString()}`}
          icon={DollarSign}
          className="stagger-1"
        />
        <StatCard
          title="Average Salary"
          value={`R${Math.round(stats.avgSalary).toLocaleString()}`}
          icon={Receipt}
          className="stagger-2"
        />
        <StatCard
          title="Total Hours"
          value={stats.totalHours.toLocaleString()}
          icon={Clock}
          className="stagger-3"
        />
        <StatCard
          title="Total Deductions"
          value={`R${stats.totalDeductions.toLocaleString()}`}
          icon={Minus}
          className="stagger-4"
        />
      </div>

      {/* Search */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search employees..."
        className="max-w-md mb-6"
      />

      {/* Payroll Table */}
      <Card className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th className="text-right">Base Salary</th>
                <th className="text-right">Hours</th>
                <th className="text-right">Deductions</th>
                <th className="text-right">Final Salary</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr 
                  key={row.employeeId}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {row.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{row.name}</p>
                        <p className="text-xs text-muted-foreground">{row.position}</p>
                      </div>
                    </div>
                  </td>
                  <td>{row.department}</td>
                  <td className="text-right">R{row.baseSalary.toLocaleString()}</td>
                  <td className="text-right">{row.hoursWorked}</td>
                  <td className="text-right text-destructive">
                    -R{(row.baseSalary - row.finalSalary).toLocaleString()}
                  </td>
                  <td className="text-right font-semibold">R{row.finalSalary.toLocaleString()}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setSelectedPayslip(row)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => generatePayslipPDF(row)}
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payslip Preview Dialog */}
      <Dialog open={!!selectedPayslip} onOpenChange={(open) => !open && setSelectedPayslip(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payslip Preview</DialogTitle>
          </DialogHeader>
          {selectedPayslip && (
            <div className="space-y-6">
              {/* Header */}
              <div className="rounded-lg p-4 text-primary-foreground" style={{ background: 'var(--gradient-hero)' }}>
                <h3 className="font-display text-xl font-bold">ModernTech Solutions</h3>
                <p className="text-sm opacity-80">Digital Payslip</p>
              </div>

              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Employee</p>
                  <p className="font-medium">{selectedPayslip.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Employee ID</p>
                  <p className="font-medium">{selectedPayslip.employeeId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Position</p>
                  <p className="font-medium">{selectedPayslip.position}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Department</p>
                  <p className="font-medium">{selectedPayslip.department}</p>
                </div>
              </div>

              {/* Salary Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Base Salary</span>
                  <span className="font-medium">R{selectedPayslip.baseSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Hours Worked</span>
                  <span className="font-medium">{selectedPayslip.hoursWorked}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Leave Deductions</span>
                  <span className="font-medium text-destructive">
                    -R{(selectedPayslip.baseSalary - selectedPayslip.finalSalary).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-3 bg-primary/10 rounded-lg px-3 -mx-3">
                  <span className="font-semibold">Final Salary</span>
                  <span className="font-bold text-lg text-primary">
                    R{selectedPayslip.finalSalary.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button 
                className="w-full gap-2" 
                onClick={() => generatePayslipPDF(selectedPayslip)}
              >
                <FileDown className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
