import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Search } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface PageHeaderProps {
    /** Page title */
    title: string
    /** Title icon */
    icon?: LucideIcon
    /** Badge text (e.g., workspace name) */
    badge?: string
    /** Search placeholder text */
    searchPlaceholder?: string
    /** Search value */
    searchValue?: string
    /** Search change handler */
    onSearchChange?: (value: string) => void
    /** Actions to render on right side */
    actions?: ReactNode
    /** Additional elements to render before title */
    prefix?: ReactNode
}

/**
 * Reusable page header with sidebar trigger, title, search, and actions
 */
export function PageHeader({
    title,
    icon: Icon,
    badge,
    searchPlaceholder = 'Search...',
    searchValue,
    onSearchChange,
    actions,
    prefix,
}: PageHeaderProps) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />

                {prefix}

                <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-5 w-5 text-indigo-500" />}
                    <h1 className="text-lg font-semibold">{title}</h1>
                    {badge && (
                        <Badge variant="secondary" className="text-xs">
                            {badge}
                        </Badge>
                    )}
                </div>
            </div>

            <div className="ml-auto flex items-center gap-4 px-4">
                {onSearchChange && (
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-64 pl-8 h-9 bg-muted/50 border-0 focus-visible:ring-1"
                        />
                    </div>
                )}
                {actions}
            </div>
        </header>
    )
}

export default PageHeader
