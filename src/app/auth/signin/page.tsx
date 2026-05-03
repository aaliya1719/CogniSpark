"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LogIn } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-primary/20 shadow-2xl">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-2xl font-mono">E</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
          <CardDescription>
            Login to CogniSpark
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button 
            className="w-full h-12 text-base" 
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <LogIn className="h-5 w-5 mr-2" />
            Continue with Google
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to stay productive and sharp.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
