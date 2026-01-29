"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Empty,
  Input,
  JLLLogo,
  MaterialSymbol,
  Separator,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@jllt/alize-ui";
import { sidebarMenuItems, getSidebarSubItemLabel } from "@/lib/sidebar-menu";

const CREATED_WORK_ORDERS_KEY = "alize-created-work-orders";

type WorkOrderRecord = {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  assignee: string;
  created: string;
  property: string;
  description: string;
  icon: string;
  attachments: number;
  comments: number;
  tasks: number;
  files: number;
  type?: string;
};

// Parse MM/DD/YYYY for sorting (newest first)
function parseCreatedDate(created: string): number {
  const [mm, dd, yyyy] = created.split("/").map(Number);
  return new Date(yyyy, mm - 1, dd).getTime();
}

// Mock work orders data - in a real app, this would come from an API
const initialWorkOrders: WorkOrderRecord[] = [
  {
    id: "W-11631-000034",
    title: "HVAC (General)",
    category: "HVAC",
    priority: "High",
    status: "Upcoming",
    assignee: "Sarah Chen",
    created: "01/28/2026",
    property: "1 Main Street",
    description:
      "Full replacement of the existing HVAC system: remove old equipment, install new units, and reconnect to building controls and ductwork.",
    icon: "hvac",
    attachments: 0,
    comments: 0,
    tasks: 0,
    files: 0,
  },
  {
    id: "W-11631-000047",
    title: "Plumbing",
    category: "Plumbing",
    type: "Maintenance",
    priority: "Low",
    status: "New",
    assignee: "Mike Johnson",
    created: "01/27/2026",
    property: "1 Main Street",
    description:
      "Minor leak detected under the sink in the 2nd floor restroom. The leak is slow but should be addressed to prevent water damage to the cabinet and flooring.",
    icon: "plumbing",
    attachments: 0,
    comments: 0,
    tasks: 0,
    files: 0,
  },
];

function getPriorityTonal(priority: string) {
  switch (priority) {
    case "Medium":
      return "amber" as const;
    case "Low":
      return "atoll" as const;
    case "High":
      return "magenta" as const;
    default:
      return "sand" as const;
  }
}

function getStatusTonal(status: string) {
  if (status === "Upcoming") {
    return "science" as const;
  }
  if (status === "In Progress") {
    return "amber" as const;
  }
  if (status === "Completed") {
    return "atoll" as const;
  }
  return undefined;
}

export default function WorkOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const workOrderId = params.id as string;

  // Theme state
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Work orders: static list + any created on dashboard (from sessionStorage)
  const [workOrdersList, setWorkOrdersList] = useState<WorkOrderRecord[]>(initialWorkOrders);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  // Avoid hydration mismatch by only rendering theme UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Merge in work orders created on dashboard so detail page can show them
  useEffect(() => {
    try {
      const raw = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(CREATED_WORK_ORDERS_KEY) : null;
      if (raw) {
        const created: WorkOrderRecord[] = JSON.parse(raw);
        setWorkOrdersList((prev) => {
          const byId = new Map(prev.map((wo) => [wo.id, wo]));
          created.forEach((wo) => byId.set(wo.id, wo));
          return [...byId.values()];
        });
      }
    } catch {
      // ignore
    }
    setHasCheckedStorage(true);
  }, [workOrderId]);

  // When leaving this details page, if viewing a modal-created work order, remove it from sessionStorage
  // so details navigation is only for the original 2 work orders
  useEffect(() => {
    const id = workOrderId;
    const isCreated = !initialWorkOrders.some((wo) => wo.id === id);
    return () => {
      if (isCreated && typeof sessionStorage !== "undefined") {
        try {
          const raw = sessionStorage.getItem(CREATED_WORK_ORDERS_KEY);
          if (raw) {
            const list: WorkOrderRecord[] = JSON.parse(raw);
            const filtered = list.filter((wo) => wo.id !== id);
            if (filtered.length === 0) {
              sessionStorage.removeItem(CREATED_WORK_ORDERS_KEY);
            } else {
              sessionStorage.setItem(CREATED_WORK_ORDERS_KEY, JSON.stringify(filtered));
            }
          }
        } catch {
          // ignore
        }
      }
    };
  }, [workOrderId]);

  // Sidebar state - persist open groups in localStorage
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-open-groups");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // If parsing fails, use default
        }
      }
    }
    // Default: Work Orders group open
    return { "Work Orders": true };
  });

  // Save to localStorage whenever openGroups changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-open-groups", JSON.stringify(openGroups));
    }
  }, [openGroups]);

  const toggleGroup = (groupLabel: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupLabel]: !prev[groupLabel],
    }));
  };

  // Toggle group state for section 2 filters
  const [selectedSections, setSelectedSections] = useState<string[]>(["all"]);
  const [historyVisible, setHistoryVisible] = useState(true);
  const [historyFollowActive, setHistoryFollowActive] = useState(false);

  // History accordion dates: today and today - 2 days
  const historyToday = new Date();
  const historyTwoDaysAgo = new Date(historyToday);
  historyTwoDaysAgo.setDate(historyTwoDaysAgo.getDate() - 2);
  const historyTodayFormatted = historyToday.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
  const historyTwoDaysAgoFormatted = historyTwoDaysAgo.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  // Per-work-order history entries (different content per work order)
  // Keys must match actual work order IDs from the workOrders array
  type HistoryEntry = { name: string; initials: string; avatarImg: number; time: string; comment: string };
  const createdByOnlyHistory = {
    today: [
      { name: "John Doe", initials: "JD", avatarImg: 1, time: "—", comment: "Created by" },
    ],
    twoDaysAgo: [] as HistoryEntry[],
  };
  const historyByWorkOrder: Record<string, { today: HistoryEntry[]; twoDaysAgo: HistoryEntry[] }> = {
    "W-11631-000034": createdByOnlyHistory,
    "W-11631-000047": {
      today: [
        { name: "Alex Rivera", initials: "AR", avatarImg: 52, time: "8:30 AM", comment: "Plumbing repair completed. Water pressure restored in Building B." },
        { name: "Jordan Lee", initials: "JL", avatarImg: 44, time: "11:45 AM", comment: "Tenant reported leak—verified fix and closed ticket." },
        { name: "Sam Taylor", initials: "ST", avatarImg: 19, time: "2:00 PM", comment: "Re-inspection scheduled for Friday." },
      ],
      twoDaysAgo: [
        { name: "Morgan Davis", initials: "MD", avatarImg: 61, time: "9:20 AM", comment: "Initial assessment done. Parts ordered." },
        { name: "Casey Brown", initials: "CB", avatarImg: 28, time: "1:15 PM", comment: "Vendor ETA updated to tomorrow morning." },
      ],
    },
  };
  const defaultHistory = {
    today: [
      { name: "Jamie Foster", initials: "JF", avatarImg: 41, time: "10:00 AM", comment: "Work order acknowledged and assigned to technician." },
      { name: "Riley Clark", initials: "RC", avatarImg: 55, time: "3:30 PM", comment: "Status update: in progress." },
    ],
    twoDaysAgo: [
      { name: "Quinn Adams", initials: "QA", avatarImg: 7, time: "11:00 AM", comment: "Site visit completed. Photos and notes uploaded." },
    ],
  };
  // Sort: modal-created work orders first (so new tile is 1 of 3), then initial work orders by date descending
  const initialIds = new Set(initialWorkOrders.map((wo) => wo.id));
  const sortedWorkOrdersForHistory = [...workOrdersList].sort((a, b) => {
    const aIsCreated = !initialIds.has(a.id);
    const bIsCreated = !initialIds.has(b.id);
    if (aIsCreated && !bIsCreated) return -1;
    if (!aIsCreated && bIsCreated) return 1;
    return parseCreatedDate(b.created) - parseCreatedDate(a.created);
  });
  const isNewestWorkOrder = workOrderId === sortedWorkOrdersForHistory[0]?.id;
  const historyForCurrent = isNewestWorkOrder ? createdByOnlyHistory : (historyByWorkOrder[workOrderId] ?? defaultHistory);
  const historyTodayEntries = historyForCurrent.today;
  const historyTwoDaysAgoEntries = historyForCurrent.twoDaysAgo;

  // Handle toggle group selection: "all" is exclusive; other items can be multi-selected
  const handleSectionToggle = (value: string[]) => {
    if (value.includes("all")) {
      const hadAll = selectedSections.includes("all");
      if (hadAll && value.length > 1) {
        // User had "all" and selected another item – remove "all" and show only selected card(s)
        setSelectedSections(value.filter((v) => v !== "all"));
      } else {
        // User clicked "all" (either alone or while others selected) – show all cards
        setSelectedSections(["all"]);
      }
      return;
    }
    // No "all" in selection: allow multi-select of labor/photos/files
    setSelectedSections(value.length > 0 ? value : ["all"]);
  };

  // Find the work order by ID (from merged list)
  const workOrder = workOrdersList.find((wo) => wo.id === workOrderId);
  // Reuse same sort for breadcrumb/prev/next
  const sortedWorkOrders = sortedWorkOrdersForHistory;
  const currentIndex = sortedWorkOrders.findIndex((wo) => wo.id === workOrderId);
  const previousWorkOrder = currentIndex > 0 ? sortedWorkOrders[currentIndex - 1] : null;
  const nextWorkOrder = currentIndex < sortedWorkOrders.length - 1 ? sortedWorkOrders[currentIndex + 1] : null;

  // Calculate target completion date (created date + 1 month)
  const getTargetCompletionDate = () => {
    if (!workOrder) return "-";
    const createdDate = new Date(workOrder.created);
    const targetDate = new Date(createdDate);
    targetDate.setMonth(targetDate.getMonth() + 1);
    return targetDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  // Wait for client merge only when ID might be from dashboard-created (not in initial list)
  const mightBeNew = !initialWorkOrders.some((wo) => wo.id === workOrderId);
  if (mightBeNew && !hasCheckedStorage) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // If work order not found, show error or redirect
  if (!workOrder) {
    return (
      <div className="p-6">
        <p>Work order not found</p>
        <Link href="/dashboard" className="text-blue-500 underline">
          Go back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col h-screen w-full overflow-hidden">
        {/* Top Navigation Bar - Full Width */}
        <header className="h-16 flex items-center justify-between bg-background px-4 sticky top-0 z-50 w-full">
          {/* Left section: Collapse button + Logo */}
          <div className="flex items-center gap-3">
            <SidebarTrigger variant="ghost" size="icon">
              <MaterialSymbol name="menu" size={20} />
            </SidebarTrigger>
            <Separator orientation="vertical" className="h-6" />
            <JLLLogo className="h-6 w-auto" />
          </div>

          {/* Right section: Dropdown + Icon button + Avatar */}
          <div className="flex items-center gap-2">
            {/* Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <MaterialSymbol name="expand_more" size={18} />
                  <span>Workspace</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Select Workspace</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <MaterialSymbol name="business" size={16} className="mr-2" />
                  Corporate HQ
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MaterialSymbol name="location_city" size={16} className="mr-2" />
                  Regional Office
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MaterialSymbol name="home_work" size={16} className="mr-2" />
                  Remote Team
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <MaterialSymbol name="add" size={16} className="mr-2" />
                  Create Workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Mode Switch */}
            {mounted && (
              <div className="flex items-center gap-2 px-2">
                <MaterialSymbol name="light_mode" size={18} className="text-muted-foreground" />
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
                <MaterialSymbol name="dark_mode" size={18} className="text-muted-foreground" />
              </div>
            )}

            {/* Secondary Icon Button */}
            <Button variant="ghost" size="icon">
              <MaterialSymbol name="notifications" size={20} />
            </Button>

            {/* Avatar with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar size="sm">
                    <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">john.doe@jll.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <MaterialSymbol name="person" size={16} className="mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MaterialSymbol name="settings" size={16} className="mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MaterialSymbol name="help" size={16} className="mr-2" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <MaterialSymbol name="logout" size={16} className="mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Utility Bar */}
        <div className="flex items-center gap-2 bg-background border-b p-3 pt-0 sticky top-16 z-40" style={{ height: 'fit-content' }}>
          <div className="flex items-center bg-secondary rounded-md border border-border">
            <Button 
              variant="secondary" 
              size="sm" 
              className="gap-2 rounded-r-none border-r-0 bg-transparent hover:bg-secondary/80"
              onClick={() => router.push("/dashboard")}
            >
              <MaterialSymbol name="add" size={18} />
              Create Work Order
            </Button>
            <div className="h-6 w-px bg-border" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="rounded-l-none px-2 bg-transparent hover:bg-secondary/80">
                  <MaterialSymbol name="expand_more" size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <MaterialSymbol name="add" size={16} className="mr-2" />
                  Create Work Order
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <MaterialSymbol name="add" size={16} className="mr-2" />
                  Create Visit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <MaterialSymbol name="add" size={16} className="mr-2" />
                  Create Reservation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => router.push("/dashboard")}
          >
            <MaterialSymbol name="work" size={18} />
            Work Orders - Tasks
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <MaterialSymbol name="apartment" size={18} />
            1 Main St
          </Button>
        </div>

        {/* Sidebar + Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Side Navigation */}
          <div className="dark">
            <Sidebar
              collapsible="icon"
              className="border-r bg-sidebar"
              style={{
                position: "sticky",
                top: 0,
                height: "calc(100vh - 7rem)",
                maxHeight: "calc(100vh - 7rem)",
              }}
            >
              <SidebarContent className="p-1">
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu className="gap-2">
                      {sidebarMenuItems.map((item, index) => {
                        if (item.type === "separator") {
                          return <SidebarSeparator key={`separator-${index}`} />;
                        }

                        if (item.type === "single") {
                          return (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton
                                tooltip={item.title}
                                className="cursor-pointer"
                                onClick={() => {
                                  if (item.title === "Home") {
                                    router.push("/dashboard?page=Home");
                                  } else {
                                    // For other single items, navigate to dashboard
                                    router.push("/dashboard");
                                  }
                                }}
                              >
                                <MaterialSymbol 
                                  name={item.icon} 
                                  size={18} 
                                />
                                <span>{item.title}</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        }

                        if (item.type === "group") {
                          const isOpen = openGroups[item.label] ?? false;
                          return (
                            <Collapsible
                              key={item.label}
                              open={isOpen}
                              onOpenChange={() => toggleGroup(item.label)}
                            >
                              <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuButton tooltip={item.label} className="cursor-pointer">
                                    <MaterialSymbol name={item.icon} size={20} />
                                    <span>{item.label}</span>
                                    <MaterialSymbol
                                      name={isOpen ? "expand_less" : "expand_more"}
                                      size={16}
                                      className="ml-auto"
                                    />
                                  </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <SidebarMenuSub className="gap-2">
                                    {item.items.map((subItem) => {
                                      // Map sub-item titles to page query parameters
                                      const getPageParam = (title: string): string | null => {
                                        if (title === "Tasks") return "Tasks";
                                        if (title === "Upcoming visits") return "Upcoming visits";
                                        if (title === "Upcoming reservations") return "Upcoming reservations";
                                        if (title === "Dashboard") return "Home";
                                        return null;
                                      };

                                      const pageParam = getPageParam(subItem.title);
                                      
                                      return (
                                        <SidebarMenuSubItem key={subItem.title}>
                                          <SidebarMenuSubButton 
                                            className="cursor-pointer"
                                            onClick={() => {
                                              if (pageParam) {
                                                router.push(`/dashboard?page=${encodeURIComponent(pageParam)}`);
                                              } else {
                                                // For items without specific pages, navigate to dashboard
                                                router.push("/dashboard");
                                              }
                                            }}
                                          >
                                            <MaterialSymbol 
                                              name={subItem.icon} 
                                              size={18} 
                                            />
                                            <span>{getSidebarSubItemLabel(subItem)}</span>
                                          </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                      );
                                    })}
                                  </SidebarMenuSub>
                                </CollapsibleContent>
                              </SidebarMenuItem>
                            </Collapsible>
                          );
                        }

                        return null;
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
          </div>

          {/* Main Content Area */}
          <SidebarInset className="flex-1 overflow-hidden flex flex-col min-h-0">
            {/* Breadcrumb */}
            <div className="px-3 pt-1.5 pb-1.5 h-fit" style={{ backgroundColor: 'var(--color-semantic-surface-overlays-level1)' }}>
              <div className="flex items-center justify-between pt-1">
                <nav className="inline-flex items-center gap-2 px-0 py-1.5 rounded-md bg-secondary/80 text-xs">
                  <button
                    onClick={() => router.push("/dashboard?page=Home")}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Home
                  </button>
                  <MaterialSymbol name="chevron_right" size={16} className="text-muted-foreground" />
                  <button
                    onClick={() => router.push("/dashboard?page=Tasks")}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Tasks
                  </button>
                  <MaterialSymbol name="chevron_right" size={16} className="text-muted-foreground" />
                  <span className="text-foreground font-medium">{workOrder.title} ({workOrder.id})</span>
                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => previousWorkOrder && router.push(`/dashboard/work-orders/${previousWorkOrder.id}`)}
                      disabled={!previousWorkOrder}
                      title="Previous work order"
                    >
                      <MaterialSymbol name="chevron_left" size={16} />
                    </Button>
                    <span className="text-xs text-muted-foreground px-1">
                      {currentIndex + 1} of {sortedWorkOrders.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => nextWorkOrder && router.push(`/dashboard/work-orders/${nextWorkOrder.id}`)}
                      disabled={!nextWorkOrder}
                      title="Next work order"
                    >
                      <MaterialSymbol name="chevron_right" size={16} />
                    </Button>
                  </div>
                </nav>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MaterialSymbol name="share" size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Share</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MaterialSymbol name="content_copy" size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clone</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MaterialSymbol name="print" size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Print</TooltipContent>
                  </Tooltip>
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MaterialSymbol name="manage_history" size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Manage History</TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end">
                      {historyVisible ? (
                        <DropdownMenuItem onClick={() => setHistoryVisible(false)}>
                          <MaterialSymbol name="visibility_off" size={16} className="mr-2" />
                          Hide history
                        </DropdownMenuItem>
                      ) : (
                        <>
                          <DropdownMenuItem onClick={() => setHistoryVisible(true)}>
                            <MaterialSymbol name="history" size={16} className="mr-2" />
                            Show History
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MaterialSymbol name="person_add" size={16} className="mr-2" />
                            Follow
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MaterialSymbol name="comment" size={16} className="mr-2" />
                            Add comment
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <main className="p-6 flex-1 flex flex-col overflow-hidden min-h-0 bg-semantic-surface-overlays-level1">
              {/* Three Cards Layout: 3col - 6col - 3col */}
              <div className="flex flex-nowrap w-full flex-1 items-stretch overflow-hidden" style={{ margin: '0px', gap: '24px', width: '100%' }}>
                {/* First Card - 3 columns */}
                <div className="h-full flex-shrink-0" style={{ flex: '0 0 25%', maxWidth: '25%', minWidth: 0 }}>
                  <Card className="flex flex-col gap-4 h-full py-3 w-full">
                    <CardContent className="space-y-4 p-3 py-0 flex-1 flex flex-col">
                      {/* Work Order Info */}
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-muted flex items-center justify-center flex-shrink-0" style={{ height: 60, width: 60, minWidth: 60, minHeight: 60 }}>
                          <MaterialSymbol name={workOrder.icon} size={28} className="text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">{workOrder.id}</p>
                          <h3 className="font-semibold text-base">{workOrder.title}</h3>
                          <p className="text-sm text-muted-foreground">{"type" in workOrder && workOrder.type ? workOrder.type : workOrder.category}</p>
                        </div>
                      </div>

                      {/* Badges: Priority, Status, Assignee */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge tonal={getPriorityTonal(workOrder.priority)}>
                          {workOrder.priority}
                        </Badge>
                        {workOrder.status === "New" ? (
                          <Badge variant="default">
                            Open
                          </Badge>
                        ) : workOrder.status === "Upcoming" ? (
                          <Badge tonal="science">
                            New
                          </Badge>
                        ) : getStatusTonal(workOrder.status) ? (
                          <Badge tonal={getStatusTonal(workOrder.status)}>
                            {workOrder.status}
                          </Badge>
                        ) : (
                          <Badge variant="default">
                            {workOrder.status}
                          </Badge>
                        )}
                        <Badge variant="default">
                          John Doe
                        </Badge>
                      </div>

                      {/* Overview Section Header */}
                      <div className="border-b pb-2">
                        <h4 className="text-sm font-semibold">Overview</h4>
                      </div>

                      {/* Created & Target Completion */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Created</p>
                          <p className="text-sm font-medium">
                            {workOrder.created}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Target completion</p>
                          <p className="text-sm font-medium truncate">{getTargetCompletionDate()}</p>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-xs text-muted-foreground">Description</p>
                        <p className="text-sm text-foreground">
                          {workOrder.description}
                        </p>
                      </div>

                      {/* Specific Location */}
                      <div>
                        <p className="text-xs text-muted-foreground">Specific location</p>
                        <p className="text-sm text-foreground">-</p>
                      </div>

                      {/* Location & Contact Section Header */}
                      <div className="border-b pb-2">
                        <h4 className="text-sm font-semibold">Location & Contact</h4>
                      </div>

                      {/* Location Info */}
                      <div className="flex items-start gap-3">
                        <Image
                          src="/assets/Thumbnail4-5062ba59-b7b7-47d0-bb46-8b0c998e44fa.png"
                          alt="Map view of 1 Main St, Boston"
                          width={48}
                          height={48}
                          className="rounded-lg object-cover flex-shrink-0"
                          unoptimized
                        />
                        <div className="min-w-0">
                          <h3 className="font-normal text-base text-semantic-text-interaction-default underline">1 Main St</h3>
                          <p className="text-sm text-muted-foreground truncate">1 Main St, Boston, MA 02109, USA</p>
                        </div>
                      </div>

                      {/* Company Info */}
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-muted flex items-center justify-center flex-shrink-0" style={{ height: 48, width: 48, minWidth: 48, minHeight: 48 }}>
                          <MaterialSymbol name="domain" size={24} className="text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-normal text-base text-semantic-text-interaction-default underline">Starbucks</h3>
                          <p className="text-sm text-muted-foreground">Floor 1</p>
                        </div>
                      </div>

                      {/* Primary Contact Info */}
                      <div className="flex items-start gap-3">
                        <Avatar style={{ width: 48, height: 48 }}>
                          <AvatarImage src="https://i.pravatar.cc/150?img=47" alt="Jane Smith" />
                          <AvatarFallback>JS</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-base">Jane Smith</h4>
                          <p className="text-xs text-muted-foreground truncate">Property Manager</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Second Card - 6 columns (fills remaining space when history is hidden) */}
                <div className="flex-1 min-w-0 flex flex-col overflow-hidden" style={{ flex: historyVisible ? '1 1 50%' : '1 1 auto' }}>
                  {/* Scrollable area: toggle sticks at top, cards scroll underneath */}
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col items-start gap-6 pb-0">
                    {/* Toggle Group Filter - sticky so cards scroll underneath */}
                    <div className="sticky top-0 z-10 bg-background pb-0 -mt-px pt-0 w-full">
                      <ToggleGroup
                        type="multiple"
                        value={selectedSections}
                        onValueChange={handleSectionToggle}
                        className="w-full"
                      >
                        <ToggleGroupItem value="all">All</ToggleGroupItem>
                        <ToggleGroupItem value="photos">Photos</ToggleGroupItem>
                        <ToggleGroupItem value="labor">Labor & Materials</ToggleGroupItem>
                        <ToggleGroupItem value="files">Files</ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  {(selectedSections.includes("all") || selectedSections.includes("photos")) && (
                    <Card className="w-full py-3">
                      <CardHeader className="px-3 flex flex-row items-center justify-between gap-2">
                        <CardTitle className="text-sm font-semibold">Photos</CardTitle>
                        <Button variant="secondary" size="xs">
                          Add photos
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="py-0">
                          <Empty
                            icon={<MaterialSymbol name="photo_library" size={48} className="text-muted-foreground" />}
                            title="No photos"
                            description="Upload photos to document this work order."
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {(selectedSections.includes("all") || selectedSections.includes("labor")) && (
                    <Card className="w-full py-3">
                      <CardHeader className="px-3">
                        <CardTitle className="text-sm font-semibold">Labor & Materials</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="py-0">
                          <Empty
                            icon={<MaterialSymbol name="construction" size={48} className="text-muted-foreground" />}
                            title="No labor & materials"
                            description="Add labor and materials to track costs for this work order."
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {(selectedSections.includes("all") || selectedSections.includes("files")) && (
                    <Card className="w-full py-3">
                      <CardHeader className="px-3">
                        <CardTitle className="text-sm font-semibold">Files</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="py-0">
                          <Empty
                            icon={<MaterialSymbol name="folder" size={48} className="text-muted-foreground" />}
                            title="No files"
                            description="Upload files and documents related to this work order."
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  </div>
                </div>

                {/* Third Card - History panel; hidden when historyVisible is false */}
                {historyVisible && (
                  <div className="h-full flex-shrink-0 flex flex-col min-h-0" style={{ flex: '0 0 25%', maxWidth: '25%', minWidth: 0 }}>
                    <Card className="flex flex-col h-full py-3 w-full overflow-hidden bg-[var(--color-semantic-surface-overlays-level1)] border-semantic-stroke-subdued">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-2">
                        <CardTitle className="text-lg font-semibold">History</CardTitle>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Button
                            variant={historyFollowActive ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground data-[state=active]:bg-muted"
                            onClick={() => setHistoryFollowActive((prev) => !prev)}
                          >
                            <MaterialSymbol name={historyFollowActive ? "visibility_off" : "visibility"} size={18} />
                            <span className="text-sm">{historyFollowActive ? "Unfollow" : "Follow"}</span>
                          </Button>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <MaterialSymbol name="open_in_new" size={18} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Open in new window</TooltipContent>
                          </Tooltip>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 pt-0 flex flex-col gap-3">
                        <div className="relative">
                          <MaterialSymbol
                            name="search"
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                          />
                          <Input
                            placeholder="Search history."
                            className="pl-9 bg-muted/50 rounded-lg h-9"
                          />
                        </div>
                        <Button variant="secondary" className="w-full justify-center gap-2">
                          <MaterialSymbol name="add_circle" size={18} />
                          Add comment
                        </Button>
                        <div className="flex flex-col gap-0">
                          <Accordion type="single" collapsible defaultValue="history-section-1">
                            <AccordionItem value="history-section-1">
                              <AccordionTrigger className="flex items-center gap-2">
                                {historyTodayFormatted}
                                <Badge variant="secondary" className="ml-auto shrink-0">{historyTodayEntries.length}</Badge>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="flex flex-col gap-2">
                                  {historyTodayEntries.map((entry, i) => (
                                    <div key={i} className="flex flex-col gap-2 p-2 rounded-md bg-semantic-surface-overlays-level1">
                                      <div className="flex items-start gap-3">
                                        <Avatar className="h-10 w-10 shrink-0">
                                          <AvatarImage src={`https://i.pravatar.cc/150?img=${entry.avatarImg}`} alt={entry.name} />
                                          <AvatarFallback>{entry.initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 space-y-0.5">
                                          <p className="text-base font-medium">{entry.name}</p>
                                          <p className="text-xs text-muted-foreground truncate">{entry.time}</p>
                                        </div>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{entry.comment}</p>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          {!isNewestWorkOrder && workOrderId !== "W-11631-000034" && (
                            <>
                              <Separator />
                              <Accordion type="single" collapsible defaultValue="">
                                <AccordionItem value="history-section-2">
                                  <AccordionTrigger className="flex items-center gap-2">
                                    {historyTwoDaysAgoFormatted}
                                    <Badge variant="secondary" className="ml-auto shrink-0">{historyTwoDaysAgoEntries.length}</Badge>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="flex flex-col gap-2">
                                      {historyTwoDaysAgoEntries.map((entry, i) => (
                                        <div key={i} className="flex flex-col gap-2 p-2 rounded-md bg-semantic-surface-overlays-level1">
                                          <div className="flex items-start gap-3">
                                            <Avatar className="h-10 w-10 shrink-0">
                                              <AvatarImage src={`https://i.pravatar.cc/150?img=${entry.avatarImg}`} alt={entry.name} />
                                              <AvatarFallback>{entry.initials}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 space-y-0.5">
                                              <p className="text-base font-medium">{entry.name}</p>
                                              <p className="text-xs text-muted-foreground truncate">{entry.time}</p>
                                            </div>
                                          </div>
                                          <p className="text-sm text-muted-foreground">{entry.comment}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
