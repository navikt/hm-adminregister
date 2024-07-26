import ReactQuill from "react-quill";
import Quill from 'quill';
import "./RichTextEditor.css";
import "react-quill/dist/quill.snow.css";
import styles from "./RichTextEditor.module.scss";
import { useRef,useLayoutEffect,forwardRef,useEffect } from "react";

/* useEffect(() => {
  //9 is the keybinding for tab
  if (editorRef.current) delete editorRef.current.getEditor().getModule("keyboard").bindings[9];
}, [editorRef]);
 */

const modules = {toolbar: [["bold", "italic"], [{ list: "ordered" }, { list: "bullet" }], ["link"]],}
const formats = ["bold", "italic", "list", "bullet", "link"];


type ThirdProps ={
  onTextChange : any
  defaultValue? : string
  className? : string
};

export const NewEditor = forwardRef<Quill | null, ThirdProps>(
  function TempComp({ onTextChange, defaultValue, className }: ThirdProps, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const onTextChangeRef = useRef(onTextChange);
    
    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
    });

    useEffect(() => {
      const container = containerRef.current;

      if (!container) {
        console.error('Invalid Quill container');
        return;
      }

      const editorContainer = container.appendChild(
        document.createElement('div')
      );

      const quill = new Quill(editorContainer, {
        modules,
        formats,
        theme: 'snow',

      });
    
      if (ref && typeof ref === 'function') {
        ref(quill);
      } else if (ref && 'current' in ref) {
        (ref as React.MutableRefObject<Quill | null>).current = quill;
      }

      if (defaultValue) {
        const incomingText = quill.clipboard.convert(defaultValue)
        quill.setContents(incomingText);
      }

      quill.on('text-change', (...args: any[]) => {
        onTextChangeRef.current?.(...args);
      });

      return () => {
        if (ref && 'current' in ref) {
          (ref as React.MutableRefObject<Quill | null>).current = null;
        }
        container.innerHTML = '';
      };
    }, [ref]);

    return <div ref={containerRef} className={className}></div>;
  }
);

export default NewEditor