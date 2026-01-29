"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  Checkbox,
  DataList,
  DataListItem,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Combobox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  JLLLogo,
  Label,
  MaterialSymbol,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Sidebar,
  Switch,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@jllt/alize-ui";
import { sidebarMenuItems, getSidebarSubItemLabel } from "@/lib/sidebar-menu";

// Helper function to format date as MM/DD/YYYY
const formatDate = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

// Get today's date and yesterday
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

export type WorkOrderItem = {
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

const initialWorkOrders: WorkOrderItem[] = [
  {
    id: "W-11631-000034",
    title: "HVAC (General)",
    category: "HVAC",
    priority: "High",
    status: "Upcoming",
    assignee: "Sarah Chen",
    created: formatDate(today),
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
    created: formatDate(yesterday),
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

// Table column definitions
const tableColumns = [
  { key: "id", label: "ID", sortable: true },
  { key: "title", label: "Title", sortable: true },
  { key: "category", label: "Category", sortable: true },
  { key: "priority", label: "Priority", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "assignee", label: "Assignee", sortable: true },
  { key: "created", label: "Created", sortable: true },
  { key: "property", label: "Property", sortable: true },
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
  return undefined;
}

function formatTimeUS(time24: string) {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

function WorkOrderCard({ workOrder, hideAssignee, visitorBadges, visitorName, hostName, cardIndex, isEmpty, onVisitorCardClick, descriptionHeight, fixedHeight }: { 
  workOrder: WorkOrderItem; 
  hideAssignee?: boolean;
  visitorBadges?: { first: string; second: string };
  visitorName?: string;
  hostName?: string;
  cardIndex?: number;
  isEmpty?: boolean;
  onVisitorCardClick?: (workOrder: WorkOrderItem) => void;
  /** When set (e.g. 60), the description block gets this min-height so the tile matches others */
  descriptionHeight?: number;
  /** When set (e.g. 322), the card gets this exact height (used for the new work order tile) */
  fixedHeight?: number;
}) {
  // Clickable: work order cards (navigate to detail) or visitor cards (open view modal when onVisitorCardClick provided)
  const isWorkOrderClickable = !visitorBadges && !isEmpty;
  const isVisitorClickable = visitorBadges && !isEmpty && onVisitorCardClick;
  const isClickable = isWorkOrderClickable || isVisitorClickable;
  
  const cardContent = (
    <Card
      className={`flex flex-col gap-4 py-3 ${fixedHeight == null ? 'h-full min-h-0' : ''} ${isClickable ? 'cursor-pointer border border-transparent hover:border-semantic-stroke-subdued transition-colors' : ''}`}
      style={fixedHeight != null ? { height: fixedHeight } : undefined}
    >
      <CardHeader className="p-3 py-0 h-8">
        {/* Top row: Priority, Status, Assignee, More */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {visitorBadges ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge tonal="science">
                      {visitorBadges.first}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Property status</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="default">
                      {visitorBadges.second}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Status</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge tonal={getPriorityTonal(workOrder.priority)}>
                      {workOrder.priority}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Priority</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent>Status</TooltipContent>
                </Tooltip>
                {!hideAssignee && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="default">
                        John Doe
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Assignee</TooltipContent>
                  </Tooltip>
                )}
              </>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MaterialSymbol name="more_vert" size={18} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className={fixedHeight != null ? "flex flex-col flex-1 min-h-0 gap-4 p-3 py-0" : "flex-1 space-y-4 p-3 py-0"}>
        {isEmpty ? null : (
          <>
        {/* Work Order Info */}
        <div className="flex items-start gap-3">
          {visitorBadges ? (
            <Avatar size="lg">
              <AvatarFallback>
                {visitorName 
                  ? visitorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  : 'GU'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="rounded-lg bg-muted flex items-center justify-center" style={{ height: 60, width: 60, minWidth: 60, minHeight: 60 }}>
              <MaterialSymbol name={workOrder.icon} size={28} className="text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {visitorBadges ? (
              <>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Guest</p>
                <h3 className="font-semibold text-base">{visitorName || "Guest"}</h3>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">{workOrder.id}</p>
                <h3 className="font-semibold text-base">{workOrder.title}</h3>
                <p className="text-sm text-muted-foreground">{"type" in workOrder && workOrder.type ? workOrder.type : workOrder.category}</p>
              </>
            )}
          </div>
        </div>

        {/* Created & Property */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">{visitorBadges ? "Date" : "Created"}</p>
            <p className="text-sm font-medium">
              {workOrder.created}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{visitorBadges ? "Time" : "Property"}</p>
            <p className="text-sm font-medium truncate">{visitorBadges ? "9:00 AM - 5:00 PM" : workOrder.property}</p>
          </div>
        </div>

        {/* Description */}
        {!visitorBadges && (
          <div style={descriptionHeight != null ? { minHeight: descriptionHeight } : undefined}>
            <p className="text-xs text-muted-foreground">Description</p>
            <p className="text-sm text-foreground line-clamp-3">
              {workOrder.description}
            </p>
          </div>
        )}

        {/* Footer Stats */}
        {visitorBadges ? (
          <div className="flex items-center gap-4 pt-2 text-muted-foreground">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-default">
                  <MaterialSymbol name="corporate_fare" size={16} />
                  <span className="text-sm">Starbucks</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Company visiting
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-default">
                  <MaterialSymbol name="person" size={16} />
                  <span className="text-sm">{hostName || "Guest"}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Host
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className={`flex items-center gap-4 pt-2 text-muted-foreground ${fixedHeight != null ? "mt-auto" : ""}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-default">
                  <MaterialSymbol name="photo" size={16} />
                  <span className="text-sm">{workOrder.tasks}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {workOrder.tasks} Photos
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-default">
                  <MaterialSymbol name="handyman" size={16} />
                  <span className="text-sm">{workOrder.attachments}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {workOrder.attachments} Labor & Material
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-default">
                  <MaterialSymbol name="description" size={16} />
                  <span className="text-sm">{workOrder.files}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {workOrder.files} Files
              </TooltipContent>
            </Tooltip>
          </div>
        )}
          </>
        )}
      </CardContent>
    </Card>
  );

  if (isWorkOrderClickable) {
    return (
      <Link href={`/dashboard/work-orders/${workOrder.id}`}>
        {cardContent}
      </Link>
    );
  }
  if (isVisitorClickable) {
    return (
      <div role="button" tabIndex={0} onClick={() => onVisitorCardClick?.(workOrder)} onKeyDown={(e) => e.key === 'Enter' && onVisitorCardClick?.(workOrder)}>
        {cardContent}
      </div>
    );
  }
  return cardContent;
}

// Reservation Card Component - Decoupled from WorkOrderCard
function ReservationCard({ 
  workOrder, 
  reservationData,
  onClick
}: { 
  workOrder: WorkOrderItem; 
  reservationData?: { floor?: string; suite?: string; date?: string; time?: string };
  onClick?: () => void;
}) {
  return (
    <Card 
      className={`flex flex-col gap-4 h-fit py-3 ${onClick ? "cursor-pointer border border-transparent hover:border-semantic-stroke-subdued transition-colors" : ""}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onClick?.();
      }}
    >
      <CardHeader className="p-3 py-0 h-8">
        {/* Top row: Status, Resource, More */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="default">
                  {workOrder.status}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Status</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge tonal="sand">
                  <MaterialSymbol name="meeting_room" size={14} className="mr-1.5" />
                  Sand Room
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Resource name</TooltipContent>
            </Tooltip>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MaterialSymbol name="more_vert" size={18} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 p-3 py-0">
        {/* Reservation Info */}
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-muted flex items-center justify-center" style={{ height: 60, width: 60, minWidth: 60, minHeight: 60 }}>
            <MaterialSymbol name="meeting_room" size={28} className="text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{workOrder.id.startsWith('R') ? workOrder.id : (workOrder.id.startsWith('W-') ? workOrder.id.replace(/^W-/, 'R-') : 'R' + workOrder.id.slice(1))}</p>
            <h3 className="font-semibold text-base">All Day event</h3>
            <p className="text-sm text-muted-foreground">Starbucks</p>
          </div>
        </div>

        {/* Property & Floor */}
        {reservationData && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Property</p>
              <p className="text-sm font-medium truncate">1 Main St</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Floor</p>
              <p className="text-sm font-medium">{reservationData.floor}</p>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <p className="text-xs text-muted-foreground">Description</p>
          <p className="text-sm text-foreground line-clamp-3">
            Business meeting to discuss quarterly strategy, review performance metrics, and plan upcoming initiatives with key stakeholders.
          </p>
        </div>

        {/* Reservation Date & Time Footer */}
        {reservationData && (reservationData.date || reservationData.time) && (
          <div className="flex items-center gap-4 pt-2">
            {reservationData.date && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-muted-foreground cursor-default">
                    <MaterialSymbol name="calendar_today" size={16} />
                    <span className="text-sm">{reservationData.date}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Date
                </TooltipContent>
              </Tooltip>
            )}
            {reservationData.time && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-muted-foreground cursor-default">
                    <MaterialSymbol name="schedule" size={16} />
                    <span className="text-sm">{reservationData.time}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Time
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Reservation Tile Component for Create Reservation page
function ReservationTile({ 
  roomName,
  date,
  timeSlot,
  location,
  capacity,
  price,
  onBookResource,
  hideBadge,
  hideDate,
  customImageSrc,
  property,
  floor,
  thirdLabel,
  thirdLabelValue,
  propertyLabel,
  avatarName,
  avatarImage,
  email,
  isCreateReservationCard
}: {
  roomName: string;
  date: string;
  timeSlot: string;
  location: string;
  capacity: number;
  price: string;
  onBookResource?: () => void;
  hideBadge?: boolean;
  hideDate?: boolean;
  customImageSrc?: string;
  property?: string;
  floor?: string;
  thirdLabel?: string;
  thirdLabelValue?: string;
  propertyLabel?: string;
  avatarName?: string;
  avatarImage?: string;
  email?: string;
  isCreateReservationCard?: boolean;
}) {
  return (
    <Card className="flex flex-col overflow-hidden p-0 !gap-0 h-fit" style={{ gap: 0 }}>
      {/* Image Section */}
      <div className="w-full h-48 bg-muted relative overflow-hidden rounded-t-lg">
        {customImageSrc ? (
          <Image
            src={customImageSrc}
            alt={roomName}
            fill
            className="object-cover"
          />
        ) : roomName === "Sand Room" ? (
          <Image
            src="/assets/sand-room.png"
            alt="Sand Room"
            fill
            className="object-cover"
          />
        ) : roomName === "Sky Room" ? (
          <Image
            src="/assets/sky-room.png"
            alt="Sky Room"
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 flex items-center justify-center">
            <MaterialSymbol name="meeting_room" size={64} className="text-muted-foreground opacity-30" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="p-4">
        {/* Room Name Badge */}
        {!hideBadge && (
          <div className="flex items-center gap-2 mb-2">
            {roomName === "Sand Room" ? (
              <Badge tonal="sand">
                <MaterialSymbol name="meeting_room" size={14} className="mr-1.5" />
                Sand Room
              </Badge>
            ) : roomName === "Sky Room" ? (
              <Badge tonal="science">
                <MaterialSymbol name="meeting_room" size={14} className="mr-1.5" />
                Sky Room
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-[#F4EDEA] text-foreground border-0 hover:bg-[#F4EDEA]">
                <MaterialSymbol name="meeting_room" size={14} className="mr-1.5" />
                {roomName}
              </Badge>
            )}
          </div>
        )}

        {/* Date */}
        {!hideDate && <p className="text-sm text-foreground">{date}</p>}

        {/* Time Slot - Bold and Larger */}
        <p className="text-base font-semibold text-foreground leading-tight">{timeSlot}</p>

        {/* Location */}
        <p className="text-sm text-foreground">{location}</p>

        {/* Capacity and Price - Side by Side */}
        {!(property && floor) && (
          <div className="flex items-center gap-6 mt-2">
            <div className="flex items-center gap-1.5">
              <MaterialSymbol name="person" size={16} className="text-muted-foreground" />
              <span className="text-sm text-foreground">{capacity} people</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MaterialSymbol name="sell" size={16} className="text-muted-foreground" />
              <span className="text-sm text-foreground">{price}</span>
            </div>
          </div>
        )}

        {/* Property, Floor, and Third Label */}
        {property && floor && (
          <div className="flex gap-4 mt-2 mb-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{propertyLabel || "Property"}</p>
              <p className="text-sm font-medium truncate">{property}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Floor</p>
              <p className="text-sm font-medium">{floor}</p>
            </div>
            {thirdLabel && thirdLabelValue && (
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{thirdLabel}</p>
                <p className="text-sm font-medium">{thirdLabelValue}</p>
              </div>
            )}
          </div>
        )}

        {/* Avatar and Name Section */}
        {avatarName && (
          <>
            <Separator className="my-2" />
            <div className="flex items-start gap-3 mt-3 mb-4">
              <Avatar size="lg">
                {avatarImage && (
                  <AvatarImage src={avatarImage} alt={avatarName} />
                )}
                <AvatarFallback>
                  {avatarName 
                    ? avatarName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    : 'GU'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-normal text-base">{avatarName}</h3>
                <h4 className="text-sm text-muted-foreground mt-1">Property Manager</h4>
                {email && (
                  <a 
                    href={`mailto:${email}`}
                    className="text-xs text-muted-foreground mt-1 hover:underline block"
                  >
                    {email}
                  </a>
                )}
              </div>
            </div>
            <Separator className="my-2" />
          </>
        )}

        {/* Buttons Section */}
        <div className="flex gap-2 pt-3">
          {isCreateReservationCard ? (
            <>
              <Button variant="outline" className="flex-1">
                Show details
              </Button>
              <Button 
                variant="secondary"
                className="flex-1"
                onClick={onBookResource}
              >
                Book resource
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" className="flex-1 bg-secondary hover:bg-secondary/80">
                <MaterialSymbol name="schedule" size={16} className="mr-2" />
                Building hours
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1 bg-secondary hover:bg-secondary/80"
                onClick={onBookResource}
              >
                <MaterialSymbol name="map" size={16} className="mr-2" />
                Floor plan
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Column configuration for the table
const defaultColumnOrder = ['id', 'title', 'category', 'priority', 'status', 'assignee', 'created', 'property'];
const defaultVisitorColumnOrder = ['name', 'propertyStatus', 'status', 'type', 'date', 'time', 'property', 'createdFor'];
const defaultReservationColumnOrder = ['resId', 'reservationName', 'resourceName', 'status', 'date', 'time', 'company', 'type', 'property', 'floor'];

const columnConfig: Record<string, { label: string; className?: string; defaultWidth?: number }> = {
  id: { label: 'ID', defaultWidth: 175 }, // 140px * 1.25 = 175px
  title: { label: 'Title', defaultWidth: 200 },
  category: { label: 'Category', defaultWidth: 150 },
  priority: { label: 'Priority', defaultWidth: 125 },
  status: { label: 'Status', defaultWidth: 125 },
  assignee: { label: 'Assignee', defaultWidth: 150 },
  created: { label: 'Created', defaultWidth: 125 },
  property: { label: 'Property', defaultWidth: 200 },
  // Visitor columns
  name: { label: 'Name', defaultWidth: 200 },
  propertyStatus: { label: 'Property status', defaultWidth: 175 },
  type: { label: 'Type', defaultWidth: 125 },
  date: { label: 'Date', defaultWidth: 125 },
  time: { label: 'Time', defaultWidth: 175 },
  createdFor: { label: 'Created for', defaultWidth: 150 },
  // Reservation columns
  resId: { label: 'Res ID', defaultWidth: 175 }, // 140px * 1.25 = 175px
  reservationName: { label: 'Reservation name', defaultWidth: 200 },
  resourceName: { label: 'Resource name', defaultWidth: 175 },
  company: { label: 'Company', defaultWidth: 150 },
  floor: { label: 'Floor', defaultWidth: 100 },
};

// Calendar Component for Visitors
function VisitorsCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Get previous month's last days for padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  
  // Generate calendar days
  const calendarDays: Array<{ day: number; isCurrentMonth: boolean; date: Date }> = [];
  
  // Previous month's days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(year, month - 1, day)
    });
  }
  
  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: new Date(year, month, day)
    });
  }
  
  // Next month's days to fill the grid (6 rows x 7 days = 42 cells)
  const remainingCells = 42 - calendarDays.length;
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(year, month + 1, day)
    });
  }
  
  const monthNames = ["January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const today = new Date();
  const isToday = (date: Date) => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(year, month + (direction === 'next' ? 1 : -1), 1));
  };
  
  return (
    <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
      <Card className="h-full flex flex-col gap-0 pt-6 pb-0">
        <CardHeader className="pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('prev')}
              >
                <MaterialSymbol name="chevron_left" size={20} />
              </Button>
              <h2 className="text-xl font-semibold">
                {monthNames[month]} {year}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('next')}
              >
                <MaterialSymbol name="chevron_right" size={20} />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
          <div className="grid grid-cols-7 border-t flex-1 h-full">
            {/* Day headers */}
            {dayNames.map((day, dayIndex) => (
              <div
                key={day}
                className={`p-2 text-center text-sm font-medium bg-muted/50 flex-shrink-0 ${
                  dayIndex !== 6 ? 'border-r' : '' // Remove right border from Saturday
                } border-b`}
              >
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((calendarDay, index) => {
              const isCurrentDay = isToday(calendarDay.date);
              const columnIndex = index % 7; // 0 = Sunday, 6 = Saturday
              const isLastRow = index >= 35; // Last row (indices 35-41)
              const isSaturday = columnIndex === 6;
              
              return (
                <div
                  key={index}
                  className={`p-2 flex flex-col ${
                    !isSaturday ? 'border-r' : '' // Remove right border from Saturday
                  } ${!isLastRow ? 'border-b' : ''} ${
                    !calendarDay.isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : 'bg-background'
                  } ${isCurrentDay ? 'bg-primary/5' : ''}`}
                >
                  <div className={`text-sm mb-1 flex-shrink-0 ${isCurrentDay ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                    {calendarDay.day}
                  </div>
                  {/* Visitor events would go here */}
                  <div className="space-y-1 flex-1 overflow-y-auto">
                    {/* Placeholder for visitor events */}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Calendar Component for Reservations
function ReservationsCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Get previous month's last days for padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  
  // Generate calendar days
  const calendarDays: Array<{ day: number; isCurrentMonth: boolean; date: Date }> = [];
  
  // Previous month's days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(year, month - 1, day)
    });
  }
  
  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: new Date(year, month, day)
    });
  }
  
  // Next month's days to fill the grid (6 rows x 7 days = 42 cells)
  const remainingCells = 42 - calendarDays.length;
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(year, month + 1, day)
    });
  }
  
  const monthNames = ["January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const today = new Date();
  const isToday = (date: Date) => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(year, month + (direction === 'next' ? 1 : -1), 1));
  };
  
  return (
    <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
      <Card className="h-full flex flex-col gap-0 pt-6 pb-0">
        <CardHeader className="pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('prev')}
              >
                <MaterialSymbol name="chevron_left" size={20} />
              </Button>
              <h2 className="text-xl font-semibold">
                {monthNames[month]} {year}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('next')}
              >
                <MaterialSymbol name="chevron_right" size={20} />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
          <div className="grid grid-cols-7 border-t flex-1 h-full">
            {/* Day headers */}
            {dayNames.map((day, dayIndex) => (
              <div
                key={day}
                className={`p-2 text-center text-sm font-medium bg-muted/50 flex-shrink-0 ${
                  dayIndex !== 6 ? 'border-r' : '' // Remove right border from Saturday
                } border-b`}
              >
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((calendarDay, index) => {
              const isCurrentDay = isToday(calendarDay.date);
              const columnIndex = index % 7; // 0 = Sunday, 6 = Saturday
              const isLastRow = index >= 35; // Last row (indices 35-41)
              const isSaturday = columnIndex === 6;
              
              return (
                <div
                  key={index}
                  className={`p-2 flex flex-col ${
                    !isSaturday ? 'border-r' : '' // Remove right border from Saturday
                  } ${!isLastRow ? 'border-b' : ''} ${
                    !calendarDay.isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : 'bg-background'
                  } ${isCurrentDay ? 'bg-primary/5' : ''}`}
                >
                  <div className={`text-sm mb-1 flex-shrink-0 ${isCurrentDay ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                    {calendarDay.day}
                  </div>
                  {/* Reservation events would go here */}
                  <div className="space-y-1 flex-1 overflow-y-auto">
                    {/* Placeholder for reservation events */}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Work Orders Table Component with drag-drop column reordering
function WorkOrdersTable({ 
  workOrders,
  sortState,
  onSort,
  columnOrder,
  onColumnReorder,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  activePage,
  visitorData,
  onVisitorRowClick,
  onReservationRowClick
}: { 
  workOrders: WorkOrderItem[];
  sortState: Record<string, 'asc' | 'desc'>;
  onSort: (column: string) => void;
  columnOrder: string[];
  onColumnReorder: (newOrder: string[]) => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  activePage?: "Home" | "Tasks" | "Upcoming visits" | "Upcoming reservations" | "Create reservation";
  visitorData?: Array<{ visitorName: string; hostName: string; visitorBadges: { first: string; second: string } }>;
  onVisitorRowClick?: (workOrder: { created: string }) => void;
  onReservationRowClick?: (workOrder: { id: string; created: string; property: string }) => void;
}) {
  const router = useRouter();
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {};
    columnOrder.forEach((col) => {
      widths[col] = columnConfig[col]?.defaultWidth || 150;
    });
    return widths;
  });
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const resizeStartX = useRef<number>(0);
  const resizeStartWidth = useRef<number>(0);

  const handleDragStart = (e: React.DragEvent, column: string) => {
    setDraggedColumn(column);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, column: string) => {
    e.preventDefault();
    if (column !== draggedColumn) {
      setDragOverColumn(column);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn !== targetColumn) {
      const newOrder = [...columnOrder];
      const draggedIndex = newOrder.indexOf(draggedColumn);
      const targetIndex = newOrder.indexOf(targetColumn);
      
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedColumn);
      
      onColumnReorder(newOrder);
    }
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  // Update column widths when column order changes
  useEffect(() => {
    setColumnWidths((prev) => {
      const newWidths = { ...prev };
      columnOrder.forEach((col) => {
        if (!newWidths[col]) {
          newWidths[col] = columnConfig[col]?.defaultWidth || 150;
        }
      });
      return newWidths;
    });
  }, [columnOrder]);

  const handleResizeStart = (e: React.MouseEvent, column: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(column);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = columnWidths[column] || columnConfig[column]?.defaultWidth || 150;
  };

  useEffect(() => {
    if (!resizingColumn) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizeStartX.current;
      const newWidth = Math.max(50, resizeStartWidth.current + diff);
      setColumnWidths((prev) => ({
        ...prev,
        [resizingColumn]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColumn]);

  // Calculate pagination values
  const totalItems = workOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedWorkOrders = workOrders.slice(startIndex, endIndex);
  const startItem = totalItems > 0 ? startIndex + 1 : 0;
  const endItem = endIndex;

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const renderCellContent = (column: string, workOrder: WorkOrderItem, index: number) => {
    // Visitor columns
    if (activePage === "Upcoming visits" && visitorData && visitorData[index]) {
      const visitor = visitorData[index];
      switch (column) {
        case 'name':
          return <span className="font-medium">{visitor.visitorName}</span>;
        case 'propertyStatus':
          return (
            <Badge tonal="science">
              {visitor.visitorBadges.first}
            </Badge>
          );
        case 'status':
          return (
            <Badge variant="default">
              {visitor.visitorBadges.second}
            </Badge>
          );
        case 'type':
          return "Guest";
        case 'date':
          return workOrder.created;
        case 'time':
          return "9:00 AM - 5:00 PM";
        case 'property':
          return <span className="max-w-[150px] truncate block">{workOrder.property}</span>;
        case 'createdFor':
          return visitor.hostName;
        default:
          return null;
      }
    }
    
    // Reservation columns
    if (activePage === "Upcoming reservations") {
      switch (column) {
        case 'resId':
          return <span className="font-normal text-semantic-text-interaction-default underline">{workOrder.id.startsWith('R') ? workOrder.id : (workOrder.id.startsWith('W-') ? workOrder.id.replace(/^W-/, 'R-') : 'R' + workOrder.id.slice(1))}</span>;
        case 'reservationName':
          return "All Day event";
        case 'resourceName':
          return (
            <Badge tonal="sand">
              <MaterialSymbol name="meeting_room" size={14} className="mr-1.5" />
              Sand Room
            </Badge>
          );
        case 'status':
          return workOrder.status === "New" ? (
            <Badge variant="default">Open</Badge>
          ) : workOrder.status === "Upcoming" ? (
            <Badge tonal="science">New</Badge>
          ) : getStatusTonal(workOrder.status) ? (
            <Badge tonal={getStatusTonal(workOrder.status)}>
              {workOrder.status}
            </Badge>
          ) : (
            <Badge variant="default">{workOrder.status}</Badge>
          );
        case 'date':
          return workOrder.created;
        case 'time':
          return "All Day";
        case 'company':
          return "Starbucks";
        case 'type':
          return "Common Area";
        case 'property':
          return <span className="max-w-[150px] truncate block">{workOrder.property}</span>;
        case 'floor':
          return "4";
        default:
          return null;
      }
    }
    
    // Work order columns
    switch (column) {
      case 'id':
        return <span className="font-normal text-semantic-text-interaction-default underline">{workOrder.id}</span>;
      case 'title':
        return (
          <div className="flex items-center gap-2">
            <MaterialSymbol name={workOrder.icon} size={18} className="text-muted-foreground" />
            {workOrder.title}
          </div>
        );
      case 'category':
        return "type" in workOrder && workOrder.type ? workOrder.type : workOrder.category;
      case 'priority':
        return (
          <Badge tonal={getPriorityTonal(workOrder.priority)}>
            {workOrder.priority}
          </Badge>
        );
      case 'status':
        return getStatusTonal(workOrder.status) ? (
          <Badge tonal={getStatusTonal(workOrder.status)}>
            {workOrder.status}
          </Badge>
        ) : (
          <Badge variant="default">{workOrder.status}</Badge>
        );
      case 'assignee':
        return "John Doe";
      case 'created':
        return workOrder.created;
      case 'property':
        return <span className="max-w-[150px] truncate block">{workOrder.property}</span>;
      default:
        return null;
    }
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current && !resizingColumn) {
      const element = scrollContainerRef.current;
      element.scrollTop += e.deltaY;
      element.scrollLeft += e.deltaX;
    }
  };

  return (
    <div className="rounded-md border flex flex-col h-full overflow-hidden">
      <div 
        ref={scrollContainerRef}
        className="overflow-auto flex-1 bg-background"
        onWheel={handleWheel}
      >
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              {columnOrder.map((column) => {
                const config = columnConfig[column];
                const direction = sortState[column];
                const isDragging = draggedColumn === column;
                const isDragOver = dragOverColumn === column;
                
                const width = columnWidths[column] || config.defaultWidth || 150;
                return (
                  <TableHead
                    key={column}
                    style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
                    className={`cursor-pointer hover:bg-muted/50 select-none transition-all ${config.className || ''} ${isDragging ? 'opacity-50' : ''} ${isDragOver ? 'bg-muted border-l-2 border-primary' : ''} relative`}
                    onClick={() => onSort(column)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, column)}
                    onDragOver={(e) => handleDragOver(e, column)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-center gap-1 pr-2">
                      <MaterialSymbol name="drag_indicator" size={14} className="text-muted-foreground opacity-50 hover:opacity-100" />
                      <span>{config.label}</span>
                      {direction && (
                        <MaterialSymbol 
                          name={direction === 'asc' ? 'arrow_upward' : 'arrow_downward'} 
                          size={14} 
                        />
                      )}
                    </div>
                    <div
                      className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-primary/50 z-30"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleResizeStart(e, column);
                      }}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  </TableHead>
                );
              })}
              <TableHead className="w-[50px] sticky right-0 bg-background z-20 border-l">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MaterialSymbol name="settings" size={18} />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {paginatedWorkOrders.map((workOrder, index) => {
                const isReservationRowClickable = activePage === "Upcoming reservations" && onReservationRowClick;
                const isVisitorRowClickable = activePage === "Upcoming visits" && onVisitorRowClick;
                const isWorkOrderClickable = activePage !== "Upcoming visits" && !isReservationRowClickable;
                const isRowClickable = isReservationRowClickable || isVisitorRowClickable || isWorkOrderClickable;
                
                return (
                  <TableRow 
                    key={workOrder.id}
                    className={isRowClickable ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button')) return;
                      if (isReservationRowClickable) {
                        onReservationRowClick?.(workOrder);
                      } else if (isVisitorRowClickable) {
                        onVisitorRowClick?.(workOrder);
                      } else if (isWorkOrderClickable) {
                        router.push(`/dashboard/work-orders/${workOrder.id}`);
                      }
                    }}
                  >
                    {columnOrder.map((column) => {
                      const width = columnWidths[column] || columnConfig[column]?.defaultWidth || 150;
                      return (
                        <TableCell key={column} style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}>
                          {renderCellContent(column, workOrder, startIndex + index)}
                        </TableCell>
                      );
                    })}
                    <TableCell className="sticky right-0 bg-background z-10 border-l">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MaterialSymbol name="more_vert" size={18} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
      {/* Pagination Footer Bar */}
      <div className="border-t bg-background px-4 py-2 flex items-center justify-between sticky bottom-0">
        <div className="flex items-center gap-4">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <Label htmlFor="page-size" className="text-xs text-muted-foreground">
              Rows per page:
            </Label>
            <Select value={pageSize.toString()} onValueChange={(value) => {
              onPageSizeChange(Number(value));
              onPageChange(1); // Reset to first page when page size changes
            }}>
              <SelectTrigger id="page-size" className="w-[65px] h-7 text-xs px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Item Count */}
          <div className="text-xs text-muted-foreground">
            {startItem}-{endItem} of {totalItems}
          </div>
        </div>
        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => onPageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

// Multi-select filter component with count badge
interface MultiSelectFilterProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  starred?: boolean;
  onStarToggle?: () => void;
  showStar?: boolean;
}

// Grouped Combobox component for issue types
function GroupedCombobox({
  options,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  hasError,
}: {
  options: Array<{ value: string; label: string; group: string }>;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Group options by category
  const groupedOptions = options.reduce((acc, option) => {
    const group = option.group || "Other";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(option);
    return acc;
  }, {} as Record<string, typeof options>);

  // Filter options based on search term
  const filteredGroups = Object.entries(groupedOptions).reduce((acc, [group, items]) => {
    const filtered = items.filter((item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[group] = filtered;
    }
    return acc;
  }, {} as Record<string, typeof options>);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={hasError ? true : undefined}
          className={`w-full justify-between ${hasError ? 'focus-visible:ring-destructive focus-visible:ring-destructive/50' : ''}`}
          style={hasError ? { borderColor: 'var(--color-semantic-stroke-rag-danger-default)', borderWidth: '1px' } : undefined}
        >
          <span className={selectedOption ? "" : "text-muted-foreground"}>
            {selectedOption ? selectedOption.label : placeholder || "Select..."}
          </span>
          <MaterialSymbol name="expand_more" size={16} className="ml-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0" 
        align="start" 
        sideOffset={4}
        style={{ 
          width: 'var(--radix-popover-trigger-width)',
          padding: 0,
          overflow: 'visible',
          maxHeight: 'none'
        }}
      >
        <div className="p-2 border-b">
          <div className="relative">
            <MaterialSymbol
              name="search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
            />
            <Input
              placeholder={searchPlaceholder || "Search..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-9 text-sm"
            />
          </div>
        </div>
        <div 
          ref={scrollContainerRef}
          className="scroll-container"
          style={{
            height: '140px',
            maxHeight: '140px',
            overflowY: 'scroll',
            overflowX: 'hidden',
            position: 'relative',
            display: 'block',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,0,0,0.2) transparent'
          }}
          onWheel={(e) => {
            if (scrollContainerRef.current) {
              const element = scrollContainerRef.current;
              element.scrollTop += e.deltaY;
              e.stopPropagation();
            }
          }}
        >
            {Object.keys(filteredGroups).length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyText || "No results found."}
              </div>
            ) : (
              Object.entries(filteredGroups).map(([group, items]) => (
                <div key={group}>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted sticky top-0 z-10 border-b">
                    {group}
                  </div>
                  {items.map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-muted ${
                        value === option.value ? "bg-muted" : ""
                      }`}
                      onClick={() => {
                        onValueChange(option.value);
                        setOpen(false);
                        setSearchTerm("");
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              ))
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MultiSelectFilter({
  label,
  options,
  selected,
  onSelectionChange,
  starred = false,
  onStarToggle,
  showStar = true,
}: MultiSelectFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort options: selected items first, then unselected, maintaining original order within each group
  const sortedOptions = [...filteredOptions].sort((a, b) => {
    const aSelected = selected.includes(a.value);
    const bSelected = selected.includes(b.value);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onSelectionChange(selected.filter((v) => v !== value));
    } else {
      onSelectionChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        {showStar && onStarToggle && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onStarToggle}
          >
            <MaterialSymbol
              name="star"
              size={18}
              fill={starred ? 1 : 0}
            />
          </Button>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex-1 justify-between">
              <span className="truncate">{label}</span>
              <div className="flex items-center gap-2">
                {selected.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                    {selected.length}
                  </Badge>
                )}
                <MaterialSymbol name="expand_more" size={18} />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-2 z-[100]" align="start">
            <div className="space-y-2">
              <div className="relative">
                <MaterialSymbol
                  name="search"
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
                />
                <Input
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-9 text-sm"
                />
              </div>
              {/* Selected items as badges */}
              {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-2 border-b">
                  {selected.map((value) => {
                    const optionLabel = options.find((o) => o.value === value)?.label || value;
                    return (
                      <Badge
                        key={value}
                        variant="secondary"
                        className="gap-1 cursor-pointer hover:bg-destructive/20"
                        onClick={() => toggleOption(value)}
                      >
                        {optionLabel}
                        <MaterialSymbol name="close" size={12} />
                      </Badge>
                    );
                  })}
                </div>
              )}
              <div className="max-h-[200px] overflow-y-auto space-y-1">
                {sortedOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">No results found</p>
                ) : (
                  sortedOptions.map((option) => {
                    const isSelected = selected.includes(option.value);
                    return (
                      <div
                        key={option.value}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer ${isSelected ? 'bg-muted/50' : ''}`}
                        onClick={() => toggleOption(option.value)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOption(option.value)}
                        />
                        <span className="text-sm">{option.label}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

// Date Range Filter component
function DateRangeFilter({
  label,
  starred = false,
  onStarToggle,
  showStar = true,
  starDisabled = false,
  value,
  onChange,
}: {
  label: string;
  starred?: boolean;
  onStarToggle?: () => void;
  showStar?: boolean;
  starDisabled?: boolean;
  value?: { start: string; end: string };
  onChange?: (range: { start: string; end: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(value?.start || "");
  const [endDate, setEndDate] = useState(value?.end || "");
  
  // Update local state when value prop changes
  useEffect(() => {
    if (value) {
      setStartDate(value.start);
      setEndDate(value.end);
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        {showStar && onStarToggle && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onStarToggle}
            disabled={starDisabled}
          >
            <MaterialSymbol
              name="star"
              size={18}
              fill={starred ? 1 : 0}
            />
          </Button>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex-1 justify-between">
              <span className="truncate">
                {startDate && endDate
                  ? `${new Date(startDate).toLocaleDateString('en-US')} - ${new Date(endDate).toLocaleDateString('en-US')}`
                  : label}
              </span>
              <MaterialSymbol name="calendar_today" size={18} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${label}-start`} className="text-xs">Start Date</Label>
                <Input
                  id={`${label}-start`}
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (onChange) {
                      onChange({ start: e.target.value, end: endDate });
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${label}-end`} className="text-xs">End Date</Label>
                <Input
                  id={`${label}-end`}
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (onChange) {
                      onChange({ start: startDate, end: e.target.value });
                    }
                  }}
                />
              </div>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => {
                  if (onChange) {
                    onChange({ start: startDate, end: endDate });
                  }
                  setOpen(false);
                }}
              >
                Done
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

// Compact Date Range for toolbar
function CompactDateRange({
  label,
  width = "w-40",
  value,
  onChange,
}: {
  label: string;
  width?: string;
  value?: { start: string; end: string };
  onChange?: (range: { start: string; end: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(value?.start || "");
  const [endDate, setEndDate] = useState(value?.end || "");
  
  // Update local state when value prop changes
  useEffect(() => {
    if (value) {
      setStartDate(value.start);
      setEndDate(value.end);
    }
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`${width} justify-between`}>
          <span className="truncate text-sm">
            {startDate && endDate
              ? `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : label}
          </span>
          <MaterialSymbol name="calendar_today" size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${label}-start-compact`} className="text-xs">Start Date</Label>
            <Input
              id={`${label}-start-compact`}
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (onChange) {
                  onChange({ start: e.target.value, end: endDate });
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${label}-end-compact`} className="text-xs">End Date</Label>
            <Input
              id={`${label}-end-compact`}
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                if (onChange) {
                  onChange({ start: startDate, end: e.target.value });
                }
              }}
            />
          </div>
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => {
              if (onChange) {
                onChange({ start: startDate, end: endDate });
              }
              setOpen(false);
            }}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Time Range Filter component
function TimeRangeFilter({
  label,
  starred = false,
  onStarToggle,
  showStar = true,
  starDisabled = false,
  value,
  onChange,
}: {
  label: string;
  starred?: boolean;
  onStarToggle?: () => void;
  showStar?: boolean;
  starDisabled?: boolean;
  value?: { start: string; end: string };
  onChange?: (range: { start: string; end: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [startTime, setStartTime] = useState(value?.start || "");
  const [endTime, setEndTime] = useState(value?.end || "");
  
  // Update local state when value prop changes
  useEffect(() => {
    if (value) {
      setStartTime(value.start);
      setEndTime(value.end);
    }
  }, [value]);

  const formatTimeUS = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        {showStar && onStarToggle && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onStarToggle}
            disabled={starDisabled}
          >
            <MaterialSymbol
              name="star"
              size={18}
              fill={starred ? 1 : 0}
            />
          </Button>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex-1 justify-between min-w-0">
              <span className="truncate min-w-0">
                {startTime && endTime
                  ? `${formatTimeUS(startTime)} - ${formatTimeUS(endTime)}`
                  : label}
              </span>
              <MaterialSymbol name="schedule" size={18} className="shrink-0 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${label}-start`} className="text-xs">Start Time</Label>
                <Input
                  id={`${label}-start`}
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    if (onChange) {
                      onChange({ start: e.target.value, end: endTime });
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${label}-end`} className="text-xs">End Time</Label>
                <Input
                  id={`${label}-end`}
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    if (onChange) {
                      onChange({ start: startTime, end: e.target.value });
                    }
                  }}
                />
              </div>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => {
                  if (onChange) {
                    onChange({ start: startTime, end: endTime });
                  }
                  setOpen(false);
                }}
              >
                Done
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

// Compact Time Range for toolbar
function CompactTimeRange({
  label,
  width = "w-40",
  value,
  onChange,
}: {
  label: string;
  width?: string;
  value?: { start: string; end: string };
  onChange?: (range: { start: string; end: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [startTime, setStartTime] = useState(value?.start || "");
  const [endTime, setEndTime] = useState(value?.end || "");
  
  // Update local state when value prop changes
  useEffect(() => {
    if (value) {
      setStartTime(value.start);
      setEndTime(value.end);
    }
  }, [value]);

  const formatTimeUS = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`${width} justify-between min-w-0`}>
          <span className="truncate text-sm min-w-0 flex-1 text-left">
            {startTime && endTime
              ? `${formatTimeUS(startTime)} - ${formatTimeUS(endTime)}`
              : label}
          </span>
          <MaterialSymbol name="schedule" size={16} className="shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${label}-start-compact`} className="text-xs">Start Time</Label>
            <Input
              id={`${label}-start-compact`}
              type="time"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                if (onChange) {
                  onChange({ start: e.target.value, end: endTime });
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${label}-end-compact`} className="text-xs">End Time</Label>
            <Input
              id={`${label}-end-compact`}
              type="time"
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                if (onChange) {
                  onChange({ start: startTime, end: e.target.value });
                }
              }}
            />
          </div>
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => {
              if (onChange) {
                onChange({ start: startTime, end: endTime });
              }
              setOpen(false);
            }}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Switch Filter component
function SwitchFilter({
  label,
  starred = false,
  onStarToggle,
  showStar = true,
  starDisabled = false,
  value,
  onChange,
  compact = false,
}: {
  label: string;
  starred?: boolean;
  onStarToggle?: () => void;
  showStar?: boolean;
  starDisabled?: boolean;
  value?: boolean;
  onChange?: (checked: boolean) => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <Label>{label}</Label>
      <div className={`flex items-center ${compact ? "gap-1.5" : "gap-2"}`}>
        {showStar && onStarToggle && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onStarToggle}
            disabled={starDisabled}
          >
            <MaterialSymbol
              name="star"
              size={18}
              fill={starred ? 1 : 0}
            />
          </Button>
        )}
        <div className={`flex items-center gap-2 ${compact ? "" : "flex-1"}`}>
          <Switch
            checked={value || false}
            onCheckedChange={onChange}
          />
          {!compact && <span className="text-sm text-muted-foreground">{value ? "On" : "Off"}</span>}
        </div>
      </div>
    </div>
  );
}

// Compact Switch for toolbar
function CompactSwitch({
  label,
  width = "w-32",
  value,
  onChange,
  compact = false,
}: {
  label: string;
  width?: string;
  value?: boolean;
  onChange?: (checked: boolean) => void;
  compact?: boolean;
}) {
  return (
    <div className={`${width} flex items-center ${compact ? "gap-1.5" : "gap-2"}`}>
      <Label className="text-sm whitespace-nowrap">{label}</Label>
      <Switch
        checked={value || false}
        onCheckedChange={onChange}
      />
    </div>
  );
}

// Compact multi-select for toolbar (starred filters)
function CompactMultiSelect({
  label,
  options,
  selected,
  onSelectionChange,
  width = "w-36",
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  width?: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort options: selected items first, then unselected, maintaining original order within each group
  const sortedOptions = [...filteredOptions].sort((a, b) => {
    const aSelected = selected.includes(a.value);
    const bSelected = selected.includes(b.value);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onSelectionChange(selected.filter((v) => v !== value));
    } else {
      onSelectionChange([...selected, value]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`${width} justify-between`}>
          <span className="truncate">{label}</span>
          <div className="flex items-center gap-1">
            {selected.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {selected.length}
              </Badge>
            )}
            <MaterialSymbol name="expand_more" size={16} />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-2" align="start">
        <div className="space-y-2">
          <div className="relative">
            <MaterialSymbol
              name="search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
            />
            <Input
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-9 text-sm"
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto space-y-1">
            {sortedOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">No results found</p>
            ) : (
              sortedOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
                  onClick={() => toggleOption(option.value)}
                >
                  <Checkbox
                    checked={selected.includes(option.value)}
                    onCheckedChange={() => toggleOption(option.value)}
                  />
                  <span className="text-sm">{option.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Order of validation fields per modal type – used to scroll to first/next error
const MODAL_ERROR_FIELD_ORDER: Record<string, string[]> = {
  "work-order": ["issueType", "details", "property", "floor", "company", "requestedFor"],
  visitor: ["visitorFirstName", "visitorLastName", "visitDateStart", "visitDateEnd", "visitTimeStart", "visitTimeEnd"],
  reservation: ["visitDateStart", "visitDateEnd", "visitTimeStart", "visitTimeEnd", "reservationDetails"],
};

type ActivePage = "Home" | "Tasks" | "Upcoming visits" | "Upcoming reservations" | "Create reservation";

function DashboardPage({
  initialActivePage,
  searchParams,
}: {
  initialActivePage: ActivePage;
  searchParams: ReturnType<typeof useSearchParams>;
}) {
  // Work orders list (tiles + table) – new entries added when Create work order succeeds
  const [workOrdersList, setWorkOrdersList] = useState<WorkOrderItem[]>(initialWorkOrders);
  const [lastCreatedWorkOrderId, setLastCreatedWorkOrderId] = useState<string | null>(null);

  // Modal state for Create Work Order
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"work-order" | "visitor" | "reservation">("work-order");
  const [isViewVisitorModalOpen, setIsViewVisitorModalOpen] = useState(false);
  const [selectedViewVisitorCreated, setSelectedViewVisitorCreated] = useState<string | null>(null);
  const [isViewReservationModalOpen, setIsViewReservationModalOpen] = useState(false);
  const [selectedReservationForView, setSelectedReservationForView] = useState<{
    roomName: string;
    reservationName: string;
    date: string;
    timeSlot: string;
    location: string;
    capacity: number;
    price: string;
  } | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<{
    roomName: string;
    date: string;
    timeSlot: string;
    location: string;
    capacity: number;
    price: string;
  } | null>(null);
  const [createAnother, setCreateAnother] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [details, setDetails] = useState("");
  const [reservationDetails, setReservationDetails] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const modalContentScrollRef = useRef<HTMLDivElement>(null);
  const [isEditDetailsMode, setIsEditDetailsMode] = useState(false);
  const [property, setProperty] = useState("1 Main St");
  const [floor, setFloor] = useState("Floor 1");
  const [company, setCompany] = useState("ABC Corp");
  const [requestedFor, setRequestedFor] = useState("John Doe");
  const [specificLocation, setSpecificLocation] = useState("");

  // Visitor form state
  const [visitorToggle, setVisitorToggle] = useState(false);
  const [visitorFirstName, setVisitorFirstName] = useState("");
  const [visitorLastName, setVisitorLastName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [visitDateStart, setVisitDateStart] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [visitDateEnd, setVisitDateEnd] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [visitTimeStart, setVisitTimeStart] = useState(() => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    return nextHour.toTimeString().slice(0, 5);
  });
  const [visitTimeEnd, setVisitTimeEnd] = useState(() => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 2, 0, 0, 0);
    return nextHour.toTimeString().slice(0, 5);
  });
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [timeRangeOpen, setTimeRangeOpen] = useState(false);

  // Active page state – driven by URL params passed from wrapper
  const [activePage, setActivePage] = useState<ActivePage>(initialActivePage);

  // Update activePage when URL params change
  useEffect(() => {
    const pageParam = searchParams.get("page");
    if (pageParam === "Home" || pageParam === "Tasks" || pageParam === "Upcoming visits" || pageParam === "Upcoming reservations" || pageParam === "Create reservation") {
      setActivePage(pageParam);
    }
  }, [searchParams]);

  // Theme state
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering theme UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // View state
  const [currentView, setCurrentView] = useState<"tile" | "calendar" | "table">("tile");

  // Reset view to tile when on Tasks page and calendar is selected
  useEffect(() => {
    if (activePage === "Tasks" && currentView === "calendar") {
      setCurrentView("tile");
    }
  }, [activePage, currentView]);

  // Set default starred filters for visitors page
  useEffect(() => {
    if (activePage === "Upcoming visits") {
      setStarredFilters(prev => ({
        ...prev,
        visitorStatus: true,
        visitDateRange: true,
      }));
    }
  }, [activePage]);
  
  // Set default starred filters for reservations pages
  useEffect(() => {
    if (activePage === "Upcoming reservations") {
      setStarredFilters(prev => ({
        ...prev,
        reservationProperty: true,
        resource: true,
        reservationDateRange: false,
      }));
      // Reset reservation date/time state so Clear all only shows when user has actually selected filters on this page
      setReservationDateRange({ start: "", end: "" });
      setReservationTimeRange({ start: "", end: "" });
      setReservationAllDay(false);
    } else if (activePage === "Create reservation") {
      // Set default date range to today's date
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      setReservationDateRange({ start: todayStr, end: todayStr });
      
      // Set default time range to next hour - +1 more hour
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);
      const nextHourStr = nextHour.toTimeString().slice(0, 5);
      const endHour = new Date(nextHour);
      endHour.setHours(endHour.getHours() + 1, 0, 0, 0);
      const endHourStr = endHour.toTimeString().slice(0, 5);
      setReservationTimeRange({ start: nextHourStr, end: endHourStr });
      
      setStarredFilters(prev => ({
        ...prev,
        reservationDateRange: true,
        reservationTimeRange: true,
        reservationAllDay: true,
        reservationProperty: false,
        resource: false,
      }));
    }
  }, [activePage]);

  // Sort state - tracks column and direction (asc/desc)
  // Start with no sort selected in UI, but data will default to newest created first
  const [selectedSorts, setSelectedSorts] = useState<Record<string, 'asc' | 'desc'>>({});
  const [sortPopoverOpen, setSortPopoverOpen] = useState(false);

  // Column order state for table drag-drop reordering
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    if (activePage === "Upcoming visits") {
      return defaultVisitorColumnOrder;
    } else if (activePage === "Upcoming reservations") {
      return defaultReservationColumnOrder;
    } else {
      return defaultColumnOrder;
    }
  });

  // Update column order when active page changes
  useEffect(() => {
    if (activePage === "Upcoming visits") {
      setColumnOrder(defaultVisitorColumnOrder);
    } else if (activePage === "Upcoming reservations") {
      setColumnOrder(defaultReservationColumnOrder);
    } else {
      setColumnOrder(defaultColumnOrder);
    }
  }, [activePage]);

  // Scroll modal to first validation error (and to next when previous is resolved)
  useEffect(() => {
    if (!isCreateModalOpen || !modalContentScrollRef.current) return;
    const errorKeys = Object.keys(validationErrors).filter((k) => validationErrors[k]);
    if (errorKeys.length === 0) return;
    const order = MODAL_ERROR_FIELD_ORDER[modalType] ?? [];
    const firstErrorKey = order.find((key) => validationErrors[key]);
    if (!firstErrorKey) return;
    // Map paired fields (e.g. visitDateEnd) to same scroll target as first in pair (visitDateStart)
    const scrollKey = firstErrorKey === "visitDateEnd" ? "visitDateStart" : firstErrorKey === "visitTimeEnd" ? "visitTimeStart" : firstErrorKey;
    const el = modalContentScrollRef.current.querySelector(`[data-validation-field="${scrollKey}"]`);
    if (el) {
      const timer = setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isCreateModalOpen, modalType, validationErrors]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sidebar group collapse state
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
    // Default: empty object (all groups closed)
    return {};
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

  // Reset modal to default state
  const resetModalToDefault = () => {
    setIsEditDetailsMode(false);
    setProperty("1 Main St");
    setFloor("Floor 1");
    setCompany("ABC Corp");
    setRequestedFor("John Doe");
    setSpecificLocation("");
    setIssueType("");
    setDetails("");
    setReservationDetails("");
    setValidationErrors({});
    setCreateAnother(false);
    setVisitorToggle(false);
    setVisitorFirstName("");
    setVisitorLastName("");
    setVisitorEmail("");
    setVisitorPhone("");
    setAllDay(false);
    setSelectedReservation(null);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    setVisitDateStart(todayStr);
    setVisitDateEnd(todayStr);
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    const nextHourStr = nextHour.toTimeString().slice(0, 5);
    setVisitTimeStart(nextHourStr);
    const endHour = new Date(nextHour);
    endHour.setHours(endHour.getHours() + 1, 0, 0, 0);
    setVisitTimeEnd(endHour.toTimeString().slice(0, 5));
    setDateRangeOpen(false);
    setTimeRangeOpen(false);
  };

  // Filter state - multi-select values
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedPropertyGroups, setSelectedPropertyGroups] = useState<string[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [selectedFloors, setSelectedFloors] = useState<string[]>([]);
  
  // Visitor filter state
  const [selectedVisitorTypes, setSelectedVisitorTypes] = useState<string[]>([]);
  const [selectedPremierAccess, setSelectedPremierAccess] = useState<string[]>([]);
  const [selectedVisitorStatuses, setSelectedVisitorStatuses] = useState<string[]>([]);
  const [selectedVisitorPropertyStatuses, setSelectedVisitorPropertyStatuses] = useState<string[]>([]);
  const [selectedVendorCompanies, setSelectedVendorCompanies] = useState<string[]>([]);
  const [selectedCompaniesVisiting, setSelectedCompaniesVisiting] = useState<string[]>([]);
  const [selectedRequestedFor, setSelectedRequestedFor] = useState<string[]>([]);
  const [selectedCreatedBy, setSelectedCreatedBy] = useState<string[]>([]);
  
  // Visitor date range state
  const [visitDateRange, setVisitDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [checkInDateRange, setCheckInDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [checkOutDateRange, setCheckOutDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [createdDateRange, setCreatedDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  
  // Reservation filter state
  const [selectedReservationProperties, setSelectedReservationProperties] = useState<string[]>([]);
  const [selectedReservationFloors, setSelectedReservationFloors] = useState<string[]>([]);
  const [selectedManagementCompanies, setSelectedManagementCompanies] = useState<string[]>([]);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [selectedReservationRegions, setSelectedReservationRegions] = useState<string[]>([]);
  const [selectedReservationCreatedBy, setSelectedReservationCreatedBy] = useState<string[]>([]);
  const [selectedReservationStatuses, setSelectedReservationStatuses] = useState<string[]>([]);
  const [selectedReservationTypes, setSelectedReservationTypes] = useState<string[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [selectedCapacityUnits, setSelectedCapacityUnits] = useState<string[]>([]);
  const [selectedCapacities, setSelectedCapacities] = useState<string[]>([]);
  const [selectedReservationCompanies, setSelectedReservationCompanies] = useState<string[]>([]);
  const [reservationDateRange, setReservationDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [reservationAllDay, setReservationAllDay] = useState(false);
  const [reservationTimeRange, setReservationTimeRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);

  // Filter options
  const statusOptions = [
    { value: "open", label: "Open" },
    { value: "in-progress", label: "In Progress" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "closed", label: "Closed" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  const categoryOptions = [
    { value: "electrical", label: "Electrical" },
    { value: "mechanical", label: "Mechanical" },
    { value: "plumbing", label: "Plumbing" },
    { value: "hvac", label: "HVAC" },
    { value: "general", label: "General Maintenance" },
  ];

  const assigneeOptions = [
    { value: "john-doe", label: "John Doe" },
    { value: "sarah-chen", label: "Sarah Chen" },
    { value: "mike-johnson", label: "Mike Johnson" },
    { value: "unassigned", label: "Unassigned" },
  ];

  const propertyGroupOptions = [
    { value: "commercial", label: "Commercial" },
    { value: "residential", label: "Residential" },
    { value: "industrial", label: "Industrial" },
  ];

  const propertyOptions = [
    { value: "1 Main St", label: "1 Main St" },
    { value: "2 Park Ave", label: "2 Park Ave" },
    { value: "3 Broadway", label: "3 Broadway" },
    { value: "4 Fifth Ave", label: "4 Fifth Ave" },
  ];

  const regionOptions = [
    { value: "northeast", label: "Northeast" },
    { value: "southeast", label: "Southeast" },
    { value: "midwest", label: "Midwest" },
    { value: "west", label: "West" },
  ];

  const buildingOptions = [
    { value: "tower-a", label: "Tower A" },
    { value: "tower-b", label: "Tower B" },
    { value: "annex", label: "Annex" },
  ];

  const floorOptions = [
    { value: "Floor 1", label: "Floor 1" },
    { value: "Floor 2", label: "Floor 2" },
    { value: "Floor 3", label: "Floor 3" },
    { value: "Floor 4", label: "Floor 4" },
    { value: "Basement", label: "Basement" },
    { value: "Ground Floor", label: "Ground Floor" },
  ];

  // Visitor filter options
  const visitorTypeOptions = [
    { value: "contractor", label: "Contractor" },
    { value: "vendor", label: "Vendor" },
    { value: "guest", label: "Guest" },
    { value: "employee", label: "Employee" },
  ];

  const premierAccessOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  const visitorStatusOptions = [
    { value: "scheduled", label: "Scheduled" },
    { value: "checked-in", label: "Checked In" },
    { value: "checked-out", label: "Checked Out" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const visitorPropertyStatusOptions = [
    { value: "first-visit", label: "First Visit" },
    { value: "returning", label: "Returning" },
    { value: "frequent", label: "Frequent" },
  ];

  const vendorCompanyOptions = [
    { value: "acme-corp", label: "ACME Corp" },
    { value: "tech-solutions", label: "Tech Solutions" },
    { value: "maintenance-plus", label: "Maintenance Plus" },
  ];

  const companyVisitingOptions = [
    { value: "starbucks", label: "Starbucks" },
    { value: "abc-corp", label: "ABC Corp" },
    { value: "xyz-inc", label: "XYZ Inc" },
  ];

  const requestedForOptions = [
    { value: "john-doe", label: "John Doe" },
    { value: "jane-smith", label: "Jane Smith" },
    { value: "bob-wilson", label: "Bob Wilson" },
  ];

  const createdByOptions = [
    { value: "admin", label: "Admin" },
    { value: "reception", label: "Reception" },
    { value: "security", label: "Security" },
  ];
  
  // Reservation filter options
  const reservationPropertyOptions = [
    { value: "1-main-st", label: "1 Main St" },
    { value: "2-park-ave", label: "2 Park Ave" },
    { value: "3-broadway", label: "3 Broadway" },
    { value: "4-fifth-ave", label: "4 Fifth Ave" },
  ];
  
  const reservationFloorOptions = [
    { value: "floor-1", label: "Floor 1" },
    { value: "floor-2", label: "Floor 2" },
    { value: "floor-3", label: "Floor 3" },
    { value: "floor-4", label: "Floor 4" },
    { value: "basement", label: "Basement" },
    { value: "ground-floor", label: "Ground Floor" },
  ];
  
  const managementCompanyOptions = [
    { value: "jll", label: "JLL" },
    { value: "cbre", label: "CBRE" },
    { value: "cushman-wakefield", label: "Cushman & Wakefield" },
    { value: "colliers", label: "Colliers" },
  ];
  
  const ownerOptions = [
    { value: "abc-corp", label: "ABC Corp" },
    { value: "xyz-inc", label: "XYZ Inc" },
    { value: "global-services", label: "Global Services" },
    { value: "tech-solutions", label: "Tech Solutions" },
  ];
  
  const reservationRegionOptions = [
    { value: "northeast", label: "Northeast" },
    { value: "southeast", label: "Southeast" },
    { value: "midwest", label: "Midwest" },
    { value: "west", label: "West" },
  ];
  
  const reservationCreatedByOptions = [
    { value: "admin", label: "Admin" },
    { value: "reception", label: "Reception" },
    { value: "security", label: "Security" },
    { value: "manager", label: "Manager" },
  ];
  
  const reservationStatusOptions = [
    { value: "confirmed", label: "Confirmed" },
    { value: "pending", label: "Pending" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" },
  ];
  
  const reservationTypeOptions = [
    { value: "meeting-room", label: "Meeting Room" },
    { value: "common-area", label: "Common Area" },
    { value: "event-space", label: "Event Space" },
    { value: "parking", label: "Parking" },
  ];
  
  const resourceOptions = [
    { value: "sand-room", label: "Sand Room" },
    { value: "sky-room", label: "Sky Room" },
    { value: "ocean-room", label: "Ocean Room" },
    { value: "forest-room", label: "Forest Room" },
  ];
  
  const capacityUnitOptions = [
    { value: "people", label: "People" },
    { value: "vehicles", label: "Vehicles" },
    { value: "square-feet", label: "Square Feet" },
  ];
  
  const capacityOptions = [
    { value: "1-10", label: "1-10" },
    { value: "11-25", label: "11-25" },
    { value: "26-50", label: "26-50" },
    { value: "51-100", label: "51-100" },
    { value: "100+", label: "100+" },
  ];
  
  const reservationCompanyOptions = [
    { value: "starbucks", label: "Starbucks" },
    { value: "abc-corp", label: "ABC Corp" },
    { value: "xyz-inc", label: "XYZ Inc" },
    { value: "tech-solutions", label: "Tech Solutions" },
  ];
  
  const durationOptions = [
    { value: "15-min", label: "15 minutes" },
    { value: "30-min", label: "30 minutes" },
    { value: "1-hour", label: "1 hour" },
    { value: "2-hours", label: "2 hours" },
    { value: "4-hours", label: "4 hours" },
    { value: "8-hours", label: "8 hours" },
    { value: "all-day", label: "All day" },
  ];

  // Sort options linked to table columns
  const sortOptions = tableColumns
    .filter((col) => col.sortable)
    .map((col) => ({ value: col.key, label: col.label }));

  // Form dropdown options
  const companyOptions = [
    { value: "ABC Corp", label: "ABC Corp" },
    { value: "XYZ Industries", label: "XYZ Industries" },
    { value: "Tech Solutions Inc", label: "Tech Solutions Inc" },
    { value: "Global Services", label: "Global Services" },
  ];

  const requestedForFormOptions = [
    { value: "John Doe", label: "John Doe" },
    { value: "Jane Smith", label: "Jane Smith" },
    { value: "Bob Johnson", label: "Bob Johnson" },
    { value: "Alice Williams", label: "Alice Williams" },
  ];

  // Issue type options for Combobox - grouped by category
  const issueTypeOptions = [
    { value: "cleaning-after-hours", label: "Cleaning - After Hours", group: "Cleaning" },
    { value: "cleaning-janitorial", label: "Cleaning / Janitorial", group: "Cleaning" },
    { value: "trash-removal", label: "Trash Removal", group: "Cleaning" },
    { value: "electrical-general", label: "Electrical (General)", group: "Electrical" },
    { value: "lighting", label: "Lighting", group: "Electrical" },
    { value: "irrigation-leak", label: "Irrigation Leak", group: "Exterior" },
    { value: "landscaping", label: "Landscaping", group: "Exterior" },
    { value: "parking", label: "Parking", group: "Exterior" },
    { value: "snow-ice-removal", label: "Snow / Ice Removal", group: "Exterior" },
    { value: "hvac-general", label: "HVAC (General)", group: "HVAC" },
    { value: "hvac-too-cold", label: "HVAC - Too Cold", group: "HVAC" },
    { value: "hvac-too-hot", label: "HVAC - Too Hot", group: "HVAC" },
    { value: "hvac-overtime", label: "HVAC - Overtime", group: "HVAC" },
    { value: "doors", label: "Doors", group: "Keys & Locks" },
    { value: "keys-and-locks", label: "Keys and Locks", group: "Keys & Locks" },
    { value: "window-plate-glass", label: "Window / Plate Glass", group: "Keys & Locks" },
    { value: "ceiling", label: "Ceiling", group: "Maintenance" },
    { value: "elevator", label: "Elevator", group: "Maintenance" },
    { value: "elevator-escalator", label: "Elevator / Escalator", group: "Maintenance" },
    { value: "maintenance", label: "Maintenance", group: "Maintenance" },
    { value: "access-card", label: "Access Card", group: "Plumbing" },
    { value: "plumbing-leak", label: "Plumbing / Leak", group: "Plumbing" },
    { value: "roof-leak", label: "Roof Leak", group: "Plumbing" },
    { value: "fire-protection", label: "Fire Protection", group: "Safety" },
    { value: "security", label: "Security", group: "Safety" },
    { value: "vendor-escort", label: "Vendor Escort", group: "Safety" },
    { value: "medical-equipment", label: "Medical Equipment", group: "Other" },
    { value: "miscellaneous", label: "Miscellaneous", group: "Other" },
    { value: "pest-control", label: "Pest Control", group: "Other" },
    { value: "signage", label: "Signage", group: "Other" },
    { value: "stairwell", label: "Stairwell", group: "Other" },
  ];

  // Icon per issue type group for new work order tiles
  const issueTypeGroupIcon: Record<string, string> = {
    Cleaning: "cleaning_services",
    Electrical: "electrical_services",
    Exterior: "yard",
    HVAC: "hvac",
    "Keys & Locks": "key",
    Maintenance: "handyman",
    Plumbing: "plumbing",
    Safety: "shield",
    Other: "construction",
  };

  // Starred filters - Property Group and Property are defaults for work orders, Properties and Resource for reservations
  const [starredFilters, setStarredFilters] = useState({
    propertyGroup: true,
    property: true,
    region: false,
    building: false,
    floor: false,
    status: false,
    priority: false,
    category: false,
    assignee: false,
    dateRange: false,
    // Visitor filters
    visitorType: false,
    premierAccess: false,
    visitorStatus: false,
    visitorPropertyStatus: false,
    visitDateRange: false,
    checkInDateRange: false,
    checkOutDateRange: false,
    vendorCompany: false,
    companyVisiting: false,
    requestedFor: false,
    createdBy: false,
    createdDateRange: false,
    // Reservation filters
    reservationProperty: false,
    reservationFloor: false,
    managementCompany: false,
    owner: false,
    reservationRegion: false,
    reservationCreatedBy: false,
    reservationStatus: false,
    reservationType: false,
    resource: false,
    capacityUnits: false,
    capacity: false,
    reservationCompany: false,
    reservationDateRange: false,
    reservationAllDay: false,
    reservationTimeRange: false,
    reservationDuration: false,
  });

  const toggleStar = (filterKey: keyof typeof starredFilters) => {
    setStarredFilters((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  // Clear all sorts
  const clearSorts = () => {
    setSelectedSorts({});
  };

  // Get sort count
  const sortCount = Object.keys(selectedSorts).length;

  // Check if any filter has selections
  const hasAnyFilterSelected = activePage === "Upcoming visits" ? (
    selectedVisitorTypes.length > 0 ||
    selectedPremierAccess.length > 0 ||
    selectedVisitorStatuses.length > 0 ||
    selectedVisitorPropertyStatuses.length > 0 ||
    selectedVendorCompanies.length > 0 ||
    selectedCompaniesVisiting.length > 0 ||
    selectedRequestedFor.length > 0 ||
    selectedCreatedBy.length > 0 ||
    (visitDateRange.start && visitDateRange.end) ||
    (checkInDateRange.start && checkInDateRange.end) ||
    (checkOutDateRange.start && checkOutDateRange.end) ||
    (createdDateRange.start && createdDateRange.end)
  ) : activePage === "Upcoming reservations" ? (
    selectedReservationProperties.length > 0 ||
    selectedReservationFloors.length > 0 ||
    selectedManagementCompanies.length > 0 ||
    selectedOwners.length > 0 ||
    selectedReservationRegions.length > 0 ||
    selectedReservationCreatedBy.length > 0 ||
    selectedReservationStatuses.length > 0 ||
    selectedReservationTypes.length > 0 ||
    selectedResources.length > 0 ||
    selectedCapacityUnits.length > 0 ||
    selectedCapacities.length > 0 ||
    selectedReservationCompanies.length > 0 ||
    (reservationDateRange.start && reservationDateRange.end)
  ) : activePage === "Create reservation" ? (
    selectedReservationProperties.length > 0 ||
    selectedReservationFloors.length > 0 ||
    (reservationDateRange.start && reservationDateRange.end) ||
    reservationAllDay ||
    (reservationTimeRange.start && reservationTimeRange.end) ||
    selectedDurations.length > 0 ||
    selectedReservationTypes.length > 0 ||
    selectedResources.length > 0 ||
    selectedCapacityUnits.length > 0 ||
    selectedCapacities.length > 0
  ) : (
    selectedStatuses.length > 0 ||
    selectedPriorities.length > 0 ||
    selectedCategories.length > 0 ||
    selectedAssignees.length > 0 ||
    selectedPropertyGroups.length > 0 ||
    selectedProperties.length > 0 ||
    selectedRegions.length > 0 ||
    selectedBuildings.length > 0 ||
    selectedFloors.length > 0
  );

  // For Create reservation, check if any additional filters (excluding date, all day, time) are selected
  const hasAnyAdditionalFilterSelected = activePage === "Create reservation" ? (
    selectedReservationProperties.length > 0 ||
    selectedReservationFloors.length > 0 ||
    selectedDurations.length > 0 ||
    selectedReservationTypes.length > 0 ||
    selectedResources.length > 0 ||
    selectedCapacityUnits.length > 0 ||
    selectedCapacities.length > 0
  ) : hasAnyFilterSelected;

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSelectedCategories([]);
    setSelectedAssignees([]);
    setSelectedPropertyGroups([]);
    setSelectedProperties([]);
    setSelectedRegions([]);
    setSelectedBuildings([]);
    setSelectedFloors([]);
    // Visitor filters
    setSelectedVisitorTypes([]);
    setSelectedPremierAccess([]);
    setSelectedVisitorStatuses([]);
    setSelectedVisitorPropertyStatuses([]);
    setSelectedVendorCompanies([]);
    setSelectedCompaniesVisiting([]);
    setSelectedRequestedFor([]);
    setSelectedCreatedBy([]);
    // Clear date ranges
    setVisitDateRange({ start: "", end: "" });
    setCheckInDateRange({ start: "", end: "" });
    setCheckOutDateRange({ start: "", end: "" });
    setCreatedDateRange({ start: "", end: "" });
    // Reservation filters
    setSelectedReservationProperties([]);
    setSelectedReservationFloors([]);
    setSelectedManagementCompanies([]);
    setSelectedOwners([]);
    setSelectedReservationRegions([]);
    setSelectedReservationCreatedBy([]);
    setSelectedReservationStatuses([]);
    setSelectedReservationTypes([]);
    setSelectedResources([]);
    setSelectedCapacityUnits([]);
    setSelectedCapacities([]);
    setSelectedReservationCompanies([]);
    setSelectedDurations([]);
    
    // For Create reservation page, preserve date, all day, and time filters (don't clear them)
    if (activePage !== "Create reservation") {
      setReservationDateRange({ start: "", end: "" });
      setReservationAllDay(false);
      setReservationTimeRange({ start: "", end: "" });
    }
    // If on Create reservation page, date, all day, and time filters are preserved (not cleared)
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedStatuses,
    selectedPriorities,
    selectedCategories,
    selectedAssignees,
    selectedPropertyGroups,
    selectedProperties,
    selectedRegions,
    selectedBuildings,
    selectedFloors,
    selectedVisitorTypes,
    selectedPremierAccess,
    selectedVisitorStatuses,
    selectedVisitorPropertyStatuses,
    selectedVendorCompanies,
    selectedCompaniesVisiting,
    selectedRequestedFor,
    selectedCreatedBy,
    selectedReservationProperties,
    selectedReservationFloors,
    selectedManagementCompanies,
    selectedOwners,
    selectedReservationRegions,
    selectedReservationCreatedBy,
    selectedReservationStatuses,
    selectedReservationTypes,
    selectedResources,
    selectedCapacityUnits,
    selectedCapacities,
    selectedReservationCompanies,
    reservationDateRange,
    reservationAllDay,
    reservationTimeRange,
    selectedDurations,
    selectedSorts
  ]);

  // Toggle sort option: none -> asc -> desc -> none
  const toggleSort = (value: string) => {
    setSelectedSorts((prev) => {
      const currentDirection = prev[value];
      if (!currentDirection) {
        // Not sorted -> Ascending
        return { ...prev, [value]: 'asc' };
      } else if (currentDirection === 'asc') {
        // Ascending -> Descending
        return { ...prev, [value]: 'desc' };
      } else {
        // Descending -> Remove
        const { [value]: _, ...rest } = prev;
        return rest;
      }
    });
  };

  // Filter and sort work orders
  const filteredAndSortedWorkOrders = (() => {
    let result = [...workOrdersList];
    
    // For visitor page, show only 2 cards
    if (activePage === "Upcoming visits") {
      result = result.slice(0, 2);
    }
    // For reservations page, show only 1 card
    if (activePage === "Upcoming reservations") {
      result = result.slice(0, 1);
    }
    // For create reservation page, show only 1 card
    if (activePage === "Create reservation") {
      // Show only Sand and Sky Room tiles
      result = result.slice(0, 2);
    }

    // Apply filters
    if (selectedStatuses.length > 0) {
      result = result.filter((wo) =>
        selectedStatuses.some((s) => wo.status.toLowerCase().replace(/\s+/g, '-') === s)
      );
    }
    if (selectedPriorities.length > 0) {
      result = result.filter((wo) =>
        selectedPriorities.some((p) => wo.priority.toLowerCase() === p)
      );
    }
    if (selectedCategories.length > 0) {
      result = result.filter((wo) =>
        selectedCategories.some((c) => wo.category.toLowerCase() === c)
      );
    }
    if (selectedAssignees.length > 0) {
      result = result.filter((wo) =>
        selectedAssignees.some((a) => wo.assignee.toLowerCase().replace(/\s+/g, '-') === a)
      );
    }
    if (selectedProperties.length > 0) {
      result = result.filter((wo) => {
        const propValue = wo.property.toLowerCase().trim();
        // Normalize so filter option "1 Main St" matches tile/table property "1 Main Street"
        const propNorm = propValue
          .replace(/\bstreet\b/g, 'st')
          .replace(/\bavenue\b/g, 'ave')
          .replace(/\broadway\b/g, 'broadway');
        return selectedProperties.some((p) => {
          const filterNorm = p.toLowerCase().trim();
          return propNorm.includes(filterNorm) || propValue.includes(filterNorm);
        });
      });
    }

    // Helper function to parse date strings (MM/DD/YYYY format)
    const parseDate = (dateStr: string) => {
      const [month, day, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day).getTime();
    };

    // Apply sorting
    const sortEntries = Object.entries(selectedSorts);
    if (sortEntries.length > 0) {
      // User has selected a sort - apply only that sort
      result.sort((a, b) => {
        for (const [key, direction] of sortEntries) {
          const aValue = a[key as keyof typeof a];
          const bValue = b[key as keyof typeof b];
          
          let comparison = 0;
          
          // Handle date strings (MM/DD/YYYY format)
          if (key === 'created' && typeof aValue === 'string' && typeof bValue === 'string') {
            const aDate = parseDate(aValue);
            const bDate = parseDate(bValue);
            comparison = aDate - bDate;
          } else if (typeof aValue === 'string' && typeof bValue === 'string') {
            comparison = aValue.localeCompare(bValue);
          } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
          }
          
          if (comparison !== 0) {
            return direction === 'asc' ? comparison : -comparison;
          }
        }
        return 0;
      });
    } else {
      // Default sort: newest created first (when no sort is selected in UI)
      result.sort((a, b) => {
        const aValue = a.created;
        const bValue = b.created;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const aDate = parseDate(aValue);
          const bDate = parseDate(bValue);
          return bDate - aDate; // Descending (newest first)
        }
        return 0;
      });
    }

    return result;
  })();

  return (
    <>
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
              onClick={() => {
                setModalType("work-order");
                setIsCreateModalOpen(true);
              }}
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
                <DropdownMenuItem onClick={() => {
                  setModalType("work-order");
                  setIsCreateModalOpen(true);
                }}>
                  <MaterialSymbol name="add" size={16} className="mr-2" />
                  Create Work Order
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setModalType("visitor");
                  setIsCreateModalOpen(true);
                }}>
                  <MaterialSymbol name="add" size={16} className="mr-2" />
                  Create Visit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setCurrentView("tile");
                  setActivePage("Create reservation");
                }}>
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
            onClick={() => setActivePage("Tasks")}
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
                          const isActive = item.title === activePage;
                          return (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton
                                tooltip={item.title}
                                isActive={isActive}
                                className="cursor-pointer"
                                onClick={() => {
                                  if (item.title === "Home") {
                                    setActivePage("Home");
                                  }
                                }}
                              >
                                <MaterialSymbol 
                                  name={item.icon} 
                                  size={18} 
                                  weight={isActive ? 300 : undefined}
                                  fill={isActive ? 0 : undefined}
                                  className={isActive ? "text-semantic-icon-interaction-bright" : ""}
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
                                      const isActive = subItem.title === activePage || 
                                        (subItem.title === "Upcoming reservations" && activePage === "Create reservation");
                                      return (
                                      <SidebarMenuSubItem key={subItem.title}>
                                        <SidebarMenuSubButton 
                                          isActive={isActive}
                                          className="cursor-pointer"
                                          onClick={() => {
                                            if (subItem.title === "Tasks" || subItem.title === "Upcoming visits" || subItem.title === "Upcoming reservations") {
                                              setActivePage(subItem.title as "Tasks" | "Upcoming visits" | "Upcoming reservations");
                                            }
                                          }}
                                        >
                                          <MaterialSymbol 
                                            name={subItem.icon} 
                                            size={18} 
                                            weight={isActive ? 300 : undefined}
                                            fill={isActive ? 0 : undefined}
                                            className={isActive ? "text-semantic-icon-interaction-bright" : ""}
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
            {/* Breadcrumb for Create reservation page - Full width, hugging navs */}
            {activePage === "Create reservation" && (
              <div className="px-3 pt-1.5 pb-1.5 h-fit" style={{ backgroundColor: 'var(--color-semantic-surface-overlays-level1)' }}>
                <nav className="inline-flex items-center gap-2 px-0 py-1.5 rounded-md bg-secondary/80 text-xs">
                  <button 
                    onClick={() => setActivePage("Tasks")}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Home
                  </button>
                  <MaterialSymbol name="chevron_right" size={16} className="text-muted-foreground" />
                  <button 
                    onClick={() => setActivePage("Upcoming reservations")}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Upcoming reservations
                  </button>
                  <MaterialSymbol name="chevron_right" size={16} className="text-muted-foreground" />
                  <span className="text-foreground font-medium">Create reservation</span>
                </nav>
              </div>
            )}
            <main className="pt-6 px-6 pb-6 flex-1 flex flex-col overflow-y-auto min-h-0 bg-semantic-surface-overlays-level1">
              <div 
                key={activePage}
                className="flex-1 flex flex-col animate-in"
              >
                {/* Page Header */}
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-semibold text-foreground">
                    {activePage === "Home" ? "Home" : activePage === "Create reservation" ? "Create reservation" : activePage === "Upcoming visits" ? "Visitors" : activePage === "Upcoming reservations" ? "Resource Reservations" : "Work Orders"}
                  </h1>
                {activePage !== "Home" && (
                  activePage === "Create reservation" ? (
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="icon" onClick={() => setActivePage("Upcoming reservations")}>
                        <MaterialSymbol name="close" size={20} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button onClick={() => {
                        if (activePage === "Upcoming reservations") {
                          setCurrentView("tile");
                          setActivePage("Create reservation");
                        } else {
                          setModalType(activePage === "Upcoming visits" ? "visitor" : "work-order");
                          setIsCreateModalOpen(true);
                        }
                      }}>
                        <MaterialSymbol name="add" size={18} className="mr-2" />
                        {activePage === "Upcoming visits" ? "Create visitor" : activePage === "Upcoming reservations" ? "Create reservation" : "Create work order"}
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MaterialSymbol name="more_vert" size={20} />
                      </Button>
                    </div>
                  )
                )}
              </div>

              {/* Search and Actions Row - Hide for Home page */}
              {activePage !== "Home" && (
              <div className="flex items-center justify-between gap-4 mb-4">
                {/* Left: Search */}
                <div className="relative w-64">
                  <MaterialSymbol
                    name="search"
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
                  />
                  <Input 
                    placeholder={activePage === "Upcoming visits" ? "Search visitors" : activePage === "Upcoming reservations" ? "Search reservations" : activePage === "Create reservation" ? "Search reservations" : "Search work orders"} 
                    className="pl-9" 
                  />
                </div>

                {/* Right: Filter, Sort, View Controls */}
                <div className="flex items-center gap-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline">
                        <MaterialSymbol name="filter_list" size={18} className="mr-2" />
                        All filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="floating-filter-sheet w-[400px] sm:w-[540px] flex flex-col" onOpenAutoFocus={(e) => e.preventDefault()}>
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                        <SheetDescription>
                          {activePage === "Upcoming visits" 
                            ? "Apply filters to narrow down your visitors. Star filters to pin them to the main view."
                            : activePage === "Upcoming reservations" || activePage === "Create reservation"
                            ? "Apply filters to narrow down your reservations. Star filters to pin them to the main view."
                            : "Apply filters to narrow down your work orders. Star filters to pin them to the main view."}
                        </SheetDescription>
                      </SheetHeader>
                      <div className="px-6 pt-0 pb-6 space-y-4 flex-1 overflow-y-auto">
                        <div className="relative">
                          <MaterialSymbol
                            name="search"
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
                          />
                          <Input placeholder="Search filters" className="pl-9" autoFocus={false} />
                        </div>

                        {activePage === "Upcoming visits" ? (
                          <Accordion type="single" collapsible defaultValue="visitor-details">
                            <AccordionItem value="visitor-details">
                              <AccordionTrigger>Visitor Details</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  <MultiSelectFilter
                                    label="Visitor Type"
                                    options={visitorTypeOptions}
                                    selected={selectedVisitorTypes}
                                    onSelectionChange={setSelectedVisitorTypes}
                                    starred={starredFilters.visitorType}
                                    onStarToggle={() => toggleStar("visitorType")}
                                  />
                                  <MultiSelectFilter
                                    label="Premier Access"
                                    options={premierAccessOptions}
                                    selected={selectedPremierAccess}
                                    onSelectionChange={setSelectedPremierAccess}
                                    starred={starredFilters.premierAccess}
                                    onStarToggle={() => toggleStar("premierAccess")}
                                  />
                                  <MultiSelectFilter
                                    label="Status"
                                    options={visitorStatusOptions}
                                    selected={selectedVisitorStatuses}
                                    onSelectionChange={setSelectedVisitorStatuses}
                                    starred={starredFilters.visitorStatus}
                                    onStarToggle={() => toggleStar("visitorStatus")}
                                  />
                                  <MultiSelectFilter
                                    label="Visitor Property Status"
                                    options={visitorPropertyStatusOptions}
                                    selected={selectedVisitorPropertyStatuses}
                                    onSelectionChange={setSelectedVisitorPropertyStatuses}
                                    starred={starredFilters.visitorPropertyStatus}
                                    onStarToggle={() => toggleStar("visitorPropertyStatus")}
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="visitor-dates">
                              <AccordionTrigger>Dates</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  <DateRangeFilter
                                    label="Visit Date Range"
                                    starred={starredFilters.visitDateRange}
                                    onStarToggle={() => toggleStar("visitDateRange")}
                                    showStar={true}
                                    value={visitDateRange}
                                    onChange={setVisitDateRange}
                                  />
                                  <DateRangeFilter
                                    label="Check-In Date Range"
                                    starred={starredFilters.checkInDateRange}
                                    onStarToggle={() => toggleStar("checkInDateRange")}
                                    showStar={true}
                                    value={checkInDateRange}
                                    onChange={setCheckInDateRange}
                                  />
                                  <DateRangeFilter
                                    label="Check-Out Date Range"
                                    starred={starredFilters.checkOutDateRange}
                                    onStarToggle={() => toggleStar("checkOutDateRange")}
                                    showStar={true}
                                    value={checkOutDateRange}
                                    onChange={setCheckOutDateRange}
                                  />
                                  <DateRangeFilter
                                    label="Created Date Range"
                                    starred={starredFilters.createdDateRange}
                                    onStarToggle={() => toggleStar("createdDateRange")}
                                    showStar={true}
                                    value={createdDateRange}
                                    onChange={setCreatedDateRange}
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="visitor-people-companies">
                              <AccordionTrigger>People & Companies</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  <MultiSelectFilter
                                    label="Vendor Company"
                                    options={vendorCompanyOptions}
                                    selected={selectedVendorCompanies}
                                    onSelectionChange={setSelectedVendorCompanies}
                                    starred={starredFilters.vendorCompany}
                                    onStarToggle={() => toggleStar("vendorCompany")}
                                  />
                                  <MultiSelectFilter
                                    label="Company Visiting"
                                    options={companyVisitingOptions}
                                    selected={selectedCompaniesVisiting}
                                    onSelectionChange={setSelectedCompaniesVisiting}
                                    starred={starredFilters.companyVisiting}
                                    onStarToggle={() => toggleStar("companyVisiting")}
                                  />
                                  <MultiSelectFilter
                                    label="Requested For"
                                    options={requestedForOptions}
                                    selected={selectedRequestedFor}
                                    onSelectionChange={setSelectedRequestedFor}
                                    starred={starredFilters.requestedFor}
                                    onStarToggle={() => toggleStar("requestedFor")}
                                  />
                                  <MultiSelectFilter
                                    label="Created By"
                                    options={createdByOptions}
                                    selected={selectedCreatedBy}
                                    onSelectionChange={setSelectedCreatedBy}
                                    starred={starredFilters.createdBy}
                                    onStarToggle={() => toggleStar("createdBy")}
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        ) : activePage === "Upcoming reservations" ? (
                          <Accordion type="single" collapsible defaultValue="reservation-property-location">
                            <AccordionItem value="reservation-property-location">
                              <AccordionTrigger>Property & Location</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  <MultiSelectFilter
                                    label="Properties"
                                    options={reservationPropertyOptions}
                                    selected={selectedReservationProperties}
                                    onSelectionChange={setSelectedReservationProperties}
                                    starred={starredFilters.reservationProperty}
                                    onStarToggle={() => toggleStar("reservationProperty")}
                                  />
                                  <MultiSelectFilter
                                    label="Floor / Space"
                                    options={reservationFloorOptions}
                                    selected={selectedReservationFloors}
                                    onSelectionChange={setSelectedReservationFloors}
                                    starred={starredFilters.reservationFloor}
                                    onStarToggle={() => toggleStar("reservationFloor")}
                                  />
                                  <MultiSelectFilter
                                    label="Management Company"
                                    options={managementCompanyOptions}
                                    selected={selectedManagementCompanies}
                                    onSelectionChange={setSelectedManagementCompanies}
                                    starred={starredFilters.managementCompany}
                                    onStarToggle={() => toggleStar("managementCompany")}
                                  />
                                  <MultiSelectFilter
                                    label="Owner"
                                    options={ownerOptions}
                                    selected={selectedOwners}
                                    onSelectionChange={setSelectedOwners}
                                    starred={starredFilters.owner}
                                    onStarToggle={() => toggleStar("owner")}
                                  />
                                  <MultiSelectFilter
                                    label="Region"
                                    options={reservationRegionOptions}
                                    selected={selectedReservationRegions}
                                    onSelectionChange={setSelectedReservationRegions}
                                    starred={starredFilters.reservationRegion}
                                    onStarToggle={() => toggleStar("reservationRegion")}
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="reservation-details">
                              <AccordionTrigger>Reservation Details</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  <MultiSelectFilter
                                    label="Created By"
                                    options={reservationCreatedByOptions}
                                    selected={selectedReservationCreatedBy}
                                    onSelectionChange={setSelectedReservationCreatedBy}
                                    starred={starredFilters.reservationCreatedBy}
                                    onStarToggle={() => toggleStar("reservationCreatedBy")}
                                  />
                                  <MultiSelectFilter
                                    label="Status"
                                    options={reservationStatusOptions}
                                    selected={selectedReservationStatuses}
                                    onSelectionChange={setSelectedReservationStatuses}
                                    starred={starredFilters.reservationStatus}
                                    onStarToggle={() => toggleStar("reservationStatus")}
                                  />
                                  <MultiSelectFilter
                                    label="Type"
                                    options={reservationTypeOptions}
                                    selected={selectedReservationTypes}
                                    onSelectionChange={setSelectedReservationTypes}
                                    starred={starredFilters.reservationType}
                                    onStarToggle={() => toggleStar("reservationType")}
                                  />
                                  <MultiSelectFilter
                                    label="Resource"
                                    options={resourceOptions}
                                    selected={selectedResources}
                                    onSelectionChange={setSelectedResources}
                                    starred={starredFilters.resource}
                                    onStarToggle={() => toggleStar("resource")}
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="reservation-capacity">
                              <AccordionTrigger>Capacity</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  <MultiSelectFilter
                                    label="Capacity Units"
                                    options={capacityUnitOptions}
                                    selected={selectedCapacityUnits}
                                    onSelectionChange={setSelectedCapacityUnits}
                                    starred={starredFilters.capacityUnits}
                                    onStarToggle={() => toggleStar("capacityUnits")}
                                  />
                                  <MultiSelectFilter
                                    label="Capacity"
                                    options={capacityOptions}
                                    selected={selectedCapacities}
                                    onSelectionChange={setSelectedCapacities}
                                    starred={starredFilters.capacity}
                                    onStarToggle={() => toggleStar("capacity")}
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="reservation-company-dates">
                              <AccordionTrigger>Company & Dates</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  <MultiSelectFilter
                                    label="Company"
                                    options={reservationCompanyOptions}
                                    selected={selectedReservationCompanies}
                                    onSelectionChange={setSelectedReservationCompanies}
                                    starred={starredFilters.reservationCompany}
                                    onStarToggle={() => toggleStar("reservationCompany")}
                                  />
                                  <DateRangeFilter
                                    label="Reservation Dates"
                                    starred={starredFilters.reservationDateRange}
                                    onStarToggle={() => toggleStar("reservationDateRange")}
                                    showStar={true}
                                    value={reservationDateRange}
                                    onChange={setReservationDateRange}
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        ) : activePage === "Create reservation" ? (
                          <Accordion type="single" collapsible defaultValue="reservation-dates-time">
                            <AccordionItem value="reservation-property-location">
                              <AccordionTrigger>Property & Location</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  <MultiSelectFilter
                                    label="Property"
                                    options={reservationPropertyOptions}
                                    selected={selectedReservationProperties}
                                    onSelectionChange={setSelectedReservationProperties}
                                    starred={starredFilters.reservationProperty}
                                    onStarToggle={() => toggleStar("reservationProperty")}
                                  />
                                  <MultiSelectFilter
                                    label="Floor / Space"
                                    options={reservationFloorOptions}
                                    selected={selectedReservationFloors}
                                    onSelectionChange={setSelectedReservationFloors}
                                    starred={starredFilters.reservationFloor}
                                    onStarToggle={() => toggleStar("reservationFloor")}
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="reservation-dates-time">
                              <AccordionTrigger>Dates & Time</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  <DateRangeFilter
                                    label="Dates"
                                    starred={starredFilters.reservationDateRange}
                                    onStarToggle={() => toggleStar("reservationDateRange")}
                                    showStar={true}
                                    starDisabled={activePage === "Create reservation"}
                                    value={reservationDateRange}
                                    onChange={setReservationDateRange}
                                  />
                                  <SwitchFilter
                                    label="All day"
                                    starred={starredFilters.reservationAllDay}
                                    onStarToggle={() => toggleStar("reservationAllDay")}
                                    showStar={true}
                                    starDisabled={activePage === "Create reservation"}
                                    value={reservationAllDay}
                                    onChange={setReservationAllDay}
                                    compact={true}
                                  />
                                  <TimeRangeFilter
                                    label="Time"
                                    starred={starredFilters.reservationTimeRange}
                                    onStarToggle={() => toggleStar("reservationTimeRange")}
                                    showStar={true}
                                    starDisabled={activePage === "Create reservation"}
                                    value={reservationTimeRange}
                                    onChange={setReservationTimeRange}
                                  />
                                  <MultiSelectFilter
                                    label="Duration"
                                    options={durationOptions}
                                    selected={selectedDurations}
                                    onSelectionChange={setSelectedDurations}
                                    starred={starredFilters.reservationDuration}
                                    onStarToggle={() => toggleStar("reservationDuration")}
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="reservation-details">
                              <AccordionTrigger>Reservation Details</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  <MultiSelectFilter
                                    label="Type"
                                    options={reservationTypeOptions}
                                    selected={selectedReservationTypes}
                                    onSelectionChange={setSelectedReservationTypes}
                                    starred={starredFilters.reservationType}
                                    onStarToggle={() => toggleStar("reservationType")}
                                  />
                                  <MultiSelectFilter
                                    label="Resource"
                                    options={resourceOptions}
                                    selected={selectedResources}
                                    onSelectionChange={setSelectedResources}
                                    starred={starredFilters.resource}
                                    onStarToggle={() => toggleStar("resource")}
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="reservation-capacity">
                              <AccordionTrigger>Capacity</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  <MultiSelectFilter
                                    label="Capacity Units"
                                    options={capacityUnitOptions}
                                    selected={selectedCapacityUnits}
                                    onSelectionChange={setSelectedCapacityUnits}
                                    starred={starredFilters.capacityUnits}
                                    onStarToggle={() => toggleStar("capacityUnits")}
                                  />
                                  <MultiSelectFilter
                                    label="Capacity"
                                    options={capacityOptions}
                                    selected={selectedCapacities}
                                    onSelectionChange={setSelectedCapacities}
                                    starred={starredFilters.capacity}
                                    onStarToggle={() => toggleStar("capacity")}
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        ) : (
                          <Accordion type="single" collapsible defaultValue="property-location">
                            <AccordionItem value="property-location">
                              <AccordionTrigger>Property & Location</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  <MultiSelectFilter
                                    label="Region"
                                    options={regionOptions}
                                    selected={selectedRegions}
                                    onSelectionChange={setSelectedRegions}
                                    starred={starredFilters.region}
                                    onStarToggle={() => toggleStar("region")}
                                  />
                                  <MultiSelectFilter
                                    label="Property Group"
                                    options={propertyGroupOptions}
                                    selected={selectedPropertyGroups}
                                    onSelectionChange={setSelectedPropertyGroups}
                                    starred={starredFilters.propertyGroup}
                                    onStarToggle={() => toggleStar("propertyGroup")}
                                  />
                                  <MultiSelectFilter
                                    label="Property"
                                    options={propertyOptions}
                                    selected={selectedProperties}
                                    onSelectionChange={setSelectedProperties}
                                    starred={starredFilters.property}
                                    onStarToggle={() => toggleStar("property")}
                                  />
                                  <MultiSelectFilter
                                    label="Building"
                                    options={buildingOptions}
                                    selected={selectedBuildings}
                                    onSelectionChange={setSelectedBuildings}
                                    starred={starredFilters.building}
                                    onStarToggle={() => toggleStar("building")}
                                  />
                                  <MultiSelectFilter
                                    label="Floor"
                                    options={floorOptions}
                                    selected={selectedFloors}
                                    onSelectionChange={setSelectedFloors}
                                    starred={starredFilters.floor}
                                    onStarToggle={() => toggleStar("floor")}
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="work-order-details">
                              <AccordionTrigger>Work Order Details</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  <MultiSelectFilter
                                    label="Status"
                                    options={statusOptions}
                                    selected={selectedStatuses}
                                    onSelectionChange={setSelectedStatuses}
                                    starred={starredFilters.status}
                                    onStarToggle={() => toggleStar("status")}
                                  />
                                  <MultiSelectFilter
                                    label="Priority"
                                    options={priorityOptions}
                                    selected={selectedPriorities}
                                    onSelectionChange={setSelectedPriorities}
                                    starred={starredFilters.priority}
                                    onStarToggle={() => toggleStar("priority")}
                                  />
                                  <MultiSelectFilter
                                    label="Category"
                                    options={categoryOptions}
                                    selected={selectedCategories}
                                    onSelectionChange={setSelectedCategories}
                                    starred={starredFilters.category}
                                    onStarToggle={() => toggleStar("category")}
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="people-dates">
                              <AccordionTrigger>People & Dates</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  <MultiSelectFilter
                                    label="Assignee"
                                    options={assigneeOptions}
                                    selected={selectedAssignees}
                                    onSelectionChange={setSelectedAssignees}
                                    starred={starredFilters.assignee}
                                    onStarToggle={() => toggleStar("assignee")}
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        )}
                      </div>
                      <SheetFooter>
                        {/* For Create reservation, only show if additional filters (not date/all day/time) are selected */}
                        {(activePage === "Create reservation" ? hasAnyAdditionalFilterSelected : hasAnyFilterSelected) && (
                          <SheetClose asChild>
                            <Button variant="outline" onClick={clearAllFilters}>Clear all</Button>
                          </SheetClose>
                        )}
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>

                  {/* Sort Multi-Select with Clear */}
                  {activePage !== "Create reservation" && (
                    <Popover open={sortPopoverOpen} onOpenChange={setSortPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-36 justify-between">
                          <div className="flex items-center">
                            <MaterialSymbol name="sort" size={16} className="mr-2" />
                            <span>Sort by</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {sortCount > 0 && (
                              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                                {sortCount}
                              </Badge>
                            )}
                            <MaterialSymbol name="expand_more" size={16} />
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[220px] p-2" align="end">
                        <div className="space-y-1">
                          {sortOptions.map((option) => {
                            const sortDirection = selectedSorts[option.value];
                            return (
                              <div
                                key={option.value}
                                className={`flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer ${sortDirection ? 'bg-muted/50' : ''}`}
                                onClick={() => toggleSort(option.value)}
                              >
                                <span className="text-sm">{option.label}</span>
                                {sortDirection && (
                                  <MaterialSymbol 
                                    name={sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'} 
                                    size={16} 
                                    className="text-foreground"
                                  />
                                )}
                              </div>
                            );
                          })}
                          {sortCount > 0 && (
                            <>
                              <Separator className="my-2" />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-muted-foreground"
                                onClick={() => {
                                  clearSorts();
                                  setSortPopoverOpen(false);
                                }}
                              >
                                <MaterialSymbol name="close" size={16} className="mr-2" />
                                Clear all
                              </Button>
                            </>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}

                  {/* View Toggle */}
                  {activePage !== "Create reservation" && (
                    <div className="flex items-center border rounded-md h-9">
                      <Button
                        variant={currentView === "tile" ? "secondary" : "ghost"}
                        size="icon"
                        className={activePage === "Tasks" ? "rounded-r-none border-0 h-full rounded-l-md" : "rounded-r-none border-0 h-full rounded-l-md"}
                        onClick={() => setCurrentView("tile")}
                      >
                        <MaterialSymbol name="grid_view" size={18} />
                      </Button>
                      {activePage !== "Tasks" && (
                        <Button
                          variant={currentView === "calendar" ? "secondary" : "ghost"}
                          size="icon"
                          className="border-0 h-full border-x"
                          onClick={() => setCurrentView("calendar")}
                        >
                          <MaterialSymbol name="calendar_today" size={18} />
                        </Button>
                      )}
                      <Button
                        variant={currentView === "table" ? "secondary" : "ghost"}
                        size="icon"
                        className={activePage === "Tasks" ? "rounded-l-none border-0 h-full rounded-r-md" : "rounded-l-none border-0 h-full rounded-r-md"}
                        onClick={() => setCurrentView("table")}
                      >
                        <MaterialSymbol name="table_rows" size={18} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* Property Filters Row - Only show starred filters with multi-select (same order as filters panel) - Hide for Home page */}
              {activePage !== "Home" && (
              <div className="flex items-center gap-3 mb-6">
                {activePage === "Upcoming visits" ? (
                  <>
                    {/* Visitor filters - Order matches filters panel: Visitor Details section */}
                    {starredFilters.visitorType && (
                      <CompactMultiSelect
                        label="Visitor Type"
                        options={visitorTypeOptions}
                        selected={selectedVisitorTypes}
                        onSelectionChange={setSelectedVisitorTypes}
                        width="w-36"
                      />
                    )}
                    {starredFilters.premierAccess && (
                      <CompactMultiSelect
                        label="Premier Access"
                        options={premierAccessOptions}
                        selected={selectedPremierAccess}
                        onSelectionChange={setSelectedPremierAccess}
                        width="w-40"
                      />
                    )}
                    {starredFilters.visitorStatus && (
                      <CompactMultiSelect
                        label="Status"
                        options={visitorStatusOptions}
                        selected={selectedVisitorStatuses}
                        onSelectionChange={setSelectedVisitorStatuses}
                        width="w-32"
                      />
                    )}
                    {starredFilters.visitorPropertyStatus && (
                      <CompactMultiSelect
                        label="Visitor Property Status"
                        options={visitorPropertyStatusOptions}
                        selected={selectedVisitorPropertyStatuses}
                        onSelectionChange={setSelectedVisitorPropertyStatuses}
                        width="w-48"
                      />
                    )}
                    {/* Dates section */}
                    {starredFilters.visitDateRange && (
                      <CompactDateRange
                        label="Visit Date Range"
                        width="w-44"
                        value={visitDateRange}
                        onChange={setVisitDateRange}
                      />
                    )}
                    {starredFilters.checkInDateRange && (
                      <CompactDateRange
                        label="Check-In Date Range"
                        width="w-48"
                        value={checkInDateRange}
                        onChange={setCheckInDateRange}
                      />
                    )}
                    {starredFilters.checkOutDateRange && (
                      <CompactDateRange
                        label="Check-Out Date Range"
                        width="w-48"
                        value={checkOutDateRange}
                        onChange={setCheckOutDateRange}
                      />
                    )}
                    {starredFilters.createdDateRange && (
                      <CompactDateRange
                        label="Created Date Range"
                        width="w-44"
                        value={createdDateRange}
                        onChange={setCreatedDateRange}
                      />
                    )}
                    {/* People & Companies section */}
                    {starredFilters.vendorCompany && (
                      <CompactMultiSelect
                        label="Vendor Company"
                        options={vendorCompanyOptions}
                        selected={selectedVendorCompanies}
                        onSelectionChange={setSelectedVendorCompanies}
                        width="w-40"
                      />
                    )}
                    {starredFilters.companyVisiting && (
                      <CompactMultiSelect
                        label="Company Visiting"
                        options={companyVisitingOptions}
                        selected={selectedCompaniesVisiting}
                        onSelectionChange={setSelectedCompaniesVisiting}
                        width="w-44"
                      />
                    )}
                    {starredFilters.requestedFor && (
                      <CompactMultiSelect
                        label="Requested For"
                        options={requestedForOptions}
                        selected={selectedRequestedFor}
                        onSelectionChange={setSelectedRequestedFor}
                        width="w-36"
                      />
                    )}
                    {starredFilters.createdBy && (
                      <CompactMultiSelect
                        label="Created By"
                        options={createdByOptions}
                        selected={selectedCreatedBy}
                        onSelectionChange={setSelectedCreatedBy}
                        width="w-32"
                      />
                    )}
                  </>
                ) : activePage === "Upcoming reservations" ? (
                  <>
                    {/* Property & Location filters - Order matches filters panel */}
                    {starredFilters.reservationProperty && (
                      <CompactMultiSelect
                        label="Properties"
                        options={reservationPropertyOptions}
                        selected={selectedReservationProperties}
                        onSelectionChange={setSelectedReservationProperties}
                        width="w-36"
                      />
                    )}
                    {starredFilters.reservationFloor && (
                      <CompactMultiSelect
                        label="Floor / Space"
                        options={reservationFloorOptions}
                        selected={selectedReservationFloors}
                        onSelectionChange={setSelectedReservationFloors}
                        width="w-36"
                      />
                    )}
                    {starredFilters.managementCompany && (
                      <CompactMultiSelect
                        label="Management Company"
                        options={managementCompanyOptions}
                        selected={selectedManagementCompanies}
                        onSelectionChange={setSelectedManagementCompanies}
                        width="w-44"
                      />
                    )}
                    {starredFilters.owner && (
                      <CompactMultiSelect
                        label="Owner"
                        options={ownerOptions}
                        selected={selectedOwners}
                        onSelectionChange={setSelectedOwners}
                        width="w-32"
                      />
                    )}
                    {starredFilters.reservationRegion && (
                      <CompactMultiSelect
                        label="Region"
                        options={reservationRegionOptions}
                        selected={selectedReservationRegions}
                        onSelectionChange={setSelectedReservationRegions}
                        width="w-32"
                      />
                    )}
                    {/* Reservation Details filters */}
                    {starredFilters.reservationCreatedBy && (
                      <CompactMultiSelect
                        label="Created By"
                        options={reservationCreatedByOptions}
                        selected={selectedReservationCreatedBy}
                        onSelectionChange={setSelectedReservationCreatedBy}
                        width="w-32"
                      />
                    )}
                    {starredFilters.reservationStatus && (
                      <CompactMultiSelect
                        label="Status"
                        options={reservationStatusOptions}
                        selected={selectedReservationStatuses}
                        onSelectionChange={setSelectedReservationStatuses}
                        width="w-28"
                      />
                    )}
                    {starredFilters.reservationType && (
                      <CompactMultiSelect
                        label="Type"
                        options={reservationTypeOptions}
                        selected={selectedReservationTypes}
                        onSelectionChange={setSelectedReservationTypes}
                        width="w-36"
                      />
                    )}
                    {starredFilters.resource && (
                      <CompactMultiSelect
                        label="Resource"
                        options={resourceOptions}
                        selected={selectedResources}
                        onSelectionChange={setSelectedResources}
                        width="w-36"
                      />
                    )}
                    {/* Capacity filters */}
                    {starredFilters.capacityUnits && (
                      <CompactMultiSelect
                        label="Capacity Units"
                        options={capacityUnitOptions}
                        selected={selectedCapacityUnits}
                        onSelectionChange={setSelectedCapacityUnits}
                        width="w-36"
                      />
                    )}
                    {starredFilters.capacity && (
                      <CompactMultiSelect
                        label="Capacity"
                        options={capacityOptions}
                        selected={selectedCapacities}
                        onSelectionChange={setSelectedCapacities}
                        width="w-32"
                      />
                    )}
                    {/* Company & Dates filters */}
                    {starredFilters.reservationCompany && (
                      <CompactMultiSelect
                        label="Company"
                        options={reservationCompanyOptions}
                        selected={selectedReservationCompanies}
                        onSelectionChange={setSelectedReservationCompanies}
                        width="w-36"
                      />
                    )}
                    {starredFilters.reservationDateRange && (
                      <CompactDateRange
                        label="Reservation Dates"
                        width="w-48"
                        value={reservationDateRange}
                        onChange={setReservationDateRange}
                      />
                    )}
                  </>
                ) : activePage === "Create reservation" ? (
                  <>
                    {/* Property & Location filters - Order matches filters panel */}
                    {starredFilters.reservationProperty && (
                      <CompactMultiSelect
                        label="Property"
                        options={reservationPropertyOptions}
                        selected={selectedReservationProperties}
                        onSelectionChange={setSelectedReservationProperties}
                        width="w-36"
                      />
                    )}
                    {starredFilters.reservationFloor && (
                      <CompactMultiSelect
                        label="Floor / Space"
                        options={reservationFloorOptions}
                        selected={selectedReservationFloors}
                        onSelectionChange={setSelectedReservationFloors}
                        width="w-36"
                      />
                    )}
                    {/* Dates & Time filters */}
                    {starredFilters.reservationDateRange && (
                      <CompactDateRange
                        label="Dates"
                        width="w-44"
                        value={reservationDateRange}
                        onChange={setReservationDateRange}
                      />
                    )}
                    {starredFilters.reservationAllDay && (
                      <CompactSwitch
                        label="All day"
                        width="w-fit"
                        value={reservationAllDay}
                        onChange={setReservationAllDay}
                        compact={true}
                      />
                    )}
                    {starredFilters.reservationTimeRange && (
                      <CompactTimeRange
                        label="Time"
                        width="w-44"
                        value={reservationTimeRange}
                        onChange={setReservationTimeRange}
                      />
                    )}
                    {starredFilters.reservationDuration && (
                      <CompactMultiSelect
                        label="Duration"
                        options={durationOptions}
                        selected={selectedDurations}
                        onSelectionChange={setSelectedDurations}
                        width="w-36"
                      />
                    )}
                    {/* Reservation Details filters */}
                    {starredFilters.reservationType && (
                      <CompactMultiSelect
                        label="Type"
                        options={reservationTypeOptions}
                        selected={selectedReservationTypes}
                        onSelectionChange={setSelectedReservationTypes}
                        width="w-36"
                      />
                    )}
                    {starredFilters.resource && (
                      <CompactMultiSelect
                        label="Resource"
                        options={resourceOptions}
                        selected={selectedResources}
                        onSelectionChange={setSelectedResources}
                        width="w-36"
                      />
                    )}
                    {/* Capacity filters */}
                    {starredFilters.capacityUnits && (
                      <CompactMultiSelect
                        label="Capacity Units"
                        options={capacityUnitOptions}
                        selected={selectedCapacityUnits}
                        onSelectionChange={setSelectedCapacityUnits}
                        width="w-36"
                      />
                    )}
                    {starredFilters.capacity && (
                      <CompactMultiSelect
                        label="Capacity"
                        options={capacityOptions}
                        selected={selectedCapacities}
                        onSelectionChange={setSelectedCapacities}
                        width="w-32"
                      />
                    )}
                  </>
                ) : (
                  <>
                    {/* Property & Location filters */}
                    {starredFilters.region && (
                      <CompactMultiSelect
                        label="Region"
                        options={regionOptions}
                        selected={selectedRegions}
                        onSelectionChange={setSelectedRegions}
                        width="w-32"
                      />
                    )}
                    {starredFilters.propertyGroup && (
                      <CompactMultiSelect
                        label="Property group"
                        options={propertyGroupOptions}
                        selected={selectedPropertyGroups}
                        onSelectionChange={setSelectedPropertyGroups}
                        width="w-40"
                      />
                    )}
                    {starredFilters.property && (
                      <CompactMultiSelect
                        label="Property"
                        options={propertyOptions}
                        selected={selectedProperties}
                        onSelectionChange={setSelectedProperties}
                        width="w-44"
                      />
                    )}
                    {starredFilters.building && (
                      <CompactMultiSelect
                        label="Building"
                        options={buildingOptions}
                        selected={selectedBuildings}
                        onSelectionChange={setSelectedBuildings}
                        width="w-32"
                      />
                    )}
                    {starredFilters.floor && (
                      <CompactMultiSelect
                        label="Floor"
                        options={floorOptions}
                        selected={selectedFloors}
                        onSelectionChange={setSelectedFloors}
                        width="w-28"
                      />
                    )}
                    {/* Work Order Details filters */}
                    {starredFilters.status && (
                      <CompactMultiSelect
                        label="Status"
                        options={statusOptions}
                        selected={selectedStatuses}
                        onSelectionChange={setSelectedStatuses}
                        width="w-28"
                      />
                    )}
                    {starredFilters.priority && (
                      <CompactMultiSelect
                        label="Priority"
                        options={priorityOptions}
                        selected={selectedPriorities}
                        onSelectionChange={setSelectedPriorities}
                        width="w-28"
                      />
                    )}
                    {starredFilters.category && (
                      <CompactMultiSelect
                        label="Category"
                        options={categoryOptions}
                        selected={selectedCategories}
                        onSelectionChange={setSelectedCategories}
                        width="w-36"
                      />
                    )}
                    {/* People & Dates filters */}
                    {starredFilters.assignee && (
                      <CompactMultiSelect
                        label="Assignee"
                        options={assigneeOptions}
                        selected={selectedAssignees}
                        onSelectionChange={setSelectedAssignees}
                        width="w-32"
                      />
                    )}
                  </>
                )}
                {/* Clear all button - Hide for Home page */}
                {/* For Create reservation, only show if additional filters (not date/all day/time) are selected */}
                {(activePage === "Create reservation" ? hasAnyAdditionalFilterSelected : hasAnyFilterSelected) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={clearAllFilters}
                  >
                    <MaterialSymbol name="close" size={16} className="mr-1" />
                    Clear all
                  </Button>
                )}
              </div>
              )}

              {/* Grid or Table View - Show blank page for Home */}
              {activePage === "Home" ? (
                <div className="flex-1 flex flex-col items-start justify-start">
                  <div className="flex flex-wrap gap-6 w-full">
                    <div 
                      className="flex items-start gap-3 border border-transparent hover:border-semantic-stroke-subdued transition-colors cursor-pointer" 
                      style={{ padding: "16px", borderRadius: "6px", backgroundColor: "var(--color-semantic-surface-secondary)" }}
                      onClick={() => {
                        setModalType("work-order");
                        setIsCreateModalOpen(true);
                      }}
                    >
                      <div className="p-2 rounded-full flex items-center justify-center text-secondary-foreground" style={{ width: "fit-content", height: "fit-content", backgroundColor: "var(--color-semantic-surface-secondary)" }}>
                        <MaterialSymbol name="build_circle" size={24} />
                      </div>
                      <div className="flex flex-col items-start gap-0">
                        <span className="text-sm font-medium text-secondary-foreground">Create Work Order</span>
                        <span className="text-sm font-light text-secondary-foreground">Quickly report an issue</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 border border-transparent hover:border-semantic-stroke-subdued transition-colors cursor-pointer" style={{ padding: "16px", borderRadius: "6px", backgroundColor: "var(--color-semantic-surface-secondary)" }}>
                      <div className="p-2 rounded-full flex items-center justify-center text-secondary-foreground" style={{ width: "fit-content", height: "fit-content", backgroundColor: "var(--color-semantic-surface-secondary)" }}>
                        <MaterialSymbol name="contacts" size={24} />
                      </div>
                      <div className="flex flex-col items-start gap-0">
                        <span className="text-sm font-medium text-secondary-foreground">Contact Management</span>
                        <span className="text-sm font-light text-secondary-foreground">Get in touch</span>
                      </div>
                    </div>
                    <div 
                      className="flex items-start gap-3 border border-transparent hover:border-semantic-stroke-subdued transition-colors cursor-pointer" 
                      style={{ padding: "16px", borderRadius: "6px", backgroundColor: "var(--color-semantic-surface-secondary)" }}
                      onClick={() => {
                        setCurrentView("tile");
                        setActivePage("Create reservation");
                      }}
                    >
                      <div className="p-2 rounded-full flex items-center justify-center text-secondary-foreground" style={{ width: "fit-content", height: "fit-content", backgroundColor: "var(--color-semantic-surface-secondary)" }}>
                        <MaterialSymbol name="event" size={24} />
                      </div>
                      <div className="flex flex-col items-start gap-0">
                        <span className="text-sm font-medium text-secondary-foreground">Create Reservation</span>
                        <span className="text-sm font-light text-secondary-foreground">Book a resource</span>
                      </div>
                    </div>
                    <div 
                      className="flex items-start gap-3 border border-transparent hover:border-semantic-stroke-subdued transition-colors cursor-pointer" 
                      style={{ padding: "16px", borderRadius: "6px", backgroundColor: "var(--color-semantic-surface-secondary)" }}
                      onClick={() => {
                        setModalType("visitor");
                        setIsCreateModalOpen(true);
                      }}
                    >
                      <div className="p-2 rounded-full flex items-center justify-center text-secondary-foreground" style={{ width: "fit-content", height: "fit-content", backgroundColor: "var(--color-semantic-surface-secondary)" }}>
                        <MaterialSymbol name="person_add" size={24} />
                      </div>
                      <div className="flex flex-col items-start gap-0">
                        <span className="text-sm font-medium text-secondary-foreground">Create Visitor</span>
                        <span className="text-sm font-light text-secondary-foreground">Register a new visitor</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 border border-transparent hover:border-semantic-stroke-subdued transition-colors cursor-pointer" style={{ padding: "16px", borderRadius: "6px", backgroundColor: "var(--color-semantic-surface-secondary)" }}>
                      <div className="p-2 rounded-full flex items-center justify-center text-secondary-foreground" style={{ width: "fit-content", height: "fit-content", backgroundColor: "var(--color-semantic-surface-secondary)" }}>
                        <MaterialSymbol name="warning" size={24} />
                      </div>
                      <div className="flex flex-col items-start gap-0">
                        <span className="text-sm font-medium text-secondary-foreground">Report Incident</span>
                        <span className="text-sm font-light text-secondary-foreground">Report an issue</span>
                      </div>
                    </div>
                  </div>

                  {/* Hero Element with Welcome Message and Data List */}
                  <div className="flex flex-1 min-h-0 gap-6 h-fit" style={{ margin: "0px", width: "100%", marginTop: "24px" }}>
                    <div className="col-span-9 flex-1 min-h-0 flex flex-col">
                    <Card className="flex-1 flex flex-col min-h-0" style={{ borderRadius: "6px", paddingTop: "0px", paddingBottom: "0px", width: "100%" }}>
                      <CardContent className="flex flex-col flex-1 min-h-0 overflow-hidden h-fit" style={{ padding: "20px" }}>
                        {/* Hero Element - Welcome Message (full width above) */}
                        <div className="mb-6 flex-shrink-0">
                          <h2 className="text-2xl font-semibold text-foreground mb-2">
                            Welcome back!
                          </h2>
                          <p className="text-muted-foreground">
                            Here's what's happening in your building
                          </p>
                        </div>

                        {/* Data List and Banner on same row */}
                        <div className="flex flex-1 min-h-0 flex-nowrap gap-6 items-stretch overflow-hidden h-fit">
                          {/* Left side - Data List only (scrolls internally) */}
                          <div className="flex-1 min-w-0 min-h-0 overflow-auto hero-datalist-wrap h-fit">
                            <DataList>
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex-1">
                              <DataListItem
                                id="fire-safety-inspection"
                                title="Fire Safety Inspection Scheduled"
                                subtitle="Building-wide inspection on February 15th, 9 AM - 3 PM"
                                thumbnail={
                                  <Avatar size="md">
                                    <AvatarFallback>SM</AvatarFallback>
                                  </Avatar>
                                }
                              />
                            </div>
                            <Button variant="outline" size="sm">
                              Read more
                            </Button>
                          </div>
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex-1">
                              <DataListItem
                                id="elevator-maintenance"
                                title="Elevator Maintenance Notice"
                                subtitle="Elevator #2 out of service January 30th for maintenance"
                                thumbnail={
                                  <Avatar size="md">
                                    <AvatarFallback>MT</AvatarFallback>
                                  </Avatar>
                                }
                              />
                            </div>
                            <Button variant="outline" size="sm">
                              Read more
                            </Button>
                          </div>
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex-1">
                              <DataListItem
                                id="parking-policy"
                                title="New Parking Policy Effective"
                                subtitle="Updated parking regulations enforced starting February 3rd"
                                thumbnail={
                                  <Avatar size="md">
                                    <AvatarFallback>JL</AvatarFallback>
                                  </Avatar>
                                }
                              />
                            </div>
                            <Button variant="outline" size="sm">
                              Read more
                            </Button>
                          </div>
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex-1">
                              <DataListItem
                                id="hvac-upgrade"
                                title="HVAC System Upgrade Complete"
                                subtitle="Building HVAC improvements finished. Enhanced efficiency and comfort"
                                thumbnail={
                                  <Avatar size="md">
                                    <AvatarFallback>RC</AvatarFallback>
                                  </Avatar>
                                }
                              />
                            </div>
                            <Button variant="outline" size="sm">
                              Read more
                            </Button>
                          </div>
                        </DataList>
                          </div>
                          {/* Right side - Banner Image */}
                          <div className="flex-shrink-0 h-fit" style={{ width: "400px" }}>
                            <Image
                              src="/assets/Banner-5cce3ac3-66d7-4c84-ae0c-cb66d8711e9e.png"
                              alt="Tenant app download banner"
                              width={400}
                              height={200}
                              className="rounded-lg object-contain"
                              style={{ width: "100%", height: "auto" }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    </div>
                    <div className="col-span-3 h-fit">
                    {(() => {
                      const today = new Date();
                      const futureDate = new Date(today);
                      futureDate.setDate(today.getDate() + 2);
                      return (
                        <ReservationTile
                          roomName="Sand Room"
                          date={futureDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                          timeSlot="1 Main St"
                          location="Boston, MA 02109, USA"
                          capacity={10}
                          price="US$35.00"
                          hideBadge={true}
                          hideDate={true}
                          customImageSrc="/assets/PropertCardThumbnail3.png"
                          property="Starbucks"
                          propertyLabel="My Company"
                          floor="10"
                          thirdLabel="Suite"
                          thirdLabelValue="201"
                          avatarName="James Anderson"
                          avatarImage="https://github.com/shadcn.png"
                          email="james.anderson@example.com"
                        />
                      );
                    })()}
                    </div>
                  </div>
                </div>
              ) : (
              <div className="flex-1 overflow-hidden flex flex-col">
                {currentView === "calendar" && activePage === "Upcoming visits" ? (
                  <VisitorsCalendar />
                ) : currentView === "calendar" && activePage === "Upcoming reservations" ? (
                  <ReservationsCalendar />
                ) : currentView === "tile" ? (
                  <div className="flex-1 overflow-y-auto min-h-0">
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '28px',
                        width: '100%',
                        alignContent: 'start'
                      }}
                    >
                      {filteredAndSortedWorkOrders.map((workOrder, index) => {
                        const visitorBadges = activePage === "Upcoming visits" 
                          ? index === 0 
                            ? { first: "First Visit", second: "Checked In" }
                            : { first: "First Visit", second: "Scheduled" }
                          : undefined;
                        
                        // Generate random names for visitor cards
                        const randomNames = ["Sarah Mitchell", "James Anderson", "Emily Chen", "Michael Rodriguez", "Jessica Taylor", "David Kim"];
                        const visitorName = activePage === "Upcoming visits" ? randomNames[index] : undefined;
                        const hostName = activePage === "Upcoming visits" ? "John Doe" : undefined;
                        
                        // Reservation data for reservations page
                        const reservationData = activePage === "Upcoming reservations" && index === 0
                          ? (() => {
                              const today = new Date();
                              const futureDate = new Date(today);
                              futureDate.setDate(today.getDate() + 2);
                              return {
                                floor: "4",
                                suite: "Conference Room 201",
                                date: futureDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
                                time: "All Day"
                              };
                            })()
                          : undefined;
                        
                        // Render ReservationTile for Create reservation page
                        if (activePage === "Create reservation") {
                          // Format date from ISO format (YYYY-MM-DD) to MM/DD/YYYY
                          const formatDateForDisplay = (dateStr: string) => {
                            if (!dateStr) return "";
                            const [year, month, day] = dateStr.split('-');
                            return `${month}/${day}/${year}`;
                          };
                          
                          // Format time from 24-hour format (HH:MM) to 12-hour format with AM/PM
                          const formatTimeUS = (time: string) => {
                            if (!time) return "";
                            const [hours, minutes] = time.split(':');
                            const hour = parseInt(hours, 10);
                            const ampm = hour >= 12 ? 'PM' : 'AM';
                            const displayHour = hour % 12 || 12;
                            return `${displayHour}:${minutes} ${ampm}`;
                          };
                          
                          // Get the default selected date and time from filters
                          const selectedDate = reservationDateRange.start 
                            ? formatDateForDisplay(reservationDateRange.start)
                            : new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
                          
                          const selectedTimeSlot = reservationTimeRange.start && reservationTimeRange.end
                            ? `${formatTimeUS(reservationTimeRange.start)} - ${formatTimeUS(reservationTimeRange.end)}`
                            : "9:00 AM - 10:00 AM";
                          
                          // Sample reservation data for different tiles
                          const reservationTiles = [
                            {
                              roomName: "Sand Room",
                              date: selectedDate,
                              timeSlot: selectedTimeSlot,
                              location: "Floor 10 - 1 Main St, Boston, MA",
                              capacity: 10,
                              price: "US$35.00"
                            },
                            {
                              roomName: "Sky Room",
                              date: selectedDate,
                              timeSlot: selectedTimeSlot,
                              location: "Floor 12 - 1 Main St, Boston, MA",
                              capacity: 20,
                              price: "US$50.00"
                            }
                          ];
                          
                          // Sort reservation tiles by date (newest to oldest)
                          const sortedReservationTiles = [...reservationTiles].sort((a, b) => {
                            const parseDate = (dateStr: string) => {
                              const [month, day, year] = dateStr.split('/').map(Number);
                              return new Date(year, month - 1, day).getTime();
                            };
                            const aDate = parseDate(a.date);
                            const bDate = parseDate(b.date);
                            return bDate - aDate; // Descending (newest first)
                          });
                          
                          const reservation = sortedReservationTiles[index] || sortedReservationTiles[0];
                          return (
                            <ReservationTile
                              key={index}
                              roomName={reservation.roomName}
                              date={reservation.date}
                              timeSlot={reservation.timeSlot}
                              location={reservation.location}
                              capacity={reservation.capacity}
                              price={reservation.price}
                              isCreateReservationCard
                              onBookResource={() => {
                                setSelectedReservation({
                                  roomName: reservation.roomName,
                                  date: reservation.date,
                                  timeSlot: reservation.timeSlot,
                                  location: reservation.location,
                                  capacity: reservation.capacity,
                                  price: reservation.price
                                });
                                setModalType("reservation");
                                setIsCreateModalOpen(true);
                              }}
                            />
                          );
                        }
                        
                        // Use ReservationCard for reservations, WorkOrderCard for others
                        if (activePage === "Upcoming reservations") {
                          return (
                            <ReservationCard 
                              key={index} 
                              workOrder={workOrder} 
                              reservationData={reservationData}
                              onClick={() => {
                                setSelectedReservationForView({
                                  roomName: "Sand Room",
                                  reservationName: "All Day event",
                                  date: reservationData?.date ?? workOrder.created,
                                  timeSlot: reservationData?.time ?? "All Day",
                                  location: workOrder.property ?? "1 Main St",
                                  capacity: 8,
                                  price: "$0"
                                });
                                setIsViewReservationModalOpen(true);
                              }}
                            />
                          );
                        }
                        
                        return (
                          <div key={workOrder.id} className="min-h-0 flex flex-col">
                            <WorkOrderCard 
                              workOrder={workOrder} 
                              hideAssignee={activePage === "Upcoming visits"}
                              visitorBadges={activePage === "Upcoming visits" ? visitorBadges : undefined}
                              visitorName={activePage === "Upcoming visits" ? visitorName : undefined}
                              hostName={activePage === "Upcoming visits" ? hostName : undefined}
                              cardIndex={index}
                              isEmpty={false}
                              onVisitorCardClick={activePage === "Upcoming visits" ? (wo) => { setSelectedViewVisitorCreated(wo.created); setIsViewVisitorModalOpen(true); } : undefined}
                              fixedHeight={workOrder.id === lastCreatedWorkOrderId ? 322 : undefined}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  (() => {
                    // Generate visitor data for table
                    const randomNames = ["Sarah Mitchell", "James Anderson", "Emily Chen", "Michael Rodriguez", "Jessica Taylor", "David Kim"];
                    const visitorData = activePage === "Upcoming visits" 
                      ? filteredAndSortedWorkOrders.map((_, index) => ({
                          visitorName: randomNames[index % randomNames.length],
                          hostName: "John Doe",
                          visitorBadges: index === 0 
                            ? { first: "First Visit", second: "Checked In" }
                            : { first: "First Visit", second: "Scheduled" }
                        }))
                      : undefined;

                    return (
                      <WorkOrdersTable 
                        workOrders={filteredAndSortedWorkOrders} 
                        sortState={selectedSorts}
                        onSort={toggleSort}
                        columnOrder={columnOrder}
                        onColumnReorder={setColumnOrder}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                        activePage={activePage}
                        visitorData={visitorData}
                        onVisitorRowClick={activePage === "Upcoming visits" ? (wo) => { setSelectedViewVisitorCreated(wo.created); setIsViewVisitorModalOpen(true); } : undefined}
                        onReservationRowClick={activePage === "Upcoming reservations" ? (wo) => {
                          setSelectedReservationForView({
                            roomName: "Sand Room",
                            reservationName: "All Day event",
                            date: wo.created,
                            timeSlot: "All Day",
                            location: wo.property ?? "1 Main St",
                            capacity: 8,
                            price: "$0"
                          });
                          setIsViewReservationModalOpen(true);
                        } : undefined}
                      />
                    );
                  })()
                )}
              </div>
              )}
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>


      {/* Create Work Order Modal */}
      <Dialog 
        open={isCreateModalOpen} 
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) {
            resetModalToDefault();
            // Reset modal type to match current page when closing
            setModalType(activePage === "Upcoming visits" ? "visitor" : "work-order");
          } else if (open && modalType === "visitor") {
            // Set default date and time when opening visitor modal
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            setVisitDateStart(todayStr);
            setVisitDateEnd(todayStr);
            const now = new Date();
            const nextHour = new Date(now);
            nextHour.setHours(now.getHours() + 1, 0, 0, 0);
            const nextHourStr = nextHour.toTimeString().slice(0, 5);
            setVisitTimeStart(nextHourStr);
            const endHour = new Date(nextHour);
            endHour.setHours(endHour.getHours() + 1, 0, 0, 0);
            setVisitTimeEnd(endHour.toTimeString().slice(0, 5));
          }
        }}
      >
        <DialogContent 
          className="sm:max-w-[590px] w-[590px] max-h-[calc(100vh-112px)] h-[calc(100vh-112px)] my-[56px] flex flex-col p-0 gap-0"
          style={{ maxHeight: 'calc(100vh - 112px)', height: 'calc(100vh - 112px)', maxWidth: '590px', width: '590px', overflow: 'hidden' }}
          showCloseButton={false}
        >
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b flex flex-row items-center justify-between">
            <DialogTitle className="m-0">
              {modalType === "visitor" ? "Create visitor" : modalType === "reservation" ? "Book resource" : "Create work order"}
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetModalToDefault();
              }}
              className="h-8 w-8"
            >
              <MaterialSymbol name="close" size={18} />
            </Button>
          </DialogHeader>
          
          <div ref={modalContentScrollRef} className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 space-y-6 px-4 py-4">
            {/* Reservation Tile Content - only for reservation modal */}
            {modalType === "reservation" && selectedReservation ? (
              <div className="border rounded-lg overflow-hidden">
                {/* Image Section */}
                <div className="w-full h-48 bg-muted relative overflow-hidden rounded-t-lg">
                  {selectedReservation.roomName === "Sand Room" ? (
                    <Image
                      src="/assets/sand-room.png"
                      alt="Sand Room"
                      fill
                      className="object-cover"
                    />
                  ) : selectedReservation.roomName === "Sky Room" ? (
                    <Image
                      src="/assets/sky-room.png"
                      alt="Sky Room"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 flex items-center justify-center">
                      <MaterialSymbol name="meeting_room" size={64} className="text-muted-foreground opacity-30" />
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="space-y-2 p-3">
                  {/* Room Name Badge with Icons */}
                  <div className="flex items-center justify-between gap-2">
                    {selectedReservation.roomName === "Sand Room" ? (
                      <Badge tonal="sand">
                        <MaterialSymbol name="meeting_room" size={14} className="mr-1.5" />
                        Sand Room
                      </Badge>
                    ) : selectedReservation.roomName === "Sky Room" ? (
                      <Badge tonal="science">
                        <MaterialSymbol name="meeting_room" size={14} className="mr-1.5" />
                        Sky Room
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-[#F4EDEA] text-foreground border-0 hover:bg-[#F4EDEA]">
                        <MaterialSymbol name="meeting_room" size={14} className="mr-1.5" />
                        {selectedReservation.roomName}
                      </Badge>
                    )}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1.5">
                        <MaterialSymbol name="person" size={16} className="text-muted-foreground" />
                        <span className="text-sm text-foreground">{selectedReservation.capacity} people</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MaterialSymbol name="sell" size={16} className="text-muted-foreground" />
                        <span className="text-sm text-foreground">{selectedReservation.price}</span>
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <p className="text-sm text-foreground">{selectedReservation.date}</p>

                  {/* Time Slot - Bold and Larger */}
                  <p className="text-base font-semibold text-foreground leading-tight">{selectedReservation.timeSlot}</p>

                  {/* Location */}
                  <p className="text-sm text-foreground">{selectedReservation.location}</p>
                </div>
              </div>
            ) : (
              /* Pre-filled Details Card - for work order and visitor modals */
              !isEditDetailsMode && (
                <Card className="bg-muted/50 py-0">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <MaterialSymbol name="lightbulb" size={20} className="text-muted-foreground mt-0.5" />
                      <p className="text-sm font-medium">We've pre-filled some details based on your account</p>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-8">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge>{property}</Badge>
                        </TooltipTrigger>
                        <TooltipContent>Property</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge>{floor}</Badge>
                        </TooltipTrigger>
                        <TooltipContent>Floor</TooltipContent>
                      </Tooltip>
                      {modalType === "visitor" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge>Starbucks</Badge>
                          </TooltipTrigger>
                          <TooltipContent>Company visiting</TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge>{requestedFor}</Badge>
                        </TooltipTrigger>
                        <TooltipContent>{modalType === "visitor" ? "Host" : "Requested For"}</TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-muted-foreground gap-1"
                        onClick={() => setIsEditDetailsMode(true)}
                      >
                        <MaterialSymbol name="edit" size={16} />
                        Edit details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}

            {/* Who is visiting section - only for visitor modal */}
            {modalType === "visitor" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 className="text-lg font-medium text-muted-foreground">Who is visiting</h3>
                
                <div className="space-y-2">
                  <Label>
                    <span style={{ color: 'var(--destructive-foreground)' }}>*</span>{" "}Name
                  </Label>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div className="flex-1" data-validation-field="visitorFirstName">
                      <Input
                        id="visitor-first-name"
                        placeholder="First name"
                        value={visitorFirstName}
                        onChange={(e) => {
                          setVisitorFirstName(e.target.value);
                          if (validationErrors.visitorFirstName && e.target.value.trim()) {
                            setValidationErrors(prev => ({ ...prev, visitorFirstName: false }));
                          }
                        }}
                        className={validationErrors.visitorFirstName ? 'focus-visible:ring-destructive focus-visible:ring-destructive/50' : ''}
                        style={validationErrors.visitorFirstName ? { borderColor: 'var(--color-semantic-stroke-rag-danger-default)', borderWidth: '1px' } : undefined}
                        aria-invalid={validationErrors.visitorFirstName ? true : undefined}
                        required
                      />
                    </div>
                    <div className="flex-1" data-validation-field="visitorLastName">
                      <Input
                        id="visitor-last-name"
                        placeholder="Last name"
                        value={visitorLastName}
                        onChange={(e) => {
                          setVisitorLastName(e.target.value);
                          if (validationErrors.visitorLastName && e.target.value.trim()) {
                            setValidationErrors(prev => ({ ...prev, visitorLastName: false }));
                          }
                        }}
                        className={validationErrors.visitorLastName ? 'focus-visible:ring-destructive focus-visible:ring-destructive/50' : ''}
                        style={validationErrors.visitorLastName ? { borderColor: 'var(--color-semantic-stroke-rag-danger-default)', borderWidth: '1px' } : undefined}
                        aria-invalid={validationErrors.visitorLastName ? true : undefined}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="visitor-toggle" className="cursor-pointer">Premier access</Label>
                    <Switch
                      id="visitor-toggle"
                      checked={visitorToggle}
                      onCheckedChange={setVisitorToggle}
                      disabled={true}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Providing a visitor with Premier Access will send them an email to check-in online the day of the visit.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitor-email">Email</Label>
                  <Input
                    id="visitor-email"
                    type="email"
                    placeholder="Enter email"
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitor-phone">Phone</Label>
                  <Input
                    id="visitor-phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Date & Time of upcoming visit section - only for visitor modal */}
            {modalType === "visitor" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 className="text-lg font-medium text-muted-foreground">When is the visit occurring</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="all-day" className="cursor-pointer">All day</Label>
                    <Switch
                      id="all-day"
                      checked={allDay}
                      onCheckedChange={setAllDay}
                    />
                  </div>
                </div>

                <div className="space-y-2" data-validation-field="visitDateStart">
                  <Label>
                    <span style={{ color: 'var(--destructive-foreground)' }}>*</span>{" "}Date & Time
                  </Label>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div className={allDay ? "w-full" : "flex-1"}>
                      <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-between ${validationErrors.visitDateStart || validationErrors.visitDateEnd ? 'border-destructive' : ''}`}
                            onClick={() => setDateRangeOpen(true)}
                          >
                            <span className="text-sm">
                              {visitDateStart && visitDateEnd
                                ? `${new Date(visitDateStart).toLocaleDateString('en-US')} - ${new Date(visitDateEnd).toLocaleDateString('en-US')}`
                                : 'Select date range'}
                            </span>
                            <MaterialSymbol name="calendar_today" size={16} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-4" align="start">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="visit-date-start" className="text-xs">Start Date</Label>
                              <Input
                                id="visit-date-start"
                                type="date"
                                value={visitDateStart}
                                onChange={(e) => {
                                  setVisitDateStart(e.target.value);
                                  if (validationErrors.visitDateStart && e.target.value.trim()) {
                                    setValidationErrors(prev => ({ ...prev, visitDateStart: false }));
                                  }
                                }}
                                lang="en-US"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="visit-date-end" className="text-xs">End Date</Label>
                              <Input
                                id="visit-date-end"
                                type="date"
                                value={visitDateEnd}
                                onChange={(e) => {
                                  setVisitDateEnd(e.target.value);
                                  if (validationErrors.visitDateEnd && e.target.value.trim()) {
                                    setValidationErrors(prev => ({ ...prev, visitDateEnd: false }));
                                  }
                                }}
                                lang="en-US"
                              />
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    {!allDay && (
                      <div className="flex-1" data-validation-field="visitTimeStart">
                        <Popover open={timeRangeOpen} onOpenChange={setTimeRangeOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-between ${validationErrors.visitTimeStart || validationErrors.visitTimeEnd ? 'border-destructive' : ''}`}
                              onClick={() => setTimeRangeOpen(true)}
                            >
                              <span className="text-sm">
                                {visitTimeStart && visitTimeEnd
                                  ? `${formatTimeUS(visitTimeStart)} - ${formatTimeUS(visitTimeEnd)}`
                                  : 'Select time range'}
                              </span>
                              <MaterialSymbol name="schedule" size={16} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-4" align="start">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="visit-time-start" className="text-xs">Start Time</Label>
                                <Input
                                  id="visit-time-start"
                                  type="time"
                                  value={visitTimeStart}
                                  onChange={(e) => {
                                    setVisitTimeStart(e.target.value);
                                    if (validationErrors.visitTimeStart && e.target.value.trim()) {
                                      setValidationErrors(prev => ({ ...prev, visitTimeStart: false }));
                                    }
                                  }}
                                  lang="en-US"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="visit-time-end" className="text-xs">End Time</Label>
                                <Input
                                  id="visit-time-end"
                                  type="time"
                                  value={visitTimeEnd}
                                  onChange={(e) => {
                                    setVisitTimeEnd(e.target.value);
                                    if (validationErrors.visitTimeEnd && e.target.value.trim()) {
                                      setValidationErrors(prev => ({ ...prev, visitTimeEnd: false }));
                                    }
                                  }}
                                  lang="en-US"
                                />
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Type of work section - only for work orders */}
            {modalType === "work-order" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 className="text-lg font-medium text-muted-foreground">Type of work being requested</h3>
                
                <div className="space-y-2" data-validation-field="issueType">
                  <Label htmlFor="issue-type">
                    <span style={{ color: 'var(--destructive-foreground)' }}>*</span>{" "}Issue type
                  </Label>
                  <GroupedCombobox
                    options={issueTypeOptions}
                    value={issueType}
                    onValueChange={(value) => {
                      setIssueType(value);
                      if (validationErrors.issueType && value.trim()) {
                        setValidationErrors(prev => ({ ...prev, issueType: false }));
                      }
                    }}
                    placeholder="Choose type"
                    searchPlaceholder="Search issue types..."
                    emptyText="No issue type found."
                    hasError={validationErrors.issueType}
                  />
                </div>

                <div className="space-y-2" data-validation-field="details">
                  <Label htmlFor="details">
                    <span style={{ color: 'var(--destructive-foreground)' }}>*</span>{" "}Details
                  </Label>
                  <Textarea 
                    id="details"
                    placeholder="Provide further details for the work"
                    className={`h-[100px] resize-y ${validationErrors.details ? 'focus-visible:ring-destructive focus-visible:ring-destructive/50' : ''}`}
                    style={validationErrors.details ? { borderColor: 'var(--color-semantic-stroke-rag-danger-default)', borderWidth: '1px' } : undefined}
                    aria-invalid={validationErrors.details ? true : undefined}
                    value={details}
                    onChange={(e) => {
                      setDetails(e.target.value);
                      if (validationErrors.details && e.target.value.trim()) {
                        setValidationErrors(prev => ({ ...prev, details: false }));
                      }
                    }}
                    required
                  />
                </div>
              </div>
            )}

            {/* Reservation details section - only for reservation modal */}
            {modalType === "reservation" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 className="text-lg font-medium text-muted-foreground">Reservation details</h3>
                
                <div className="space-y-2" data-validation-field="visitDateStart">
                  <Label>
                    <span style={{ color: 'var(--destructive-foreground)' }}>*</span>{" "}Date & Time
                  </Label>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div className="flex-1">
                      <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-between ${validationErrors.visitDateStart || validationErrors.visitDateEnd ? 'border-destructive' : ''}`}
                            onClick={() => setDateRangeOpen(true)}
                          >
                            <span className="text-sm">
                              {visitDateStart && visitDateEnd 
                                ? `${new Date(visitDateStart).toLocaleDateString('en-US')} - ${new Date(visitDateEnd).toLocaleDateString('en-US')}`
                                : 'Select date range'}
                            </span>
                            <MaterialSymbol name="calendar_today" size={16} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-4" align="start">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="reservation-date-start" className="text-xs">Start Date</Label>
                              <Input
                                id="reservation-date-start"
                                type="date"
                                value={visitDateStart}
                                onChange={(e) => {
                                  setVisitDateStart(e.target.value);
                                  if (validationErrors.visitDateStart && e.target.value.trim()) {
                                    setValidationErrors(prev => ({ ...prev, visitDateStart: false }));
                                  }
                                }}
                                className={validationErrors.visitDateStart ? 'focus-visible:ring-destructive focus-visible:ring-destructive/50' : ''}
                                style={validationErrors.visitDateStart ? { borderColor: 'var(--color-semantic-stroke-rag-danger-default)', borderWidth: '1px' } : undefined}
                                aria-invalid={validationErrors.visitDateStart ? true : undefined}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="reservation-date-end" className="text-xs">End Date</Label>
                              <Input
                                id="reservation-date-end"
                                type="date"
                                value={visitDateEnd}
                                onChange={(e) => {
                                  setVisitDateEnd(e.target.value);
                                  if (validationErrors.visitDateEnd && e.target.value.trim()) {
                                    setValidationErrors(prev => ({ ...prev, visitDateEnd: false }));
                                  }
                                }}
                                className={validationErrors.visitDateEnd ? 'focus-visible:ring-destructive focus-visible:ring-destructive/50' : ''}
                                style={validationErrors.visitDateEnd ? { borderColor: 'var(--color-semantic-stroke-rag-danger-default)', borderWidth: '1px' } : undefined}
                                aria-invalid={validationErrors.visitDateEnd ? true : undefined}
                                required
                              />
                            </div>
                            <Button 
                              variant="secondary" 
                              className="w-full"
                              onClick={() => setDateRangeOpen(false)}
                            >
                              Done
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    {!allDay && (
                      <div className="flex-1" data-validation-field="visitTimeStart">
                        <Popover open={timeRangeOpen} onOpenChange={setTimeRangeOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-between ${validationErrors.visitTimeStart || validationErrors.visitTimeEnd ? 'border-destructive' : ''}`}
                              onClick={() => setTimeRangeOpen(true)}
                            >
                              <span className="text-sm">
                                {visitTimeStart && visitTimeEnd 
                                  ? `${formatTimeUS(visitTimeStart)} - ${formatTimeUS(visitTimeEnd)}`
                                  : 'Select time range'}
                              </span>
                              <MaterialSymbol name="schedule" size={16} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-4" align="start">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="reservation-time-start" className="text-xs">Start Time</Label>
                                <Input
                                  id="reservation-time-start"
                                  type="time"
                                  value={visitTimeStart}
                                  onChange={(e) => {
                                    setVisitTimeStart(e.target.value);
                                    if (validationErrors.visitTimeStart && e.target.value.trim()) {
                                      setValidationErrors(prev => ({ ...prev, visitTimeStart: false }));
                                    }
                                  }}
                                  className={validationErrors.visitTimeStart ? 'focus-visible:ring-destructive focus-visible:ring-destructive/50' : ''}
                                  style={validationErrors.visitTimeStart ? { borderColor: 'var(--color-semantic-stroke-rag-danger-default)', borderWidth: '1px' } : undefined}
                                  aria-invalid={validationErrors.visitTimeStart ? true : undefined}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="reservation-time-end" className="text-xs">End Time</Label>
                                <Input
                                  id="reservation-time-end"
                                  type="time"
                                  value={visitTimeEnd}
                                  onChange={(e) => {
                                    const endHour = new Date();
                                    const [hours, minutes] = e.target.value.split(':').map(Number);
                                    endHour.setHours(hours, minutes, 0, 0);
                                    setVisitTimeEnd(e.target.value);
                                    if (validationErrors.visitTimeEnd && e.target.value.trim()) {
                                      setValidationErrors(prev => ({ ...prev, visitTimeEnd: false }));
                                    }
                                  }}
                                  className={validationErrors.visitTimeEnd ? 'focus-visible:ring-destructive focus-visible:ring-destructive/50' : ''}
                                  style={validationErrors.visitTimeEnd ? { borderColor: 'var(--color-semantic-stroke-rag-danger-default)', borderWidth: '1px' } : undefined}
                                  aria-invalid={validationErrors.visitTimeEnd ? true : undefined}
                                  required
                                />
                              </div>
                              <Button 
                                variant="secondary" 
                                className="w-full"
                                onClick={() => setTimeRangeOpen(false)}
                              >
                                Done
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2" data-validation-field="reservationDetails">
                  <Label htmlFor="reservation-details">
                    <span style={{ color: 'var(--destructive-foreground)' }}>*</span>{" "}Details
                  </Label>
                  <Textarea 
                    id="reservation-details"
                    placeholder="Provide further details for the reservation"
                    className={`h-[100px] resize-y ${validationErrors.reservationDetails ? 'focus-visible:ring-destructive focus-visible:ring-destructive/50' : ''}`}
                    style={validationErrors.reservationDetails ? { borderColor: 'var(--color-semantic-stroke-rag-danger-default)', borderWidth: '1px' } : undefined}
                    aria-invalid={validationErrors.reservationDetails ? true : undefined}
                    value={reservationDetails}
                    onChange={(e) => {
                      setReservationDetails(e.target.value);
                      if (validationErrors.reservationDetails && e.target.value.trim()) {
                        setValidationErrors(prev => ({ ...prev, reservationDetails: false }));
                      }
                    }}
                    required
                  />
                </div>
              </div>
            )}

            {/* Location section - only for work orders (8px less gap from Type of work block) */}
            {modalType === "work-order" && (
              <div className="-mt-2" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 className="text-lg font-medium text-muted-foreground">Where will the work be performed</h3>
                
                {isEditDetailsMode && (
                  <>
                    <div className="space-y-2" data-validation-field="property">
                      <Label htmlFor="property">
                        <span style={{ color: 'var(--destructive-foreground)' }}>*</span>{" "}Property
                      </Label>
                      <Select 
                        value={property} 
                        onValueChange={(value) => {
                          setProperty(value);
                          if (validationErrors.property && value.trim()) {
                            setValidationErrors(prev => ({ ...prev, property: false }));
                          }
                        }}
                      >
                        <SelectTrigger 
                          id="property" 
                          className={validationErrors.property ? 'focus-visible:ring-destructive focus-visible:ring-destructive/50' : ''}
                          style={validationErrors.property ? { borderColor: 'var(--color-semantic-stroke-rag-danger-default)', borderWidth: '1px' } : undefined}
                          aria-invalid={validationErrors.property ? true : undefined}
                        >
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2" data-validation-field="floor">
                      <Label htmlFor="floor">
                        <span style={{ color: 'var(--destructive-foreground)' }}>*</span>{" "}Floor
                      </Label>
                      <Select
                        value={floor}
                        onValueChange={(value) => {
                          setFloor(value);
                          if (validationErrors.floor && value.trim()) {
                            setValidationErrors(prev => ({ ...prev, floor: false }));
                          }
                        }}
                      >
                        <SelectTrigger 
                          id="floor" 
                          className={validationErrors.floor ? 'focus-visible:ring-destructive focus-visible:ring-destructive/50' : ''}
                          style={validationErrors.floor ? { borderColor: 'var(--color-semantic-stroke-rag-danger-default)', borderWidth: '1px' } : undefined}
                          aria-invalid={validationErrors.floor ? true : undefined}
                        >
                          <SelectValue placeholder="Select floor" />
                        </SelectTrigger>
                        <SelectContent>
                          {floorOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="location">Specific location</Label>
                  <Input 
                    id="location"
                    value={specificLocation}
                    onChange={(e) => setSpecificLocation(e.target.value)}
                    placeholder="Where does the work need to be done?"
                  />
                </div>
              </div>
            )}

            {/* Requester information section */}
            {isEditDetailsMode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 className="text-lg font-medium text-muted-foreground">Requester information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="company">
                    <span style={{ color: 'var(--destructive-foreground)' }}>*</span>{" "}Company
                  </Label>
                  <Select 
                    value={company} 
                    onValueChange={(value) => {
                      setCompany(value);
                      if (validationErrors.company && value.trim()) {
                        setValidationErrors(prev => ({ ...prev, company: false }));
                      }
                    }}
                  >
                    <SelectTrigger 
                      id="company" 
                      className={validationErrors.company ? 'focus-visible:ring-destructive focus-visible:ring-destructive/50' : ''}
                      style={validationErrors.company ? { borderColor: 'var(--color-semantic-stroke-rag-danger-default)', borderWidth: '1px' } : undefined}
                      aria-invalid={validationErrors.company ? true : undefined}
                    >
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2" data-validation-field="requestedFor">
                  <Label htmlFor="requested-for">
                    <span style={{ color: 'var(--destructive-foreground)' }}>*</span>{" "}{modalType === "visitor" ? "Created for" : "Requested For"}
                  </Label>
                  <Select
                    value={requestedFor}
                    onValueChange={(value) => {
                      setRequestedFor(value);
                      if (validationErrors.requestedFor && value.trim()) {
                        setValidationErrors(prev => ({ ...prev, requestedFor: false }));
                      }
                    }}
                  >
                    <SelectTrigger 
                      id="requested-for" 
                      className={validationErrors.requestedFor ? 'focus-visible:ring-destructive focus-visible:ring-destructive/50' : ''}
                      style={validationErrors.requestedFor ? { borderColor: 'var(--color-semantic-stroke-rag-danger-default)', borderWidth: '1px' } : undefined}
                      aria-invalid={validationErrors.requestedFor ? true : undefined}
                    >
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      {requestedForFormOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 px-6 flex-shrink-0 flex justify-end gap-2 border-t">
            <Button variant="ghost" onClick={() => {
              setIsCreateModalOpen(false);
              resetModalToDefault();
            }}>
              Cancel
            </Button>
            <Button 
              className="gap-1.5" 
              onClick={() => {
                // Validate required fields
                const errors: Record<string, boolean> = {};
                
                if (modalType === "visitor") {
                  if (!visitorFirstName.trim()) {
                    errors.visitorFirstName = true;
                  }
                  if (!visitorLastName.trim()) {
                    errors.visitorLastName = true;
                  }
                  if (!visitDateStart.trim()) {
                    errors.visitDateStart = true;
                  }
                  if (!visitDateEnd.trim()) {
                    errors.visitDateEnd = true;
                  }
                  if (!allDay) {
                    if (!visitTimeStart.trim()) {
                      errors.visitTimeStart = true;
                    }
                    if (!visitTimeEnd.trim()) {
                      errors.visitTimeEnd = true;
                    }
                  }
                } else if (modalType === "reservation") {
                  if (!visitDateStart.trim()) {
                    errors.visitDateStart = true;
                  }
                  if (!visitDateEnd.trim()) {
                    errors.visitDateEnd = true;
                  }
                  if (!allDay) {
                    if (!visitTimeStart.trim()) {
                      errors.visitTimeStart = true;
                    }
                    if (!visitTimeEnd.trim()) {
                      errors.visitTimeEnd = true;
                    }
                  }
                  if (!reservationDetails.trim()) {
                    errors.reservationDetails = true;
                  }
                } else {
                  if (!issueType.trim()) {
                    errors.issueType = true;
                  }
                  if (!details.trim()) {
                    errors.details = true;
                  }
                  
                  if (isEditDetailsMode) {
                    if (!property.trim()) {
                      errors.property = true;
                    }
                    if (!floor.trim()) {
                      errors.floor = true;
                    }
                    if (!company.trim()) {
                      errors.company = true;
                    }
                    if (!requestedFor.trim()) {
                      errors.requestedFor = true;
                    }
                  }
                }
                
                setValidationErrors(errors);
                
                // Only close modal and add work order if no errors (work-order modal only)
                if (Object.keys(errors).length === 0) {
                  if (modalType === "work-order") {
                    // Generate new ID from max existing (e.g. W-11631-000047 -> 47, next 48)
                    const prefix = "W-11631-";
                    const maxNum = workOrdersList.reduce((max, wo) => {
                      const match = wo.id.match(/^W-11631-(\d+)$/);
                      const n = match ? parseInt(match[1], 10) : 0;
                      return n > max ? n : max;
                    }, 0);
                    const newId = `${prefix}${String(maxNum + 1).padStart(6, "0")}`;
                    const selectedIssueOption = issueTypeOptions.find((opt) => opt.value === issueType.trim());
                    const issueTypeLabel = selectedIssueOption?.label ?? issueType.trim();
                    const issueTypeGroup = selectedIssueOption?.group ?? issueType.trim();
                    const iconForGroup = issueTypeGroup ? (issueTypeGroupIcon[issueTypeGroup] ?? "construction") : "construction";
                    const newWorkOrder: WorkOrderItem = {
                      id: newId,
                      title: issueTypeLabel,
                      category: issueTypeGroup,
                      type: issueTypeGroup,
                      priority: "Medium",
                      status: "New",
                      assignee: requestedFor.trim() || "John Doe",
                      created: formatDate(new Date()),
                      property: property.trim() || "1 Main St",
                      description: details.trim(),
                      icon: iconForGroup,
                      attachments: 0,
                      comments: 0,
                      tasks: 0,
                      files: 0,
                    };
                    setWorkOrdersList((prev) => [newWorkOrder, ...prev]);
                    setLastCreatedWorkOrderId(newWorkOrder.id);
                    // Persist so detail page can show newly created work orders
                    try {
                      const key = "alize-created-work-orders";
                      const raw = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(key) : null;
                      const list: WorkOrderItem[] = raw ? JSON.parse(raw) : [];
                      list.unshift(newWorkOrder);
                      sessionStorage.setItem(key, JSON.stringify(list));
                    } catch {
                      // ignore
                    }
                  }
                  setIsCreateModalOpen(false);
                  resetModalToDefault();
                }
              }}
            >
              {modalType === "visitor" ? "Create visitor" : modalType === "reservation" ? "Book resource" : "Create work order"}
              <MaterialSymbol name="check" size={16} />
            </Button>
          </DialogFooter>

          <div className="flex items-center justify-end gap-2 pt-4 px-6 pb-4 flex-shrink-0 box-content">
            <Checkbox 
              id="create-another" 
              checked={createAnother}
              onCheckedChange={(checked) => setCreateAnother(checked as boolean)}
            />
            <Label htmlFor="create-another" className="text-sm cursor-pointer">
              {modalType === "visitor" ? "Create another visitor" : modalType === "reservation" ? "Book another resource" : "Create another work order"}
            </Label>
          </div>
        </DialogContent>
      </Dialog>

      {/* View visitor Modal */}
      <Dialog open={isViewVisitorModalOpen} onOpenChange={(open) => { setIsViewVisitorModalOpen(open); if (!open) setSelectedViewVisitorCreated(null); }}>
        <DialogContent
          className="sm:max-w-[590px] w-[590px] max-h-[calc(100vh-112px)] h-[calc(100vh-112px)] my-[56px] flex flex-col p-0 gap-0"
          style={{ maxHeight: 'calc(100vh - 112px)', height: 'calc(100vh - 112px)', maxWidth: '590px', width: '590px', overflow: 'hidden' }}
          showCloseButton={false}
          aria-describedby={undefined}
        >
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b flex flex-row items-center justify-between">
            <DialogTitle className="m-0">View visitor</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsViewVisitorModalOpen(false)}
              className="h-8 w-8"
            >
              <MaterialSymbol name="close" size={18} />
            </Button>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 px-6 py-6 flex flex-col items-start gap-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tonal="science">First Visit</Badge>
              <Badge variant="default">Checked In</Badge>
            </div>
            <div className="flex items-start gap-3">
              <Avatar size="lg">
                <AvatarFallback>SM</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Guest</p>
                <h3 className="font-semibold text-base">Sarah Mitchell</h3>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 w-full">
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">{selectedViewVisitorCreated ?? formatDate(new Date())}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="text-sm font-medium">9:00 AM - 5:00 PM</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">sarah.mitchell@example.com</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">+1 555-0123</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Property</p>
                <p className="text-sm font-normal text-semantic-text-interaction-default underline cursor-pointer hover:underline">1 Main St</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Floor</p>
                <p className="text-sm font-medium">Floor 1</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Company</p>
                <p className="text-sm font-normal text-semantic-text-interaction-default underline cursor-pointer hover:underline">Starbucks</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Host</p>
                <p className="text-sm font-normal text-semantic-text-interaction-default underline cursor-pointer hover:underline">John Doe</p>
              </div>
            </div>
            <Accordion type="single" collapsible defaultValue="additional-info" className="w-full">
              <AccordionItem value="additional-info" className="border-none">
                <AccordionTrigger className="pointer-events-none cursor-default [&[data-state=open]>svg]:rotate-0 hover:no-underline py-2">
                  Additional information
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-1 pt-0">
                    <h4 className="text-sm font-normal text-muted-foreground">0 Related visitors</h4>
                    <h4 className="text-sm font-normal text-muted-foreground">0 Upcoming visits</h4>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <DialogFooter className="pt-4 px-6 pb-4 flex-shrink-0 flex justify-end gap-2 border-t">
            <Button variant="ghost" onClick={() => setIsViewVisitorModalOpen(false)}>
              Close
            </Button>
            <Button variant="destructive" className="gap-1.5">
              <MaterialSymbol name="cancel" size={16} />
              Cancel visit
            </Button>
            <Button variant="secondary" className="gap-1.5">
              <MaterialSymbol name="edit" size={16} />
              Edit visit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View reservation Modal */}
      <Dialog open={isViewReservationModalOpen} onOpenChange={(open) => { setIsViewReservationModalOpen(open); if (!open) setSelectedReservationForView(null); }}>
        <DialogContent
          className="sm:max-w-[590px] w-[590px] max-h-[calc(100vh-112px)] h-[calc(100vh-112px)] my-[56px] flex flex-col p-0 gap-0"
          style={{ maxHeight: 'calc(100vh - 112px)', height: 'calc(100vh - 112px)', maxWidth: '590px', width: '590px', overflow: 'hidden' }}
          showCloseButton={false}
          aria-describedby={undefined}
        >
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b flex flex-row items-center justify-between">
            <DialogTitle className="m-0">View reservation</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setIsViewReservationModalOpen(false); setSelectedReservationForView(null); }}
              className="h-8 w-8"
            >
              <MaterialSymbol name="close" size={18} />
            </Button>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 px-6 py-6 flex flex-col items-start gap-6">
            {selectedReservationForView && (
              <>
                {/* Image - no border */}
                <div className="w-full h-48 bg-muted relative overflow-hidden rounded-lg">
                  {selectedReservationForView.roomName === "Sand Room" ? (
                    <Image
                      src="/assets/sand-room.png"
                      alt="Sand Room"
                      fill
                      className="object-cover"
                    />
                  ) : selectedReservationForView.roomName === "Sky Room" ? (
                    <Image
                      src="/assets/sky-room.png"
                      alt="Sky Room"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 flex items-center justify-center">
                      <MaterialSymbol name="meeting_room" size={64} className="text-muted-foreground opacity-30" />
                    </div>
                  )}
                </div>

                {/* Reservation name tile */}
                <div className="w-full">
                  {selectedReservationForView.roomName === "Sand Room" ? (
                    <Badge tonal="sand">
                      <MaterialSymbol name="meeting_room" size={14} className="mr-1.5" />
                      Sand Room
                    </Badge>
                  ) : selectedReservationForView.roomName === "Sky Room" ? (
                    <Badge tonal="science">
                      <MaterialSymbol name="meeting_room" size={14} className="mr-1.5" />
                      Sky Room
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-[#F4EDEA] text-foreground border-0 hover:bg-[#F4EDEA]">
                      <MaterialSymbol name="meeting_room" size={14} className="mr-1.5" />
                      {selectedReservationForView.roomName}
                    </Badge>
                  )}
                  <h3 className="font-semibold text-base mt-2">{selectedReservationForView.reservationName}</h3>
                </div>

                {/* Label group - Description row */}
                <div className="w-full">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm text-foreground line-clamp-3 mt-0.5">
                    Business meeting to discuss quarterly strategy, review performance metrics, and plan upcoming initiatives with key stakeholders.
                  </p>
                </div>
                <Separator className="w-full" />
                {/* Other label group row */}
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm font-medium">{selectedReservationForView.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="text-sm font-medium">{selectedReservationForView.timeSlot}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Property</p>
                    <p className="text-sm font-medium truncate">{selectedReservationForView.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Floor</p>
                    <p className="text-sm font-medium">4</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="text-sm font-medium">Starbucks</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="text-sm font-medium">Common Area</p>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="pt-4 px-6 pb-4 flex-shrink-0 flex justify-end gap-2 border-t">
            <Button variant="ghost" onClick={() => { setIsViewReservationModalOpen(false); setSelectedReservationForView(null); }}>
              Close
            </Button>
            <Button variant="destructive" className="gap-1.5">
              <MaterialSymbol name="cancel" size={16} />
              Cancel reservation
            </Button>
            <Button variant="secondary" className="gap-1.5">
              <MaterialSymbol name="edit" size={16} />
              Edit reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Thin wrapper that calls useSearchParams – only rendered after client mount to avoid recoverable error during prerender
function DashboardWithSearchParams() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const initialActivePage: ActivePage =
    pageParam === "Home" || pageParam === "Tasks" || pageParam === "Upcoming visits" || pageParam === "Upcoming reservations" || pageParam === "Create reservation"
      ? pageParam
      : "Home";
  return <DashboardPage initialActivePage={initialActivePage} searchParams={searchParams} />;
}

const DashboardFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <p className="text-muted-foreground">Loading...</p>
  </div>
);

export default function DashboardPageWithSuspense() {
  // Defer useSearchParams until after client mount so it never runs during prerender (avoids recoverable error)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <DashboardFallback />;
  }

  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardWithSearchParams />
    </Suspense>
  );
}
