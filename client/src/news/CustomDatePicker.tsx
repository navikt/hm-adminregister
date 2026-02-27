import { DatePicker, useDatepicker, type UseDatepickerOptions } from "@navikt/ds-react";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { format, isEqual } from "date-fns";
import { labelRequired } from "utils/string-util";

const CustomDatePicker = <T extends FieldValues>({
  name,
  label,
  description,
  control,
  errorMessage,
  readOnly,
  watchPublishDate,
  shouldUnregister = false,
  required = true,
}: {
  name: Path<T>;
  label: string;
  description?: string;
  control: Control<T>;
  errorMessage?: string;
  readOnly?: boolean;
  watchPublishDate?: Date;
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
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (watchPublishDate) {
          if (new Date(watchPublishDate) >= new Date(value)) {
            return "Velg senere dato";
          }
        }
        if (errorMessage && !value) {
          return errorMessage;
        }

        return undefined;
      },
      required: {
        value: required,
        message: errorMessage || "Må fylles ut",
      },
    },
    shouldUnregister: shouldUnregister,
  });

  const formatDateToLocaleDateOrEmptyString = (date: Date | undefined) =>
    date === undefined ? "" : format(date, "yyyy-MM-dd");

  const { datepickerProps, inputProps, setSelected, selectedDay } = useDatepicker({
    onDateChange: (date?: Date) => {
      field.onChange(formatDateToLocaleDateOrEmptyString(date));
    },

    locale: "nb",
    inputFormat: "dd.MM.yyyy",
    defaultSelected: field.value ? new Date(field.value) : undefined,
    fromDate: (() => {
      const date = watchPublishDate ? new Date(watchPublishDate) : new Date();
      date.setDate(date.getDate() + 1);
      return watchPublishDate ? date : new Date();
    })(),
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

export default CustomDatePicker;
