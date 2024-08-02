import React, { useEffect } from "react";
import ReactQuill from "react-quill";
import "./RichTextEditor.css";
import "react-quill/dist/quill.snow.css";
import styles from "./RichTextEditor.module.scss";
import { useRef } from "react";
import { Box, Heading } from "@navikt/ds-react";

type RichTextEditorNewsProps = {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
};

export default function RichTextEditorNews(props: RichTextEditorNewsProps) {
  const editorRef = useRef<ReactQuill>(null);
  useEffect(() => {
    //9 is the keybinding for tab
    if (editorRef.current) delete editorRef.current.getEditor().getModule("keyboard").bindings[9];
  }, [editorRef]);

  const modules = {
    toolbar: [["bold", "italic"], [{ list: "ordered" }, { list: "bullet" }], ["link"]],
  };

  const formats = ["bold", "italic", "list", "bullet", "link"];

  return (
    <Box>
      <Heading level="2" size="xsmall" spacing={true}>
        Beskrivelse
      </Heading>
      <ReactQuill
        ref={editorRef}
        modules={modules}
        formats={formats}
        value={props.content}
        onChange={props.setContent}
        className={styles.editorStyle}
      />
    </Box>
  );
}
