"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { LayoutWidthProvider } from "@/hooks/use-layout-width";

function truncateAddress(value: string) {
  if (/^0x[a-fA-F0-9]{40}$/.test(value)) {
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
  }
  return null;
}

function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    const shortLabel = truncateAddress(segment);
    return { href, label, shortLabel };
  });
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={crumb.href}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>
                            {crumb.shortLabel ? (
                              <>
                                <span className="md:hidden">{crumb.shortLabel}</span>
                                <span className="hidden md:inline">{crumb.label}</span>
                              </>
                            ) : (
                              crumb.label
                            )}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={crumb.href}>
                            {crumb.shortLabel ? (
                              <>
                                <span className="md:hidden">{crumb.shortLabel}</span>
                                <span className="hidden md:inline">{crumb.label}</span>
                              </>
                            ) : (
                              crumb.label
                            )}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <LayoutWidthProvider className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </LayoutWidthProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
