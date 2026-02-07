import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  ArrowLeft,
  FileText,
  GitBranch,
  Loader2,
  Search,
  X,
  Zap,
} from 'lucide-react'
import { PageHeader } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTemplates, useCreateWorkflow } from '@/hooks/queries'
import type { Workspace, Template } from '@/types'
import { cn } from '@/lib/utils'

interface CreateWorkflowContentProps {
  selectedWorkspace: Workspace | null
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })
}

function TemplateSidebarItem({
  template,
  isSelected,
  onClick,
}: {
  template: Template
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border/30 hover:bg-indigo-50/50',
        isSelected && 'bg-indigo-50 border-l-2 border-l-indigo-500',
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg shrink-0',
          isSelected
            ? 'bg-indigo-500 text-white'
            : 'bg-amber-100 text-amber-600',
        )}
      >
        <FileText className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{template.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {template.created_by_name ? `@${template.created_by_name}` : ''}
          {template.created_at ? ` ${formatDate(template.created_at)}` : ''}
        </p>
      </div>
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

export function CreateWorkflowContent({
  selectedWorkspace,
}: CreateWorkflowContentProps) {
  const search = useSearch({ strict: false }) as { user_id?: string; workflow_name?: string }
  const workflowName = search.workflow_name || ''

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [templateSearch, setTemplateSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const userId = localStorage.getItem('user_id') || ''
  const companyId =
    localStorage.getItem('company_id') || selectedWorkspace?._id || ''

  const { data: templatesData, isLoading: templatesLoading } = useTemplates({
    companyId,
    page: 0,
    pageSize: 100,
    enabled: !!companyId,
  })

  const { mutate: createWorkflow, isPending: isCreating } = useCreateWorkflow()

  const templates: Template[] = templatesData?.data || []
  const filteredTemplates = templates.filter((t) =>
    t.name?.toLowerCase().includes(templateSearch.toLowerCase()),
  )

  const handleCreate = () => {
    if (!workflowName.trim() || !selectedTemplate) return

    createWorkflow(
      {
        name: workflowName.trim(),
        company_id: companyId,
        template_id: selectedTemplate.id || selectedTemplate._id,
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
            onClick={handleCreate}
            disabled={!selectedTemplate || isCreating}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:shadow-none"
            size="sm"
          >
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            Save Workflow
          </Button>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Main canvas area */}
        <div className="flex-1 flex flex-col items-center justify-center bg-muted/20 relative">
          {selectedTemplate ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                <FileText className="h-10 w-10 text-indigo-500/60" />
              </div>
              <div className="text-center max-w-md">
                <h3 className="text-lg font-semibold mb-1">
                  {selectedTemplate.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Template selected for workflow "{workflowName}"
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 max-w-md text-center px-4">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                  <GitBranch className="h-12 w-12 text-indigo-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pick a template or document from the right bar and drag it to
                start building your workflow!
              </p>
            </div>
          )}

          {/* Toggle sidebar button when closed */}
          {!sidebarOpen && (
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setSidebarOpen(true)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Show Templates
            </Button>
          )}
        </div>

        {/* Right sidebar - Document Templates */}
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
              ) : filteredTemplates.length === 0 ? (
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
                  {filteredTemplates.map((template) => (
                    <TemplateSidebarItem
                      key={template.id || template._id}
                      template={template}
                      isSelected={
                        (selectedTemplate?.id || selectedTemplate?._id) ===
                        (template.id || template._id)
                      }
                      onClick={() => setSelectedTemplate(template)}
                    />
                  ))}
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
