import { FC, forwardRef } from "react";
import { Publication } from "modules/publications";
import { DataInputProps } from "./DataInput";
import TextInput from "./TextInput";

export default forwardRef<HTMLInputElement, DataInputProps>(
  function TextDataInput({ rowId, colId, ...props }, ref) {
    const placeholder = Publication.ATTRIBUTE_LABELS[colId];
    const error = Boolean(props.error);

    return (
      <TextInput {...props} ref={ref} placeholder={placeholder} error={error} />
    );
  }
) as FC<DataInputProps>;
