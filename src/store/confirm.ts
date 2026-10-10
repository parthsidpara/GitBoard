import { create } from 'zustand'

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void | Promise<void>
}

interface ConfirmState {
  open: boolean
  options: ConfirmOptions | null
  confirm: (options: ConfirmOptions) => void
  close: () => void
}

/**
 * A single app-wide confirmation dialog. Any component can request a confirm
 * without rendering its own <AlertDialog>. See <ConfirmDialog />.
 */
export const useConfirmStore = create<ConfirmState>()((set) => ({
  open: false,
  options: null,
  confirm: (options) => set({ open: true, options }),
  close: () => set({ open: false, options: null }),
}))
