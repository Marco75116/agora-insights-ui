"use client";

import Link from "next/link";
import { BarChart3, Home, Mail } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "AUSD Analytics",
    url: "/dashboard/ausd-analytics",
    icon: BarChart3,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <Image
            src="/agora-logo.png"
            alt="Agora Insights"
            width={24}
            height={24}
            className="shrink-0"
          />
          <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
            Agora Insights
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon aria-hidden="true" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <a
          href="https://t.me/marcopoloo33"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <Mail className="size-5 shrink-0" aria-hidden="true" />
          <span className="text-muted-foreground text-sm font-medium group-data-[collapsible=icon]:hidden">
            Contact
          </span>
        </a>
        <Separator className="group-data-[collapsible=icon]:hidden" />
        <a
          href="https://app.misti.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <Image
            src="/misti-logo.png"
            alt="Misti"
            width={28}
            height={28}
            className="shrink-0 rounded"
          />
          <span className="text-muted-foreground text-sm font-medium group-data-[collapsible=icon]:hidden">
            Powered by Misti
          </span>
        </a>
      </SidebarFooter>
    </Sidebar>
  );
}
