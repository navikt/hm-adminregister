import { Editor } from "react-draft-wysiwyg";
import { EditorState } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import styles from "./RichTextEditor.module.scss";
import { ReactNode, useState } from "react";
import { stateFromHTML } from "draft-js-import-html";
import { stateToHTML } from "draft-js-export-html";

export interface Props {
  description: ReactNode;
  onChange: (description: string) => void;
  textContent: string;
}

export const RichTextEditor = ({ description, onChange, textContent }: Props) => {
  const [state, setState] = useState<EditorState>(EditorState.createWithContent(stateFromHTML(textContent)));

  return (
    <>
      <div className={styles.description}>{description}</div>
      <Editor
        editorState={state}
        onEditorStateChange={(editorState) => {
          setState(editorState);
          const html = stateToHTML(editorState.getCurrentContent());
          onChange(html);
        }}
        editorClassName={styles.editor}
        toolbar={{
          options: ["inline", "list"],
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
