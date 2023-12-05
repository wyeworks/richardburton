import countries from "i18n-iso-countries";
import countriesEN from "i18n-iso-countries/langs/en.json";

//TODO: decouple this component from countries
countries.registerLocale(countriesEN);
type Country = { id: string; label: string };

const COUNTRIES: Record<Country["id"], Country> = Object.entries(
  countries.getNames("en", { select: "official" }),
).reduce(
  (acc, [key, label]) => ({
    ...acc,
    [key]: { id: key, label: label },
  }),
  {},
);

export type { Country };
export { COUNTRIES };
