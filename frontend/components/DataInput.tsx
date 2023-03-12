import { FC, forwardRef, HTMLProps, Ref, useEffect, useState } from "react";
import TextDataInput from "./TextDataInput";
import TextArrayDataInput from "./TextArrayDataInput";
import {
  Publication,
  PublicationId,
  PublicationKey,
  PublicationKeyType,
} from "modules/publications";
import Tooltip from "./Tooltip";
import TextEnumDataInput from "./TextEnumDataInput";
import countries from "i18n-iso-countries";
import countriesEN from "i18n-iso-countries/langs/en.json";

//TODO: decouple this component from countries
countries.registerLocale(countriesEN);
const COUNTRIES = countries.getNames("en", { select: "official" });

const COMPONENTS_PER_TYPE: Record<PublicationKeyType, FC<Props>> = {
  text: TextDataInput,
  enum: TextEnumDataInput,
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
  const { rowId, colId, value: data, autoValidated, onChange } = props;

  const type = Publication.ATTRIBUTE_TYPES[props.colId];
  const Component = COMPONENTS_PER_TYPE[type];

  const validate = Publication.REMOTE.useValidate();
  const override = Publication.STORE.ATTRIBUTES.useOverride();
  const [value, setValue] = useState(data);

  function doValidate() {
    if (autoValidated) {
      validate([rowId]);
    }
  }

  function handleChange(value: string) {
    console.log(value);
    setValue(value);
    override(rowId, colId, value);
    onChange?.(value);
  }

  useEffect(() => {
    if (colId === "country") {
      if (COUNTRIES[data] !== value) {
        setValue(COUNTRIES[data]);
      }
    } else {
      if (data !== value) {
        setValue(data);
      }
    }
  }, [data, rowId, colId, value, setValue]);

  return (
    <Tooltip error message={props.error}>
      <Component
        {...props}
        ref={ref}
        value={value}
        onChange={handleChange}
        onBlur={doValidate}
      />
    </Tooltip>
  );
});

export { COUNTRIES };
export type { Props as DataInputProps };
export default DataInput;
