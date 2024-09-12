import { Tag } from "@navikt/ds-react";
import { ReactNode } from "react";
import "./tags.scss";

export enum colors {
  "GREY" = "neutral",
  "ORANGE" = "warning",
  "GREEN" = "success",
  "RED" = "error",
  "BLUE" = "info",
}

const LocalTag = ({ icon, text, color }: { icon?: ReactNode; text: string; color: colors }) => {
  return icon ? (
    <div className="tag-container">
      <Tag variant={color} icon={icon} size="small">
        {text}
      </Tag>
    </div>
  ) : (
    <div className="tag-container">
      <Tag variant={color} size="small">
        {text}
      </Tag>
    </div>
  );
};

export default LocalTag;
