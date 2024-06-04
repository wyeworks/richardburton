import { FloatingPortal } from "@floating-ui/react";
import LogoOutlinedAnimatedThumb from "assets/logo-outlined-animated-thumb.svg";
import { motion } from "framer-motion";
import { FC } from "react";

const AppLoader: FC = () => {
  return (
    <FloatingPortal>
      <div aria-modal="true" className="fixed inset-0 z-50 bg-indigo-900/30">
        <motion.div
          role="presentation"
          className="absolute flex flex-col justify-between h-32 p-2 pb-6 bg-white rounded-full shadow shadow-indigo-200 bottom-4 right-4 w-30"
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
        >
          <LogoOutlinedAnimatedThumb className="text-indigo-700 size-fit" />
          <div className="text-sm font-normal text-indigo-700">Loading...</div>
        </motion.div>
      </div>
    </FloatingPortal>
  );
};

export default AppLoader;
