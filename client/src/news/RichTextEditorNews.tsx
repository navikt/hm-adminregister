import "./RichTextEditorNews.css";
import "quill/dist/quill.snow.css";
import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import Quill from "quill";

// noinspection JSUnusedGlobalSymbols
const bindings = {
  tab: {
    key: 9,
    handler: () => true,
  },
};



const modules = {
  toolbar: [["bold", "italic"], [{ list: "ordered" }, { list: "bullet" }], ["link"]],
  keyboard: {
    bindings: bindings,
  },
};
const formats = ["bold", "italic", "list", "link"];

type Props = {
  onTextChange: (html: string) => void;
  defaultValue?: string;
  className?: string;
};

export const RichTextNewsEditor = forwardRef(function TempComp({ onTextChange, defaultValue, className }: Props, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onTextChangeRef = useRef(onTextChange);
  const defaultValueRef = useRef(defaultValue);

  useLayoutEffect(() => {
    onTextChangeRef.current = onTextChange;
  });

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      console.error("Invalid Quill container");
      return;
    }

    const editorContainer = container.appendChild(container.ownerDocument.createElement("div"));

    const quill = new Quill(editorContainer, {
      modules,
      formats,
      theme: "snow",
    });

    if (ref && typeof ref === "function") {
      ref(quill);
    } else if (ref && "current" in ref) {
      (ref as React.MutableRefObject<Quill | null>).current = quill;
    }

    if (defaultValueRef.current) {
      const htmlAsDelta = quill.clipboard.convert({ html: defaultValueRef.current });
      quill.setContents(htmlAsDelta);
    }

    quill.on(Quill.events.TEXT_CHANGE, () => {
      onTextChange(quill.root.innerHTML);
    });

    return () => {
      if (ref && "current" in ref) {
        (ref as React.MutableRefObject<Quill | null>).current = null;
      }
      container.innerHTML = "";
    };
  }, [ref]);

  return <div ref={containerRef} className={className}></div>;
});

export default RichTextNewsEditor;
