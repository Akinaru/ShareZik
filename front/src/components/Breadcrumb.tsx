"use client"

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "./ui/sidebar"
import { Separator } from "@/components/ui/separator"

interface BreadcrumbItemType {
  label: string
  href?: string
}

interface CustomBreadcrumbProps {
  items: BreadcrumbItemType[]
}

export default function CustomBreadcrumb({ items }: CustomBreadcrumbProps) {
  return (
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
            <Breadcrumb>
                <BreadcrumbList>
                    {items.map((item, index) => {
                    const isLast = index === items.length - 1
                    return (
                        <div key={index} className="flex items-center">
                        <BreadcrumbItem className={!isLast ? "hidden md:block" : undefined}>
                            {isLast ? (
                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            ) : (
                            <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator />}
                        </div>
                    )
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
      </header>
  )
}
