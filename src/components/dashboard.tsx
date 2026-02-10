import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Search,
} from 'lucide-react'
import { DocsColumns } from '../components/core/DocsColumns'
import TanStackTable from '../components/core/TanstackTable'
import {
  AppSidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from './layout/AppSidebar'
import type { Workspace } from '@/types'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { Input } from '@/components/ui/input'

const Dashboard = () => {
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
        `${import.meta.env.VITE_PUBLIC_URL}/api/workspaces/`,
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
    data: documentsData,
    isLoading: isDocsLoading,
    isFetching: isDocsFetching,
  } = useQuery({
    queryKey: ['documents', company_id, pageIndex, pageSize],
    queryFn: async () => {
      const token = localStorage.getItem('access_token')
      if (!token) throw new Error('No access token found')

      const res = await fetch(
        `${import.meta.env.VITE_PUBLIC_URL}/api/company-document-responses-v2?company_id=${company_id}&page=${
          pageIndex + 1
        }&limit=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!res.ok) {
        throw new Error('Failed to fetch documents')
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

  const totalDocs = documentsData?.total || 0
  const pageCount = Math.ceil(totalDocs / pageSize)

  const stats = [
    {
      title: 'Total Documents',
      value: totalDocs,
      icon: FileText,
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    },
    {
      title: 'Pending',
      value:
        documentsData?.data?.filter(
          (d: any) => d.document_status === 'INPROGRESS',
        ).length || 0,
      icon: Clock,
      color: 'bg-gradient-to-br from-amber-500 to-orange-600',
    },
    {
      title: 'Completed',
      value:
        documentsData?.data?.filter(
          (d: any) => d.document_status === 'COMPLETED',
        ).length || 0,
      icon: CheckCircle2,
      color: 'bg-gradient-to-br from-emerald-500 to-green-600',
    },
    {
      title: 'Draft',
      value:
        documentsData?.data?.filter((d: any) => d.document_status === 'DRAFT')
          .length || 0,
      icon: AlertCircle,
      color: 'bg-gradient-to-br from-slate-500 to-gray-600',
    },
  ]

  return (
    <SidebarProvider>
      <AppSidebar
        workspaces={workspaces?.data}
        selectedWorkspace={selectedWorkspace}
        setSelectedWorkspace={setSelectedWorkspace}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">Dashboard</h1>
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
                placeholder="Search documents..."
                className="w-64 pl-8 h-9 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 space-y-6 p-6 overflow-auto">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card
                key={stat.title}
                className="overflow-hidden border-0 shadow-sm"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.color} rounded-lg p-2`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader className="h-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    Recent Documents
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage and track your documents
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <TanStackTable
                data={documentsData?.data || []}
                columns={DocsColumns}
                pageIndex={pageIndex}
                pageSize={pageSize}
                pageCount={pageCount}
                totalCount={totalDocs}
                onPageChange={setPageIndex}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize)
                  setPageIndex(0)
                }}
                loading={isDocsLoading || isDocsFetching}
              />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Dashboard
