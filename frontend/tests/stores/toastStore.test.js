import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useToastStore } from '@/stores/toastStore.js';
import { APP_CONFIG } from '@/utils';

describe('useToastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useToastStore.setState({
      toastNotifications: [],
      timers: new Map(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with an empty notifications list', () => {
    expect(useToastStore.getState().toastNotifications).toEqual([]);
  });

  it('adds a toast notification with the specified message, type and icon', () => {
    useToastStore.getState().showToastNotification('Salvo com sucesso!', 'success', '🔖');

    const toasts = useToastStore.getState().toastNotifications;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Salvo com sucesso!');
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].icon).toBe('🔖');
    expect(typeof toasts[0].id).toBe('number');
  });

  it('manually dismisses a toast and clears its timer', () => {
    useToastStore.getState().showToastNotification('Notificação manual', 'info');
    const toastId = useToastStore.getState().toastNotifications[0].id;

    expect(useToastStore.getState().timers.has(toastId)).toBe(true);

    useToastStore.getState().dismissToast(toastId);

    expect(useToastStore.getState().toastNotifications).toHaveLength(0);
    expect(useToastStore.getState().timers.has(toastId)).toBe(false);
  });

  it('automatically dismisses toast after configured timeout', () => {
    useToastStore.getState().showToastNotification('Mensagem temporária', 'warning');
    expect(useToastStore.getState().toastNotifications).toHaveLength(1);

    // Fast-forward time to just before dismissal
    vi.advanceTimersByTime(APP_CONFIG.TOAST_AUTO_DISMISS_MS - 1);
    expect(useToastStore.getState().toastNotifications).toHaveLength(1);

    // Advance past timeout
    vi.advanceTimersByTime(1);
    expect(useToastStore.getState().toastNotifications).toHaveLength(0);
  });
});
