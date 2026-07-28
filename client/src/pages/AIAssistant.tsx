import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, Sparkles, Database, Terminal, Send, Search } from 'lucide-react';

export default function AIAssistant() {
  const [prompt, setPrompt] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);

  const samplePrompts = [
    'Who entered after 10 AM today?',
    'Show students inside library for more than two hours',
    'Find suspicious attendance or GPS spoofing fraud',
    'Show CSE department attendance roster',
  ];

  const aiQueryMutation = useMutation({
    mutationFn: async (textPrompt: string) => {
      const res = await axios.post('/api/ai/query', { prompt: textPrompt });
      return res.data;
    },
    onSuccess: (data) => {
      setQueryResult(data);
    },
  });

  const handleSearch = (text: string) => {
    setPrompt(text);
    aiQueryMutation.mutate(text);
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" /> AI Natural Language Attendance Assistant
        </h1>
        <p className="text-muted-foreground text-sm">
          Ask questions in natural English — automatically converts to SQL queries against PostgreSQL & TimescaleDB.
        </p>
      </div>

      {/* Query Card */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" /> Ask AI Natural Language Query
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Show students who entered after 10 AM today..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(prompt)}
              className="text-sm font-medium"
            />
            <Button
              onClick={() => handleSearch(prompt)}
              disabled={aiQueryMutation.isPending || !prompt}
              className="gap-2 font-semibold"
            >
              <Send className="h-4 w-4" /> {aiQueryMutation.isPending ? 'Querying...' : 'Ask AI'}
            </Button>
          </div>

          {/* Sample Prompts */}
          <div className="space-y-2 pt-1">
            <p className="text-xs font-semibold text-muted-foreground">Sample Executive Queries:</p>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((p) => (
                <Button
                  key={p}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch(p)}
                  className="text-xs border-primary/30 hover:bg-primary/5 text-primary gap-1"
                >
                  <Search className="h-3 w-3" /> {p}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Query Result & Generated SQL */}
      {queryResult && (
        <div className="space-y-4 animate-in fade-in">
          {/* Generated SQL Terminal Box */}
          <Card className="border border-slate-800 bg-slate-950 text-slate-100 shadow-xl overflow-hidden font-mono text-xs">
            <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800">
              <span className="flex items-center gap-2 text-emerald-400 font-bold">
                <Terminal className="h-4 w-4" /> Generated SQL Query Engine
              </span>
              <Badge className="bg-emerald-600 text-white text-[10px]">PostgreSQL Execution</Badge>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-slate-400 text-[11px]">// {queryResult.queryExplanation}</p>
              <p className="text-emerald-300 font-bold">{queryResult.generatedSQL}</p>
            </div>
          </Card>

          {/* Results Table */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" /> Query Result Output ({queryResult.totalResultsCount} Records Found)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                      <th className="p-2">Name</th>
                      <th className="p-2">Roll Number / Email</th>
                      <th className="p-2">Timestamp / Location / Detail</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {queryResult.results.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-muted/30 font-medium">
                        <td className="p-2 font-bold">{row.name}</td>
                        <td className="p-2 text-muted-foreground">{row.rollNumber || row.email}</td>
                        <td className="p-2 text-muted-foreground">
                          {row.checkInTime || row.location || row.alert || row.department}
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-emerald-600 border-emerald-500/40">
                            {row.status || row.severity || 'Executed'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
