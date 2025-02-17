"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    };

    checkAuth(); // Initial check

    // Listen for storage changes across tabs
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    router.push("/"); // Redirect to home
  };

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold">LLM LEADS</span>
        </Link>
        <nav className="flex items-center space-x-6">
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/challenges"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/challenges" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Challenges
          </Link>
          <Link
            href="/leaderboard"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/leaderboard" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Leaderboard
          </Link>
          {isAuthenticated && (
            <Link
              href="/profile"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/profile" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Profile
            </Link>
          )}
          <ModeToggle />
          {isAuthenticated ? (
            <Button variant="default" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Link href="/login">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  localStorage.setItem("token", "dummy_token"); // Simulating login
                  setIsAuthenticated(true);
                }}
              >
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
