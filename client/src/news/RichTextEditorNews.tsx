import React, { useState } from "react";
import ReactQuill from "react-quill";
import styles from "./RichTextEditor.module.scss"
import "./RichTextEditor.css";

import "react-quill/dist/quill.snow.css";

export default function RichTextEditorNews() {
    const modules = {
        toolbar: [
            ["bold", "italic"],
            [{ list: "ordered" }, { list: "bullet" }],
        ]
    };

    const formats = [
        "bold",
        "italic",
        "list",
        "bullet",
    ];

    const [code, setCode] = useState(
        ""
    );

    const handleProcedureContentChange = (content: string) => {
        setCode(content);
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
