import React, { ReactNode } from "react";
import { DatePicker, useDatepicker } from "@navikt/ds-react";
import { UseDatepickerOptions } from "@navikt/ds-react/esm/date/hooks/useDatepicker";
import { Control, FieldValues, Path, useController, UseFormWatch } from "react-hook-form";
import { format, isEqual } from "date-fns";
import { labelRequired } from "utils/string-util";
import { commonSeriesInfo } from "utils/zodSchema/newSeries";

const DatoVelger = <T extends FieldValues>({
  name,
  label,
  description,
  control,
  errorVedTomInput,
  readOnly,
  watchDate,
  shouldUnregister = false,
  required = true,
}: {
  name: Path<T>;
  label: string;
  description?: string;
  control: Control<T>;
  errorVedTomInput?: string;
  readOnly?: boolean;
  watchDate?: Date;
  shouldUnregister?: boolean;
  required?: boolean;
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: {
      validate: (value) => {
        if (watchDate) {
          if (new Date(watchDate) >= new Date(value)) {
            return "Til dato må være senere enn fra dato";
          }
        }

        if (errorVedTomInput && !value) {
          return errorVedTomInput;
        }
        return undefined;
      },
      required: {
        value: required,
        message: errorVedTomInput || "Må fylles ut",
      },
    },
    shouldUnregister: shouldUnregister,
  });

  const formatDateToLocaleDateOrEmptyString = (date: Date | undefined) =>
    date === undefined ? "" : format(date, "yyyy-MM-dd");

  const { datepickerProps, inputProps, setSelected, selectedDay } = useDatepicker({
    onDateChange: (date: Date) => {
      date && field.onChange(formatDateToLocaleDateOrEmptyString(date));
    },
    locale: "nb",
    inputFormat: "dd.MM.yyyy",
    defaultSelected: field.value ? new Date(field.value) : undefined,
    fromDate: watchDate ? new Date(watchDate) : new Date(),
  } as UseDatepickerOptions);

  const handleBlur = () => {
    if (selectedDay && !field.value) {
      setSelected(undefined);
    } else if (selectedDay && !isEqual(new Date(field.value), selectedDay)) {
      setSelected(new Date(field.value));
    } else if (field.value && !selectedDay && inputProps.value?.toString().length === 0) {
      setSelected(new Date(field.value));
    }
  };
  return (
    <DatePicker {...datepickerProps}>
      <DatePicker.Input
        {...inputProps}
        id={field.name}
        label={required ? labelRequired(label) : label}
        description={description}
        error={error?.message}
        readOnly={readOnly}
        onBlur={handleBlur}
      />
    </DatePicker>
  );
};

export default DatoVelger;
