import { HM_REGISTER_URL } from "environments";
import { fetchAPI } from "api/fetch";
import useSWR from "swr";
import { fetcherGET } from "utils/swr-hooks";
import { CatalogFileCriteria, CatalogFileChunk, CatalogFile, ProductAgreementImportDTO} from "utils/types/response-types";

const BASE_URL = () => `${HM_REGISTER_URL()}/admreg/admin/api/v1/catalog-file`;

export const importCatalogExcel = (
    file: File,
    supplierId: string,
    dryRun: boolean = true
): Promise<ProductAgreementImportDTO> => {
    const formData = new FormData();
    formData.append("file", file);
    const params = new URLSearchParams();
    params.append("supplierId", supplierId);
    params.append("dryRun", dryRun ? "true" : "false");
    return fetchAPI(`${BASE_URL()}/excel-import?${params.toString()}`, "POST", formData);
};

export function findCatalogFiles(
    criteria: CatalogFileCriteria = {},
    page: number = 0,
    size: number = 20,
    sort: string = "created,DESC"){
    const params = new URLSearchParams();
    if (criteria.fileName) params.append("fileName", criteria.fileName);
    if (criteria.orderRef) params.append("orderRef", criteria.orderRef);
    if (criteria.supplierId) params.append("supplierId", criteria.supplierId);
    if (criteria.status) params.append("status", criteria.status);
    params.append("page", page.toString());
    params.append("size", size.toString());
    if (sort) params.append("sort", sort);
    const path = `${BASE_URL()}?${params.toString()}`;
    const { data, error, isLoading, mutate } = useSWR<CatalogFileChunk>(path, fetcherGET);
    return {
        data,
        isLoading,
        error,
        mutate,
    };
};

export const deleteCatalogFile = (id: string): Promise<boolean> =>
    fetchAPI(`${BASE_URL()}/${id}`, "DELETE");

export const retryCatalogFile = (id: string): Promise<CatalogFile> =>
    fetchAPI(`${BASE_URL()}/${id}/retry`, "PUT");