import { FC, ForwardedRef, forwardRef, useEffect, useState } from "react";
import { Publication } from "modules/publications";
import { DataInputProps } from "./DataInput";
import countries from "i18n-iso-countries";
import countriesEN from "i18n-iso-countries/langs/en.json";
import c from "classnames";
import Select, { SelectOption } from "./Select";

//TODO: decouple this component from countries
countries.registerLocale(countriesEN);
const COUNTRIES = countries.getNames("en", { select: "official" });

const OPTIONS = Object.entries(COUNTRIES).map(([key, label]) => ({
  id: key,
  label: label,
}));

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

  function handleChange(option: SelectOption) {
    setValue(option.label);
    override(rowId, colId, option.id);
    onChange?.(option.id);
  }

  useEffect(() => {
    if (COUNTRIES[data] !== value) {
      setValue(COUNTRIES[data]);
    }
  }, [data, rowId, colId, value, setValue]);

  return (
    <Select
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
      error={Boolean(error)}
      options={OPTIONS}
    />
  );
}) as FC<DataInputProps>;
