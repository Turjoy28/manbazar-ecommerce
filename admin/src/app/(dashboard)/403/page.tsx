"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] p-8 text-center bg-[#0b0f19] text-white">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-900/10 border border-red-500/20 mb-6 animate-pulse">
        <ShieldAlert className="h-10 w-10 text-red-500" />
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight mb-2">403 Forbidden</h1>
      <p className="text-gray-400 max-w-md mx-auto mb-8 text-sm">
        You do not have administrative clearance to access this panel. Global configurations and settings suites are strictly reserved for Super Administrators.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => router.back()}
          className="bg-transparent hover:bg-gray-800 text-gray-300 border border-[#1e293b] px-6 py-5 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        <Button
          onClick={() => router.replace("/products")}
          className="bg-gradient-to-r from-[#e07b39] to-amber-500 hover:from-[#c96a2a] hover:to-amber-600 font-semibold px-6 py-5 flex items-center gap-2 shadow-lg shadow-[#e07b39]/10"
        >
          <Home className="h-4 w-4" />
          Product Console
        </Button>
      </div>
    </div>
  );
}
