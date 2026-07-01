"use client"

import {
  DropdownManu,
  DropdownManuContent,
  DropdownManuItem,
  DropdownManuSeparator,
  DropdownManuTrigger,
} from "@/components/ui/dropdown-manu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarManu,
  SidebarManuAction,
  SidebarManuButton,
  SidebarManuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { MoreHorizontalIcon, FolderIcon, ShareIcon, Trash2Icon } from "lucide-react"

export function NavDocumants({
  items,
}: {
  items: {
    name: string
    url: string
    icon: React.ReactNode
  }[]
}) {
  const { isMobile } = useSidebar()
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documants</SidebarGroupLabel>
      <SidebarManu>
        {items.map((item) => (
          <SidebarManuItem key={item.name}>
            <SidebarManuButton render={<a href={item.url} />}>
              {item.icon}
              <span>{item.name}</span>
            </SidebarManuButton>
            <DropdownManu>
              <DropdownManuTrigger
                render={
                  <SidebarManuAction
                    showOnHover
                    className="aria-expanded:bg-muted"
                  />
                }
              >
                <MoreHorizontalIcon
                />
                <span className="sr-only">More</span>
              </DropdownManuTrigger>
              <DropdownManuContent
                className="w-24"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownManuItem>
                  <FolderIcon
                  />
                  <span>Open</span>
                </DropdownManuItem>
                <DropdownManuItem>
                  <ShareIcon
                  />
                  <span>Share</span>
                </DropdownManuItem>
                <DropdownManuSeparator />
                <DropdownManuItem variant="destructive">
                  <Trash2Icon
                  />
                  <span>Delete</span>
                </DropdownManuItem>
              </DropdownManuContent>
            </DropdownManu>
          </SidebarManuItem>
        ))}
        <SidebarManuItem>
          <SidebarManuButton className="text-sidebar-foreground/70">
            <MoreHorizontalIcon className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarManuButton>
        </SidebarManuItem>
      </SidebarManu>
    </SidebarGroup>
  )
}
