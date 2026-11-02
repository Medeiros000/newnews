import { Component } from 'react';
import { useToastStore } from '@/stores';
import { ToastNotificationItem } from './ToastNotificationItem';
import './ToastContainer.css';

export { ToastNotificationItem } from './ToastNotificationItem';

/**
 * ToastContainerView Class Component.
 * Pure presentation class for rendering toast notifications list.
 */
export class ToastContainerView extends Component {
  render() {
    const { toastNotifications = [], onDismissToast } = this.props;

    if (!toastNotifications.length) return null;

    return (
      <div className="nn-toast-container" aria-live="polite" aria-atomic="true">
        {toastNotifications.map((toast) => (
          <ToastNotificationItem
            key={toast.id}
            toast={toast}
            onDismiss={onDismissToast}
          />
        ))}
      </div>
    );
  }
}

/**
 * Global Toast Notification Container connected with zustand store.
 */
export function ToastContainer({
  toastNotifications: propsNotifications,
  onDismissToast: propsDismiss,
}) {
  const storeToastNotifications = useToastStore(
    (state) => state.toastNotifications,
  );
  const storeDismissToast = useToastStore((state) => state.dismissToast);

  const toastNotifications =
    propsNotifications ?? storeToastNotifications ?? [];
  const onDismissToast = propsDismiss ?? storeDismissToast;

  return (
    <ToastContainerView
      toastNotifications={toastNotifications}
      onDismissToast={onDismissToast}
    />
  );
}
