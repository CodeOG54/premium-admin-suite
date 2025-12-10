import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Employee, 
  EmployeeAttendance, 
  PayrollRecord, 
  LeaveRequest,
  employeeData as initialEmployees,
  attendanceData as initialAttendance,
  payrollData as initialPayroll
} from '@/data/employees';

interface DataContextType {
  employees: Employee[];
  attendance: EmployeeAttendance[];
  payroll: PayrollRecord[];
  addEmployee: (employee: Omit<Employee, 'employeeId'>) => void;
  updateEmployee: (id: number, employee: Partial<Employee>) => void;
  deleteEmployee: (id: number) => void;
  updateLeaveRequest: (employeeId: number, requestId: string, status: 'Approved' | 'Denied') => void;
  addLeaveRequest: (employeeId: number, request: Omit<LeaveRequest, 'id'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  employees: 'hr_employees',
  attendance: 'hr_attendance',
  payroll: 'hr_payroll'
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.employees);
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [attendance, setAttendance] = useState<EmployeeAttendance[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.attendance);
    return saved ? JSON.parse(saved) : initialAttendance;
  });

  const [payroll, setPayroll] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.payroll);
    return saved ? JSON.parse(saved) : initialPayroll;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.attendance, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.payroll, JSON.stringify(payroll));
  }, [payroll]);

  const addEmployee = (employee: Omit<Employee, 'employeeId'>) => {
    const maxId = employees.reduce((max, e) => Math.max(max, e.employeeId), 0);
    const newEmployee: Employee = { ...employee, employeeId: maxId + 1 };
    setEmployees(prev => [...prev, newEmployee]);
    
    // Add attendance record
    setAttendance(prev => [...prev, {
      employeeId: newEmployee.employeeId,
      name: newEmployee.name,
      attendance: [],
      leaveRequests: []
    }]);
    
    // Add payroll record
    setPayroll(prev => [...prev, {
      employeeId: newEmployee.employeeId,
      hoursWorked: 0,
      leaveDeductions: 0,
      finalSalary: employee.salary
    }]);
  };

  const updateEmployee = (id: number, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => 
      e.employeeId === id ? { ...e, ...updates } : e
    ));
    
    if (updates.name) {
      setAttendance(prev => prev.map(a => 
        a.employeeId === id ? { ...a, name: updates.name! } : a
      ));
    }
  };

  const deleteEmployee = (id: number) => {
    setEmployees(prev => prev.filter(e => e.employeeId !== id));
    setAttendance(prev => prev.filter(a => a.employeeId !== id));
    setPayroll(prev => prev.filter(p => p.employeeId !== id));
  };

  const updateLeaveRequest = (employeeId: number, requestId: string, status: 'Approved' | 'Denied') => {
    setAttendance(prev => prev.map(a => {
      if (a.employeeId === employeeId) {
        return {
          ...a,
          leaveRequests: a.leaveRequests.map(lr => 
            lr.id === requestId ? { ...lr, status } : lr
          )
        };
      }
      return a;
    }));
  };

  const addLeaveRequest = (employeeId: number, request: Omit<LeaveRequest, 'id'>) => {
    const newRequest: LeaveRequest = {
      ...request,
      id: `lr-${employeeId}-${Date.now()}`
    };
    
    setAttendance(prev => prev.map(a => {
      if (a.employeeId === employeeId) {
        return {
          ...a,
          leaveRequests: [...a.leaveRequests, newRequest]
        };
      }
      return a;
    }));
  };

  return (
    <DataContext.Provider value={{
      employees,
      attendance,
      payroll,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      updateLeaveRequest,
      addLeaveRequest
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
