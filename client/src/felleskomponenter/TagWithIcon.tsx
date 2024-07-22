import { ReactNode } from "react";
import "./tags.scss";
import { Tag } from "@navikt/ds-react";

export enum colors {
  "GREY" = "neutral",
  "ORANGE" = "warning",
  "GREEN" = "success",
  "RED" = "error",
  "BLUE" = "info",
}

const TagWithIcon = ({ icon, text, color }: { icon: ReactNode; text: string; color: colors }) => {
  return (
    <div className="tag-container">
      <Tag variant={color} icon={icon} size="small">
        {text}
      </Tag>
    </div>
  );
};

export default TagWithIcon;
