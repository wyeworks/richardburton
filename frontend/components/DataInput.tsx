import {
  FC,
  FocusEvent,
  forwardRef,
  HTMLProps,
  Ref,
  useEffect,
  useState,
} from "react";
import TextDataInput from "./TextDataInput";
import TextArrayDataInput from "./TextArrayDataInput";
import {
  Publication,
  PublicationId,
  PublicationKey,
  PublicationKeyType,
} from "modules/publication";
import Tooltip from "./Tooltip";
import TextEnumDataInput from "./TextEnumDataInput";
import TextNumberDataInput from "./TextNumberDataInput";

const COMPONENTS_PER_TYPE: Record<PublicationKeyType, FC<Props>> = {
  text: TextDataInput,
  enum: TextEnumDataInput,
  number: TextNumberDataInput,
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

const DataInput = forwardRef<HTMLElement, Props>(
  function DataInput(props, ref) {
    const {
      rowId,
      colId,
      value: data,
      error,
      autoValidated,
      onBlur,
      onChange,
    } = props;

    const type = Publication.ATTRIBUTE_TYPES[props.colId];
    const Component = COMPONENTS_PER_TYPE[type];
    const placeholder = Publication.ATTRIBUTE_LABELS[colId];

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
      if (type == "array" || type == "enum") {
        doValidate();
      }
      onChange?.(value);
    }

    function handleBlur(event: FocusEvent<HTMLInputElement>) {
      doValidate();
      onBlur?.(event);
    }

    useEffect(() => {
      if (data !== value) {
        setValue(data);
      }
    }, [data, rowId, colId, value, setValue]);

    return (
      <Tooltip error message={props.error}>
        <Component
          {...props}
          {...Publication.define(colId)}
          ref={ref}
          value={value}
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder={placeholder}
          error={error}
        />
      </Tooltip>
    );
  },
);

export type { Props as DataInputProps };
export default DataInput;
