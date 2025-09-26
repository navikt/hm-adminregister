import { Button, HStack, TextField, VStack, Select } from "@navikt/ds-react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import {TechLabelType, TechLabelRegistrationDTO, TechLabelCreateUpdateDTO} from "utils/types/response-types";
import { createTechLabel, updateTechLabel } from "api/TechLabelApi";
import FormBox from "felleskomponenter/FormBox";

type FormData = {
  label: string;
  type: TechLabelType;
  unit: string;
  isoCode: string;
  options: string;
};

const TECH_LABEL_TYPES = [
  { value: "", label: "Velg type" },
  { value: "N", label: "N" },
  { value: "L", label: "L" },
  { value: "C", label: "C"},
];

const CreateAndEditTechLabel = () => {
  const location = useLocation();
  const editData = location.state as TechLabelRegistrationDTO | undefined;
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      label: editData?.label || "",
      type: editData?.type || "N",
      unit: editData?.unit || "",
      isoCode: editData?.isoCode || "",
      options: editData?.options.join(", ") || "",
    },
  });

  async function onSubmit(data: FormData) {
    const dto: TechLabelCreateUpdateDTO = {
      ...data,
      options : data.options ? data.options.split(",").map(opt => opt.trim()) : [],
    };

    if (editData) {
      await updateTechLabel(editData.id, dto)
    } else {
      await createTechLabel(dto);
    }
    navigate("/tekniskdata");
  }

  const title = editData ? "Endre tekniskdata beskrivelse" : "Opprett ny tekniskdata beskrivelse";

  return (
    <FormBox title={title}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap="7">
          <TextField
            {...register("label", { required: true })}
            label="Label *"
            error={errors.label && "Label is required"}
            id="label"
            autoComplete="on"
          />
          <Select
            {...register("type", { required: true })}
            label="Type *"
            error={errors.type && "Type is required"}
            id="type"
            defaultValue={editData?.type || ""}
          >
            {TECH_LABEL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
          <TextField
            {...register("unit", { required:false })}
            label="Unit"
            id="unit"
            autoComplete="on"
          />
          <TextField
            {...register("isoCode", { required: true })}
            label="ISO Code *"
            error={errors.isoCode && "ISO Code is required"}
            id="isoCode"
            autoComplete="on"
          />
          <TextField
              {...register("options", { required: false })}
              label="Options"
              id="options"
              autoComplete="on"
          />
          <HStack gap="4" align="center">
            <Button type="reset" variant="secondary" size="medium" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button type="submit" size="medium">
              {editData ? "Save" : "Create"}
            </Button>
          </HStack>
        </VStack>
      </form>
    </FormBox>
  );
};

export default CreateAndEditTechLabel;
