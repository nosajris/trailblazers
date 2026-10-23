/**
 * Shared toast notifications for the admin portal.
 *
 * Every admin form today confirms success the same way: the page reloads
 * (or, with `use:enhance`, re-fetches its data) and the confirmation is
 * whatever changed in the table underneath — nothing says "Payment marked
 * paid" out loud. For an action a staff member fires and then looks away
 * from (closing a modal, moving to the next row), that is easy to miss.
 *
 * This is one small store, not a framework: call `toast.success(...)` /
 * `toast.error(...)` from a form's `use:enhance` callback, render `<Toast />`
 * once near the root of the layout, and every page that wants a toast gets
 * one without inventing its own dismiss timer and stacking logic. Pages that
 * don't call it behave exactly as before — this is additive, not a
 * replacement for the inline `form?.error` banners already in use.
 */

export type ToastKind = 'success' | 'error' | 'info';
export type ToastMessage = { id: number; kind: ToastKind; text: string };

let nextId = 1;
const items: ToastMessage[] = $state([]);

const DEFAULT_DURATION_MS = 4500;

function push(kind: ToastKind, text: string, durationMs = DEFAULT_DURATION_MS): number {
	const id = nextId++;
	items.push({ id, kind, text });
	if (durationMs > 0) {
		setTimeout(() => dismiss(id), durationMs);
	}
	return id;
}

function dismiss(id: number) {
	const index = items.findIndex((item) => item.id === id);
	if (index !== -1) items.splice(index, 1);
}

export const toast = {
	success: (text: string, durationMs?: number) => push('success', text, durationMs),
	error: (text: string, durationMs?: number) => push('error', text, durationMs),
	info: (text: string, durationMs?: number) => push('info', text, durationMs),
	dismiss,
	get items() {
		return items;
	}
};
