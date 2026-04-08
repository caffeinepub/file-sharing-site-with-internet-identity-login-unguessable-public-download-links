import { useIsAdmin } from "@/features/admin/useIsAdmin";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Link } from "@tanstack/react-router";
import { FileUp, Shield } from "lucide-react";
import { SiGithub, SiX } from "react-icons/si";
import AuthStatusBadge from "../auth/AuthStatusBadge";
import LoginButton from "../auth/LoginButton";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const isAuthenticated = !!identity;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none bg-center bg-no-repeat bg-cover"
        style={{
          backgroundImage: "url(/assets/generated/landing-bg.dim_1600x900.png)",
        }}
      />

      <header className="relative border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/assets/generated/logo-mark.dim_512x512.png"
                alt="Logo"
                className="w-10 h-10"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  FileVault
                </h1>
                <p className="text-xs text-muted-foreground">
                  Secure file sharing on ICP
                </p>
              </div>
            </Link>

            <nav className="flex items-center gap-6">
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <FileUp className="w-4 h-4" />
                    My Files
                  </Link>
                  {!isAdminLoading && isAdmin && (
                    <Link
                      to="/admin"
                      className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Admin
                    </Link>
                  )}
                </>
              )}
              <AuthStatusBadge />
              <LoginButton />
            </nav>
          </div>
        </div>
      </header>

      <main className="relative flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="relative border-t border-border bg-background/80 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} FileVault</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                Built with <span className="text-destructive">♥</span> using{" "}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                    typeof window !== "undefined"
                      ? window.location.hostname
                      : "filevault",
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:text-foreground transition-colors"
                >
                  caffeine.ai
                </a>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <SiX className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <SiGithub className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
