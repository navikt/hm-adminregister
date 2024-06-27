import { ReactNode } from "react";

export const Strikethrough = ({ children }: { children: ReactNode }) => {
  return (
    <s style={{ color: "rgba(0, 0, 0, 0.4)" }}>
      <div style={{ color: "black" }}>{children}</div>
    </s>
  );
};
