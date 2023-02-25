import { FC } from "react";

const ToolbarHeading: FC<{ label: string }> = ({ label }) => (
  <h3 className="flex items-center space-x-2 text-sm">
    <span className="border-b grow h-fit" />
    <span className="text-gray-500">{label}</span>
    <span className="border-b grow h-fit" />
  </h3>
);

export default ToolbarHeading;
