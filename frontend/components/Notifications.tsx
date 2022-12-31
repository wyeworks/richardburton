import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import {
  atom,
  useRecoilCallback,
  useRecoilState,
  useResetRecoilState,
} from "recoil";
import { v4 as uuid } from "uuid";

type Notification = { id: string; message: string };

const NOTIFICATIONS = atom<Notification[]>({
  key: "notifications",
  default: [],
});

const NOTIFICATION_TIMEOUT_MS = 4000;
const MAX_SNACKBARS = 3;

const Notifications: FC = () => {
  const [notifications, setNotifications] = useRecoilState(NOTIFICATIONS);
  const resetNotifications = useResetRecoilState(NOTIFICATIONS);
  const router = useRouter();

  useEffect(() => {
    if (notifications.length > 0) {
      const timeout = setTimeout(
        () => setNotifications(notifications.slice(1)),
        NOTIFICATION_TIMEOUT_MS
      );
      return () => clearTimeout(timeout);
    }
  }, [notifications, setNotifications]);

  useEffect(() => resetNotifications, [router, resetNotifications]);

  const shownNotificationsCount =
    notifications.length === MAX_SNACKBARS
      ? notifications.length
      : Math.min(MAX_SNACKBARS - 1, notifications.length);

  const stackedNotificationsCount =
    notifications.length - shownNotificationsCount;

  const snackbars = notifications
    .slice(0, shownNotificationsCount)
    .map(({ message, id }) => ({ message, key: id }))
    .concat({
      message: `${stackedNotificationsCount} more notifications`,
      key: "notification-stack",
    });

  return (
    <section className="fixed z-50 flex flex-col items-center space-y-2 -translate-x-1/2 left-1/2 top-10">
      <AnimatePresence>
        {snackbars.map(
          ({ key, message }) =>
            (key !== "error-stack" || stackedNotificationsCount > 0) && (
              <motion.div
                layout
                key={key}
                className="flex px-3 py-2 space-x-4 bg-white rounded shadow-md w-96"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.1 }}
                aria-modal="true"
                aria-describedby="snackbar-message"
                aria-label="Error"
              >
                <div role="presentation">⚠️</div>
                <div id={`snackbar-message-${key}`}>{message}</div>
              </motion.div>
            )
        )}
      </AnimatePresence>
    </section>
  );
};

type Notifier = (message: Notification["message"]) => void;

const _notify =
  (message: Notification["message"]) =>
  (current: Notification[]): Notification[] =>
    [...current, { id: uuid(), message }];

function useNotify(): Notifier {
  return useRecoilCallback(
    ({ set }) =>
      (message) => {
        set(NOTIFICATIONS, _notify(message));
      },
    []
  );
}

export default Notifications;
export { useNotify, NOTIFICATIONS as _NOTIFICATIONS, _notify };
