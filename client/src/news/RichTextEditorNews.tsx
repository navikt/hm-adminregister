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
  const fieldsButton = Array.from(document.querySelectorAll("button")) || [];
  const index = fieldsButton.findIndex((item) => item.className === "ql-link");

  return (
    <ReactQuill
      modules={modules}
      formats={formats}
      value={props.content}
      onChange={props.setContent}
      onKeyDown={(e) => {
        if (e.key === "Tab") {
          if (e.target.className === "ql-editor") {
            fieldsButton[index + 1].focus();
            //console.log("textfield", props.content.replace("\t", ""));
          }
        }
      }}
      className={styles.editorStyle}
    />
  );
}
