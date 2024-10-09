import "./RichTextEditorQuill.scss";
import "quill/dist/quill.snow.css";
import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import Quill from "quill";
import Link from "quill/formats/link";

// noinspection JSUnusedGlobalSymbols
const bindings = {
  tab: {
    key: 9,
    handler: () => true,
  },
};

const defaultModules = {
  toolbar: [["bold", "italic"], [{ list: "ordered" }, { list: "bullet" }], ["link"]],
  keyboard: {
    bindings: bindings,
  },
};
const defaultFormats = ["bold", "italic", "list", "link"];

type Props = {
  onTextChange: (html: string) => void;
  defaultValue?: any;
  className?: string;
  toolbar?: (string[] | { list: string }[])[];
  formats?: string[];
};

export const RichTextEditorQuill = forwardRef(function TempComp(
  { onTextChange, defaultValue, className, toolbar, formats }: Props,
  ref
) {
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
      modules: toolbar ? { ...defaultModules, toolbar: toolbar } : defaultModules,
      formats: formats ? formats : defaultFormats,
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
      onTextChange(quill.getSemanticHTML());
    });

    Link.sanitize = (url) => {
      if (url.startsWith("https://")) return url;
      else return `https://${url}`;
    };

    return () => {
      if (ref && "current" in ref) {
        (ref as React.MutableRefObject<Quill | null>).current = null;
      }
      container.innerHTML = "";
    };
  }, [ref]);

  return <div ref={containerRef} className={className}></div>;
});

export default RichTextEditorQuill;
