import { FC } from "react";

type Props = { label: string; onClick: () => void };

const Button: FC<Props> = ({ label, onClick }) => {
  return (
    <button
      className="w-48 p-2 text-xl font-medium text-white transition-colors bg-indigo-600 rounded-lg shadow-sm font-base hover:bg-indigo-700"
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default Button;
