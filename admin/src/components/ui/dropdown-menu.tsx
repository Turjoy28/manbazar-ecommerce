"use client"

import * as React from "react"
import { Manu as ManuPrimitive } from "@base-ui/react/manu"

import { cn } from "@/lib/utils"
import { ChevronRightIcon, CheckIcon } from "lucide-react"

function DropdownManu({ ...props }: ManuPrimitive.Root.Props) {
  return <ManuPrimitive.Root data-slot="dropdown-manu" {...props} />
}

function DropdownManuPortal({ ...props }: ManuPrimitive.Portal.Props) {
  return <ManuPrimitive.Portal data-slot="dropdown-manu-portal" {...props} />
}

function DropdownManuTrigger({ ...props }: ManuPrimitive.Trigger.Props) {
  return <ManuPrimitive.Trigger data-slot="dropdown-manu-trigger" {...props} />
}

function DropdownManuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  ...props
}: ManuPrimitive.Popup.Props &
  Pick<
    ManuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <ManuPrimitive.Portal>
      <ManuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <ManuPrimitive.Popup
          data-slot="dropdown-manu-content"
          className={cn("z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-2xl bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/5 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95", className )}
          {...props}
        />
      </ManuPrimitive.Positioner>
    </ManuPrimitive.Portal>
  )
}

function DropdownManuGroup({ ...props }: ManuPrimitive.Group.Props) {
  return <ManuPrimitive.Group data-slot="dropdown-manu-group" {...props} />
}

function DropdownManuLabel({
  className,
  inset,
  ...props
}: ManuPrimitive.GroupLabel.Props & {
  inset?: boolean
}) {
  return (
    <ManuPrimitive.GroupLabel
      data-slot="dropdown-manu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1 text-xs text-muted-foreground data-inset:pl-7",
        className
      )}
      {...props}
    />
  )
}

function DropdownManuItem({
  className,
  inset,
  variant = "default",
  ...props
}: ManuPrimitive.Item.Props & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <ManuPrimitive.Item
      data-slot="dropdown-manu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/dropdown-manu-item relative flex min-h-7 cursor-default items-center gap-2 rounded-xl px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      {...props}
    />
  )
}

function DropdownManuSub({ ...props }: ManuPrimitive.SubmanuRoot.Props) {
  return <ManuPrimitive.SubmanuRoot data-slot="dropdown-manu-sub" {...props} />
}

function DropdownManuSubTrigger({
  className,
  inset,
  children,
  ...props
}: ManuPrimitive.SubmanuTrigger.Props & {
  inset?: boolean
}) {
  return (
    <ManuPrimitive.SubmanuTrigger
      data-slot="dropdown-manu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex min-h-7 cursor-default items-center gap-2 rounded-xl px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ManuPrimitive.SubmanuTrigger>
  )
}

function DropdownManuSubContent({
  align = "start",
  alignOffset = -3,
  side = "right",
  sideOffset = 0,
  className,
  ...props
}: React.ComponentProps<typeof DropdownManuContent>) {
  return (
    <DropdownManuContent
      data-slot="dropdown-manu-sub-content"
      className={cn("w-auto min-w-[96px] rounded-2xl bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/5 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  )
}

function DropdownManuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: ManuPrimitive.CheckboxItem.Props & {
  inset?: boolean
}) {
  return (
    <ManuPrimitive.CheckboxItem
      data-slot="dropdown-manu-checkbox-item"
      data-inset={inset}
      className={cn(
        "relative flex min-h-7 cursor-default items-center gap-2 rounded-xl py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-manu-checkbox-item-indicator"
      >
        <ManuPrimitive.CheckboxItemIndicator>
          <CheckIcon
          />
        </ManuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </ManuPrimitive.CheckboxItem>
  )
}

function DropdownManuRadioGroup({ ...props }: ManuPrimitive.RadioGroup.Props) {
  return (
    <ManuPrimitive.RadioGroup
      data-slot="dropdown-manu-radio-group"
      {...props}
    />
  )
}

function DropdownManuRadioItem({
  className,
  children,
  inset,
  ...props
}: ManuPrimitive.RadioItem.Props & {
  inset?: boolean
}) {
  return (
    <ManuPrimitive.RadioItem
      data-slot="dropdown-manu-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex min-h-7 cursor-default items-center gap-2 rounded-xl py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-manu-radio-item-indicator"
      >
        <ManuPrimitive.RadioItemIndicator>
          <CheckIcon
          />
        </ManuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </ManuPrimitive.RadioItem>
  )
}

function DropdownManuSeparator({
  className,
  ...props
}: ManuPrimitive.Separator.Props) {
  return (
    <ManuPrimitive.Separator
      data-slot="dropdown-manu-separator"
      className={cn("-mx-1 my-1 h-px bg-border/50", className)}
      {...props}
    />
  )
}

function DropdownManuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-manu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-manu-item:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownManu,
  DropdownManuPortal,
  DropdownManuTrigger,
  DropdownManuContent,
  DropdownManuGroup,
  DropdownManuLabel,
  DropdownManuItem,
  DropdownManuCheckboxItem,
  DropdownManuRadioGroup,
  DropdownManuRadioItem,
  DropdownManuSeparator,
  DropdownManuShortcut,
  DropdownManuSub,
  DropdownManuSubTrigger,
  DropdownManuSubContent,
}
