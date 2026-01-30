import { useEffect, useState, type ReactNode } from 'react'
import { AppSidebar } from './AppSidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { LoadingSpinner, ErrorState } from '@/components/common'
import { useWorkspaces, getDefaultWorkspace } from '@/hooks/queries'
import type { Workspace } from '@/types'

interface MainLayoutProps {
  children: (props: {
    selectedWorkspace: Workspace | null
    setSelectedWorkspace: (workspace: Workspace) => void
    workspaces: Array<Workspace>
  }) => ReactNode
}

/**
 * Main application layout with sidebar and workspace management
 * Provides workspace context to child components
 */
export function MainLayout({ children }: MainLayoutProps) {
  const { data: workspaces, isLoading, isError, refetch } = useWorkspaces()
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null,
  )

  // Set default workspace when data loads
  useEffect(() => {
    if (workspaces && !selectedWorkspace) {
      setSelectedWorkspace(getDefaultWorkspace(workspaces))
    }
  }, [workspaces, selectedWorkspace])

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading workspaces..." />
  }

  if (isError) {
    return (
      <ErrorState
        fullScreen
        title="Failed to load workspaces"
        message="Please check your connection and try again"
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar
        workspaces={Array.isArray(workspaces) ? workspaces : workspaces?.data || []}
        selectedWorkspace={selectedWorkspace}
        setSelectedWorkspace={setSelectedWorkspace}
      />
      <SidebarInset>
        {children({
          selectedWorkspace,
          setSelectedWorkspace,
          workspaces: Array.isArray(workspaces) ? workspaces : workspaces?.data || [],
        })}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default MainLayout
