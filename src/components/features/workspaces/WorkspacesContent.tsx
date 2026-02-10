import { useState, useMemo } from 'react'
import { Briefcase, Loader2, Plus } from 'lucide-react'
import type { Workspace } from '@/types'
import { PageHeader } from '@/components/common'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useWorkspaces, useWorkspaceById } from '@/hooks/queries/useWorkspaces'
import { WorkspaceCard } from './WorkspaceCard'
import { CreateWorkspaceDialog } from './CreateWorkspaceDialog'
import { EditWorkspaceDialog } from './EditWorkspaceDialog'

interface WorkspaceData {
    _id: string
    name: string
    description?: string
    status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
    type?: string
    is_owner?: boolean
    created_at?: string
    updated_at?: string
}

interface WorkspacesContentProps {
    selectedWorkspace: Workspace | null
}

export function WorkspacesContent({
    selectedWorkspace,
}: WorkspacesContentProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [searchById, setSearchById] = useState('')

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [selectedWorkspaceData, setSelectedWorkspaceData] =
        useState<WorkspaceData | null>(null)

    // Fetch all workspaces
    const { data: workspaces = [], isLoading, isFetching } = useWorkspaces()

    // Search by ID query
    const { data: searchedWorkspace, isLoading: isSearching } =
        useWorkspaceById(searchById)

    // Filter workspaces
    const filteredWorkspaces = useMemo(() => {
        // If searching by ID and we have a result, show only that
        if (searchById && searchedWorkspace) {
            return [searchedWorkspace]
        }

        // Otherwise filter by name/description
        if (!searchTerm) return workspaces

        const searchLower = searchTerm.toLowerCase()
        return workspaces.filter((ws: WorkspaceData) => {
            const name = (ws.name || '').toLowerCase()
            const description = (ws.description || '').toLowerCase()
            return name.includes(searchLower) || description.includes(searchLower)
        })
    }, [workspaces, searchTerm, searchById, searchedWorkspace])

    // Handle edit
    const handleEdit = (workspace: WorkspaceData) => {
        setSelectedWorkspaceData(workspace)
        setEditDialogOpen(true)
    }



    // Handle search by ID
    const handleSearchById = (value: string) => {
        // If it looks like a MongoDB ObjectID, search by ID
        if (value.length === 24 && /^[a-f0-9]+$/i.test(value)) {
            setSearchById(value)
            setSearchTerm('')
        } else {
            setSearchById('')
            setSearchTerm(value)
        }
    }

    const loading = isLoading || isFetching

    return (
        <>
            <PageHeader
                title="Workspaces"
                icon={Briefcase}
                badge={selectedWorkspace?.name || 'All Workspaces'}
                searchPlaceholder="Search by name or ID..."
                searchValue={searchById || searchTerm}
                onSearchChange={handleSearchById}
            />

            <div className="flex-1 space-y-6 p-6 overflow-auto">
                {/* Stats Bar */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                                {filteredWorkspaces.length}
                            </span>
                            workspace{filteredWorkspaces.length !== 1 ? 's' : ''}
                        </div>
                        {isSearching && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Searching...
                            </div>
                        )}
                    </div>
                    <Button
                        onClick={() => setCreateDialogOpen(true)}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-sm"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Workspace
                    </Button>
                </div>

                {/* Loading State */}
                {loading && workspaces.length === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="h-64 animate-pulse">
                                <CardContent className="p-5 pt-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
                                        <div className="flex-1">
                                            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                                            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                                        </div>
                                    </div>
                                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                                    <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredWorkspaces.length === 0 && (
                    <Card className="border-dashed border-2">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                <Briefcase className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No workspaces found</h3>
                            <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                                {searchTerm || searchById
                                    ? 'No workspaces match your search criteria. Try a different search term.'
                                    : 'Get started by creating your first workspace.'}
                            </p>
                            {(searchTerm || searchById) && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm('')
                                        setSearchById('')
                                    }}
                                >
                                    Clear Search
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Workspaces Grid */}
                {!loading && filteredWorkspaces.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredWorkspaces.map((workspace: WorkspaceData) => (
                            <WorkspaceCard
                                key={workspace._id}
                                workspace={workspace}
                                onEdit={handleEdit}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <CreateWorkspaceDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />

            <EditWorkspaceDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                workspace={selectedWorkspaceData}
            />


        </>
    )
}

export default WorkspacesContent
