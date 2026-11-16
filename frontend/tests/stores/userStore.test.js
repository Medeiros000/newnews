import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from '@/stores/userStore.js';

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({
      user: null,
      isLoadingUser: false,
      notifications: [],
    });
  });

  it('starts with default initial state', () => {
    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoadingUser).toBe(false);
    expect(state.notifications).toEqual([]);
  });

  it('updates user profile upon login', () => {
    const userData = { id: 42, name: 'Maria Souza', email: 'maria@example.com' };
    useUserStore.getState().login(userData);
    expect(useUserStore.getState().user).toEqual(userData);
  });

  it('clears user and notifications upon logout', () => {
    useUserStore.setState({
      user: { id: 1, name: 'Lucas' },
      notifications: [{ id: 'n1', text: 'Novo artigo disponível' }],
    });

    useUserStore.getState().logout();

    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.notifications).toEqual([]);
  });

  it('clears user state without modifying notifications when clearUser is called', () => {
    useUserStore.setState({
      user: { id: 1, name: 'Lucas' },
      notifications: [{ id: 'n1', text: 'Alerta' }],
    });

    useUserStore.getState().clearUser();

    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.notifications).toHaveLength(1);
  });

  it('dismisses a notification by ID', () => {
    useUserStore.setState({
      notifications: [
        { id: 1, message: 'Notificação 1' },
        { id: 2, message: 'Notificação 2' },
      ],
    });

    useUserStore.getState().dismissNotification(1);

    const remaining = useUserStore.getState().notifications;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(2);
  });
});
