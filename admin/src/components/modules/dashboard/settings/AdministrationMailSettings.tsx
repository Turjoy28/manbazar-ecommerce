"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUiData } from "@/services/ui";
import { authService } from "@/services/auth";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Mail, Server, User, KeyRound, Loader2, Send, ShieldCheck, UserCog } from "lucide-react";

interface AdministrationMailSettingsProps {
    smtp?: {
        host?: string;
        port?: number;
        user?: string;
        pass?: string;
        from?: string;
        superAdminEmail?: string;
        userAdminEmail?: string;
    };
    id: string;
}

export default function AdministrationMailSettings({ smtp, id }: AdministrationMailSettingsProps) {
    const [host, setHost] = useState(smtp?.host || "smtp.gmail.com");
    const [port, setPort] = useState(smtp?.port?.toString() || "587");
    const [user, setUser] = useState(smtp?.user || "");
    const [pass, setPass] = useState(smtp?.pass || "");
    const [from, setFrom] = useState(smtp?.from || "");
    const [superAdminEmail, setSuperAdminEmail] = useState(smtp?.superAdminEmail || "");
    const [userAdminEmail, setUserAdminEmail] = useState(smtp?.userAdminEmail || "");
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        const toastId = toast.loading("Updating Administration Mail settings...");
        try {
            // 1. Save SMTP settings (including email references) to UI model
            await updateUiData(id, {
                "smtp.host": host.trim(),
                "smtp.port": parseInt(port) || 587,
                "smtp.user": user.trim(),
                "smtp.pass": pass.trim(),
                "smtp.from": from.trim(),
                "smtp.superAdminEmail": superAdminEmail.trim(),
                "smtp.userAdminEmail": userAdminEmail.trim(),
            });

            // 2. Update Admin documents' emails (so forgot password works with the new emails)
            if (superAdminEmail.trim() || userAdminEmail.trim()) {
                try {
                    await authService.updateAdminEmails(superAdminEmail.trim(), userAdminEmail.trim());
                } catch (emailError: any) {
                    toast.error(emailError.message || "Failed to update admin account emails", { id: toastId });
                    setIsUpdating(false);
                    return;
                }
            }

            toast.success("Administration Mail settings updated successfully!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to update Administration Mail settings", { id: toastId });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Card className="border-[#1e293b] bg-[#111827]/60 shadow-xl overflow-hidden h-full flex flex-col">
            <CardHeader className="bg-gradient-to-r from-gray-900 to-[#111827] border-b border-[#1e293b] pb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[#e07b39]/20 text-[#e07b39]">
                        <Mail className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold text-white">Administration Mail</CardTitle>
                        <CardDescription className="text-gray-400 text-xs mt-1">
                            Configure SMTP to send OTPs from a specific email
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <form onSubmit={handleUpdate} className="flex-1 flex flex-col">
                <CardContent className="space-y-4 pt-6 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="smtpHost" className="text-xs text-gray-300 font-medium">SMTP Host</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Server className="h-4 w-4 text-gray-500" />
                                </div>
                                <Input
                                    id="smtpHost"
                                    placeholder="smtp.gmail.com"
                                    value={host}
                                    onChange={(e) => setHost(e.target.value)}
                                    className="pl-9 bg-[#0b0f19]/50 border-[#1e293b] text-white focus:border-[#e07b39] h-10 text-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtpPort" className="text-xs text-gray-300 font-medium">SMTP Port</Label>
                            <Input
                                id="smtpPort"
                                type="number"
                                placeholder="587"
                                value={port}
                                onChange={(e) => setPort(e.target.value)}
                                className="bg-[#0b0f19]/50 border-[#1e293b] text-white focus:border-[#e07b39] h-10 text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="smtpUser" className="text-xs text-gray-300 font-medium flex items-center gap-2">
                            Email Address (User&apos;s Mail)
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <Input
                                id="smtpUser"
                                type="email"
                                placeholder="admin@menbazar.com"
                                value={user}
                                onChange={(e) => setUser(e.target.value)}
                                className="pl-9 bg-[#0b0f19]/50 border-[#1e293b] text-white focus:border-[#e07b39] h-10 text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="smtpPass" className="text-xs text-gray-300 font-medium flex items-center justify-between">
                            <span>App Password (Admin&apos;s Mail)</span>
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <KeyRound className="h-4 w-4 text-gray-500" />
                            </div>
                            <Input
                                id="smtpPass"
                                type="password"
                                placeholder="Enter app password"
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                className="pl-9 bg-[#0b0f19]/50 border-[#1e293b] text-white focus:border-[#e07b39] h-10 text-sm"
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">For Gmail, generate an App Password in your Google Account settings.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="smtpFrom" className="text-xs text-gray-300 font-medium">Sender Name / Address (Optional)</Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Send className="h-4 w-4 text-gray-500" />
                            </div>
                            <Input
                                id="smtpFrom"
                                placeholder="MenBazar <noreply@menbazar.com>"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="pl-9 bg-[#0b0f19]/50 border-[#1e293b] text-white focus:border-[#e07b39] h-10 text-sm"
                            />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-[#1e293b] pt-4 mt-2">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-[#e07b39]" />
                            Forgot Password — Admin Emails
                        </p>
                        <p className="text-[10px] text-gray-500 mb-3">
                            These emails are used for the forgot password OTP flow. Updating them here will also update the login email for each admin role.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="superAdminEmail" className="text-xs text-gray-300 font-medium flex items-center gap-2">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            Super Admin Email
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserCog className="h-4 w-4 text-gray-500" />
                            </div>
                            <Input
                                id="superAdminEmail"
                                type="email"
                                placeholder="superadmin@menbazar.com"
                                value={superAdminEmail}
                                onChange={(e) => setSuperAdminEmail(e.target.value)}
                                className="pl-9 bg-[#0b0f19]/50 border-[#1e293b] text-white focus:border-[#e07b39] h-10 text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="userAdminEmail" className="text-xs text-gray-300 font-medium flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-blue-400" />
                            User Admin Email
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <Input
                                id="userAdminEmail"
                                type="email"
                                placeholder="useradmin@menbazar.com"
                                value={userAdminEmail}
                                onChange={(e) => setUserAdminEmail(e.target.value)}
                                className="pl-9 bg-[#0b0f19]/50 border-[#1e293b] text-white focus:border-[#e07b39] h-10 text-sm"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-[#0b0f19]/30 border-t border-[#1e293b] p-4 mt-auto">
                    <Button 
                        type="submit" 
                        disabled={isUpdating}
                        className="w-full bg-[#e07b39] hover:bg-[#c96a2a] text-white transition-colors h-10"
                    >
                        {isUpdating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : "Save Administration Mail"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
