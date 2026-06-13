/* ═══════════════════════════════════════════════════════════════════════════════
   ADMIN LOGIN PAGE
   
   A premium dark-themed login page with:
   - Animated background glow effects for visual appeal
   - Orange gradient brand identity (Extenup signature color)
   - Form validation with Sonner toast notifications
   - Loading state with spinner during authentication
   - Redirects to dashboard on successful login
   ═══════════════════════════════════════════════════════════════════════════════ */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "../../services/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { KeyRound, Mail, Sparkles, Loader2 } from "lucide-react";

export default function Login() {
    const router = useRouter();

    /* Form field state */
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    /* Loading state — prevents double submissions */
    const [isLoading, setIsLoading] = useState(false);

    /**
     * handleSubmit — Authenticate the admin user.
     * On success: redirect to dashboard.
     * On failure: show error toast with the server message.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        /* Client-side validation — ensure both fields are filled */
        if (!email || !password) {
            toast.error("Please fill in all fields.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await authService.login(email, password);
            if (res.success) {
                toast.success("Login successful! Welcome back.");
                /* Replace current route (so user can't go back to login) */
                router.replace("/");
                router.refresh();
            } else {
                toast.error(res.message || "Invalid email or password.");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to log in. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
      /* Full-screen centered container with radial gradient background */
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0b0f19] px-4 py-12 sm:px-6 lg:px-8">
        {/* ─── Background Decorative Glows ─── 
                These blurred circles create a subtle, animated ambient effect
                behind the login card for a premium feel. */}
        <div className="absolute top-1/4 left-1/4 h-75 w-75 rounded-full bg-[#e07b39]/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 h-75 w-75 rounded-full bg-blue-500/10 blur-[120px] animate-pulse delay-1000"></div>

        <div className="z-10 w-full max-w-md">
          {/* ─── Logo / Title Area ─── */}
          <div className="mb-8 text-center animate-fade-in">
            {/* Brand icon — orange gradient square with sparkle icon */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-tr from-[#e07b39] to-amber-400 shadow-lg shadow-[#e07b39]/30">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Extenup Admin
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Sign in to manage your storefront, products, and orders
            </p>
          </div>

          {/* ─── Login Card ─── 
                    Uses glassmorphism (backdrop-blur + semi-transparent bg) */}
          <Card className="border-[#1e293b] bg-[#111827]/60 backdrop-blur-xl shadow-2xl shadow-black/80">
            <form onSubmit={handleSubmit}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl font-bold text-white">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-gray-400 mb-5">
                  Enter your credentials to access the console
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 mb-5">
                {/* Email field with icon prefix */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-200"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@extenup.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-[#1e293b] bg-[#0b0f19]/50 pl-10 text-white placeholder-gray-600 focus:border-[#e07b39] focus:ring-[#e07b39] h-14"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
                {/* Password field with icon prefix */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-200"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <KeyRound className="h-4 w-4 text-gray-500" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-[#1e293b] bg-[#0b0f19]/50 pl-10 text-white placeholder-gray-600 focus:border-[#e07b39] focus:ring-[#e07b39] h-14"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {/* Submit button — orange gradient with hover darkening */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#e07b39] to-amber-500 py-6 text-base font-semibold text-white shadow-lg shadow-[#e07b39]/20 hover:from-[#c96a2a] hover:to-amber-600 active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#e07b39] focus:ring-offset-2 focus:ring-offset-[#0b0f19]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      {/* Spinner shown during login request */}
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    );
}
