"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "rounded-lg p-[3px] group-data-[orientation=horizontal]/tabs:h-9 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
          // 1. 기본 레이아웃 및 폰트 설정 (배경/보더 제거)
          "relative inline-flex h-full items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium whitespace-nowrap transition-all",
          "bg-transparent border-none shadow-none outline-none", // 배경, 선, 그림자 완전 제거

          // 2. 비활성 상태 (연한 회색)
          "text-foreground/50 hover:text-foreground",

          // 3. 활성 상태 (글자색 강조 및 배경 유지)
          "data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none",
          "dark:data-[state=active]:text-white",

          // 4. 하단 강조선 (Underline) - 이미지의 부자연스러운 박스 대신 일체감 있는 선만 남김
          "after:absolute after:bottom-[-1px] after:inset-x-0 after:h-[2px] after:bg-foreground after:opacity-0 after:transition-opacity",
          "data-[state=active]:after:opacity-100",

          // 5. 기타 유틸리티
          "disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
          className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
