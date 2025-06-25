import api from '@/lib/api';
import qs from 'query-string';
import APIConfiguration from '@/lib/endpoints';

export const productsByStoreId = (
  storeId: string,
  query?: Record<string, string>
) =>
  api
    .get(
      qs.stringifyUrl({
        url: '/catalog/store/' + storeId,
        query,
      })
    )
    .then((v) => v.data);

export const getCatalogs = () =>
  api.get(APIConfiguration.GET_ALL_LIVE_CATALOG).then((v) => {
    return v.data;
  });

export const getAllQualifiedBrands = () =>
  api.get(APIConfiguration.GET_ALL_QUALIFIED_BRANDS).then((v) => {
    return v.data;
  });

export const overviewByStoreId = (
  storeId: string,
  query?: Record<string, string>
) =>
  api
    .get(
      qs.stringifyUrl({
        url: '/overview/store/' + storeId,
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
        url: '/purchase-order/store/' + storeId,
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
        url: '/purchase-order/' + orderId + '/store/' + storeId,
        query,
      })
    )
    .then((v) => v.data);

// Admin
export const getAllCatalogs = () =>
  api.get(APIConfiguration.GET_ALL_CATALOGS_ADMIN).then((v) => {
    return v.data;
  });

export const getAllBrands = () =>
  api.get(APIConfiguration.GET_ALL_BRANDS_ADMIN).then((v) => {
    return v.data;
  });
