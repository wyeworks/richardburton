import { FloatingPortal } from "@floating-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FC,
  MouseEvent,
  PropsWithChildren,
  useCallback,
  useState,
} from "react";

interface ModalInterface {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

function useModal(): ModalInterface {
  const [isOpen, setIsOpen] = useState(true);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, open, close };
}

interface Props extends PropsWithChildren {
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

const Modal: FC<Props> = ({ children, isOpen, onClose }) => {
  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <FloatingPortal>
          <motion.div
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-start justify-center bg-indigo-900/30"
            onClick={handleOverlayClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="dialog"
              className="bg-white rounded shadow-lg p-7 mt-[15%]"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              {children}
            </motion.div>
          </motion.div>
          ,
        </FloatingPortal>
      )}
    </AnimatePresence>
  );
};

export { Modal, useModal };
