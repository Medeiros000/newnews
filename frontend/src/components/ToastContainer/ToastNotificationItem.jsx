import { Component } from 'react';

/**
 * ToastNotificationItem Class Component.
 * Individual notification item representation.
 */
export class ToastNotificationItem extends Component {
  render() {
    const { toast, onDismiss } = this.props;

    return (
      <output
        className={`nn-toast nn-toast--${toast.type || 'info'}`}
      >
        <span className="nn-toast__icon" style={{ fontSize: '1.1rem' }}>
          {toast.icon || (toast.type === 'success' ? '✓' : 'ℹ️')}
        </span>
        <div className="flex-grow-1" style={{ fontSize: '0.85rem' }}>
          {toast.message}
        </div>
        <button
          type="button"
          className="btn-close ms-2"
          style={{ fontSize: '0.65rem' }}
          onClick={() => onDismiss?.(toast.id)}
          aria-label="Fechar notificação"
        />
      </output>
    );
  }
}

