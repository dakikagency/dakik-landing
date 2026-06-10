import {
  ChartPieIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  Settings2Icon,
  SparklesIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/registry/react/components/sidebar";

const navigation = [
  { label: "Dashboard", icon: HomeIcon, active: true, badge: "" },
  { label: "Inbox", icon: InboxIcon, active: false, badge: "12" },
  { label: "Projects", icon: FolderIcon, active: false, badge: "" },
  { label: "Analytics", icon: ChartPieIcon, active: false, badge: "" },
  { label: "Settings", icon: Settings2Icon, active: false, badge: "" },
];

export default function Demo() {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <div className="h-80 w-full overflow-hidden rounded-lg border border-white/10">
        <SidebarProvider
          className="h-full min-h-0"
          style={{ "--sidebar-width": "13rem" } as CSSProperties}
        >
          <Sidebar collapsible="none">
            <SidebarHeader>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <SparklesIcon className="size-3.5" />
                </div>
                <span className="font-semibold text-sm">Acme Inc</span>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigation.map(({ label, icon: Icon, active, badge }) => (
                      <SidebarMenuItem key={label}>
                        <SidebarMenuButton isActive={active}>
                          <Icon />
                          <span>{label}</span>
                        </SidebarMenuButton>
                        {!!badge && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <div className="size-6 rounded-full bg-muted" />
                <div className="flex flex-col">
                  <span className="font-medium text-xs">Erdeniz K.</span>
                  <span className="text-[10px] text-muted-foreground">
                    erdeniz@acme.inc
                  </span>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          <main className="flex flex-1 items-center justify-center bg-background text-muted-foreground text-sm">
            Main content
          </main>
        </SidebarProvider>
      </div>
    </div>
  );
}
