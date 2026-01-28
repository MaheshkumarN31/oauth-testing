import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { DocsColumns } from './core/DocsColumns'
import TanStackTable from './core/TanstackTable'
import {
    AppSidebar,
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from './layout/AppSidebar'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FolderOpen, Search, Plus, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'

export interface Workspace {
    _id: string
    name: string
    type: string
    status: string
    user_id: string
    application_theme: string
    created_at: Date
    updated_at: Date
    plan_type: string
    is_owner: boolean
    user_types: UserType[]
}

export interface UserType {
    user_type_id: string
    user_type_name: string
}

const Templates = () => {
    const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
        null,
    )
    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(10)

    const {
        data: workspaces,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const token = localStorage.getItem('access_token')
            if (!token) throw new Error('No access token found')

            const res = await fetch(
                `https://v2-dev-api.esigns.io/v1.0/api/workspaces/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )

            if (!res.ok) {
                throw new Error('Failed to fetch user data')
            }

            return res.json()
        },
    })

    const company_id = selectedWorkspace?._id

    const {
        data: templatesData,
        isLoading: isTemplatesLoading,
        isFetching: isTemplatesFetching,
    } = useQuery({
        queryKey: ['templates', company_id, pageIndex, pageSize],
        queryFn: async () => {
            const token = localStorage.getItem('access_token')
            if (!token) throw new Error('No access token found')

            const res = await fetch(
                `https://v2-dev-api.esigns.io/v1.0/api/company-document-responses-v2?company_id=${company_id}&page=${pageIndex + 1
                }&limit=${pageSize}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )

            if (!res.ok) {
                throw new Error('Failed to fetch templates')
            }

            return res.json()
        },
        enabled: !!company_id,
    })

    useEffect(() => {
        if (!selectedWorkspace) {
            setSelectedWorkspace(workspaces?.data[0])
        }
    }, [workspaces])

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-destructive">
                    <AlertCircle className="h-12 w-12" />
                    <p className="text-lg font-medium">Error loading data</p>
                    <p className="text-sm text-muted-foreground">
                        Please try again later
                    </p>
                </div>
            </div>
        )
    }

    const totalTemplates = templatesData?.total || 0
    const pageCount = Math.ceil(totalTemplates / pageSize)

    return (
        <SidebarProvider>
            <AppSidebar
                workspaces={workspaces?.data}
                selectedWorkspace={selectedWorkspace}
                setSelectedWorkspace={setSelectedWorkspace}
            />
            <SidebarInset>
                {/* Header */}
                <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <div className="flex items-center gap-2">
                            <FolderOpen className="h-5 w-5 text-indigo-500" />
                            <h1 className="text-lg font-semibold">Templates</h1>
                            <Badge variant="secondary" className="text-xs">
                                {selectedWorkspace?.name || 'No workspace'}
                            </Badge>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center gap-4 px-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search templates..."
                                className="w-64 pl-8 h-9 bg-muted/50 border-0 focus-visible:ring-1"
                            />
                        </div>
                        <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                            <Plus className="h-4 w-4" />
                            Create New Template
                        </Button>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 space-y-6 p-6 overflow-auto">
                    {/* Templates Table */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="h-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold">
                                        All Templates
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Manage and organize your document templates
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <TanStackTable
                                data={templatesData?.data || []}
                                columns={DocsColumns}
                                pageIndex={pageIndex}
                                pageSize={pageSize}
                                pageCount={pageCount}
                                totalCount={totalTemplates}
                                onPageChange={setPageIndex}
                                onPageSizeChange={(newSize) => {
                                    setPageSize(newSize)
                                    setPageIndex(0)
                                }}
                                loading={isTemplatesLoading || isTemplatesFetching}
                            />
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default Templates
