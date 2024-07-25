import ReactQuill from "react-quill";
import Quill from 'quill';
import "./RichTextEditor.css";
import "react-quill/dist/quill.snow.css";
import styles from "./RichTextEditor.module.scss";
import { useRef,useLayoutEffect,forwardRef,useEffect,useState  } from "react";

type RichTextEditorNewsProps = {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
};

type thirdProps ={
  onTextChange : any
  defaultValue? : any
};

export function RichTextEditorNews(props: RichTextEditorNewsProps) {
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
    <ReactQuill
      ref={editorRef}
      modules={modules}
      formats={formats}
      value={props.content}
      onChange={props.setContent}
      className={styles.editorStyle}
    />
  );
}

/////
export const NewEditor = forwardRef<any, any>(
  function tempComp(
  { onTextChange, defaultValue}: thirdProps,
  ref,
) {
  
  const containerRef = useRef<HTMLDivElement>(null);
  const defaultValueRef = useRef(defaultValue);
  const onTextChangeRef = useRef(onTextChange);

  useLayoutEffect(() => {
    onTextChangeRef.current = onTextChange;
  });


  useEffect(() => {
    const container = containerRef.current;

    const editorContainer = container?.appendChild(
      container.ownerDocument.createElement('div'),
    );

    const quill = new Quill(editorContainer, {
      theme: 'snow',
    });

    ref?.current = quill;

    if (defaultValueRef.current) {
      quill.setContents(defaultValue);
    }

    quill.on(Quill.events.TEXT_CHANGE, (...args) => {
      onTextChangeRef.current?.(...args);
    });

    return () => {
      ref.current = null;
      container.innerHTML = '';
    };
  }, [ref]);


  return <div ref={ref}></div>

})

export default NewEditor