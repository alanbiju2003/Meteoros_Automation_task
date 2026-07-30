import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileSpreadsheet, Download, Filter, ShieldAlert, Award, TrendingUp, Mail, Send, CheckCircle2, Moon, AlertTriangle, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Reports() {
  const [department, setDepartment] = useState('all');
  const [format, setFormat] = useState('csv');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('dean-academics@college.edu');

  // Preview Modal State
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // CSV Report Generator
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

  // Real-Time Security Incident Email Mutation
  const securityEmailMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/api/alerts/send-security-email', {
        studentName: 'Aarav Sharma',
        rollNumber: 'CSE2023001',
        riskType: 'GPS Spoofing & Teleportation Speed Anomaly (>180 km/h jump)',
        details: 'Student position jumped between Noida and Bengaluru in <2 minutes. Mock Location API enabled.',
        recipientEmail,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setSuccessMessage(`✅ Security Email Alert dispatched to ${data.recipientEmail}`);
      setPreviewTitle('Real-Time Security Alert Email Preview');
      setPreviewHtml(data.htmlPreview);
      setIsModalOpen(true);
    },
  });

  // Nightly Threat Audit Email Mutation
  const nightlyReportMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/api/alerts/nightly-audit-report', {
        recipientEmail,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setSuccessMessage(`✅ Nightly Threat Audit Report sent to ${data.recipientEmail}`);
      setPreviewTitle('Nightly Threat & Audit Email Report Preview');
      setPreviewHtml(data.htmlPreview);
      setIsModalOpen(true);
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="h-7 w-7 text-primary" /> Security Alerts & Stakeholder Email Engine
          </h1>
          <p className="text-muted-foreground text-sm">
            Automated stakeholder security dispatches, nightly threat audit reports, and PostgreSQL compliance exports.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

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
              <p className="text-xs text-muted-foreground font-medium">Spoofing Risk Flags</p>
              <p className="text-2xl font-bold text-rose-600">2 Flagged Today</p>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Layout: Security Email Dispatcher + CSV Exporter */}
      <div className="grid gap-6 md:grid-cols-2 items-start">
        {/* Stakeholder Security & Threat Email Engine Card */}
        <Card className="border-2 border-slate-800 shadow-md bg-slate-950 text-slate-100">
          <CardHeader className="border-b border-slate-800 pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-rose-400">
              <Mail className="h-5 w-5 text-rose-400" /> Stakeholder Security & Threat Email Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300 font-semibold">Stakeholder Email Recipient</Label>
              <Input
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="bg-slate-900 border-slate-700 text-slate-100 text-xs font-mono"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
              <p className="font-bold text-rose-400 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> High-Risk Incident Summary
              </p>
              <p className="text-slate-300">Student: <strong>Aarav Sharma (CSE2023001)</strong></p>
              <p className="text-slate-400 text-[10px]">Reason: GPS Teleportation Speed Anomaly (&gt;180 km/h) & Mock Location Detected</p>
            </div>

            <div className="space-y-2 pt-1">
              <Button
                onClick={() => securityEmailMutation.mutate()}
                disabled={securityEmailMutation.isPending}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold gap-2"
              >
                <Send className="h-4 w-4" /> Dispatch Real-Time Security Incident Email
              </Button>

              <Button
                onClick={() => nightlyReportMutation.mutate()}
                disabled={nightlyReportMutation.isPending}
                variant="outline"
                className="w-full border-slate-700 text-slate-200 hover:bg-slate-900 font-semibold gap-2"
              >
                <Moon className="h-4 w-4 text-blue-400" /> Send Nightly Automated Threat Audit Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CSV & JSON Export Card */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" /> Export Attendance Database Report
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
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
          </CardContent>
          <CardFooter className="pt-2">
            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full gap-2 py-5 font-semibold text-sm">
              <Download className="h-4 w-4" /> {isGenerating ? 'Generating Report...' : `Download ${format.toUpperCase()} Attendance Audit Report`}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Email Template Preview Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> {previewTitle}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Live HTML Email template dispatched to stakeholders.
            </DialogDescription>
          </DialogHeader>

          <div
            className="p-4 border rounded-xl bg-white text-slate-900"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
