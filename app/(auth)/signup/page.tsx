"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // Sign up user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Wait a moment for cookies to be set after signup
        await new Promise((resolve) => setTimeout(resolve, 100));
        
        // Create user record in database
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Include cookies in the request
          body: JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            name,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to create user profile");
        }

        setSuccess(true);
        
        // If email confirmation is disabled, redirect to dashboard
        if (data.session) {
          setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
          }, 1500);
        }
      }
    } catch (err: any) {
      // Handle Supabase rate limiting
      if (err?.code === "over_email_send_rate_limit" || err?.message?.includes("rate limit")) {
        // Extract wait time from message (e.g., "after 34 seconds")
        const waitMatch = err.message?.match(/(\d+)\s*seconds?/i);
        const waitTime = waitMatch ? parseInt(waitMatch[1], 10) : 60;
        
        setRateLimitSeconds(waitTime);
        setError(
          `Too many signup attempts. Please wait ${waitTime} seconds before trying again.`
        );
        
        // Start countdown timer
        const interval = setInterval(() => {
          setRateLimitSeconds((prev) => {
            if (prev === null || prev <= 1) {
              clearInterval(interval);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
        
        // Clear interval after wait time
        setTimeout(() => {
          clearInterval(interval);
          setRateLimitSeconds(null);
        }, waitTime * 1000);
      } else {
        // Handle other errors
        const errorMessage = err?.message || err?.error_description || "An error occurred during signup";
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl text-primary-900">
            Check your email
          </CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent you a confirmation link to verify your account.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Link href="/login">
            <Button variant="link">Back to login</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-3xl font-bold text-primary-900">
          MoneyQ
        </CardTitle>
        <CardDescription className="text-center">
          Create your account to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">
              Minimum 8 characters
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <div className="flex items-center justify-between">
                <span>{error}</span>
                {rateLimitSeconds !== null && rateLimitSeconds > 0 && (
                  <span className="ml-2 font-mono text-xs">
                    ({rateLimitSeconds}s)
                  </span>
                )}
              </div>
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || (rateLimitSeconds !== null && rateLimitSeconds > 0)}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {rateLimitSeconds !== null && rateLimitSeconds > 0
              ? `Please wait ${rateLimitSeconds}s`
              : "Create Account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

