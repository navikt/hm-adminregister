import { zodResolver } from "@hookform/resolvers/zod";
import { Buldings3Icon } from "@navikt/aksel-icons";
import { Button, HStack, Loader, TextField, VStack } from "@navikt/ds-react";
import { updateSupplier } from "api/SupplierApi";
import FormBox from "felleskomponenter/FormBox";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { labelRequired } from "utils/string-util";
import { SupplierDTOBody } from "utils/supplier-util";
import { useSupplier } from "utils/swr-hooks";
import { newSupplierSchema } from "utils/zodSchema/newSupplier";
import { z } from "zod";

type FormData = z.infer<typeof newSupplierSchema>;
export default function EditSupplier() {
  const { supplierId } = useParams();
  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();

  const { supplier, supplierError, supplierIsLoading, supplierMutate } = useSupplier(loggedInUser?.isAdmin, supplierId);

  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    trigger,
    formState: { errors, isSubmitting, isDirty, isValid },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(newSupplierSchema),
    mode: "onChange",
    defaultValues: {
      name: supplier?.name || "",
      email: supplier?.supplierData.email || "",
      homepage: supplier?.supplierData.homepage || "",
      phone: supplier?.supplierData.phone || "",
      address: supplier?.supplierData.address || "",
      postNr: supplier?.supplierData.postNr || "",
      postLocation: supplier?.supplierData.postLocation || "",
    },
  });

  useEffect(() => {
    reset({
      name: supplier?.name || "",
      email: supplier?.supplierData.email || "",
      homepage: supplier?.supplierData.homepage || "",
      phone: supplier?.supplierData.phone || "",
      address: supplier?.supplierData.address || "",
      postNr: supplier?.supplierData.postNr || "",
      postLocation: supplier?.supplierData.postLocation || "",
    });
    trigger();
  }, [supplier]);

  if (supplierIsLoading) {
    return <Loader size="3xlarge" title="venter..."></Loader>;
  }

  if (supplierError) {
    setGlobalError(supplierError);
  }

  async function onSubmit(data: FormData) {
    const cleanedPhoneNumber = data.phone.replace(/[^+\d]+/g, "");

    const editedSupplier: SupplierDTOBody = {
      ...supplier,
      name: data.name,
      supplierData: {
        ...supplier?.supplierData,
        email: data.email,
        homepage: data.homepage,
        phone: cleanedPhoneNumber,
        address: data.address,
        postNr: data.postNr,
        postLocation: data.postLocation,
      },
    };

    updateSupplier(loggedInUser?.isAdmin || false, supplierId!, editedSupplier)
      .then(() => {
        supplierMutate();
        navigate(loggedInUser?.isAdmin ? `/leverandor/${supplierId}` : "/profil");
      })
      .catch((error) => {
        setGlobalError(error);
      });
  }

  return (
    <FormBox title="Endre leverandørinformasjon" icon={<Buldings3Icon />}>
      <form action="" method="POST" onSubmit={handleSubmit(onSubmit)}>
        <VStack gap="7" width="300px">
          <TextField
            {...register("name", { required: true })}
            label={labelRequired("Firmanavn")}
            id="name"
            name="name"
            type="text"
            autoComplete="off"
            error={errors.name && errors.name.message}
          />
          <TextField
            {...register("email", { required: false })}
            label={"E-post"}
            id="email"
            type="email"
            name="email"
            description="Eksempel: e-post til kundeservice"
            autoComplete="off"
            error={errors.email && errors.email.message}
          />
          <TextField
            {...register("homepage", { required: false })}
            label="Nettside"
            id="homepage"
            type="text"
            name="homepage"
            description="Eksempel: www.domene.no"
            autoComplete="off"
            error={errors.homepage && errors.homepage.message}
          />
          <TextField
            {...register("phone", { required: false })}
            label="Telefonnummer"
            id="phoneNumber"
            type="text"
            name="phone"
            description="Eksempel: nummer til kundeservice"
            autoComplete="off"
            error={errors.phone && errors.phone.message}
          />
          <TextField
            {...register("address", { required: false })}
            label="Adresse"
            id="address"
            type="text"
            name="address"
            autoComplete="off"
            error={errors.address && errors.address.message}
          />
          <TextField
            {...register("postNr", { required: false })}
            label="Postnummer"
            id="postNr"
            type="text"
            name="postNr"
            autoComplete="off"
            error={errors.postNr && errors.postNr.message}
          />
          <TextField
            {...register("postLocation", { required: false })}
            label="Sted"
            id="postLocation"
            type="text"
            name="postLocation"
            autoComplete="off"
            error={errors.postLocation && errors.postLocation.message}
          />
          <HStack gap="4" align="center">
            <Button type="reset" variant="secondary" size="medium" onClick={() => window.history.back()}>
              Avbryt
            </Button>
            <Button type="submit" size="medium" disabled={!isValid || isSubmitting}>
              Lagre
            </Button>
          </HStack>
        </VStack>
      </form>
    </FormBox>
  );
}
