import Notifications from "./Notifications.svelte";
import type { Notification } from "@invopop/gobl-worker";

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
