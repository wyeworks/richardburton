import { FC, forwardRef, HTMLProps, Ref } from "react";
import TextDataInput from "./TextDataInput";
import TextArrayDataInput from "./TextArrayDataInput";
import {
  Publication,
  PublicationId,
  PublicationKey,
  PublicationKeyType,
} from "modules/publications";
import Tooltip from "./Tooltip";

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
  error: string;
  onChange?: (value: string) => void;
  autoValidated?: boolean;
};

const DataInput = forwardRef<HTMLElement, Props>(function DataInput(
  props,
  ref
) {
  const type = Publication.ATTRIBUTE_TYPES[props.colId];
  const Component = COMPONENTS_PER_TYPE[type];
  return (
    <Tooltip error message={props.error}>
      <Component {...props} ref={ref} />
    </Tooltip>
  );
});

export type { Props as DataInputProps };
export default DataInput;
