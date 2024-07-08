import React from "react";
import ReactQuill from "react-quill";
import "./RichTextEditor.css";
import "react-quill/dist/quill.snow.css";
import styles from "./RichTextEditor.module.scss";

type RichTextEditorNewsProps = {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
};

export default function RichTextEditorNews(props: RichTextEditorNewsProps) {
  const modules = {
    toolbar: [["bold", "italic"], [{ list: "ordered" }, { list: "bullet" }], ["link"]],
  };

  const formats = ["bold", "italic", "list", "bullet", "link"];

  return (
    <ReactQuill
      modules={modules}
      formats={formats}
      value={props.content}
      onChange={props.setContent}
      onKeyDown={(e) => {
        const fields = Array.from(document.querySelectorAll("button")) || [];
        if (e.key === "Tab") {
          if (e.target.className === "ql-editor") {
            fields[52].focus();
          }
        }
      }}
      className={styles.editorStyle}
    />
  );
}
