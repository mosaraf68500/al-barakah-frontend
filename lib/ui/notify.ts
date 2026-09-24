import { useUiStore } from '@/store/uiStore';

export type ToastKind = 'success' | 'error';

/** Site-wide hot toast. Errors stay longer so the reason can be read. */
export function notify(message: string, kind: ToastKind = 'success') {
  useUiStore.getState().showToast(message, kind);
}
