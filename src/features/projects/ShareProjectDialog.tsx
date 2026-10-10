import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface ShareProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  link: string
}

export function ShareProjectDialog({ open, onOpenChange, link }: ShareProjectDialogProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share board</DialogTitle>
          <DialogDescription>
            This creates a read-only snapshot. Anyone with the link can import their own copy
            without affecting your board.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input value={link} readOnly onFocus={(event) => event.target.select()} />
          <Button onClick={() => void handleCopy()} className="shrink-0">
            {copied ? <Check /> : <Copy />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
