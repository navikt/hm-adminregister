import { useSeriesByHmsNr } from "utils/swr-hooks";

export const SeriesByHmsNr = ({
  hmsNr,
  setFoundSeriesByHmsNr,
}: {
  hmsNr: string;
  setFoundSeriesByHmsNr: (found: boolean) => void;
}) => {
  const { seriesByHmsNr, isLoadingSeriesByHmsNr } = useSeriesByHmsNr(hmsNr);

  if (seriesByHmsNr) {
    setFoundSeriesByHmsNr(true);
    return <>Found series by hmsNr</>;
  }
  return <></>;
};
