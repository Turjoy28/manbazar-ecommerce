"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "../../services/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { KeyRound, Mail, Sparkles, Loader2, ArrowLeft, ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const router = useRouter();

  /* Form field state */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  /* Loading state — prevents double submissions */
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* ─── Forgot Password State ─── */
  const [forgotMode, setForgotMode] = useState(false);
  // Steps: "email" → "otp" → "reset" → "success"
  const [forgotStep, setForgotStep] = useState<"email" | "otp" | "reset" | "success">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailHints, setEmailHints] = useState<{ superAdminEmail: string; userAdminEmail: string } | null>(null);

  useEffect(() => {
    // Fetch email hints on component mount
    authService.getAdminEmailsHint().then((res) => {
      if (res?.success && res.data) {
        setEmailHints(res.data);
      }
    }).catch((err) => console.error("Failed to fetch email hints", err));
  }, []);

  // Helper to mask an email (e.g., saifbus28@gmail.com -> sa***@gmail.com)
  const maskEmail = (email: string) => {
    if (!email || !email.includes("@")) return email;
    const [name, domain] = email.split("@");
    if (name.length <= 2) return `${name[0]}***@${domain}`;
    return `${name.substring(0, 2)}***@${domain}`;
  };

  // Helper to generate a masked hint string (only for user admin)
  const getEmailPlaceholder = () => {
    if (emailHints?.userAdminEmail) {
      return maskEmail(emailHints.userAdminEmail);
    }
    return "admin@manbazar.com";
  };

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

  /* ─── Forgot Password Handlers ─── */

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await authService.forgotPassword(forgotEmail.trim());
      if (res.success) {
        toast.success("OTP sent to your email! Check your inbox.");
        setForgotStep("otp");
      } else {
        toast.error(res.message || "Failed to send OTP.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await authService.verifyResetOtp(forgotEmail.trim(), otp.trim());
      if (res.success) {
        toast.success("OTP verified! Set your new password.");
        setForgotStep("reset");
      } else {
        toast.error(res.message || "Invalid OTP.");
      }
    } catch (err: any) {
      toast.error(err.message || "OTP verification failed.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await authService.resetPassword(forgotEmail.trim(), otp.trim(), newPassword);
      if (res.success) {
        toast.success("Password reset successfully! You can now login.");
        setForgotStep("success");
      } else {
        toast.error(res.message || "Failed to reset password.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password.");
    } finally {
      setForgotLoading(false);
    }
  };

  const resetForgotState = () => {
    setForgotMode(false);
    setForgotStep("email");
    setForgotEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
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
            Manbazar Admin
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {forgotMode ? "Reset your password" : "Sign in to manage your storefront, products, and orders"}
          </p>
        </div>

        {/* ─── Login Card OR Forgot Password Card ─── */}
        {!forgotMode ? (
          /* ═══ LOGIN FORM ═══ */
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
                        placeholder={getEmailPlaceholder()}
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
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-[#1e293b] bg-[#0b0f19]/50 pl-10 pr-10 text-white placeholder-gray-600 focus:border-[#e07b39] focus:ring-[#e07b39] h-14"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
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
                {/* Forgot Password Link */}
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  className="text-sm text-gray-400 hover:text-[#e07b39] transition-colors duration-200 cursor-pointer"
                >
                  Forgot Password?
                </button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          /* ═══ FORGOT PASSWORD FLOW ═══ */
          <Card className="border-[#1e293b] bg-[#111827]/60 backdrop-blur-xl shadow-2xl shadow-black/80">
            {/* ── STEP 1: Enter Email ── */}
            {forgotStep === "email" && (
              <form onSubmit={handleSendOtp}>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <Mail className="h-5 w-5 text-[#e07b39]" />
                    Forgot Password
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Enter your email address and we&apos;ll send you a 6-digit OTP
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email" className="text-sm font-medium text-gray-200">
                      Email Address
                    </Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                      </div>
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder={getEmailPlaceholder()}
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                        className="border-[#1e293b] bg-[#0b0f19]/50 pl-10 text-white placeholder-gray-600 focus:border-[#e07b39] focus:ring-[#e07b39] h-14"
                        disabled={forgotLoading}
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#e07b39] to-amber-500 py-6 text-base font-semibold text-white shadow-lg shadow-[#e07b39]/20 hover:from-[#c96a2a] hover:to-amber-600 active:scale-[0.98] transition-all duration-200"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={resetForgotState}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to Login
                  </button>
                </CardFooter>
              </form>
            )}

            {/* ── STEP 2: Enter OTP ── */}
            {forgotStep === "otp" && (
              <form onSubmit={handleVerifyOtp}>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#e07b39]" />
                    Verify OTP
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    We sent a 6-digit code to <span className="text-[#e07b39] font-medium">{forgotEmail}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-medium text-gray-200">
                      Enter OTP
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="border-[#1e293b] bg-[#0b0f19]/50 text-white placeholder-gray-600 focus:border-[#e07b39] focus:ring-[#e07b39] h-14 text-center text-2xl tracking-[0.5em] font-bold"
                      disabled={forgotLoading}
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    OTP is valid for 10 minutes. Check your spam folder if you don&apos;t see it.
                  </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#e07b39] to-amber-500 py-6 text-base font-semibold text-white shadow-lg shadow-[#e07b39]/20 hover:from-[#c96a2a] hover:to-amber-600 active:scale-[0.98] transition-all duration-200"
                    disabled={forgotLoading || otp.length !== 6}
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setForgotStep("email"); setOtp(""); }}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Change Email
                  </button>
                </CardFooter>
              </form>
            )}

            {/* ── STEP 3: New Password ── */}
            {forgotStep === "reset" && (
              <form onSubmit={handleResetPassword}>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <Lock className="h-5 w-5 text-[#e07b39]" />
                    Set New Password
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Create a strong new password for your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-medium text-gray-200">
                      New Password
                    </Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <KeyRound className="h-4 w-4 text-gray-500" />
                      </div>
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="border-[#1e293b] bg-[#0b0f19]/50 pl-10 pr-10 text-white placeholder-gray-600 focus:border-[#e07b39] focus:ring-[#e07b39] h-14"
                        disabled={forgotLoading}
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-200">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <KeyRound className="h-4 w-4 text-gray-500" />
                      </div>
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="border-[#1e293b] bg-[#0b0f19]/50 pl-10 pr-10 text-white placeholder-gray-600 focus:border-[#e07b39] focus:ring-[#e07b39] h-14"
                        disabled={forgotLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-400 text-center">Passwords do not match</p>
                  )}
                  <p className="text-xs text-gray-500 text-center">
                    Min 8 characters with uppercase, lowercase, number & special character.
                  </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#e07b39] to-amber-500 py-6 text-base font-semibold text-white shadow-lg shadow-[#e07b39]/20 hover:from-[#c96a2a] hover:to-amber-600 active:scale-[0.98] transition-all duration-200"
                    disabled={forgotLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </CardFooter>
              </form>
            )}

            {/* ── STEP 4: Success ── */}
            {forgotStep === "success" && (
              <>
                <CardHeader className="space-y-1 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
                    <ShieldCheck className="h-8 w-8 text-emerald-500" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white">
                    Password Reset Successful!
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Your password has been updated. You can now sign in with your new password.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    type="button"
                    onClick={resetForgotState}
                    className="w-full bg-gradient-to-r from-[#e07b39] to-amber-500 py-6 text-base font-semibold text-white shadow-lg shadow-[#e07b39]/20 hover:from-[#c96a2a] hover:to-amber-600 active:scale-[0.98] transition-all duration-200"
                  >
                    Back to Login
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
