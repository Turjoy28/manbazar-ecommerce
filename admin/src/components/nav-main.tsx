"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarManu,
  SidebarManuButton,
  SidebarManuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarManu>
          {items.map((item) => (
            <Link href={item.url} key={item.title}>
            <SidebarManuItem>
              <SidebarManuButton tooltip={item.title}>
                {item.icon}
                <span>{item.title}</span>
              </SidebarManuButton>
            </SidebarManuItem>
            </Link>
          ))}
        </SidebarManu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
