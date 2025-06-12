import api from "@/lib/api";
import qs from "query-string";

export const productsByStoreId = (
  storeId: string,
  query?: Record<string, string>
) =>
  api
    .get(
      qs.stringifyUrl({
        url: "/catalog/store/" + storeId,
        query,
      })
    )
    .then((v) => v.data);

export const getCatalogs = () =>
  api
    .get("https://catalistgroup.app.n8n.cloud/webhook/prod-live-catalog")
    .then((v) => v.data);

export const overviewByStoreId = (
  storeId: string,
  query?: Record<string, string>
) =>
  api
    .get(
      qs.stringifyUrl({
        url: "/overview/store/" + storeId,
        query,
      })
    )
    .then((v) => v.data);

export const purchaseOrdersByStoreId = (
  storeId: string,
  query?: Record<string, string>
) =>
  api
    .get(
      qs.stringifyUrl({
        url: "/purchase-order/store/" + storeId,
        query,
      })
    )
    .then((v) => v.data);

export const purchaseOrderBySAndOId = (
  storeId: string,
  orderId: string,
  query?: Record<string, string>
) =>
  api
    .get(
      qs.stringifyUrl({
        url: "/purchase-order/" + orderId + "/store/" + storeId,
        query,
      })
    )
    .then((v) => v.data);
