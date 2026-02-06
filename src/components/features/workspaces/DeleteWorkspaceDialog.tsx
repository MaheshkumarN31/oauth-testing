import { AlertTriangle, Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteWorkspace } from '@/hooks/queries/useWorkspaces'

interface DeleteWorkspaceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    workspace: {
        _id: string
        name: string
    } | null
}

export function DeleteWorkspaceDialog({
    open,
    onOpenChange,
    workspace,
}: DeleteWorkspaceDialogProps) {
    const deleteWorkspaceMutation = useDeleteWorkspace()

    const handleDelete = () => {
        if (!workspace) return

        deleteWorkspaceMutation.mutate(workspace._id, {
            onSuccess: () => {
                onOpenChange(false)
            },
        })
    }

    if (!workspace) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Delete Workspace</DialogTitle>
                            <DialogDescription className="text-sm mt-1">
                                This action cannot be undone
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete the workspace{' '}
                        <span className="font-semibold text-foreground">
                            "{workspace.name}"
                        </span>
                        ? This will permanently remove the workspace and all associated
                        data.
                    </p>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={deleteWorkspaceMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteWorkspaceMutation.isPending}
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 min-w-[120px]"
                    >
                        {deleteWorkspaceMutation.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Delete Workspace'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteWorkspaceDialog
