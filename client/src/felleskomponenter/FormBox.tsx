import { Buldings3Icon } from "@navikt/aksel-icons"
import { Box, Heading, VStack } from "@navikt/ds-react"
import { ReactElement, ReactNode, cloneElement } from "react";
import "./form-box.scss";

export interface FormBoxProps {
    children?: ReactNode | undefined;
    title: string
    icon: ReactElement
}
export default function FormBox(props: FormBoxProps) {
    const icon = cloneElement(props.icon, { "aria-hidden": true, title: "a11y-title", width: 43, height: 43 });
    return (
        <div className="create-new-supplier">
            <Box
                background="surface-default"
                padding="8"
                paddingInline="20"
                borderRadius="large"
                shadow="medium"

            >
                <VStack align="center" gap="8" maxWidth="300px">
                    <VStack align="center" gap="4">
                        {icon}
                        <Heading level="1" size="large" align="center">
                            {props.title}
                        </Heading>
                    </VStack>
                    {props.children}
                </VStack>
            </Box >
        </div >
    )
}
