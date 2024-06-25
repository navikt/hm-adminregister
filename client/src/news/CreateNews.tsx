import React from "react";
import {NewspaperIcon} from "@navikt/aksel-icons";
import {Button, Heading, HStack, DatePicker, Textarea, TextField} from "@navikt/ds-react";
import {labelRequired} from "utils/string-util";


const CreateNews = () => {

    return (
        <div className="create-new-supplier">
            <div className="content">
                <div className="header-container">
                    <NewspaperIcon title="a11y-title" width={43} height={43} aria-hidden/>
                    <Heading level="1" size="large" align="center">
                        Opprett ny nyhetsmelding
                    </Heading>
                </div>
                <form action="" method="POST">
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
                        <HStack gap="4" wrap={false}>
                            <DatePicker.Input label="Fra" />
                            <DatePicker.Input label="Til" />
                        </HStack>
                    </DatePicker>

                    <Textarea label={"Beskrivelse"}>

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