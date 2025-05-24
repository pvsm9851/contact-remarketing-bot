import { toast } from 'sonner';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface NotificationOptions {
  key?: string;
  debounceMs?: number;
  type?: ToastType;
  description?: string;
  duration?: number;
  onDismiss?: () => void;
}

class NotificationService {
  private activeNotifications: Set<string> = new Set();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  private generateKey(message: string, type?: ToastType): string {
    return `${type || 'default'}-${message}`;
  }

  private showToast(
    message: string,
    options: NotificationOptions = {}
  ) {
    const {
      key = this.generateKey(message, options.type),
      debounceMs = 2000,
      type,
      ...toastOptions
    } = options;

    // Se já existe uma notificação com a mesma chave, não mostra
    if (this.activeNotifications.has(key)) {
      return;
    }

    // Limpa o timer de debounce anterior se existir
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Adiciona a notificação à lista de ativas
    this.activeNotifications.add(key);

    // Configura o timer para remover a notificação da lista
    const timer = setTimeout(() => {
      this.activeNotifications.delete(key);
      this.debounceTimers.delete(key);
    }, debounceMs);

    this.debounceTimers.set(key, timer);

    // Mostra o toast
    return toast[type || 'default'](message, {
      ...toastOptions,
      onDismiss: () => {
        this.activeNotifications.delete(key);
        if (options.onDismiss) {
          options.onDismiss();
        }
      }
    });
  }

  success(message: string, options: Omit<NotificationOptions, 'type'> = {}) {
    return this.showToast(message, { ...options, type: 'success' });
  }

  error(message: string, options: Omit<NotificationOptions, 'type'> = {}) {
    return this.showToast(message, { ...options, type: 'error' });
  }

  warning(message: string, options: Omit<NotificationOptions, 'type'> = {}) {
    return this.showToast(message, { ...options, type: 'warning' });
  }

  info(message: string, options: Omit<NotificationOptions, 'type'> = {}) {
    return this.showToast(message, { ...options, type: 'info' });
  }

  loading(message: string, options: Omit<NotificationOptions, 'type'> = {}) {
    return this.showToast(message, { ...options, type: 'loading' });
  }

  // Método para atualizar um toast existente
  update(toastId: string, message: string, options: NotificationOptions = {}) {
    const { type, ...toastOptions } = options;
    if (type) {
      toast[type](message, toastOptions);
    } else {
      toast(message, toastOptions);
    }
  }

  // Método para remover um toast específico
  dismiss(toastId: string) {
    toast.dismiss(toastId);
  }

  // Método para remover todos os toasts
  dismissAll() {
    toast.dismiss();
    this.activeNotifications.clear();
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }
}

export const notify = new NotificationService(); 