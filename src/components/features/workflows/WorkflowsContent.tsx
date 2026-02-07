import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  GitBranch,
  Plus,
  Clock,
  MoreVertical,
  Play,
  Pause,
  Trash2,
  Search,
  Zap,
  ArrowRight,
} from 'lucide-react'
import { PageHeader } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useWorkflows } from '@/hooks/queries'
import type { Workspace, Workflow } from '@/types'

interface WorkflowsContentProps {
  selectedWorkspace: Workspace | null
}

function getStatusConfig(status?: string) {
  switch (status?.toLowerCase()) {
    case 'active':
      return {
        label: 'Active',
        className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        dot: 'bg-emerald-500',
      }
    case 'paused':
      return {
        label: 'Paused',
        className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        dot: 'bg-amber-500',
      }
    case 'draft':
      return {
        label: 'Draft',
        className: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
        dot: 'bg-slate-400',
      }
    default:
      return {
        label: status || 'Unknown',
        className: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
        dot: 'bg-slate-400',
      }
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const statusConfig = getStatusConfig(workflow.status)

  return (
    <Card className="group relative overflow-hidden border border-border/50 bg-card hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 group-hover:from-indigo-500/20 group-hover:to-purple-500/20 transition-colors">
              <Zap className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate group-hover:text-indigo-600 transition-colors">
                {workflow.name}
              </h3>
              {workflow.template_name && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {workflow.template_name}
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem>
                <Play className="mr-2 h-3.5 w-3.5" />
                Run
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Pause className="mr-2 h-3.5 w-3.5" />
                Pause
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {workflow.description && (
          <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
            {workflow.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <Badge
            variant="outline"
            className={`text-[10px] px-2 py-0.5 font-medium ${statusConfig.className}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${statusConfig.dot}`} />
            {statusConfig.label}
          </Badge>

          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDate(workflow.created_at)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function WorkflowCardSkeleton() {
  return (
    <Card className="border border-border/50">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-3 w-2/3 mb-4" />
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

function CreateWorkflowDialog({
  open,
  onOpenChange,
  onNavigate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: (name: string) => void
}) {
  const [workflowName, setWorkflowName] = useState('')

  const handleContinue = () => {
    if (!workflowName.trim()) return
    onOpenChange(false)
    onNavigate(workflowName.trim())
    setWorkflowName('')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) setWorkflowName('')
      }}
    >
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-lg">Create Workflow</DialogTitle>
          <DialogDescription>
            Enter a new name for your workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Input
            placeholder="Enter new workflow name"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleContinue()
            }}
            className="h-11"
            autoFocus
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setWorkflowName('')
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!workflowName.trim()}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-6">
        <GitBranch className="h-10 w-10 text-indigo-500/60" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        Create your first workflow to automate document processes with templates.
      </p>
      <Button
        onClick={onCreateClick}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Workflow
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}

export function WorkflowsContent({ selectedWorkspace }: WorkflowsContentProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const navigate = useNavigate()
  const userId = localStorage.getItem('user_id') || ''
  const companyId = localStorage.getItem('company_id') || selectedWorkspace?._id || ''

  const { data: workflowsData, isLoading } = useWorkflows({
    companyId,
    enabled: !!companyId,
  })

  const workflows: Workflow[] = workflowsData?.data || []
  const filteredWorkflows = workflows.filter((w) =>
    w.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleNavigateToCreate = (name: string) => {
    navigate({
      to: '/workflows/create',
      search: { user_id: userId, workflow_name: name },
    })
  }

  return (
    <>
      <CreateWorkflowDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onNavigate={handleNavigateToCreate}
      />

      <PageHeader
        title="Workflows"
        icon={GitBranch}
        badge={selectedWorkspace?.name || 'No workspace'}
        searchPlaceholder="Search workflows..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        actions={
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Workflow
          </Button>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <WorkflowCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredWorkflows.length === 0 ? (
          searchTerm ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-1">No results found</h3>
              <p className="text-sm text-muted-foreground">
                No workflows match "{searchTerm}"
              </p>
            </div>
          ) : (
            <EmptyState onCreateClick={() => setDialogOpen(true)} />
          )
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold">All Workflows</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {filteredWorkflows.length} workflow{filteredWorkflows.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredWorkflows.map((workflow) => (
                <WorkflowCard key={workflow._id} workflow={workflow} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default WorkflowsContent
