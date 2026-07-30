import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { FileText, Download, Filter, FileSpreadsheet, ShieldAlert, Award, TrendingUp, CheckCircle2, CloudRain } from 'lucide-react';

export default function Reports() {
  const [department, setDepartment] = useState('all');
  const [format, setFormat] = useState('csv');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/reports?department=${department}&format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `college_attendance_report_${department}_${Date.now()}.${format === 'csv' ? 'csv' : 'json'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to generate report.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="h-7 w-7 text-primary" /> Executive Attendance Reports & CTO Intelligence
          </h1>
          <p className="text-muted-foreground text-sm">
            Export comprehensive 30-day attendance metrics, geofence compliance, and fraud audit logs from PostgreSQL.
          </p>
        </div>
      </div>

      {/* Top Intelligence Stats Banner */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Overall Attendance Compliance</p>
              <p className="text-2xl font-extrabold text-emerald-600">88.4%</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Geofence Accuracy</p>
              <p className="text-2xl font-bold text-blue-600">96.8%</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Spoofing / Fraud Risk Flags</p>
              <p className="text-2xl font-bold text-rose-600">2 Resolved</p>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Generator Card */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" /> Export Custom Attendance Report
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 text-xs">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Target Department</Label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-background border rounded-md px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Departments (100+ Students)</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Export Format</Label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full bg-background border rounded-md px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="csv">CSV Spreadsheet (.csv)</option>
                <option value="json">JSON Raw Dataset (.json)</option>
              </select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full gap-2 py-5 font-semibold text-sm">
            <Download className="h-4 w-4" /> {isGenerating ? 'Generating Report...' : `Download ${format.toUpperCase()} Attendance Audit Report`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
