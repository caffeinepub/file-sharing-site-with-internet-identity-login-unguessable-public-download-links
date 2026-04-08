import FileUploadPanel from "@/components/files/FileUploadPanel";
import MyFilesTable from "@/components/files/MyFilesTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import { AlertCircle, LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const { isLoading: profileLoading } = useGetCallerUserProfile();

  if (!identity) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Please log in to access your dashboard</span>
            <Link to="/">
              <Button variant="outline" size="sm">
                Go Home
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <LayoutDashboard className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-muted-foreground mt-0.5">
            Upload and manage your files
          </p>
        </div>
      </div>

      <FileUploadPanel />

      <MyFilesTable />
    </div>
  );
}
