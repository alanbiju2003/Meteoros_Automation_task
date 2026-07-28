import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Search, Download, UserPlus, Battery, RefreshCw, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  course: string;
  year: number;
  status: string;
  battery: number;
}

export default function Students() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New Student Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('student123');
  const [newRollNumber, setNewRollNumber] = useState('');
  const [newDepartment, setNewDepartment] = useState('Computer Science');
  const [newCourse, setNewCourse] = useState('B.Tech CSE');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Fetch Students from PostgreSQL
  const { data: students = [], isLoading, refetch } = useQuery<Student[]>({
    queryKey: ['students-list'],
    queryFn: async () => {
      const res = await axios.get('/api/students');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  // Create Student Mutation
  const createStudentMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/api/students', {
        name: newName,
        email: newEmail,
        password: newPassword,
        rollNumber: newRollNumber,
        departmentName: newDepartment,
        courseName: newCourse,
        year: 2,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setFormSuccess(`✅ ${data.message}`);
      setFormError('');
      queryClient.invalidateQueries({ queryKey: ['students-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setTimeout(() => {
        setIsDialogOpen(false);
        setFormSuccess('');
        setNewName('');
        setNewEmail('');
        setNewRollNumber('');
      }, 1500);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to create student. Check duplicate email/roll number.');
    },
  });

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Roll Number', 'Department', 'Course', 'Status', 'Battery'];
    const rows = filteredStudents.map((s) => [
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.rollNumber}"`,
      `"${s.department}"`,
      `"${s.course}"`,
      `"${s.status}"`,
      `${s.battery}%`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `students_roster_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Student Roster & Tracking Grid</h1>
          <p className="text-muted-foreground text-sm">
            Manage student records, inspect real-time battery & location telemetry, or register new students.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2 font-semibold">
            <Download className="h-4 w-4" /> Export CSV
          </Button>

          {/* Add New Student Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 font-semibold bg-primary">
                <UserPlus className="h-4 w-4" /> + Add New Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">Register New Student</DialogTitle>
                <DialogDescription className="text-xs">
                  Create a new student profile in PostgreSQL linked to department & attendance tracking.
                </DialogDescription>
              </DialogHeader>

              {formError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> {formError}
                </div>
              )}

              {formSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> {formSuccess}
                </div>
              )}

              <div className="space-y-3 text-xs pt-2">
                <div className="space-y-1">
                  <Label>Full Name</Label>
                  <Input placeholder="e.g. Vikram Sharma" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Email Address</Label>
                  <Input placeholder="vikram@gmail.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Password</Label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Roll Number</Label>
                    <Input placeholder="CSE2023051" value={newRollNumber} onChange={(e) => setNewRollNumber(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Department</Label>
                    <Input value={newDepartment} onChange={(e) => setNewDepartment(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Course</Label>
                    <Input value={newCourse} onChange={(e) => setNewCourse(e.target.value)} />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-3">
                <Button
                  onClick={() => createStudentMutation.mutate()}
                  disabled={createStudentMutation.isPending || !newName || !newEmail || !newRollNumber}
                  className="w-full font-semibold"
                >
                  {createStudentMutation.isPending ? 'Registering...' : 'Save Student to Database'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="border border-border/60 shadow-sm p-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name, roll number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </Card>

      {/* Table Card */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            PostgreSQL Student Master Records ({filteredStudents.length} Active)
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Battery</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-muted/30 font-medium">
                      <td className="p-3">
                        <p className="font-bold text-slate-900 dark:text-slate-100">{student.name}</p>
                        <p className="text-[11px] text-muted-foreground">{student.email}</p>
                      </td>
                      <td className="p-3 font-mono font-semibold">{student.rollNumber}</td>
                      <td className="p-3">{student.department}</td>
                      <td className="p-3">
                        <span className="flex items-center gap-1 font-semibold">
                          <Battery className="h-3.5 w-3.5 text-amber-500" /> {student.battery}%
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant={student.status === 'Present' ? 'default' : 'secondary'} className={student.status === 'Present' ? 'bg-emerald-600 text-white' : ''}>
                          {student.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/students/${student.id}`)}
                          className="gap-1 text-xs font-semibold hover:bg-primary/10 hover:text-primary"
                        >
                          <Eye className="h-3.5 w-3.5" /> Passport
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No students found matching "{searchTerm}". Click "+ Add New Student" to register one!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
