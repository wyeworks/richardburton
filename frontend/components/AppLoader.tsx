import {
  FloatingFocusManager,
  FloatingPortal,
  useFloating,
} from "@floating-ui/react";
import LogoOutlinedAnimated from "assets/logo-outlined-animated.svg";
import { motion } from "framer-motion";
import { FC } from "react";

const AppLoader: FC = () => {
  const { context, refs } = useFloating();

  return (
    <FloatingPortal>
      <FloatingFocusManager context={context} initialFocus={refs.floating}>
        <motion.div
          ref={refs.setFloating}
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center text-indigo-700 bg-indigo-900/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          autoFocus
        >
          <motion.div
            role="dialog"
            className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-200 rounded-full shadow-xl h-72"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
          >
            <LogoOutlinedAnimated role="presentation" className="h-full" />

            <div className="absolute z-50 px-2 py-1 text-center bg-gray-200 rounded-full absoluce-center-y">
              Your request is being processed
            </div>
          </motion.div>
          <input
            role="presentation"
            aria-label="Your request is being processed"
            className="sr-only"
            autoFocus
          />
        </motion.div>
      </FloatingFocusManager>
    </FloatingPortal>
  );
};

export default AppLoader;
