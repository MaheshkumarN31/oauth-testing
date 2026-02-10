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
  // Initialize state from localStorage if available
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(() => {
    const saved = localStorage.getItem('selected_workspace_id')
    return saved ? { _id: saved, id: saved, name: '' } as Workspace : null
  })

  // Update localStorage when selection changes
  useEffect(() => {
    if (selectedWorkspace?._id) {
      localStorage.setItem('selected_workspace_id', selectedWorkspace._id)
    }
  }, [selectedWorkspace])

  // Sync with fetched workspaces and handle defaults
  useEffect(() => {
    if (workspaces) {
      const workspaceList = Array.isArray(workspaces) ? workspaces : workspaces.data || []

      // If we have a saved ID, try to find the full workspace object
      const savedId = localStorage.getItem('selected_workspace_id')
      if (savedId && (!selectedWorkspace || !selectedWorkspace.name)) {
        const found = workspaceList.find((w: Workspace) => w._id === savedId || w.id === savedId)
        if (found) {
          setSelectedWorkspace(found)
          return
        }
      }

      // If no selection or invalid selection, set default
      if (!selectedWorkspace && workspaceList.length > 0) {
        setSelectedWorkspace(getDefaultWorkspace(workspaceList))
      }
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
