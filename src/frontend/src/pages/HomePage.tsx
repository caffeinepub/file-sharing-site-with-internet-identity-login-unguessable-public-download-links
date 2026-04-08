import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGlobalStats } from "@/features/stats/useGlobalStats";
import { formatBytes } from "@/utils/format";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Download,
  FileText,
  HardDrive,
  Lock,
  Share2,
  UploadCloud,
} from "lucide-react";

export default function HomePage() {
  const { data: stats, isLoading, error, refetch } = useGlobalStats();

  const steps = [
    {
      icon: <UploadCloud className="w-5 h-5 text-primary" />,
      step: "1",
      title: "Login & Upload",
      desc: "Sign in with Internet Identity and upload any file — no size or type limits.",
    },
    {
      icon: <Lock className="w-5 h-5 text-primary" />,
      step: "2",
      title: "Get Unique Link",
      desc: "Each file gets a cryptographically random, unguessable download link.",
    },
    {
      icon: <Share2 className="w-5 h-5 text-primary" />,
      step: "3",
      title: "Share & Track",
      desc: "Share the link with anyone. Monitor download counts and delete anytime.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-16">
      {/* Hero */}
      <div className="text-center space-y-6 py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-2">
          <Lock className="w-3.5 h-3.5" />
          Decentralized File Sharing
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Secure Files on the
          <br />
          <span className="text-primary">Internet Computer</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Upload files and share with unique, unguessable links. No limits, no
          middlemen — your data lives on a decentralized network.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/dashboard">
            <Button size="lg" className="gap-2" data-ocid="hero-cta">
              <UploadCloud className="w-4 h-4" />
              Start Uploading
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-5">
        <h2 className="text-2xl font-semibold text-center tracking-tight">
          Platform Statistics
        </h2>

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

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          data-ocid="stats-grid"
        >
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Files
              </CardTitle>
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                <div
                  className="text-3xl font-bold tracking-tight"
                  data-ocid="stat-total-files"
                >
                  {stats?.totalFiles.toString() ?? "0"}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Files uploaded
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Storage
              </CardTitle>
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <HardDrive className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                <div
                  className="text-3xl font-bold tracking-tight"
                  data-ocid="stat-total-bytes"
                >
                  {formatBytes(stats?.totalBytes ?? BigInt(0))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Data stored</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Downloads
              </CardTitle>
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <Download className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                <div
                  className="text-3xl font-bold tracking-tight"
                  data-ocid="stat-total-downloads"
                >
                  {stats?.totalDownloads.toString() ?? "0"}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Files downloaded
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-muted/30 border border-border rounded-xl p-8 space-y-6">
        <h3 className="text-xl font-semibold tracking-tight">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({ step, icon, title, desc }) => (
            <div key={step} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  {icon}
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  Step {step}
                </span>
              </div>
              <h4 className="font-semibold">{title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
