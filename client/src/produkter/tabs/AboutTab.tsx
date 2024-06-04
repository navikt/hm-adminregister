import {Alert, BodyShort, Button, Heading, Tabs, TextField, UNSAFE_Combobox, VStack} from "@navikt/ds-react";
import React, {useRef, useState} from "react";
import {SubmitHandler, useFormContext} from "react-hook-form";
import {FloppydiskIcon, PencilWritingIcon, PlusCircleIcon} from "@navikt/aksel-icons";
import {EditSeriesInfo} from "../Produkt";
import {IsoCategoryDTO, SeriesRegistrationDTO} from "utils/types/response-types";
import {labelRequired} from "utils/string-util";
import {RichTextEditor} from "produkter/RichTextEditor";
import parse from "html-react-parser";
import {isValidKeyword, isValidUrl} from "produkter/seriesUtils";


interface Props {
    series: SeriesRegistrationDTO;
    onSubmit: SubmitHandler<EditSeriesInfo>;
    isoCategory?: IsoCategoryDTO;
    isEditable: boolean;
    showInputError: boolean;
}

const AboutTab = ({series, onSubmit, isoCategory, isEditable, showInputError}: Props) => {
    const formMethods = useFormContext<EditSeriesInfo>();
    const [showEditDescriptionMode, setShowEditDescriptionMode] = useState(false);
    const [showEditKeywordsMode, setShowEditKeywordsMode] = useState(false);
    const [showEditUrlMode, setShowEditUrlMode] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const [urlFormatError, setUrlFormatError] = useState<string | undefined>(undefined);
    const [keywordFormatError, setKeywordFormatError] = useState<string | undefined>(undefined);
    const comboBoxInitialOptions = ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]  // to be deleted
    const [inputValue, setInputValue] = useState("");
    const [selectedOptions, setSelectedOptions] = useState<string[]>(series.seriesData.attributes.keywords ? series.seriesData.attributes.keywords : []);

    const validKeywordLetters = new RegExp(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9_\s]*$/);

    const getDescription = () => (
        <>
            Beskrivelsen vises på produktsiden og bør:
            <ul>
                <li>Være mellom 100 og 750 tegn</li>
                <li>Ikke inneholde tekniske data, for eksempel. “Totalvekt i str. 42x40”</li>
                <li>Ha en nøytral språkstil uten markedsføringsuttrykk</li>
            </ul>
        </>
    );

    const handleSaveDescription = () => {
        setShowEditDescriptionMode(false);
        formRef.current?.requestSubmit();
    };

    const handleSaveUrl = () => {
        setUrlFormatError(undefined);
        setShowEditUrlMode(false);
        formRef.current?.requestSubmit();
    };

    const handleSaveKeywords = () => {
        setKeywordFormatError(undefined);
        setShowEditKeywordsMode(false);
        if (selectedOptions.length <= 3) {
            formMethods.setValue("keywords", selectedOptions)
            formRef.current?.requestSubmit();
        } else setKeywordFormatError("Du kan maksimalt velge 3 nøkkelord");
    };

    return (
        <Tabs.Panel value="about" className="tab-panel">
            <form method="POST" onSubmit={formMethods.handleSubmit(onSubmit)} ref={formRef}>
                <VStack gap="14">
                    <VStack gap="2">
                        <Heading level="2" size="small">
                            Iso-kategori (kode)
                        </Heading>

                        <div>
                            {isoCategory?.isoTitle} ({isoCategory?.isoCode})
                        </div>
                    </VStack>

                    <VStack gap="2">
                        <Heading level="2" size="small">
                            {labelRequired("Produktbeskrivelse")}
                        </Heading>

                        {!showEditDescriptionMode && (
                            <>
                                {!series.text ? (
                                    <>
                                        <Alert variant={showInputError ? "error" : "info"}>
                                            Produktet trenger en beskrivelse før det kan sendes til godkjenning
                                        </Alert>
                                        <Button
                                            className="fit-content"
                                            variant="tertiary"
                                            icon={<PlusCircleIcon title="Legg til beskrivelse" fontSize="1.5rem"/>}
                                            onClick={() => setShowEditDescriptionMode(true)}
                                        >
                                            Legg til beskrivelse
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <div className="preview">{parse(series.text)}</div>

                                        {isEditable && (
                                            <Button
                                                className="fit-content"
                                                variant="tertiary"
                                                icon={<PencilWritingIcon title="Endre beskrivelse" fontSize="1.5rem"/>}
                                                onClick={() => setShowEditDescriptionMode(true)}
                                            >
                                                Endre beskrivelse
                                            </Button>
                                        )}
                                    </>
                                )}
                            </>
                        )}

                        {showEditDescriptionMode && (
                            <>
                                <RichTextEditor
                                    description={getDescription()}
                                    onChange={(description: string) => {
                                        formMethods.setValue("description", description);
                                    }}
                                    textContent={series.text || ""}
                                />
                                <Button
                                    className="fit-content"
                                    variant="tertiary"
                                    icon={<FloppydiskIcon title="Lagre beskrivelse" fontSize="1.5rem"/>}
                                    onClick={handleSaveDescription}
                                >
                                    Lagre
                                </Button>
                            </>
                        )}
                    </VStack>
                    <VStack gap="2">
                        <Heading level="2" size="xsmall">
                            {"URL til leverandørs produktside"}
                        </Heading>
                        {!showEditUrlMode && (
                            <>
                                {!series.seriesData.attributes.url ? (
                                    <>
                                        {isEditable ? (
                                            <Button
                                                className="fit-content"
                                                variant="tertiary"
                                                icon={<PlusCircleIcon title="Legg til URL til leverandørs produktside"
                                                                      fontSize="1.5rem"/>}
                                                onClick={() => setShowEditUrlMode(true)}
                                            >
                                                Legg til URL til leverandørs produktside
                                            </Button>
                                        ) : (
                                            "-"
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <a href={series.seriesData.attributes.url} target="_blank" className="preview"
                                           rel="noreferrer">
                                            {series.seriesData.attributes.url}
                                        </a>
                                        {isEditable && (
                                            <Button
                                                className="fit-content"
                                                variant="tertiary"
                                                icon={<PencilWritingIcon title="Endre url" fontSize="1.5rem"/>}
                                                onClick={() => setShowEditUrlMode(true)}
                                            >
                                                Endre URL
                                            </Button>
                                        )}
                                    </>
                                )}
                            </>
                        )}

                        {showEditUrlMode && (
                            <>
                                <TextField
                                    defaultValue={series.seriesData.attributes.url || ""}
                                    label={""}
                                    id="url"
                                    name="url"
                                    type="text"
                                    onChange={(e) => {
                                        if (e.target.value.length > 0 && !isValidUrl(e.target.value)) {
                                            setUrlFormatError("Ugyldig URL-format");
                                        } else {
                                            formMethods.setValue("url", e.target.value);
                                            setUrlFormatError(undefined);
                                        }
                                    }}
                                    error={urlFormatError}
                                />
                                <Button
                                    className="fit-content"
                                    variant="tertiary"
                                    icon={<FloppydiskIcon title="Lagre URL" fontSize="1.5rem"/>}
                                    onClick={handleSaveUrl}
                                >
                                    Lagre
                                </Button>
                            </>
                        )}
                    </VStack>
                    <VStack gap="2">
                        <Heading level="2" size="xsmall">
                            Nøkkelord
                        </Heading>
                        <BodyShort>Nøkkelord vil bli brukt til søket, så her kan dere legge ord som dere mener bør gi
                            treff på dette hjelpemiddelet.</BodyShort>
                        {!showEditKeywordsMode && (
                            <>
                                {!series.seriesData.attributes.keywords ? (
                                    <>
                                        {isEditable ? (
                                            <Button
                                                className="fit-content"
                                                variant="tertiary"
                                                icon={<PlusCircleIcon title="Legg til URL til produsentens produktside"
                                                                      fontSize="1.5rem"/>}
                                                onClick={() => setShowEditKeywordsMode(true)}
                                            >
                                                Legg til nøkkelord
                                            </Button>
                                        ) : (
                                            "-"
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <BodyShort>
                                            <b> {series.seriesData.attributes.keywords.join(", ")} </b>
                                        </BodyShort>
                                        {isEditable && (
                                            <Button
                                                className="fit-content"
                                                variant="tertiary"
                                                icon={<PencilWritingIcon title="Endre url" fontSize="1.5rem"/>}
                                                onClick={() => setShowEditKeywordsMode(true)}
                                            >
                                                Endre nøkkelord
                                            </Button>
                                        )}
                                    </>
                                )}
                            </>
                        )}

                        {showEditKeywordsMode && (
                            <>
                                <UNSAFE_Combobox
                                    id="keywords"
                                    label=""
                                    isMultiSelect={true}
                                    clearButton={true}
                                    options={[...comboBoxInitialOptions]}
                                    selectedOptions={selectedOptions || []}
                                    maxSelected={{limit: 3}}
                                    shouldShowSelectedOptions={true}
                                    shouldAutocomplete={true}
                                    onToggleSelected={(option: string, isSelected: boolean) =>
                                        (isSelected && isValidKeyword(inputValue) && validKeywordLetters.test(inputValue))
                                            ? setSelectedOptions([...selectedOptions, option])
                                            : setSelectedOptions(selectedOptions.filter((o) => o !== option))
                                    }
                                    error={keywordFormatError}
                                />
                                <Button
                                    className="fit-content"
                                    variant="tertiary"
                                    icon={<FloppydiskIcon title="Lagre nøkkelord" fontSize="1.5rem"/>}
                                    onClick={handleSaveKeywords}
                                >
                                    Lagre
                                </Button>
                            </>
                        )}
                    </VStack>

                </VStack>
            </form>
        </Tabs.Panel>
    );
};

export default AboutTab;
