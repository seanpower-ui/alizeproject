/**
 * Shared sidebar menu configuration used across the app (dashboard, work order details, etc.).
 * Edit this file to change nav labels and items everywhere at once.
 */
export const sidebarMenuItems = [
  // Single item
  {
    type: "single" as const,
    title: "Home",
    icon: "home",
  },
  // Group
  {
    type: "group" as const,
    label: "Recent visited",
    icon: "history",
    items: [
      { title: "Dashboard", icon: "dashboard" },
      { title: "Analytics", icon: "analytics" },
    ],
  },
  // Separator
  { type: "separator" as const },
  // Groups
  {
    type: "group" as const,
    label: "Work Orders",
    icon: "build_circle",
    items: [
      { title: "Tasks", icon: "task" },
      { title: "Schedules", icon: "schedule" },
    ],
  },
  {
    type: "group" as const,
    label: "Incidents",
    icon: "warning",
    items: [
      { title: "All Incidents", icon: "list" },
      { title: "Active Incidents", icon: "error" },
    ],
  },
  {
    type: "group" as const,
    label: "Resource Reservations",
    icon: "event",
    items: [
      { title: "Upcoming reservations", icon: "schedule", navLabel: "Schedule" },
      { title: "Resource list", icon: "list" },
    ],
  },
  {
    type: "group" as const,
    label: "Visitors",
    icon: "people",
    items: [
      { title: "Upcoming visits", icon: "schedule", navLabel: "Schedule" },
    ],
  },
  {
    type: "group" as const,
    label: "Tenant Compliance",
    icon: "verified",
    items: [
      { title: "Compliance Overview", icon: "dashboard" },
      { title: "Violations", icon: "error" },
    ],
  },
  // Separator
  { type: "separator" as const },
  // More groups
  {
    type: "single" as const,
    title: "My Properties",
    icon: "apartment",
  },
  {
    type: "single" as const,
    title: "My Companies",
    icon: "business",
  },
  {
    type: "single" as const,
    title: "My Users",
    icon: "group",
  },
  {
    type: "single" as const,
    title: "My Files",
    icon: "folder",
  },
];

/** Get display label for a sub-item (uses navLabel when present, otherwise title) */
export function getSidebarSubItemLabel(subItem: { title: string; navLabel?: string }): string {
  return subItem.navLabel ?? subItem.title;
}
