import { FC, forwardRef, useMemo } from "react";
import { Publication } from "modules/publications";
import { DataInputProps } from "./DataInput";
import Select, { SelectOption } from "./Select";
import countries from "i18n-iso-countries";
import countriesEN from "i18n-iso-countries/langs/en.json";

//TODO: decouple this component from countries
countries.registerLocale(countriesEN);
const COUNTRIES = countries.getNames("en", { select: "official" });

const OPTIONS = Object.entries(COUNTRIES).map(([key, label]) => ({
  id: key,
  label: label,
}));

export default forwardRef<HTMLInputElement, DataInputProps>(
  function TextDataInput({ rowId, colId, value, onChange, ...props }, ref) {
    const placeholder = Publication.ATTRIBUTE_LABELS[colId];
    const error = Boolean(props.error);

    function handleChange(option: SelectOption) {
      onChange?.(option.id);
    }

    const selectedOption = useMemo(
      () => OPTIONS.find((opt) => opt.id === value),
      [value]
    );

    return (
      <Select
        {...props}
        ref={ref}
        value={selectedOption}
        placeholder={placeholder}
        onChange={handleChange}
        error={error}
        options={OPTIONS}
      />
    );
  }
) as FC<DataInputProps>;
