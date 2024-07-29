import Quill from "quill";
import "./RichTextEditor.css";
import "react-quill/dist/quill.snow.css";
import { useRef,useLayoutEffect,forwardRef,useEffect } from "react";

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

    const checkContentForList = (html:string) : string  =>{
      const regExOl = /<ol>/g
      const regExUl = /<ul>/g
      const olMatch = [...html.matchAll(regExOl)]
      const ulMatch = [...html.matchAll(regExUl)]
      
      if (olMatch.length && ulMatch.length)
        return "both"
      else if (olMatch.length)
        return "ol"
      else if (ulMatch.length)
        return "ul"
      else return "nothing"
    }
    
    const handleQuery = (quill:Quill, state:string) => {
      if (state == "both"){
        quill.root.querySelectorAll('ol').forEach((element) => {
        element.classList.add('quill-ol');
      });
      quill.root.querySelectorAll('ul').forEach((element) => {
        element.classList.add('quill-ul');
      })}  
      else if (state == "ol"){
        quill.root.querySelectorAll('ol').forEach((element) => {
          element.classList.add('quill-ol');
        });
        }
      else if (state == "ul"){
        quill.root.querySelectorAll('ul').forEach((element) => {
          element.classList.add('quill-ul');
        });
      }
    }

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
    });

    useEffect(() => {
      const container = containerRef.current;

      if (!container) {
        console.error("Invalid Quill container");
        return;
      }

      const editorContainer = container.appendChild(
        document.createElement("div")
      );

      const quill = new Quill(editorContainer, {
        modules,
        formats,
        theme: "snow",
      });
      delete quill.getModule("keyboard").bindings["9"]

      if (ref && typeof ref === "function") {
        ref(quill);
      } else if (ref && "current" in ref) {
        (ref as React.MutableRefObject<Quill | null>).current = quill;
      }

      if (defaultValue) {
        const incomingText = quill.clipboard.convert(defaultValue)
        quill.setContents(incomingText);
      }

      quill.on("text-change", () => {
        const state = checkContentForList(quill.root.innerHTML)
        handleQuery(quill,state)
        onTextChange(quill.root.innerHTML)
      });

      return () => {
        if (ref && "current" in ref) {
          (ref as React.MutableRefObject<Quill | null>).current = null;
        }
        container.innerHTML = "";
      };
    }, [ref]);

    return <div ref={containerRef} className={className}></div>;
  }
);

export default NewEditor