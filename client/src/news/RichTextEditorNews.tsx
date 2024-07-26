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

      const applyQuillClass = () => {
        // WHOLE TEXT
        const content = quill.root.innerHTML;
        console.log("raw",content)

        const contentRegex = /(?<=>)[a-zA-Z]*?[^ ](?=<)|<br>/g //ALSO GETS BR might not be good
        const quillClass = "className=quillTag>" 
        
        const tagRegex  = /<[a-z]*[^br]>/g
        const endTagRegex = /<\/[a-z]*>/g
        const ListRegex = /<.l>.*?<\/.l>/g

        const contentOflists = [...content.matchAll(ListRegex)];

        const contentArray = [...content.matchAll(contentRegex)];
        const tagArrayWithoutBr = [...content.matchAll(tagRegex)];

        const endTagArray = [...content.matchAll(endTagRegex)];
        console.log("tags",tagArrayWithoutBr)
        console.log("contet",contentArray)
        console.log("endtags",endTagArray)

        var currUlOl = 0
         for (let i = 0; i < tagArrayWithoutBr.length; i++){
          console.log(i)
          console.log(tagArrayWithoutBr[i][0])

          if (tagArrayWithoutBr[i][0] === "<ol>" || tagArrayWithoutBr[i][0] === "<ul>" ){
            //HERE WE PICK OUT THE CURRENT OL/UL
            const listContent = contentOflists[currUlOl][0]; 
            const listItems = [...listContent.matchAll(/<li>.*?<\/li>/g)];
            //HERE WE PRINT OUT THE VALUES OF EACH LI
            for (let j = 0; j < listItems.length; j++){
              console.log(listItems[j][0])
            }
            currUlOl += 1
            //JUMP FURTHER INTO TagArray since we have printed out mutiple
            i = i + listItems.length
            console.log(endTagArray[i][0])
          }
          else{
            console.log(contentArray[i][0]) // CRASHES HERE
            console.log(endTagArray[i][0])
          }
        } 
      };


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

        applyQuillClass()
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