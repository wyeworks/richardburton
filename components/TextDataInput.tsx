import { FC, forwardRef } from "react";
import { DataInputProps } from "./DataInput";
import TextInput from "./TextInput";

export default forwardRef<HTMLInputElement, DataInputProps>(
  function TextDataInput({ rowId, colId, ...props }, ref) {
    return <TextInput {...props} ref={ref} />;
  }
) as FC<DataInputProps>;
