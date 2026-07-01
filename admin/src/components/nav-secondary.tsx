"use client"

import * as React from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarManu,
  SidebarManuButton,
  SidebarManuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: React.ReactNode
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarManu>
          {items.map((item) => (
            <SidebarManuItem key={item.title}>
              <SidebarManuButton render={<a href={item.url} />}>
                {item.icon}
                <span>{item.title}</span>
              </SidebarManuButton>
            </SidebarManuItem>
          ))}
        </SidebarManu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
