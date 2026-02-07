import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  GitBranch,
  Loader2,
  Search,
  Settings,
  Trash2,
  X,
  Zap,
  Eye,
  Pencil,
} from 'lucide-react'
import { PageHeader } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTemplates, useCreateWorkflow } from '@/hooks/queries'
import type { Workspace, Template } from '@/types'
import { cn } from '@/lib/utils'

interface CreateWorkflowContentProps {
  selectedWorkspace: Workspace | null
}

function getTemplateId(template: Template): string {
  return template.id || template._id || ''
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })
}

/* ─── Sidebar template item ─── */
function TemplateSidebarItem({
  template,
  isDisabled,
  onClick,
}: {
  template: Template
  isDisabled: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-border/30',
        isDisabled
          ? 'opacity-40 cursor-not-allowed bg-muted/40'
          : 'hover:bg-indigo-50/60 cursor-pointer',
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg shrink-0',
          isDisabled ? 'bg-gray-200 text-gray-400' : 'bg-amber-100 text-amber-600',
        )}
      >
        <FileText className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-medium truncate', isDisabled && 'text-muted-foreground')}>
          {template.title || template.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {template.created_by_name ? `@${template.created_by_name}` : ''}
          {template.created_at ? ` ${formatDate(template.created_at)}` : ''}
        </p>
      </div>
      {isDisabled && (
        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 shrink-0">
          Added
        </Badge>
      )}
    </button>
  )
}

function TemplateSidebarSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
      <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

/* ─── Step card on the canvas ─── */
function StepCard({
  step,
  index,
  totalSteps,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  step: Template
  index: number
  totalSteps: number
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  return (
    <div className="w-full max-w-2xl">
      {/* Step header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-slate-50 to-white border border-border/60 rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          <span className="text-sm font-semibold text-foreground">Step {index + 1}</span>
          <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px] px-2 py-0 h-5 font-medium hover:bg-indigo-100">
            SIGNER
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
          onClick={onRemove}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Step body */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-x border-b border-border/60 rounded-b-xl shadow-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600 shrink-0">
          <FileText className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{step.title || step.name}</p>
          <p className="text-xs text-muted-foreground">{formatDate(step.created_at)}</p>
        </div>

        {/* Move buttons */}
        <div className="flex flex-col gap-0.5">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            disabled={index === 0}
            onClick={onMoveUp}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            disabled={index === totalSteps - 1}
            onClick={onMoveDown}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>

        {/* Actions */}
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
          <Eye className="h-3 w-3" />
          Preview
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <Settings className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

/* ─── Next step placeholder ─── */
function NextStepPlaceholder({ stepNumber }: { stepNumber: number }) {
  return (
    <div className="w-full max-w-2xl border-2 border-dashed border-border/40 rounded-xl px-4 py-4 text-center">
      <p className="text-sm text-muted-foreground">Step {stepNumber}</p>
    </div>
  )
}

/* ─── Main component ─── */
export function CreateWorkflowContent({
  selectedWorkspace,
}: CreateWorkflowContentProps) {
  const search = useSearch({ strict: false }) as { user_id?: string; workflow_name?: string }
  const workflowName = search.workflow_name || ''

  const [selectedTemplates, setSelectedTemplates] = useState<Template[]>([])
  const [templateSearch, setTemplateSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const userId = localStorage.getItem('user_id') || ''
  const companyId = selectedWorkspace?._id

  const { data: templatesData, isLoading: templatesLoading } = useTemplates({
    companyId,
    page: 0,
    pageSize: 100,
  })

  const { mutate: createWorkflow, isPending: isCreating } = useCreateWorkflow()

  const templates: Template[] = templatesData?.data || []
  const filteredTemplates = templates.filter((t) => {
    const searchLower = templateSearch.toLowerCase()
    return (
      t.name?.toLowerCase().includes(searchLower) ||
      t.title?.toLowerCase().includes(searchLower)
    )
  })

  // Set of selected template IDs for O(1) lookups
  const selectedIds = new Set(selectedTemplates.map(getTemplateId))

  const handleAddTemplate = (template: Template) => {
    if (selectedIds.has(getTemplateId(template))) return
    setSelectedTemplates((prev) => [...prev, template])
  }

  const handleRemoveTemplate = (index: number) => {
    setSelectedTemplates((prev) => prev.filter((_, i) => i !== index))
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    setSelectedTemplates((prev) => {
      const next = [...prev]
        ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  const handleMoveDown = (index: number) => {
    if (index >= selectedTemplates.length - 1) return
    setSelectedTemplates((prev) => {
      const next = [...prev]
        ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  const handleSave = () => {
    if (!workflowName.trim() || selectedTemplates.length === 0 || !companyId) return

    createWorkflow(
      {
        name: workflowName.trim(),
        company_id: companyId,
        template_id: selectedTemplates.map(getTemplateId).join(','),
        steps: selectedTemplates.map((t, i) => ({
          step: i + 1,
          template_id: getTemplateId(t),
          template_name: t.title || t.name,
        })),
      },
      {
        onSuccess: () => {
          navigate({ to: '/workflows', search: { user_id: userId } })
        },
      },
    )
  }

  return (
    <>
      <PageHeader
        title={workflowName || 'Create Workflow'}
        icon={GitBranch}
        badge={selectedWorkspace?.name || 'No workspace'}
        prefix={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 mr-1"
            onClick={() =>
              navigate({ to: '/workflows', search: { user_id: userId } })
            }
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        }
        actions={
          <Button
            onClick={handleSave}
            disabled={selectedTemplates.length === 0 || isCreating}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:shadow-none"
            size="sm"
          >
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            Continue
          </Button>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        {/* ─── Main canvas ─── */}
        <div className="flex-1 overflow-auto bg-slate-50/80 relative">
          <div className="flex flex-col items-center py-10 px-4 min-h-full gap-5">
            {/* START label */}
            <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase">
              Start
            </p>

            {/* Connector */}
            {selectedTemplates.length > 0 && (
              <div className="w-px h-6 bg-border" />
            )}

            {/* Step cards */}
            {selectedTemplates.map((template, index) => (
              <div key={`${getTemplateId(template)}-${index}`} className="contents">
                <StepCard
                  step={template}
                  index={index}
                  totalSteps={selectedTemplates.length}
                  onRemove={() => handleRemoveTemplate(index)}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                />
                {/* Connector line between steps */}
                <div className="w-px h-5 bg-border relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-indigo-300" />
                </div>
              </div>
            ))}

            {/* Next step placeholder */}
            <NextStepPlaceholder stepNumber={selectedTemplates.length + 1} />

            {/* END label */}
            <div className="w-px h-5 bg-border" />
            <p className="text-xs font-bold tracking-widest text-red-400 uppercase">
              End
            </p>

            {/* Empty state message (only when no templates selected) */}
            {selectedTemplates.length === 0 && (
              <div className="flex flex-col items-center gap-3 mt-6 max-w-sm text-center">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                    <GitBranch className="h-10 w-10 text-indigo-400" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pick a template or document from the right bar to start
                  building your workflow!
                </p>
              </div>
            )}
          </div>

          {/* Toggle sidebar button when closed */}
          {!sidebarOpen && (
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 shadow-sm"
              onClick={() => setSidebarOpen(true)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Templates
            </Button>
          )}
        </div>

        {/* ─── Right sidebar ─── */}
        {sidebarOpen && (
          <div className="w-[320px] flex flex-col border-l border-border/50 bg-background shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Document Templates
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="px-4 py-3 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="pl-9 h-9 bg-muted/30 border-border/50"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              {templatesLoading ? (
                <div>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TemplateSidebarSkeleton key={i} />
                  ))}
                </div>
              ) : templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <FileText className="h-8 w-8 text-muted-foreground/30 mb-3" />
                  <p className="text-xs text-muted-foreground text-center">
                    {templateSearch
                      ? `No templates match "${templateSearch}"`
                      : 'No templates available'}
                  </p>
                </div>
              ) : (
                <div>
                  {filteredTemplates.map((template) => {
                    const tid = getTemplateId(template)
                    const isDisabled = selectedIds.has(tid)
                    return (
                      <TemplateSidebarItem
                        key={tid}
                        template={template}
                        isDisabled={isDisabled}
                        onClick={() => handleAddTemplate(template)}
                      />
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>
    </>
  )
}

export default CreateWorkflowContent
