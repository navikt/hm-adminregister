import {Box, Heading, VStack} from "@navikt/ds-react";
import {cloneElement, ReactElement, ReactNode} from "react";
import "./form-box.scss";

interface FormBoxProps {
    children?: ReactNode | undefined;
    title?: string;
    icon?: ReactElement;
}

export default function FormBox(props: FormBoxProps) {
    const icon = props.icon
        ? cloneElement(props.icon, {"aria-hidden": true, title: "a11y-title", width: 43, height: 43})
        : null;
    return (
        <div className="form-box-conteiner">
            <Box
                background="default"
                marginBlock="space-56 space-40"
                padding="space-24"
                paddingInline="space-48"
                borderRadius="16"
                shadow="dialog"
            >
                <VStack align="center" gap="space-24" maxWidth="400px">
                    {props.title && (
                        <VStack align="center" gap="space-24">
                            {icon}
                            <Heading level="1" size="medium" align="center">
                                {props.title}
                            </Heading>
                        </VStack>
                    )}
                    {props.children}
                </VStack>
            </Box>
        </div>
    );
}
