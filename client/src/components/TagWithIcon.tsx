import classNames from "classnames";
import { ReactNode } from "react";
import "./tags.scss";

export enum colors {
  "GREY",
  "ORANGE",
  "GREEN",
}

const TagWithIcon = ({ icon, text, color }: { icon: ReactNode; text: string; color: colors }) => {
  return (
    <span
      className={classNames("tag-with-icon", {
        "tag-with-icon--grey": color === colors.GREY,
        "tag-with-icon--orange": color === colors.ORANGE,
        "tag-with-icon--green": color === colors.GREEN,
      })}
    >
      {icon}
      <p className="text">{text}</p>
    </span>
  );
};

export default TagWithIcon;
