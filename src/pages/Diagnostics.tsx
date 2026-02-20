import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { API_URL } from '@/lib/api';
import { CheckCircle2, XCircle, Activity, Globe, ShieldCheck } from 'lucide-react';

export function DiagnosticsPage() {
    const [results, setResults] = useState<any>({
        apiHealth: { status: 'pending', details: null },
        apiPing: { status: 'pending', details: null },
        diagnostics: { status: 'pending', details: null },
        env: {
            apiUrl: API_URL,
            nodeEnv: import.meta.env.MODE,
            origin: window.location.origin,
            userAgent: navigator.userAgent
        }
    });

    const runChecks = async () => {
        // Reset status
        setResults(prev => ({
            ...prev,
            apiHealth: { status: 'pending' },
            apiPing: { status: 'pending' },
            diagnostics: { status: 'pending' }
        }));

        // Check Health
        try {
            const res = await fetch(`${API_URL}/health`);
            const data = await res.json();
            setResults(prev => ({ ...prev, apiHealth: { status: res.ok ? 'success' : 'error', details: data } }));
        } catch (e: any) {
            setResults(prev => ({ ...prev, apiHealth: { status: 'error', details: e.message } }));
        }

        // Check Ping
        try {
            const res = await fetch(`${API_URL}/ping`);
            const text = await res.text();
            setResults(prev => ({ ...prev, apiPing: { status: res.ok ? 'success' : 'error', details: text } }));
        } catch (e: any) {
            setResults(prev => ({ ...prev, apiPing: { status: 'error', details: e.message } }));
        }

        // Check Diagnostics
        try {
            const res = await fetch(`${API_URL}/diagnostics`);
            const data = await res.json();
            setResults(prev => ({ ...prev, diagnostics: { status: res.ok ? 'success' : 'error', details: data } }));
        } catch (e: any) {
            setResults(prev => ({ ...prev, diagnostics: { status: 'error', details: e.message } }));
        }
    };

    useEffect(() => {
        runChecks();
    }, []);

    const StatusIcon = ({ status }: { status: string }) => {
        if (status === 'success') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
        if (status === 'error') return <XCircle className="w-5 h-5 text-red-500" />;
        return <Activity className="w-5 h-5 text-yellow-500 animate-pulse" />;
    };

    return (
        <div className="min-h-screen bg-background p-6 space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                    System Diagnostics
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Environment Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Globe className="w-5 h-5" />
                                Environment Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground">API URL</span>
                                <code className="text-xs bg-muted px-2 py-1 rounded">{results.env.apiUrl}</code>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground">Mode</span>
                                <Badge variant="outline">{results.env.nodeEnv}</Badge>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-muted-foreground">Host Origin</span>
                                <span className="text-xs">{results.env.origin}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* API Health */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center justify-between">
                                <span>API Connectivity</span>
                                <Button variant="ghost" size="sm" onClick={runChecks}>Refresh</Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <StatusIcon status={results.apiHealth.status} />
                                    <span>/api/health</span>
                                </div>
                                <Badge variant={results.apiHealth.status === 'success' ? 'default' : 'destructive'}>
                                    {results.apiHealth.status}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <StatusIcon status={results.apiPing.status} />
                                    <span>/api/ping</span>
                                </div>
                                <Badge variant={results.apiPing.status === 'success' ? 'default' : 'destructive'}>
                                    {results.apiPing.status}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <StatusIcon status={results.diagnostics.status} />
                                    <span>/api/diagnostics</span>
                                </div>
                                <Badge variant={results.diagnostics.status === 'success' ? 'default' : 'destructive'}>
                                    {results.diagnostics.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Console / Error Log */}
                <Card>
                    <CardHeader>
                        <CardTitle>Technical Logs</CardTitle>
                        <CardDescription>Raw response data from the last check</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-black text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-64">
                            {JSON.stringify(results, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default DiagnosticsPage;
