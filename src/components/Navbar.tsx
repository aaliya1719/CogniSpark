"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { User, LogOut, LogIn } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b bg-card px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold font-mono">E</span>
        </div>
        <h1 className="text-lg font-bold tracking-tight">CogniSpark</h1>
      </div>

      <div className="flex items-center gap-4">
        {session ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{session.user?.name || "User"}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={() => signIn()}>
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
        )}
      </div>
    </nav>
  );
}
