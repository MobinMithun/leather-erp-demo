import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  Layers,
  FlaskConical,
  Warehouse,
  ShieldCheck,
  Droplets,
  Factory,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const sections = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
  },
  {
    label: "Sales",
    items: [{ title: "Orders", url: "/orders", icon: ClipboardList }],
  },
  {
    label: "Production",
    items: [
      { title: "Batches", url: "/batches", icon: Boxes },
      { title: "Pieces", url: "/pieces", icon: Layers },
      { title: "Recipes", url: "/recipes", icon: FlaskConical },
      { title: "QC + Grading", url: "/qc", icon: ShieldCheck },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Inventory", url: "/inventory", icon: Warehouse },
      { title: "ESG / Waste", url: "/esg", icon: Droplets },
    ],
  },
];

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (u: string) => (u === "/" ? path === "/" : path.startsWith(u));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent text-accent-foreground">
            <Factory className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-xs uppercase tracking-widest text-sidebar-foreground/60">
              Tannery
            </span>
            <span className="text-sm font-semibold text-sidebar-foreground">HIDE.OS</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {sections.map((s) => (
          <SidebarGroup key={s.label}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
              {s.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {s.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:hidden">
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-medium text-sidebar-accent-foreground">
            AD
          </div>
          <div className="flex flex-col text-xs leading-tight">
            <span className="text-sidebar-foreground">Admin</span>
            <span className="text-sidebar-foreground/60">Owner / All access</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
