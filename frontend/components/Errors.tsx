import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import {
  atom,
  useRecoilState,
  useResetRecoilState,
  useSetRecoilState,
} from "recoil";
import { v4 as uuid } from "uuid";

type Error = { id: string; message: string };

const errorsAtom = atom<Error[]>({
  key: "errors",
  default: [],
});

const ERROR_TIMEOUT_MS = 4000;
const MAX_SNACKBARS = 3;

const Errors: FC = () => {
  const [errors, setErrors] = useRecoilState(errorsAtom);
  const resetErrors = useResetRecoilState(errorsAtom);
  const router = useRouter();

  useEffect(() => {
    if (errors.length > 0) {
      const timeout = setTimeout(
        () => setErrors(errors.slice(1)),
        ERROR_TIMEOUT_MS
      );
      return () => clearTimeout(timeout);
    }
  }, [errors]);

  useEffect(() => resetErrors, [router]);

  const shownErrorCount =
    errors.length === MAX_SNACKBARS
      ? errors.length
      : Math.min(MAX_SNACKBARS - 1, errors.length);

  const stackedErrorCount = errors.length - shownErrorCount;

  const snackbars = errors
    .slice(0, shownErrorCount)
    .map(({ message, id }) => ({ message, key: id }))
    .concat({
      message: `${stackedErrorCount} more errors`,
      key: "error-stack",
    });

  return (
    <section className="fixed z-50 flex flex-col items-center space-y-2 -translate-x-1/2 left-1/2 top-10">
      <AnimatePresence>
        {snackbars.map(
          ({ key, message }) =>
            (key !== "error-stack" || stackedErrorCount > 0) && (
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

const useNotifyError = () => {
  const setErrors = useSetRecoilState(errorsAtom);
  return (message: Error["message"]) =>
    setErrors((current) => [...current, { id: uuid(), message }]);
};

export default Errors;
export { useNotifyError };
