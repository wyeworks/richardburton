import { times } from "lodash";
import { FC } from "react";

interface Props {
  rows: number;
}

const ListSkeleton: FC<Props> = ({ rows }) => {
  return (
    <ul
      className="w-full space-y-2 animate-pulse"
      aria-label="Loading"
      role="presentation"
    >
      {times(rows, (index) => (
        <li
          key={index}
          className="w-full h-8 bg-gray-200 rounded hover:bg-indigo-100"
          style={{
            opacity: index > 7 ? 1 - (2 * (index - rows / 2)) / rows : 1,
          }}
        />
      ))}
    </ul>
  );
};

export { ListSkeleton };
