import { Loader2, AlertTriangle } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteUser } from '@/hooks/queries/useUsers'
import type { User } from '@/types'

interface DeleteUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User | null
    companyId?: string
}

export function DeleteUserDialog({ open, onOpenChange, user, companyId }: DeleteUserDialogProps) {
    const deleteUserMutation = useDeleteUser(companyId)

    const handleDelete = async () => {
        if (!user) return

        deleteUserMutation.mutate(user.id, {
            onSuccess: () => {
                onOpenChange(false)
            },
        })
    }

    const isLoading = deleteUserMutation.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <DialogTitle>Delete User</DialogTitle>
                    </div>
                    <DialogDescription>
                        Are you sure you want to remove <span className="font-semibold text-foreground">{user?.first_name} {user?.last_name}</span>?
                        This will revoke their access to this company and all associated workspaces.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Removing...
                            </>
                        ) : (
                            'Remove User'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
