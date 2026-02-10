import { Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteUserType } from '@/hooks/queries/useUserTypes'
import type { UserType } from '@/services/api/user-types'

interface DeleteUserTypeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    userType: UserType | null
}

export function DeleteUserTypeDialog({ open, onOpenChange, userType }: DeleteUserTypeDialogProps) {
    const deleteUserTypeMutation = useDeleteUserType()

    const handleDelete = async () => {
        if (!userType) return

        deleteUserTypeMutation.mutate(userType.id, {
            onSuccess: () => {
                onOpenChange(false)
            },
        })
    }

    const isLoading = deleteUserTypeMutation.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete User Type</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <span className="font-semibold text-foreground">{userType?.name}</span>?
                        This action cannot be undone. Users assigned to this type may lose permissions.
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
                                Deleting...
                            </>
                        ) : (
                            'Delete'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
