import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Heading, HStack, TextField, VStack } from '@navikt/ds-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import useSWR from 'swr'
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { newProductVariantSchema } from "../utils/zodSchema/newProduct";
import { useHydratedAuthStore } from "../utils/store/useAuthStore";
import { useHydratedErrorStore } from "../utils/store/useErrorStore";
import { DraftVariantDTO, ProductRegistrationDTO } from "../utils/response-types";
import { fetcherGET } from "../utils/swr-hooks";
import { isUUID, labelRequired } from "../utils/string-util";
import ProductVariantForm from "./ProductVariantForm";
import { HM_REGISTER_URL } from "../environments";

type FormData = z.infer<typeof newProductVariantSchema>

const OpprettProduktVariant = () => {

    const { loggedInUser } = useHydratedAuthStore()
    const { setGlobalError } = useHydratedErrorStore()
    const [blurredField, setBlurredField] = useState(false)
    const [newProduct, setNewProduct] = useState<ProductRegistrationDTO | null>(null)
    const [searchParams] = useSearchParams()
    const page = Number(searchParams.get('page')) || 1
    const navigate = useNavigate()

    const { seriesId, productId } = useParams()

    const seriesIdPath = loggedInUser?.isAdmin
        ? `${HM_REGISTER_URL}admreg/admin/api/v1/product/registrations/series/${seriesId}`
        : `${HM_REGISTER_URL}admreg/vendor/api/v1/product/registrations/series/${seriesId}`

    const registrationsDraftPath = loggedInUser?.isAdmin
        ? `${HM_REGISTER_URL}admreg/admin/api/v1/product/registrations/draft/variant/${productId}`
        : `${HM_REGISTER_URL}admreg/vendor/api/v1/product/registrations/draft/variant/${productId}`

    const registrationsUpdatePath = (id: string) =>
        loggedInUser?.isAdmin
            ? `${HM_REGISTER_URL}admreg/admin/api/v1/product/registrations/${id}`
            : `${HM_REGISTER_URL}admreg/vendor/api/v1/product/registrations/${id}`

    ///PROBLEM den skriver over uansett nå, yey

    const { data: products, mutate } = useSWR<ProductRegistrationDTO[]>(seriesIdPath, fetcherGET)
    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting, isDirty, isValid },
    } = useForm<FormData>({
        resolver: zodResolver(newProductVariantSchema),
        mode: 'onSubmit',
    })

    const isFirstProductInSeries = products?.length === 1 && isUUID(products[0].supplierRef)

    async function onSubmit(data: FormData) {
        if (isFirstProductInSeries) {
            const updatedProduct = {
                ...products[0],
                articleName: data.articleName,
                supplierRef: data.supplierRef,
            }

            const setProductVariantResponse = await fetch(registrationsUpdatePath(updatedProduct.id), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updatedProduct),
            })

            if (setProductVariantResponse.ok) {
                const product = await setProductVariantResponse.json()
                setNewProduct(product)
                // router.push(`/produkter/${id}/rediger-variant/${product.id}?page=${page}`)
            } else {
                const responsData = await setProductVariantResponse.json()
                setGlobalError(setProductVariantResponse.status, responsData.message)
            }
        } else {
            const newVariant: DraftVariantDTO = {
                articleName: data.articleName,
                supplierRef: data.supplierRef,
            }

            const response = await fetch(registrationsDraftPath, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(newVariant),
            })
            if (response.ok) {
                const product = await response.json()
                setNewProduct(product)
                // router.push(`/produkter/${id}/rediger-variant/${product.id}?page=${page}`)
            } else {
                const responsData = await response.json()
                setGlobalError(response.status, responsData.message)
            }
        }
    }

    return (
        <main>
            <HStack justify="center" className="create-variant-page">
                <VStack gap="8">
                    <Heading level="1" size="large" align="start">
                        {!newProduct ? 'Legg til artikkel' : 'Legg til teknisk data'}
                    </Heading>
                    {!newProduct && (
                        <form className="form form--max-width-small" onSubmit={handleSubmit(onSubmit)}>
                            <TextField
                                {...register('articleName', { required: true })}
                                label={labelRequired('Artikkelnavn')}
                                id="articleName"
                                name="articleName"
                                type="text"
                                onBlur={() => setBlurredField(true)}
                                onFocus={() => setBlurredField(false)}
                                error={errors?.articleName?.message}
                            />
                            <TextField
                                {...register('supplierRef', { required: true })}
                                label={labelRequired('Leverandør artikkelnummer')}
                                id="supplierRef"
                                name="supplierRef"
                                type="text"
                                onBlur={() => setBlurredField(true)}
                                onFocus={() => setBlurredField(false)}
                                error={errors?.supplierRef?.message}
                            />

                            <div className="button-container">
                                <Button type="reset" variant="tertiary" size="medium"
                                        onClick={() => window.history.back()}>
                                    Avbryt
                                </Button>
                                <Button type="submit" size="medium">
                                    Opprett og legg til mer info
                                </Button>
                            </div>
                        </form>
                    )}

                    {newProduct && (
                        <ProductVariantForm
                            product={newProduct}
                            registrationPath={registrationsUpdatePath(newProduct.id)}
                            mutate={mutate}
                            firstTime={true}
                        />
                    )}
                </VStack>
            </HStack>
        </main>
    )
}

export default OpprettProduktVariant