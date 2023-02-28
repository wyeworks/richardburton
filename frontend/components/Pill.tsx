import { FC } from "react";
import CloseIcon from "assets/close.svg";

type Props = {
  label: string;
  onRemove: () => void;
};

const Pill: FC<Props> = ({ label, onRemove }) => {
  return (
    <span className="flex items-center space-x-1 shrink-0 px-1 py-0.5 border border-indigo-600 text-indigo-600 rounded">
      <span>{label}</span>
      <button
        className="inline-flex items-center justify-center transition-colors rounded-full hover:bg-indigo-500 hover:text-white"
        onClick={onRemove}
      >
        <CloseIcon className="inline w-3 aspect-square" />
      </button>
    </span>
  );
};

export default Pill;
