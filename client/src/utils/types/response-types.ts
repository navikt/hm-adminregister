import { components } from "./schema";

// Schema Obj
export type UserDTO = components["schemas"]["UserDTO"];
export type AdminUserChunk = components["schemas"]["Page_UserDTO_"];
export type SupplierRegistrationDTO = components["schemas"]["SupplierRegistrationDTO"];
export type UserRegistrationDTO = components["schemas"]["UserRegistrationDTO"];
export type LoggedInUserResponse = components["schemas"]["RegistrationAuthentication"];

export type SupplierStatus = components["schemas"]["SupplierStatus"];
export type DraftStatus = components["schemas"]["DraftStatus"];
export type SeriesStatus = components["schemas"]["SeriesStatus"];
export type AdminStatus = components["schemas"]["AdminStatus"];

export type SupplierChunk = components["schemas"]["Page_SupplierRegistrationDTO_"];
export type SupplierUserChunk = components["schemas"]["Page_UserDTO_"];

export type AgreementsChunk = {
  content: components["schemas"]["AgreementBasicInformationDto"][];
  pageable: components["schemas"]["OpenApiPageable"];
  /** Format: int32 */
  pageNumber?: number;
  /** Format: int64 */
  offset?: number;
  /** Format: int32 */
  size?: number;
  totalPages?: number;
  empty?: boolean;
  /** Format: int32 */
  numberOfElements?: number;
};

export type ProductsChunk = {
  content: components["schemas"]["ProductRegistrationDTO"][];
  pageable: components["schemas"]["OpenApiPageable"];
  /** Format: int32 */
  pageNumber?: number;
  /** Format: int64 */
  offset?: number;
  /** Format: int32 */
  size?: number;
  totalPages?: number;
  empty?: boolean;
  /** Format: int32 */
  numberOfElements?: number;
};

export type SeriesGroupDTO = components["schemas"]["SeriesGroupDTO"][];
export type ProductRegistrationDTO = components["schemas"]["ProductRegistrationDTO"];
export type ProductAgreementRegistrationDTO = components["schemas"]["ProductAgreementRegistrationDTO"];
export type ProductAgreementRegistrationDTOList = components["schemas"]["ProductAgreementRegistrationDTO"][];
export type ProduktvarianterForDelkontrakterDTO = components["schemas"]["ProduktvarianterForDelkontrakterDTO"];
export type ProduktvarianterForDelkontrakterDTOList = components["schemas"]["ProduktvarianterForDelkontrakterDTO"][];
export type AgreementRegistrationDTO = components["schemas"]["AgreementRegistrationDTO"];
export type AgreementPostDTO = components["schemas"]["AgreementPost"];
export type IsoCategoryDTO = components["schemas"]["IsoCategoryDTO"];
export type AgreementGroupDto = components["schemas"]["AgreementBasicInformationDto"][];
export type AgreementAttachment = components["schemas"]["AgreementAttachment"];
export type AgreementDraftWithDTO = components["schemas"]["AgreementDraftWithDTO"];
export type MediaDTO = components["schemas"]["MediaDTO"];
export type MediaInfo = components["schemas"]["MediaInfo"];
export type MediaInfoDTO = components["schemas"]["MediaInfoDTO"];
export type ProductDraftWithDTO = components["schemas"]["ProductDraftWithDTO"];
export type DraftVariantDTO = components["schemas"]["DraftVariantDTO"];
export type TechData = components["schemas"]["TechData"];
export type DelkontraktRegistrationDTO = components["schemas"]["DelkontraktRegistrationDTO"];
export type ProductVariantsForDelkontraktDto = components["schemas"]["ProductVariantsForDelkontraktDto"];
export type ProductAgreementImportDTO = components["schemas"]["ProductAgreementImportDTO"];
export type ProductToApproveDto = components["schemas"]["ProductToApproveDto"];
export type SeriesRegistrationDTO = components["schemas"]["SeriesRegistrationDTO"];

export type ProdukterTilGodkjenningChunk = {
  content: ProductToApproveDto[];
  pageable: components["schemas"]["OpenApiPageable"];
  /** Format: int32 */
  pageNumber?: number;
  /** Format: int64 */
  offset?: number;
  /** Format: int32 */
  size?: number;
  totalPages?: number;
  empty?: boolean;
  /** Format: int32 */
  numberOfElements?: number;
};

export type SeriesChunk = {
  content: SeriesRegistrationDTO[];
  pageable: components["schemas"]["OpenApiPageable"];
  /** Format: int32 */
  pageNumber?: number;
  /** Format: int64 */
  offset?: number;
  /** Format: int32 */
  size?: number;
  totalPages?: number;
  empty?: boolean;
  /** Format: int32 */
  numberOfElements?: number;
};

// Path params
//type EndpointParams = paths['/my/endpoint']['parameters']

// Response obj
//type SuccessResponse = paths['/my/endpoint']['get']['responses'][200]['content']['application/json']['schema']
//type ErrorResponse = paths['/my/endpoint']['get']['responses'][500]['content']['application/json']['schema']
