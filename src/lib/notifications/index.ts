import Notifications from "./Notifications.svelte";

export enum Severity {
  Info = "info",
  Error = "error",
  Success = "success",
}

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
