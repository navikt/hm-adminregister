import { Editor } from "react-draft-wysiwyg";
import { ContentState, convertFromRaw, convertToRaw, EditorState } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import styles from "./RichTextEditor.module.scss";
import { ReactNode, useState } from "react";

export interface Props {
  description: ReactNode;
  onChange: (description: string) => void;
  onChangeFormatted: (description: string) => void;
  textContent: string;
  formattedContent?: string;
}

export const RichTextEditor = ({ description, onChange, onChangeFormatted, textContent, formattedContent }: Props) => {
  const [state, setState] = useState<EditorState>(
    formattedContent
      ? EditorState.createWithContent(convertFromRaw(JSON.parse(formattedContent)))
      : EditorState.createWithContent(ContentState.createFromText(textContent)),
  );

  return (
    <>
      <div className={styles.description}>{description}</div>
      <Editor
        editorState={state}
        onEditorStateChange={(editorState) => {
          setState(editorState);
          onChange(editorState.getCurrentContent().getPlainText());

          const formattedJsonString = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
          onChangeFormatted(formattedJsonString);

          //setConvertedContent(html);
          //console.log(rawContentState);
          //console.log(html);
          //console.log(JSON.stringify(convertToRaw(editorState.getCurrentContent())));
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
