import { FloatingPortal } from "@floating-ui/react";
import { Key } from "app";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import {
  FC,
  MouseEvent,
  PropsWithChildren,
  useCallback,
  useState,
} from "react";
import { useHotkey } from "utils/useHotkey";

interface ModalInterface {
  open: (value?: string) => void;
  close: () => void;
  isOpen: boolean;
}

function useModal(): ModalInterface {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, open, close };
}

interface URLModalInterface extends ModalInterface {
  value?: string | string[];
}

function useURLQueryModal(param: string): URLModalInterface {
  const router = useRouter();

  const { [param]: value, ...rest } = router.query;

  const open = useCallback(
    (value: string = "true") => {
      router.replace({ query: { ...rest, [param]: value } });
    },
    [router, param, rest]
  );

  const close = useCallback(() => {
    router.replace({ query: rest });
  }, [router, rest]);

  return { isOpen: Boolean(value), value, open, close };
}

interface Props extends PropsWithChildren {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: FC<Props> = ({ children, isOpen, onClose }) => {
  function handleClose(event: KeyboardEvent | MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  useHotkey(Key.ESCAPE, onClose);

  return (
    <AnimatePresence>
      {isOpen && (
        <FloatingPortal>
          <motion.div
            aria-modal="true"
            aria-label="Close modal"
            className="fixed inset-0 z-50 bg-indigo-900/30"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="dialog"
              className="absolute w-11/12 lg:w-2/3 xl:w-1/2 max-h-[85%] max-lg:h-[80%] min-h-0 mb-5 bg-white rounded-lg shadow-lg left-1/2 absolute-center-x overflow-y-scroll overflow-x-clip scrollbar-thin scrollbar-thumb-indigo-600"
              initial={{ scale: 0.9, transform: "translateX(-50%)" }}
              animate={{ scale: 1, top: "12%", transform: "translateX(-50%)" }}
              exit={{ scale: 0.9, top: 0 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </FloatingPortal>
      )}
    </AnimatePresence>
  );
};

export { Modal, useModal, useURLQueryModal };
export type { Props as ModalProps };
