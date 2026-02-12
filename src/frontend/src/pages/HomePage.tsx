import { useGlobalStats } from '@/features/stats/useGlobalStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, HardDrive, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

function formatBytes(bytes: bigint): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = Number(bytes);
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

export default function HomePage() {
  const { data: stats, isLoading, error, refetch } = useGlobalStats();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Secure File Sharing</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Upload files securely to the Internet Computer. Share with unique, unguessable links. No limits, no tracking.
        </p>
        <div className="pt-4">
          <Link to="/dashboard">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-center">Platform Statistics</h2>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load statistics</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalFiles.toString() || '0'}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Files uploaded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{formatBytes(stats?.totalBytes || BigInt(0))}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Data stored</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalDownloads.toString() || '0'}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Files downloaded</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-8 space-y-4">
        <h3 className="text-xl font-semibold">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              1
            </div>
            <h4 className="font-medium">Login & Upload</h4>
            <p className="text-sm text-muted-foreground">
              Sign in with Internet Identity and upload your files securely.
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              2
            </div>
            <h4 className="font-medium">Get Unique Link</h4>
            <p className="text-sm text-muted-foreground">
              Each file gets a unique, unguessable download link that you can share.
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              3
            </div>
            <h4 className="font-medium">Share & Track</h4>
            <p className="text-sm text-muted-foreground">
              Share the link with anyone. Track downloads and manage your files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
