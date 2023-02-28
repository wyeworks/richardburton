import { DetailedHTMLProps, FC, forwardRef, OlHTMLAttributes } from "react";

type Props = Omit<
  DetailedHTMLProps<OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>,
  "className"
>;

export default forwardRef<HTMLOListElement, Props>(function Menu(
  { ...props },
  ref
) {
  return (
    <ol
      className="z-30 text-xs rounded shadow w-max bg-gray-active"
      ref={ref}
      {...props}
    />
  );
});
