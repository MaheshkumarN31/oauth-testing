import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Mail, Send, User } from 'lucide-react'
import { toast } from 'sonner'
import type { Workspace } from '@/types'
import { sendDocumentAPI } from '@/services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface SendDocumentScreenProps {
    selectedWorkspace: Workspace | null
}

// Helper to get user from localStorage
const getUserFromLocalStorage = () => {
    try {
        const userStr = localStorage.getItem('user')
        return userStr ? JSON.parse(userStr) : null
    } catch {
        return null
    }
}

export function SendDocumentScreen({ selectedWorkspace }: SendDocumentScreenProps) {
    const searchParams = new URLSearchParams(window.location.search)
    const templateId = searchParams.get('template_id') || ''
    const responseId = searchParams.get('response_id') || ''
    const userId = searchParams.get('user_id') || ''
    const documentTitle = searchParams.get('title') || 'Document'
    const recipientsParam = searchParams.get('recipients') || '[]'

    const user = getUserFromLocalStorage()
    const recipients = JSON.parse(decodeURIComponent(recipientsParam))

    const [emailSubject, setEmailSubject] = useState(`Please review and sign - ${documentTitle}`)
    const [emailNotes, setEmailNotes] = useState('')
    const [emailCC, setEmailCC] = useState('')

    // Send document mutation
    const sendMutation = useMutation({
        mutationFn: sendDocumentAPI,
        onSuccess: () => {
            toast.success('Document sent successfully! 🎉')
            // Redirect to documents page
            setTimeout(() => {
                window.location.href = `/documents?user_id=${userId}`
            }, 1500)
        },
        onError: (error: any) => {
            console.error('❌ Send Document Error:', error)
            toast.error(error?.data?.message || 'Failed to send document')
        },
    })

    const handleBack = () => {
        window.history.back()
    }

    const handleSend = async () => {
        if (!emailSubject.trim()) {
            toast.error('Please enter an email subject')
            return
        }

        const emailTo = recipients
            .filter((r: any) => r.role !== 'sender' && r.email)
            .map((r: any) => r.email)

        if (emailTo.length === 0) {
            toast.error('No recipients found')
            return
        }

        const ccEmails = emailCC
            .split(',')
            .map(email => email.trim())
            .filter(email => email.length > 0)

        const payload = {
            email_subject: emailSubject,
            email_notes: emailNotes,
            email_to: emailTo,
            sender_fill_later: false,
            email_cc: ccEmails,
        }

        console.log('📤 Send Document Payload:', payload)

        await sendMutation.mutateAsync({
            templateId,
            responseId,
            payload,
        })
    }

    const recipientEmails = recipients
        .filter((r: any) => r.role !== 'sender')
        .map((r: any) => r.email)
        .filter(Boolean)

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-white px-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <Mail className="h-6 w-6 text-indigo-500" />
                    <div>
                        <h1 className="text-lg font-semibold">Send Document</h1>
                        <p className="text-xs text-muted-foreground">{documentTitle}</p>
                    </div>
                </div>
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </header>

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Email Form Card */}
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6 space-y-6">
                            {/* From Field */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">From</Label>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
                                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">
                                            {user?.first_name} {user?.last_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* To Field */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">To</Label>
                                <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-slate-50 border min-h-[60px]">
                                    {recipientEmails.length > 0 ? (
                                        recipientEmails.map((email: string, index: number) => (
                                            <div
                                                key={index}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium"
                                            >
                                                <User className="h-3 w-3" />
                                                {email}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No recipients</p>
                                    )}
                                </div>
                            </div>

                            {/* CC Field */}
                            <div className="space-y-2">
                                <Label htmlFor="cc" className="text-sm font-medium text-muted-foreground">
                                    CC <span className="text-xs font-normal">(optional, comma-separated)</span>
                                </Label>
                                <Input
                                    id="cc"
                                    type="text"
                                    placeholder="email1@example.com, email2@example.com"
                                    value={emailCC}
                                    onChange={(e) => setEmailCC(e.target.value)}
                                    className="h-11"
                                />
                            </div>

                            {/* Subject Field */}
                            <div className="space-y-2">
                                <Label htmlFor="subject" className="text-sm font-medium text-muted-foreground">
                                    Subject *
                                </Label>
                                <Input
                                    id="subject"
                                    type="text"
                                    placeholder="Enter email subject"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    className="h-11 font-medium"
                                />
                            </div>

                            {/* Message Field */}
                            <div className="space-y-2">
                                <Label htmlFor="message" className="text-sm font-medium text-muted-foreground">
                                    Message <span className="text-xs font-normal">(optional)</span>
                                </Label>
                                <Textarea
                                    id="message"
                                    placeholder="Type your message here..."
                                    value={emailNotes}
                                    onChange={(e) => setEmailNotes(e.target.value)}
                                    className="min-h-[150px] resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handleBack}
                            disabled={sendMutation.isPending}
                        >
                            Back
                        </Button>
                        <Button
                            size="lg"
                            onClick={handleSend}
                            disabled={sendMutation.isPending || !emailSubject.trim()}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg min-w-[120px]"
                        >
                            {sendMutation.isPending ? (
                                <>
                                    <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SendDocumentScreen
