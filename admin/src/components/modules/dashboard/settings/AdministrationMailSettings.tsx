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
        <Card className="bg-white border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
            <CardHeader className="bg-white border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600">
                        <Mail className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">Administration Mail</CardTitle>
                        <CardDescription className="text-gray-500 text-sm mt-0.5">
                            Configure SMTP to send OTPs from a specific email
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <form onSubmit={handleUpdate} className="flex-1 flex flex-col">
                <CardContent className="space-y-5 pt-6 flex-1">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="smtpHost" className="text-sm text-gray-700 font-medium">SMTP Host</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Server className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input
                                    id="smtpHost"
                                    placeholder="smtp.gmail.com"
                                    value={host}
                                    onChange={(e) => setHost(e.target.value)}
                                    className="pl-9 bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500 h-11"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtpPort" className="text-sm text-gray-700 font-medium">SMTP Port</Label>
                            <Input
                                id="smtpPort"
                                type="number"
                                placeholder="587"
                                value={port}
                                onChange={(e) => setPort(e.target.value)}
                                className="bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500 h-11"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="smtpUser" className="text-sm text-gray-700 font-medium flex items-center gap-2">
                            Email Address (User&apos;s Mail)
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                                id="smtpUser"
                                type="email"
                                placeholder="admin@menbazar.com"
                                value={user}
                                onChange={(e) => setUser(e.target.value)}
                                className="pl-9 bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500 h-11"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="smtpPass" className="text-sm text-gray-700 font-medium flex items-center justify-between">
                            <span>App Password (Admin&apos;s Mail)</span>
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <KeyRound className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                                id="smtpPass"
                                type="password"
                                placeholder="Enter app password"
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                className="pl-9 bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500 h-11"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">For Gmail, generate an App Password in your Google Account settings.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="smtpFrom" className="text-sm text-gray-700 font-medium">Sender Name / Address (Optional)</Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Send className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                                id="smtpFrom"
                                placeholder="MenBazar <noreply@menbazar.com>"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="pl-9 bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500 h-11"
                            />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 pt-5 mt-2">
                        <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4 text-orange-500" />
                            Forgot Password — Admin Emails
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                            These emails are used for the forgot password OTP flow. Updating them here will also update the login email for each admin role.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="superAdminEmail" className="text-sm text-gray-700 font-medium flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                            Super Admin Email
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserCog className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                                id="superAdminEmail"
                                type="email"
                                placeholder="superadmin@menbazar.com"
                                value={superAdminEmail}
                                onChange={(e) => setSuperAdminEmail(e.target.value)}
                                className="pl-9 bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500 h-11"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="userAdminEmail" className="text-sm text-gray-700 font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            User Admin Email
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                                id="userAdminEmail"
                                type="email"
                                placeholder="useradmin@menbazar.com"
                                value={userAdminEmail}
                                onChange={(e) => setUserAdminEmail(e.target.value)}
                                className="pl-9 bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500 h-11"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t border-gray-100 p-5 mt-auto">
                    <Button 
                        type="submit" 
                        disabled={isUpdating}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white transition-colors h-11 text-base font-medium"
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
