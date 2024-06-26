import React from "react";
import {NewspaperIcon} from "@navikt/aksel-icons";
import {Button, Heading, HStack, DatePicker, Textarea, TextField} from "@navikt/ds-react";
import {labelRequired} from "utils/string-util";
import {HM_REGISTER_URL} from "environments";
import {useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {newSupplierSchema} from "utils/zodSchema/newSupplier"; // REMOVE
import {useErrorStore} from "utils/store/useErrorStore";
import "./CreateNews.scss";


const CreateNews = () => {
    const { setGlobalError } = useErrorStore();
    const navigate = useNavigate();
    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting, isDirty, isValid },
    } = useForm<FormData>({
        resolver: zodResolver(newSupplierSchema), /// MUST CHANGE TO BE RELATED TO NEWS
        mode: "onChange",
    });

    async function onSubmit(data: FormData) {
        //remove all white spaces

        const response = await fetch(`${HM_REGISTER_URL()}/admreg/admin/api/v1/news`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json", //???
            },
            credentials: "include",
            body: JSON.stringify("hei"),
        });
        if (!response.ok) {
            const responsData = await response.json();
            setGlobalError(response.status, responsData.message);
        } else {
            navigate("/nyheter")
        }
    }




    return (
        <div className="create-new-supplier">
            <div className="content">
                <div className="header-container">
                    <NewspaperIcon title="a11y-title" width={43} height={43} aria-hidden/>
                    <Heading level="1" size="large" align="center">
                        Opprett ny nyhetsmelding
                    </Heading>
                </div>
                <form action="" method="POST" className="specialform">
                    <TextField
                        label={labelRequired("Tittel på nyhetsmelding")}
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="on"
                    />
                    <Heading level="2" size="small">
                        Vises på FinnHjelpemiddel
                    </Heading>
                    <DatePicker  >
                        <HStack gap="20" wrap={false}>
                            <DatePicker.Input label="Fra"/>
                            <DatePicker.Input label="Til" />
                        </HStack>
                    </DatePicker>

                    <Textarea label={"Beskrivelse"} resize>

                    </Textarea>


                    <div className="button-container">
                        <Button type="reset" variant="secondary" size="medium" onClick={() => window.history.back()}>
                            Avbryt
                        </Button>
                        <Button type="submit" size="medium">
                            Opprett
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateNews