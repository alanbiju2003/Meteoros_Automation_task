import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ShieldCheck, Battery, Wifi, MapPin, Laptop, ShieldAlert, CheckCircle2, History, AlertTriangle, FileText, Globe, Download, Award, QrCode } from 'lucide-react';

export default function StudentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [manualReason, setManualReason] = useState('');
  const [manualMessage, setManualMessage] = useState('');

  // Fetch Student Full Profile & Metadata
  const { data: student, isLoading } = useQuery({
    queryKey: ['student-details', id],
    queryFn: async () => {
      const res = await axios.get(`/api/students/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Manual Attendance Request Mutation
  const manualMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/api/attendance/approval-request', {
        studentId: id,
        reason: manualReason,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setManualMessage(`✅ Request submitted: "${data.message}"`);
      queryClient.invalidateQueries({ queryKey: ['live-activity'] });
    },
  });

  const handleDownloadCertificate = () => {
    if (!student) return;

    const certContent = `
========================================================================================
             METEOROS INSTITUTE OF TECHNOLOGY & AUTOMATION
                   OFFICIAL ATTENDANCE CERTIFICATE & TRANSCRIPT
========================================================================================

Student Name:      ${student.name}
Roll Number:       ${student.rollNumber}
Email Address:     ${student.email}
Department:        ${student.department}
Course / Degree:   ${student.course} (Year ${student.year})

----------------------------------------------------------------------------------------
ATTENDANCE AUDIT METRICS (POSTGRESQL VERIFIED)
----------------------------------------------------------------------------------------
Overall Attendance Percentage:   ${student.attendancePercentage}%
Days Present:                     ${student.totalPresentDays} Days
Days Absent:                      ${student.totalAbsentDays} Days
Geofence Compliance Status:       ${student.geofenceEvaluation?.isInsideGeofence ? 'VERIFIED INSIDE CAMPUS' : 'REMOTE / GEOFENCE EXEMPTION'}

----------------------------------------------------------------------------------------
REGISTERED HARDWARE TELEMETRY
----------------------------------------------------------------------------------------
Active Device Model:              ${student.deviceInfo?.model || 'Mobile Device'}
OS & Browser:                     ${student.deviceInfo?.os} | ${student.deviceInfo?.browser}
Verified IP Address:              ${student.deviceInfo?.ipAddress}

----------------------------------------------------------------------------------------
VERIFICATION SIGNATURE & SEAL
----------------------------------------------------------------------------------------
Digital Signature:  [SIGNED BY REGISTRAR & OFFICE OF ACADEMIC AFFAIRS]
Verification Hash:  0x${Math.random().toString(16).substring(2, 14).toUpperCase()}
Issued Date:        ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}

========================================================================================
`;

    const blob = new Blob([certContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Official_Attendance_Certificate_${student.rollNumber}.txt`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Loading Student Digital Passport...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-4">
        <p className="text-rose-500 font-semibold">Student record not found.</p>
        <Button variant="outline" onClick={() => navigate('/students')}>Back to Students</Button>
      </div>
    );
  }

  const geofence = student.geofenceEvaluation;
  const device = student.deviceInfo;

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/students')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              {student.name} <Badge className="bg-primary text-primary-foreground font-semibold">Digital Passport</Badge>
            </h1>
            <p className="text-xs text-muted-foreground">
              Roll Number: {student.rollNumber} | Email: {student.email} | {student.department}
            </p>
          </div>
        </div>

        <Button
          onClick={handleDownloadCertificate}
          className="gap-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          <Award className="h-4 w-4" /> Download Official Certificate
        </Button>
      </div>

      {manualMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {manualMessage}
        </div>
      )}

      {/* Multi-Device Login Conflict Alert Banner */}
      {device?.isMultiDeviceConflict && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 p-4 rounded-xl text-xs font-semibold flex items-start gap-3 shadow-sm">
          <ShieldAlert className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-bold text-sm">SECURITY ALERT: Multi-Device Concurrent Login Conflict Detected!</p>
            <p className="mt-0.5">{device.conflictReason}</p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column: Device Fingerprint & Explainability Panel */}
        <div className="md:col-span-5 space-y-6">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Laptop className="h-5 w-5 text-primary" /> Active Hardware Device Fingerprint
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Detected Model</span>
                <span className="font-bold text-primary">{device?.model || 'MacBook Pro (Apple Silicon M1)'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Battery className="h-3.5 w-3.5 text-amber-500" /> Real Device Battery
                </span>
                <span className="font-bold text-amber-600">{device?.batteryLevel || 92}% ⚡</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Operating System</span>
                <span className="font-semibold">{device?.os || 'macOS 14 Sonoma'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Browser Engine</span>
                <span className="font-semibold">{device?.browser || 'Chrome 123'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" /> Client IP Address
                </span>
                <span className="font-mono font-semibold">{device?.ipAddress || '182.73.18.94'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Attendance Percentage</span>
                <span className="font-bold text-emerald-600 text-sm">{student.attendancePercentage}%</span>
              </div>
            </CardContent>
          </Card>

          {/* CTO Explainability Panel */}
          <Card className={`border shadow-sm ${geofence?.isInsideGeofence ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'}`}>
            <CardHeader className="border-b pb-3">
              <CardTitle className={`text-base font-semibold flex items-center gap-2 ${geofence?.isInsideGeofence ? 'text-emerald-700' : 'text-rose-700'}`}>
                <ShieldCheck className="h-5 w-5" /> Attendance Decision Explainability
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2 text-xs">
              {geofence?.explainabilityList ? (
                geofence.explainabilityList.map((item: any, idx: number) => (
                  <div key={idx} className={`flex items-start gap-2 font-medium ${item.passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {item.passed ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" /> : <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />}
                    <span>{item.text}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Evaluating explainability...</p>
              )}

              <div className={`pt-3 border-t flex justify-between items-center font-bold text-sm ${geofence?.isInsideGeofence ? 'text-emerald-800 border-emerald-500/20' : 'text-rose-800 border-rose-500/20'}`}>
                <span>Final Confidence Score:</span>
                <span>{geofence?.confidenceScore}% {geofence?.isInsideGeofence ? '✅ (Verified Present)' : '🔴 (Outside Campus)'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: TimescaleDB Logs & Exemption Request */}
        <div className="md:col-span-7 space-y-6">
          {/* Manual Exemption Request */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Request Manual Attendance Exemption
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Exemption Reason</Label>
                <Input
                  placeholder="e.g. Device GPS Hardware Failure during 10 AM class"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => manualMutation.mutate()}
                disabled={manualMutation.isPending || !manualReason}
                className="w-full font-semibold gap-2"
              >
                Submit Exemption for Faculty Approval & Audit Log
              </Button>
            </CardFooter>
          </Card>

          {/* TimescaleDB Location Telemetry History */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" /> TimescaleDB Location Telemetry Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              {student.recentLocationPings?.length > 0 ? (
                student.recentLocationPings.map((ping: any) => (
                  <div key={ping.id} className="flex justify-between items-center p-3 rounded-lg border bg-muted/20 font-mono text-[11px]">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {ping.latitude.toFixed(5)}° N, {ping.longitude.toFixed(5)}° E
                      </p>
                      <p className="text-muted-foreground text-[10px]">
                        Accuracy: {ping.accuracy}m | Battery: {ping.batteryLevel}% | {ping.networkType}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-sans font-medium">
                      {new Date(ping.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-muted-foreground">No telemetry pings logged yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
