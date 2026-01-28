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
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronUp,
  Building2,
  FolderOpen,
  Users,
  BarChart3,
  Check,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import type { Workspace } from '@/components/dashboard'
import { WorkspaceSidebarSelector } from '@/components/core/workspacePopover'

interface AppSidebarProps {
  workspaces?: Workspace[]
  selectedWorkspace: Workspace | null
  setSelectedWorkspace: (workspace: Workspace) => void
}

// Logo with Slack-like workspace popover for collapsed sidebar
function SidebarLogo({
  workspaces,
  selectedWorkspace,
  setSelectedWorkspace,
}: AppSidebarProps) {
  const { state } = useSidebar()
  const [open, setOpen] = useState(false)
  const isCollapsed = state === 'collapsed'

  const logoContent = (
    <div
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0',
        isCollapsed &&
        'cursor-pointer hover:ring-2 hover:ring-indigo-400 hover:ring-offset-2 hover:ring-offset-sidebar transition-all',
      )}
    >
      <Building2 className="h-4 w-4 text-white" />
    </div>
  )

  // When collapsed, show popover on logo click
  if (isCollapsed) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center justify-center focus:outline-none">
            {logoContent}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[280px] p-0"
          side="right"
          align="start"
          sideOffset={12}
        >
          {/* Header with current workspace */}
          <div className="flex items-center gap-3 p-3 border-b">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold truncate">
                {selectedWorkspace?.name || 'eSign Pro'}
              </span>
              <span className="text-xs text-muted-foreground">
                {selectedWorkspace?.type || 'Workspace'}
              </span>
            </div>
          </div>

          {/* Workspace list */}
          <Command>
            <CommandInput placeholder="Search workspaces..." className="h-9" />
            <CommandEmpty>No workspace found.</CommandEmpty>
            <CommandGroup className="max-h-[250px] overflow-auto p-1">
              {(workspaces || []).map((workspace) => (
                <CommandItem
                  key={workspace._id}
                  value={workspace.name}
                  onSelect={() => {
                    setSelectedWorkspace(workspace)
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 py-2 px-2 rounded-md"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 shrink-0">
                    <Building2 className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">
                      {workspace.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1 py-0 h-4"
                      >
                        {workspace.type || 'Workspace'}
                      </Badge>
                      {workspace.is_owner && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 h-4 border-indigo-500/50 text-indigo-600"
                        >
                          Owner
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Check
                    className={cn(
                      'h-4 w-4 shrink-0',
                      selectedWorkspace?._id === workspace._id
                        ? 'opacity-100 text-indigo-600'
                        : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>

          {/* Add workspace option */}
          <div className="border-t p-2">
            <button className="flex items-center gap-2 w-full p-2 rounded-md text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <Plus className="h-4 w-4" />
              Add a workspace
            </button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // When expanded, just show the logo
  return logoContent
}

export function AppSidebar({
  workspaces,
  selectedWorkspace,
  setSelectedWorkspace,
}: AppSidebarProps) {
  const location = useLocation()
  const userId = localStorage.getItem('user_id') || ''

  const navItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: `/dashboard?user_id=${userId}`,
      path: '/dashboard',
    },
    {
      title: 'Templates',
      icon: FolderOpen,
      href: `/templates?user_id=${userId}`,
      path: '/templates',
    },
    {
      title: 'Team',
      icon: Users,
      href: '#',
      path: '/team',
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      href: '#',
      path: '/analytics',
    },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-1 py-3">
          <SidebarLogo
            workspaces={workspaces}
            selectedWorkspace={selectedWorkspace}
            setSelectedWorkspace={setSelectedWorkspace}
          />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">eSign Pro</span>
            <span className="text-xs text-muted-foreground">
              Document Management
            </span>
          </div>
        </div>

        {/* Workspace Selector - only visible when expanded */}
        <div className="px-2 group-data-[collapsible=icon]:hidden">
          <WorkspaceSidebarSelector
            allWorkspaces={workspaces || []}
            selectedWorkspace={selectedWorkspace}
            setSelectedWorkspace={setSelectedWorkspace}
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="transition-all duration-200"
                    >
                      <Link to={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                      US
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">User</span>
                    <span className="truncate text-xs text-muted-foreground">
                      user@example.com
                    </span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                        US
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">User</span>
                      <span className="truncate text-xs text-muted-foreground">
                        user@example.com
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export { SidebarProvider, SidebarInset, SidebarTrigger }
