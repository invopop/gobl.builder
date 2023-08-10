import Notifications from "./Notifications.svelte";

// Severity is used for error messages
export enum Severity {
  Info = "info",
  Error = "error",
  Success = "success",
}

// Notification is used for communicating error messages
export type Notification = {
  severity: Severity;
  message: string;
  context?: string;
};

const notifications = new Set<Notification>();

const notifsComponent = new Notifications({
  target: document.body,
});

export function createNotification(notif: Notification) {
  notifications.add(notif);
  notifsComponent.$set({ notifications });
  setInterval(() => {
    notifications.delete(notif);
    notifsComponent.$set({ notifications });
  }, 5000);
}
