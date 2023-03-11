import { FC, ForwardedRef, forwardRef, useEffect, useState } from "react";
import { Publication } from "modules/publications";
import { DataInputProps } from "./DataInput";
import TextInput from "./TextInput";

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

  function handleChange(value: string) {
    setValue(value);
    override(rowId, colId, value);
    onChange?.(value);
  }

  useEffect(() => {
    if (data !== value) {
      setValue(data);
    }
  }, [data, rowId, colId, value, setValue]);

  return (
    <TextInput
      {...props}
      ref={ref as ForwardedRef<HTMLInputElement>}
      placeholder={Publication.ATTRIBUTE_LABELS[colId]}
      value={value}
      onBlur={doValidate}
      onChange={handleChange}
      error={Boolean(error)}
    />
  );
}) as FC<DataInputProps>;
