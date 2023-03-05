import { FC, forwardRef, HTMLProps, Ref } from "react";
import TextDataInput from "./TextDataInput";
import TextArrayDataInput from "./TextArrayDataInput";
import {
  Publication,
  PublicationId,
  PublicationKey,
  PublicationKeyType,
} from "modules/publications";

const COMPONENTS_PER_TYPE: Record<PublicationKeyType, FC<Props>> = {
  text: TextDataInput,
  enum: TextDataInput,
  number: TextDataInput,
  array: TextArrayDataInput,
};

type Props = Omit<HTMLProps<HTMLInputElement>, "onChange" | "ref"> & {
  ref: Ref<HTMLElement>;
  rowId: PublicationId;
  colId: PublicationKey;
  value: string;
  error: boolean;
  onChange?: (value: string) => void;
};

const DataInput = forwardRef<HTMLElement, Props>(function DataInput(
  props,
  ref
) {
  const type = Publication.ATTRIBUTE_TYPES[props.colId];
  const Component = COMPONENTS_PER_TYPE[type];
  return <Component {...props} ref={ref} />;
});

export type { Props as DataInputProps };
export default DataInput;
