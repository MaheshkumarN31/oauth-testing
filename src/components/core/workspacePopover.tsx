import { Building2, Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import type { Workspace } from '@/types'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type WorkspaceComboBoxProps = {
  allWorkspaces: Array<Workspace>
  selectedWorkspace: Workspace | null
  setSelectedWorkspace: (workspace: Workspace) => void
}

export function WorkspaceComboBox({
  allWorkspaces,
  selectedWorkspace,
  setSelectedWorkspace,
}: WorkspaceComboBoxProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between"
        >
          {selectedWorkspace ? selectedWorkspace.name : 'Select workspace'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search workspaces..." />
          <CommandEmpty>No workspace found.</CommandEmpty>
          <CommandGroup>
            {(Array.isArray(allWorkspaces) ? allWorkspaces : []).map((workspace) => (
              <CommandItem
                key={workspace._id}
                value={workspace.name}
                onSelect={() => {
                  setSelectedWorkspace(workspace)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    selectedWorkspace?._id === workspace._id
                      ? 'opacity-100'
                      : 'opacity-0',
                  )}
                />
                {workspace.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function WorkspaceSidebarSelector({
  allWorkspaces,
  selectedWorkspace,
  setSelectedWorkspace,
}: WorkspaceComboBoxProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto py-2 px-3 bg-sidebar-accent/50 border-sidebar-border hover:bg-sidebar-accent"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30">
              <Building2 className="h-3 w-3 text-indigo-500" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground">Workspace</span>
              <span className="text-sm font-medium truncate max-w-[140px]">
                {selectedWorkspace?.name || 'Select...'}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search workspaces..." className="h-9" />
          <CommandEmpty>No workspace found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {(Array.isArray(allWorkspaces) ? allWorkspaces : []).map((workspace) => (
              <CommandItem
                key={workspace._id}
                value={workspace.name}
                onSelect={() => {
                  setSelectedWorkspace(workspace)
                  setOpen(false)
                }}
                className="flex items-center gap-2 py-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30">
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
      </PopoverContent>
    </Popover>
  )
}
