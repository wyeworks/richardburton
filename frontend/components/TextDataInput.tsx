import { ChangeEvent, FC, ForwardedRef, forwardRef, useState } from "react";
import { Publication } from "modules/publications";
import { DataInputProps } from "./DataInput";
import c from "classnames";

export default forwardRef<HTMLElement, DataInputProps>(function TextDataInput(
  { rowId, colId, error, value: data, autoValidated, onChange, ...props },
  ref
) {
  const validate = Publication.REMOTE.useValidate();
  const override = Publication.STORE.ATTRIBUTES.useOverride();
  const [value, setValue] = useState(data);

  function doValidate() {
    if (autoValidated) {
      validate([rowId]);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    override(rowId, colId, e.target.value);
    onChange?.(e.target.value);
  }

  return (
    <input
      {...props}
      ref={ref as ForwardedRef<HTMLInputElement>}
      placeholder={Publication.ATTRIBUTE_LABELS[colId]}
      className={c(
        "px-2 py-1 rounded outline-none bg-transparent focus:bg-gray-active focus:shadow-sm placeholder:text-xs",
        "error:focus:bg-red-400/80 error:bg-red-300/40 error:focus:text-white error:shadow-sm error:placeholder-white"
      )}
      value={value}
      onBlur={doValidate}
      onChange={handleChange}
      data-error={Boolean(error)}
    />
  );
}) as FC<DataInputProps>;
