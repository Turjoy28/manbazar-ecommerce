"use client"

import React, { useEffect } from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, Settings, Package, ShoppingCart } from "lucide-react"
import { getUiData } from "@/services/ui"
import Link from "next/link"
import Image from "next/image"

const data = {
  user: {
    name: "Admin",
    email: "admin@gmail.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "Products",
      url: "/products",
      icon: (
        <Package />
      ),
    },
    {
      title: "Orders",
      url: "/orders",
      icon: (
        <ShoppingCart />
      ),
    },
    {
      title: "Settings",
      url: "/settings",
      icon: (
        <Settings/>
      ),
    }
  ]
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [logo, setLogo] = React.useState<string>("");

  useEffect(()=>{
    const fetchLogo = async()=>{
      const res = await getUiData();

      setLogo(res.data[0].banner.logo)
    }
    fetchLogo()
  }, [])
  
  
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5! hover:bg-transparent"
              render={<Link href="/"></Link>}
            >
              {logo && <Image src={logo} alt="logo" width={150} height={150} />}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
