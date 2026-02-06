import type { User } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MoreVertical, Mail, Calendar, Users as UsersIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface UserCardProps {
    user: User
    onEdit?: (user: User) => void
    onDelete?: (user: User) => void
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
    const initials = `${user.first_name?.[0] || user.name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
    const name = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown'

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar_url} alt={name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h3 className="font-semibold leading-none">{name}</h3>
                        <p className="text-sm text-muted-foreground">{user.role}</p>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit?.(user)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(user)}>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-2 h-4 w-4" />
                        {user.email}
                    </div>
                    {user.created_at && (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-2 h-4 w-4" />
                            Joined {new Date(user.created_at).toLocaleDateString()}
                        </div>
                    )}
                    <div className="flex gap-2 mt-2">
                        {user.status && (
                            <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                {user.status}
                            </Badge>
                        )}
                        {user.user_type_id && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                <UsersIcon className="h-3 w-3" />
                                Type: {user.user_type_id}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
