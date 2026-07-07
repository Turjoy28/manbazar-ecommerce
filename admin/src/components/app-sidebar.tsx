"use client";

import React, { useEffect } from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  Settings,
  Package,
  ShoppingCart,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { getUiData } from "@/services/ui";
import { authService } from "@/services/auth";
import Link from "next/link";
import Image from "next/image";

const data = {
  user: {
    name: "Admin",
    email: "admin@gmail.com",
    avatar: "",
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [logo, setLogo] = React.useState<string>("");
  const [role, setRole] = React.useState<string>("");

  useEffect(() => {
    const fetchLogoAndRole = async () => {
      try {
        const uiRes = await getUiData();
        if (uiRes?.data?.[0]?.banner?.logo) {
          setLogo(uiRes.data[0].banner.logo);
        }

        const authRes = await authService.getMe();
        if (authRes.success && authRes.data) {
          setRole(authRes.data.role);
        }
      } catch (err) {
        console.error("Failed to load sidebar configuration:", err);
      }
    };
    fetchLogoAndRole();
  }, []);

  const navMain = [
    {
      title: "Dashboard",
      url: "/",
      icon: <LayoutDashboardIcon className="size-4" />,
    },
    {
      title: "Products",
      url: "/products",
      icon: <Package className="size-4" />,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: <ShoppingCart className="size-4" />,
    },
  ];

  if (role === "MANAGER" || role === "USER") {
    navMain.push({
      title: "Change Banners",
      url: "/banners",
      icon: <ImageIcon className="size-4" />,
    });
  } else {
    // Default to ADMIN links or admin settings fallback
    navMain.push({
      title: "Settings",
      url: "/settings",
      icon: <Settings className="size-4" />,
    });
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5! hover:bg-transparent"
              render={<Link href="/"></Link>}
            >
              {logo && (
                logo.startsWith("/") || logo.startsWith("http://") || logo.startsWith("https://") ? (
                  <Image src={logo} alt="logo" width={150} height={150} className="object-contain" />
                ) : (
                  <span className="text-foreground font-extrabold text-xl tracking-wider">{logo}</span>
                )
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
