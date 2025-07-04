import { ModeToggle } from "@/components/mode-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { checkUser } from "@/lib/checkUser";
import { UserButton } from "@clerk/nextjs";
import { AppSidebar } from "./_components/app-sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkUser();
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full h-full">
        <div className="flex justify-between w-full items-center p-4">
          <SidebarTrigger className="" />
          <div className="flex justify-center items-center gap-4">
            <ModeToggle />
            <UserButton />
          </div>
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
