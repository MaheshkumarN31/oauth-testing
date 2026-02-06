import { useState } from 'react'
import { Plus, Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUsers, useDeleteUser } from '@/hooks/queries/useUsers'
import { UserCard } from './UserCard'
import { InviteUserDialog } from './InviteUserDialog'
import { EditUserDialog } from './EditUserDialog'
import type { User } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

interface UsersContentProps {
    companyId?: string
}

export function UsersContent({ companyId }: UsersContentProps) {
    const [search, setSearch] = useState('')
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    const { data: users, isLoading } = useUsers({
        search: search || undefined,
        company_id: companyId || '',
    })

    const deleteUserMutation = useDeleteUser()

    const handleDelete = (user: User) => {
        if (confirm(`Are you sure you want to remove ${user.first_name} ${user.last_name}?`)) {
            deleteUserMutation.mutate(user.id)
        }
    }

    const handleEdit = (user: User) => {
        setEditingUser(user)
    }

    if (!companyId) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-6">
                <div className="text-center">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No Workspace Selected</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Please select a workspace to view users.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">
                        Manage your team members and their permissions here.
                    </p>
                </div>
                <Button
                    onClick={() => setIsInviteOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Invite User
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-9 bg-background/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex flex-col space-y-3">
                                <Skeleton className="h-[125px] w-full rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : users?.length === 0 ? (
                    <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-background/50 p-8 text-center animate-in fade-in-50">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Users className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No users found</h3>
                        <p className="mb-4 mt-2 text-sm text-muted-foreground">
                            You haven't invited any users yet, or no users match your search.
                        </p>
                        <Button onClick={() => setIsInviteOpen(true)} variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Invite First User
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in-50">
                        {users?.map((user: User) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            <InviteUserDialog
                open={isInviteOpen}
                onOpenChange={setIsInviteOpen}
                companyId={companyId}
            />

            <EditUserDialog
                open={!!editingUser}
                onOpenChange={(open) => !open && setEditingUser(null)}
                user={editingUser}
                companyId={companyId}
            />
        </div>
    )
}
