import { useState } from 'react'
import {
    Building2,
    Edit2,
    Calendar,
    User,
    Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useUpdateWorkspaceStatus } from '@/hooks/queries/useWorkspaces'

interface WorkspaceCardProps {
    workspace: {
        _id: string
        name: string
        description?: string
        status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
        type?: string
        is_owner?: boolean
        created_at?: string
        updated_at?: string
    }
    onEdit: (workspace: any) => void
}

const statusColors = {
    ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    INACTIVE: 'bg-amber-100 text-amber-700 border-amber-200',
    ARCHIVED: 'bg-slate-100 text-slate-600 border-slate-200',
}

const statusDotColors = {
    ACTIVE: 'bg-emerald-500',
    INACTIVE: 'bg-amber-500',
    ARCHIVED: 'bg-slate-400',
}

export function WorkspaceCard({
    workspace,
    onEdit,
}: WorkspaceCardProps) {
    const [isHovered, setIsHovered] = useState(false)
    const status = workspace.status || 'ACTIVE'
    const updateStatusMutation = useUpdateWorkspaceStatus()

    const isActive = status === 'ACTIVE'

    const handleStatusToggle = () => {
        const newStatus = isActive ? 'INACTIVE' : 'ACTIVE'
        updateStatusMutation.mutate({
            workspaceId: workspace._id,
            status: newStatus,
        })
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    const isUpdating = updateStatusMutation.isPending

    return (
        <Card
            className={cn(
                'group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 border-0',
                'bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50',
                isHovered && 'ring-2 ring-indigo-500/20',
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Gradient Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <CardContent className="p-5 pt-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base text-slate-900 dark:text-white truncate">
                                {workspace.name}
                            </h3>
                            {workspace.type && (
                                <span className="text-xs text-muted-foreground">
                                    {workspace.type}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Edit Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(workspace)}
                        className={cn(
                            'h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity',
                            isHovered && 'opacity-100',
                        )}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
                    {workspace.description || 'No description provided'}
                </p>

                {/* Status Badge & Toggle */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={cn('font-medium', statusColors[status])}
                        >
                            <span
                                className={cn(
                                    'h-2 w-2 rounded-full mr-1.5',
                                    statusDotColors[status],
                                )}
                            />
                            {status}
                        </Badge>
                        {workspace.is_owner && (
                            <Badge
                                variant="outline"
                                className="border-indigo-200 text-indigo-600 bg-indigo-50"
                            >
                                Owner
                            </Badge>
                        )}
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center gap-2">
                        {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <span className="text-xs text-muted-foreground">
                                    {isActive ? 'Active' : 'Inactive'}
                                </span>
                                <Switch
                                    checked={isActive}
                                    onCheckedChange={handleStatusToggle}
                                    disabled={isUpdating}
                                    className="data-[state=checked]:bg-emerald-500"
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(workspace.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span>Updated {formatDate(workspace.updated_at)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default WorkspaceCard
