"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Sparkles,
  Video,
  Waypoints,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function AppSidebar() {
  const router = useRouter();
  return (
    <Sidebar>
      <SidebarHeader>
        <div
          className="flex items-center gap-3 px-2 py-3 select-none cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          <span className="inline-block">
            {/* App Icon */}
            <svg
              fill="none"
              height="32"
              viewBox="0 0 40 48"
              width="28"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m19.6007 4.95239c-3.4667 0-6.2667 2.76597-6.2667 6.19051 0 3.3982 2.8 6.1641 6.24 6.1904-.8534-.0263-1.52-.7112-1.52-1.5542 0-.8429.6933-1.5541 1.5733-1.5541 3.7333 0 12.0267-.0001 15.68-.0001 2.5867 0 4.6934-2.081 4.6934-4.6362 0-2.55526-2.1067-4.63631-4.6934-4.63631z"
                fill="#5720b7"
              />
              <path
                d="m11.9815 17.3333c-3.46666 0-6.26666 2.766-6.26666 6.1905 0 3.3982 2.8 6.1641 6.23996 6.1905-.8533-.0264-1.52-.7113-1.52-1.5543 0-.8429.6934-1.5541 1.5734-1.5541h15.68c2.5866 0 4.6933-2.0811 4.6933-4.6363s-2.1067-4.6363-4.6933-4.6363z"
                fill="#6927da"
              />
              <path
                d="m6.71429 29.7143c-3.71429 0-6.71429011 2.9787-6.71429 6.6666.00000011 3.6596 3 6.6383 6.68569 6.6667-.91427-.0284-1.62855-.7659-1.62855-1.6738 0-.9078.74288-1.6737 1.68574-1.6737h16.80002c2.7714 0 5.0285-2.2411 5.0285-4.9929s-2.2571-4.9929-5.0285-4.9929z"
                fill="#7839ee"
              />
            </svg>
          </span>
          <span className="font-bold text-lg tracking-tight text-sidebar-foreground">
            Vidflow
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {(() => {
              const pathname = usePathname();
              return (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard"}
                    >
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/youtube-channel-guide"}
                    >
                      <Link href="/youtube-channel-guide">
                        <Waypoints className="mr-2" />
                        <span>YouTube Channel Guide</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/youtube"}
                    >
                      <Link href="/youtube">
                        <Sparkles className="mr-2" />
                        <span>YouTube</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/create-video"}
                    >
                      <Link href="/create-video">
                        <Video className="mr-2" />
                        <span>Create Video</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/my-videos"}
                    >
                      <Link href="/my-videos">
                        <Youtube className="mr-2" />
                        <span>My Videos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              );
            })()}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
