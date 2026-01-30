import { ChevronDown, ChevronUp, Plus, Trash2, User } from 'lucide-react'
import type { Recipient, RecipientRole } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ROLE_OPTIONS } from '@/types'

interface RecipientEditorProps {
  recipients: Array<Recipient>
  onUpdate: (recipients: Array<Recipient>) => void
}

export function RecipientEditor({
  recipients,
  onUpdate,
}: RecipientEditorProps) {
  const addRecipient = () => {
    const newRecipient: Recipient = {
      id: Date.now().toString(),
      name: `Recipient ${recipients.length + 1}`,
      role: 'signer',
    }
    onUpdate([...recipients, newRecipient])
  }

  const removeRecipient = (id: string) => {
    if (recipients.length > 1) {
      onUpdate(recipients.filter((r) => r.id !== id))
    }
  }

  const updateRecipient = (id: string, updates: Partial<Recipient>) => {
    onUpdate(recipients.map((r) => (r.id === id ? { ...r, ...updates } : r)))
  }

  const moveRecipient = (index: number, direction: 'up' | 'down') => {
    const newRecipients = [...recipients]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex >= 0 && targetIndex < recipients.length) {
      const temp = newRecipients[index]
      newRecipients[index] = newRecipients[targetIndex]
      newRecipients[targetIndex] = temp
      onUpdate(newRecipients)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {recipients.map((recipient, index) => (
          <div
            key={recipient.id}
            className="flex items-start gap-4 rounded-lg bg-muted/30 p-4 border-l-4 border-l-purple-500"
          >
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => moveRecipient(index, 'up')}
                disabled={index === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => moveRecipient(index, 'down')}
                disabled={index === recipients.length - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Recipient Info */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-muted-foreground/30 bg-background">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  value={recipient.name}
                  onChange={(e) =>
                    updateRecipient(recipient.id, { name: e.target.value })
                  }
                  placeholder="Recipient name"
                  className="flex-1 bg-transparent border-0 border-b border-muted-foreground/30 rounded-none focus-visible:ring-0 focus-visible:border-indigo-500 px-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pl-13">
                <Input
                  type="email"
                  value={recipient.email || ''}
                  onChange={(e) =>
                    updateRecipient(recipient.id, { email: e.target.value })
                  }
                  placeholder="Email address"
                  className="text-sm"
                />
                <Input
                  type="tel"
                  value={recipient.phone || ''}
                  onChange={(e) =>
                    updateRecipient(recipient.id, { phone: e.target.value })
                  }
                  placeholder="Phone number"
                  className="text-sm"
                />
              </div>
            </div>

            <Select
              value={recipient.role}
              onValueChange={(value) =>
                updateRecipient(recipient.id, { role: value as RecipientRole })
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => removeRecipient(recipient.id)}
              disabled={recipients.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={addRecipient} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Recipient
      </Button>
    </div>
  )
}

export default RecipientEditor
