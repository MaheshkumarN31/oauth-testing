import { useNavigate } from '@tanstack/react-router'
import { CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WorkflowSuccessContentProps {
    workflowName?: string
}

export function WorkflowSuccessContent({ workflowName }: WorkflowSuccessContentProps) {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-4">
            <div className="relative max-w-lg w-full">
                {/* Background glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-green-200/40 via-emerald-200/30 to-teal-200/40 rounded-3xl blur-2xl" />

                <div className="relative bg-white rounded-2xl border border-border/60 shadow-xl shadow-green-500/5 overflow-hidden">
                    {/* Top accent bar */}
                    <div className="h-1.5 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" />

                    <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
                        {/* Animated success icon */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30">
                                <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="absolute -top-1 -right-1">
                                <Sparkles className="h-5 w-5 text-amber-400" />
                            </div>
                        </div>

                        {/* Heading */}
                        <h1 className="text-2xl font-bold text-foreground mb-2">
                            Workflow Sent Successfully!
                        </h1>

                        {/* Workflow name */}
                        {workflowName && (
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
                                <span className="text-sm font-medium text-indigo-700 truncate max-w-[280px]">
                                    {workflowName}
                                </span>
                            </div>
                        )}

                        {/* Description */}
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-8">
                            Your workflow has been sent to all recipients. They will receive an email notification with instructions to complete their assigned actions.
                        </p>

                        {/* Divider */}
                        <div className="w-full border-t border-border/60 mb-6" />

                        {/* Action button */}
                        <Button
                            onClick={() => navigate({ to: '/workflows', search: { user_id: localStorage.getItem('user_id') || '' } })}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all px-8 h-11"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Return to Workflows
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
