"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  KeyRound, 
  Sparkles, 
  Loader2, 
  Check, 
  X, 
  CheckCircle, 
  Eye, 
  EyeOff,
  AlertTriangle
} from "lucide-react";

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerName, setManagerName] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Password validation states
  const isMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password); // any non-alphanumeric character
  const isMatching = password === confirmPassword && confirmPassword.length > 0;

  const allRulesMet = isMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  useEffect(() => {
    if (!token) {
      setTokenError("No verification token was provided in the link.");
      setIsLoading(false);
      return;
    }

    const verifyLink = async () => {
      try {
        const res = await authService.verifyOnboarding(token);
        if (res.success && res.data) {
          setManagerEmail(res.data.email);
          setManagerName(res.data.name || "");
        } else {
          setTokenError(res.message || "This invitation link is invalid or has expired.");
        }
      } catch (err: any) {
        setTokenError(err.message || "Failed to verify invitation link.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyLink();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!allRulesMet) {
      toast.error("Password does not meet the complexity requirements.");
      return;
    }

    if (!isMatching) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.setPassword(token, password);
      if (res.success) {
        toast.success("Password configured successfully!");
        setIsSuccess(true);
      } else {
        toast.error(res.message || "Failed to set password.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to set password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#e07b39]" />
        <p className="text-gray-400 text-sm">Verifying invitation token...</p>
      </div>
    );
  }

  if (tokenError) {
    return (
      <Card className="border-red-900/50 bg-[#111827]/60 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900/20 mb-4 border border-red-500/20">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <CardTitle className="text-xl font-bold text-white">Setup Link Invalid</CardTitle>
          <CardDescription className="text-gray-400 mt-2">
            {tokenError}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center border-t border-[#1e293b] pt-5 mt-5">
          <p className="text-xs text-gray-500">
            Please ask your system administrator to generate a new Manager invite link.
          </p>
        </CardFooter>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="border-emerald-900/50 bg-[#111827]/60 backdrop-blur-xl shadow-2xl animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-900/20 mb-4 border border-emerald-500/20">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Registration Complete!</CardTitle>
          <CardDescription className="text-gray-300 mt-2">
            Your password has been successfully configured. You can now log into the control panel.
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-4">
          <Button
            onClick={() => router.replace("/login")}
            className="w-full bg-gradient-to-r from-[#e07b39] to-amber-500 py-6 text-base font-semibold text-white shadow-lg hover:from-[#c96a2a] hover:to-amber-600 active:scale-[0.98] transition-all duration-200"
          >
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-[#1e293b] bg-[#111827]/60 backdrop-blur-xl shadow-2xl">
      <form onSubmit={handleSubmit}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-bold text-white">Setup Password</CardTitle>
          <CardDescription className="text-gray-400">
            Configure credentials for manager account <span className="text-[#e07b39] font-medium">{managerEmail}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password-field" className="text-sm font-medium text-gray-200">
              New Password
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <KeyRound className="h-4 w-4 text-gray-500" />
              </div>
              <Input
                id="password-field"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-[#1e293b] bg-[#0b0f19]/50 pl-10 pr-10 text-white placeholder-gray-600 focus:border-[#e07b39] h-14"
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword-field" className="text-sm font-medium text-gray-200">
              Confirm Password
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <KeyRound className="h-4 w-4 text-gray-500" />
              </div>
              <Input
                id="confirmPassword-field"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-[#1e293b] bg-[#0b0f19]/50 pl-10 text-white placeholder-gray-600 focus:border-[#e07b39] h-14"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {/* Password Complexity Checklist */}
          <div className="bg-[#0b0f19]/40 border border-[#1e293b]/60 rounded-lg p-4 space-y-2 text-xs text-gray-400 mt-2">
            <div className="font-semibold text-gray-300 mb-1">Password Requirements:</div>
            
            <div className="flex items-center gap-2">
              {isMinLength ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <X className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={isMinLength ? "text-emerald-400 font-medium" : ""}>At least 8 characters</span>
            </div>

            <div className="flex items-center gap-2">
              {hasUppercase ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <X className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={hasUppercase ? "text-emerald-400 font-medium" : ""}>One uppercase letter (A-Z)</span>
            </div>

            <div className="flex items-center gap-2">
              {hasLowercase ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <X className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={hasLowercase ? "text-emerald-400 font-medium" : ""}>One lowercase letter (a-z)</span>
            </div>

            <div className="flex items-center gap-2">
              {hasNumber ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <X className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={hasNumber ? "text-emerald-400 font-medium" : ""}>One number (0-9)</span>
            </div>

            <div className="flex items-center gap-2">
              {hasSpecial ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <X className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={hasSpecial ? "text-emerald-400 font-medium" : ""}>One special character (@$!%*?&...)</span>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-[#1e293b]/40">
              {isMatching ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <X className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={isMatching ? "text-emerald-400 font-medium" : ""}>Passwords match</span>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#e07b39] to-amber-500 py-6 text-base font-semibold text-white shadow-lg shadow-[#e07b39]/20 hover:from-[#c96a2a] hover:to-amber-600 active:scale-[0.98] transition-all duration-200"
            disabled={isSubmitting || !allRulesMet || !isMatching}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Configuring Account...
              </>
            ) : (
              "Save Password"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function SetPassword() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0b0f19] px-4 py-12 sm:px-6 lg:px-8">
      {/* Decorative glows */}
      <div className="absolute top-1/4 left-1/4 h-75 w-75 rounded-full bg-[#e07b39]/10 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 h-75 w-75 rounded-full bg-blue-500/10 blur-[120px] animate-pulse delay-1000"></div>

      <div className="z-10 w-full max-w-md">
        <div className="mb-8 text-center animate-fade-in">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-tr from-[#e07b39] to-amber-400 shadow-lg shadow-[#e07b39]/30">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Manbazar Setup
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Complete your manager account setup securely
          </p>
        </div>

        <Suspense fallback={
          <div className="bg-[#111827]/60 backdrop-blur-xl border border-[#1e293b] rounded-xl p-8 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#e07b39]" />
            <p className="text-gray-400 text-sm">Loading page resources...</p>
          </div>
        }>
          <SetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
