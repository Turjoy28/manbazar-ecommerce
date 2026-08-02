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
  Layers,
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
    // ADMIN-only links: Categories and Settings
    navMain.push(
      {
        title: "Categories",
        url: "/categories",
        icon: <Layers className="size-4" />,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: <Settings className="size-4" />,
      }
    );
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="pt-4 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" className="block px-2 pt-2 pb-4 hover:opacity-90 transition-opacity">
              {logo && (
                logo.startsWith("/") || logo.startsWith("http://") || logo.startsWith("https://") ? (
                  <div className="relative w-full h-24 flex items-center justify-center">
                    <Image src={logo} alt="logo" fill className="object-contain" />
                  </div>
                ) : (
                  <div className="flex justify-center w-full">
                    <span className="text-foreground font-extrabold text-2xl tracking-wider text-center">{logo}</span>
                  </div>
                )
              )}
            </Link>
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
