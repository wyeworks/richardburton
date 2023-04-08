import { DetailedHTMLProps, forwardRef, LiHTMLAttributes } from "react";
import c from "classnames";

type Props = Omit<
  DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>,
  "className"
> & {
  selected: boolean;
};

export default forwardRef<HTMLLIElement, Props>(function MenuItem(
  { selected, ...props },
  ref
) {
  return (
    <li
      className={c("px-2.5 py-1", { "bg-indigo-100": selected })}
      ref={ref}
      {...props}
    />
  );
});
