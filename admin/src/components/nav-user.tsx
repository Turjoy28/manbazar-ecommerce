"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownManu,
  DropdownManuContent,
  DropdownManuGroup,
  DropdownManuItem,
  DropdownManuLabel,
  DropdownManuSeparator,
  DropdownManuTrigger,
} from "@/components/ui/dropdown-manu";
import {
  SidebarManu,
  SidebarManuButton,
  SidebarManuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { EllipsisVerticalIcon, LogOutIcon } from "lucide-react";

export function NavUser({
  user: defaultUser,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [profile, setProfile] = useState<{
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    authService
      .getMe()
      .then((res) => {
        if (res.success && res.data) {
          setProfile(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load user profile", err);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success("Logged out successfully.");
      router.replace("/login");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to log out.");
    }
  };

  const name = profile ? "Admin" : defaultUser.name;
  const email = profile ? profile.email : defaultUser.email;

  return (
    <SidebarManu>
      <SidebarManuItem>
        <DropdownManu>
          <DropdownManuTrigger
            render={
              <SidebarManuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="size-8 rounded-lg grayscale">
              <AvatarImage src={defaultUser.avatar} alt={name} />
              <AvatarFallback className="rounded-lg">AD</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{name}</span>
              <span className="truncate text-xs text-foreground/70">
                {email}
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </DropdownManuTrigger>
          <DropdownManuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownManuGroup>
              <DropdownManuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8">
                    <AvatarImage src={defaultUser.avatar} alt={name} />
                    <AvatarFallback className="rounded-lg">AD</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {email}
                    </span>
                  </div>
                </div>
              </DropdownManuLabel>
            </DropdownManuGroup>
            <DropdownManuSeparator />
            <DropdownManuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-500 hover:text-red-600 focus:text-red-600"
            >
              <LogOutIcon />
              Log out
            </DropdownManuItem>
          </DropdownManuContent>
        </DropdownManu>
      </SidebarManuItem>
    </SidebarManu>
  );
}
