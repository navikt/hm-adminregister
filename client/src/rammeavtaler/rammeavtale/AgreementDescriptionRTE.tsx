import { Editor } from "react-draft-wysiwyg";
import { EditorState } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import styles from "./AgreementDescriptionRTE.module.scss";
import { useState } from "react";
import { stateToHTML } from "draft-js-export-html";
import { stateFromHTML } from "draft-js-import-html";

export interface Props {
  onChange: (description: string) => void;
  textContent: string;
  formattedContent?: string;
}

export const AgreementDescriptionRTE = ({ onChange, textContent }: Props) => {
  const [state, setState] = useState<EditorState>(EditorState.createWithContent(stateFromHTML(textContent)));

  return (
    <>
      <Editor
        editorState={state}
        onEditorStateChange={(editorState) => {
          setState(editorState);
          const html = stateToHTML(editorState.getCurrentContent());
          onChange(html);
        }}
        editorClassName={styles.editor}
        toolbar={{
          options: ["inline", "list", "link"],
          inline: {
            inDropdown: false,
            options: ["bold", "italic"],
          },
          list: {
            inDropdown: false,
            options: ["unordered", "ordered"],
          },
        }}
      />
    </>
  );
};
