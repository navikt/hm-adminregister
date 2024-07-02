import React, { useState } from "react";
import ReactQuill from "react-quill";
import styles from "./RichTextEditor.module.scss"
import "./RichTextEditor.css";

import "react-quill/dist/quill.snow.css";

type RichTextEditorNewsProps = {
    onChange: (content: string) => void;
};

export default function RichTextEditorNews({ onChange }: RichTextEditorNewsProps) {
    const modules = {
        toolbar: [
            ["bold", "italic"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"]
        ]
    };

    const formats = [
        "bold",
        "italic",
        "list",
        "bullet",
        "link"
    ];

    const [code, setCode] = useState(
        ""
    );

    const handleProcedureContentChange = (content: string) => {
        setCode(content);
        onChange(content);
    };

    return (
            <ReactQuill
                theme="snow"
                modules={modules}
                formats={formats}
                value={code}
                onChange={handleProcedureContentChange}
                className={styles.editorStyle}
            />
    );
}
