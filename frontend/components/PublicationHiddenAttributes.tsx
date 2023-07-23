import { Publication } from "modules/publication";
import { FC } from "react";
import c from "classnames";
import { motion, AnimatePresence } from "framer-motion";

const PublicationHiddenAttributes: FC = () => {
  const hiddenAttributes = Publication.STORE.ATTRIBUTES.useHidden();

  return (
    <AnimatePresence>
      {hiddenAttributes.length && (
        <motion.ol
          className="flex h-full shadow"
          initial={{ width: "auto" }}
          animate={{ width: "auto" }}
          exit={{ width: 0 }}
        >
          <AnimatePresence>
            {hiddenAttributes.map((key) => (
              <motion.li
                key={key}
                className={c(
                  "relative origin-top-left shadow text-xs first:rounded-l last:rounded-r",
                  "text-white bg-indigo-600"
                )}
                initial={{ width: 0 }}
                animate={{ width: "2rem" }}
                exit={{ width: 0 }}
              >
                <motion.div
                  className="absolute z-20 text-center rotate-180 translate-x-1/2 top-3 whitespace-nowrap"
                  style={{ writingMode: "vertical-lr" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {Publication.ATTRIBUTE_LABELS[key]}
                </motion.div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ol>
      )}
    </AnimatePresence>
  );
};

export default PublicationHiddenAttributes;
