import styles from "./UniformTag.module.scss";

export enum colors {
  "GREY",
  "ORANGE",
  "GREEN",
  "RED",
}

const UniformTag = ({ text, color }: { text: string; color: colors }) => {
  if (color === colors.GREY) {
    return (
      <span className={styles.blue}>
        <p>{text}</p>
      </span>
    );
  } else if (color === colors.ORANGE) {
    return (
      <span className={styles.orange}>
        <p>{text}</p>
      </span>
    );
  } else if (color === colors.GREEN) {
    return (
      <span className={styles.green}>
        <p>{text}</p>
      </span>
    );
  } else if (color === colors.RED) {
    return (
      <span className={styles.red}>
        <p>{text}</p>
      </span>
    );
  } else return <></>;
};

export default UniformTag;
