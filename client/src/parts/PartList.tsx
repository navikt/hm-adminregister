import { ChevronRightIcon } from "@navikt/aksel-icons";
import { BodyShort, Box, HGrid, Hide, Tag, VStack } from "@navikt/ds-react";
import { Link } from "react-router-dom";
import { ProductRegistrationDTOV2 } from "utils/types/response-types";
import styles from "./PartList.module.scss";

export const PartList = ({
  partsList,
  oversiktPath,
}: {
  partsList: ProductRegistrationDTOV2[];
  oversiktPath: string;
}) => {
  return (
    <VStack as={"ol"} gap={"1-alt"} className={styles.partsList}>
      {partsList.map((part) => (
        <li key={part.id}>
          <PartCard part={part} oversiktPath={oversiktPath} />
        </li>
      ))}
    </VStack>
  );
};

const PartCard = ({ part, oversiktPath }: { part: ProductRegistrationDTOV2; oversiktPath: string }) => {
  const isExpired = part.isExpired;

  return (
    <HGrid
      as={Link}
      to={`/del/${part.id}`}
      state={oversiktPath}
      columns={{
        xs: "1fr auto",
        md: "1fr auto",
        lg: "1fr auto",
      }}
      gap={"2"}
      align={"center"}
      className={styles.partPanel}
    >
      <VStack style={isExpired ? { height: "100%" } : {}} gap="1">
        {isExpired && (
          <Box>
            <Tag size="small" variant="neutral-moderate">
              Utgått
            </Tag>
          </Box>
        )}
        <BodyShort weight="semibold" className="text-overflow-hidden-small-2-lines">
          {part.articleName}
        </BodyShort>
      </VStack>

      <Hide below="md">
        <ChevronRightIcon aria-hidden fontSize="2rem" />
      </Hide>
    </HGrid>
  );
};
