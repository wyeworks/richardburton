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
            className="fixed inset-0 z-50 bg-indigo-900/30"
            onClick={handleOverlayClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="dialog"
              className="absolute w-11/12 lg:w-2/3 xl:w-1/2 h-[85%] lg:h-[80%] min-h-0 mb-5 bg-white rounded-lg shadow-lg left-1/2 absolute-center-x overflow-y-scroll overflow-x-clip scrollbar-thin scrollbar-thumb-indigo-600"
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

export { Modal, useModal };
export type { Props as ModalProps };
