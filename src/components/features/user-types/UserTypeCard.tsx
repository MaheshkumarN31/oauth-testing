import type { UserType } from '@/services/api/user-types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MoreVertical, Shield, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface UserTypeCardProps {
    userType: UserType
    onEdit?: (userType: UserType) => void
    onDelete?: (userType: UserType) => void
}

export function UserTypeCard({ userType, onEdit, onDelete }: UserTypeCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold leading-none">{userType.name}</h3>
                        <p className="text-xs text-muted-foreground">
                            Created {new Date(userType.created_at).toLocaleDateString()}
                        </p>
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
                        <DropdownMenuItem onClick={() => onEdit?.(userType)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDelete?.(userType)}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {userType.description && (
                        <div className="flex items-start text-sm text-muted-foreground">
                            <FileText className="mr-2 h-4 w-4 mt-0.5 shrink-0" />
                            <p className="line-clamp-2">{userType.description}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground">Permissions</h4>
                        <div className="flex flex-wrap gap-1">
                            {(userType.permissions || []).slice(0, 3).map((perm, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {perm}
                                </Badge>
                            ))}
                            {(userType.permissions || []).length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{(userType.permissions || []).length - 3} more
                                </Badge>
                            )}
                            {(!userType.permissions || userType.permissions.length === 0) && (
                                <span className="text-xs text-muted-foreground italic">No specific permissions</span>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
