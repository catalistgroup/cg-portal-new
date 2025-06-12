"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PurchaseOrderType } from "@/lib/types";
import { purchaseOrderBySAndOId } from "@/query/queryFn";
import { usePDF } from "react-to-pdf";
import { useReactToPrint } from "react-to-print";
import Image from "next/image";
import React, { useRef, useState } from "react";

type Props = {
  storeId: string;
  orderId: string;
};

export function PurchaseOrderDetails({ storeId, orderId }: Props) {
  const { data, isLoading } = useQuery<PurchaseOrderType>({
    queryKey: ["purchase-order", orderId, storeId],
    queryFn: () => purchaseOrderBySAndOId(storeId, orderId),
  });

  const { toPDF, targetRef } = usePDF({ filename: `order-${orderId}.pdf` });
  const router = useRouter();
  const handleBack = () => router.push(`/store/${storeId}/orders`);
  const reactToPrintFn = useReactToPrint({ contentRef: targetRef });

  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setPdfDownloaded(true);
      setTimeout(() => {
        toPDF();
        setPdfDownloaded(false);
      }, 50);
    } catch (error) {
      setPdfDownloaded(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-2 py-8">
      {/* Wrap the printable content with targetRef */}
      <div ref={targetRef}>
        <Card className="rounded-2xl shadow border border-gray-200 bg-white">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 pt-6 pb-2 gap-4 border-b">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Catalist Group"
                width={300}
                height={48}
                className="h-10 w-[120px] object-contain"
              />
            </div>
            <div className="text-right text-xs text-gray-500 space-y-1 flex gap-1">
              <div className="flex flex-col items-end pr-1">
                <div className="font-semibold text-gray-700">CATALIST GROUP</div>
                <div className="text-[10px]">(929) 416-3749</div>
                <div className="text-[9px]">catalistgroup.co</div>
              </div>
              <div className="max-w-[135px] h-fit text-gray-600 text-[9px] pl-1 border-l border-gray-500">
                287 Park Avenue South, New York, NY 10010, United States
              </div>
            </div>
          </div>

          {/* Order Summary Title & Download */}
          <div className="flex justify-between items-center px-6 pt-6 pb-2">
            <div className="font-semibold text-lg text-gray-800">Order Summary</div>
            <div className="flex items-center gap-2">
              {/* <Button
                variant="link"
                className="text-primary font-semibold text-sm px-0 no-print"
                onClick={() => toPDF()}
              >
                <Download className="h-4 w-4 mr-1" />{" "}
                <span className="sm:inline hidden">Purchase Order</span>
              </Button> */}
              {!pdfDownloaded && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="link"
                    className="text-primary font-semibold text-sm px-0 no-print"
                    onClick={handleDownloadPDF}
                  >
                    <Download className="h-4 w-4 mr-1" />{" "}
                    <span className="sm:inline hidden">Purchase Order</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Billing & Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-4">
            <div className="text-sm text-gray-700 space-y-1">
              <div className="font-semibold">Billed to</div>
              {isLoading ? (
                <Skeleton className="h-20 w-40" />
              ) : data ? (
                <>
                  <div>{data.company}</div>
                  <div>
                    {data.firstName} {data.lastName}
                  </div>
                  {data.phone && <div>{data.phone}</div>}
                  {data.email && <div>{data.email}</div>}
                  <div>{data.street}</div>
                  <div>
                    {data.city}, {data.state} {data.zip}
                  </div>
                  <div>{data.billingCountry}</div>
                </>
              ) : null}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
              {/* <div>
                <div className="font-semibold text-gray-700">Invoice No</div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-4 w-20" />
                  ) : data?.id ? (
                    `INV-${data.id}`
                  ) : (
                    "-"
                  )}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Issue Date</div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-4 w-20" />
                  ) : data?.order_placed_at ? (
                    new Date(data.order_placed_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  ) : (
                    "-"
                  )}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Due Date</div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-4 w-20" />
                  ) : data?.dueDate ? (
                    new Date(data.dueDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  ) : (
                    "-"
                  )}
                </div>
              </div> */}
              <div>
                <div className="font-semibold text-gray-700">Order ID</div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-4 w-20" />
                  ) : data?.order_id ? (
                    `#${data.order_id}`
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="px-6 pb-2">
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      ITEM NAME
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      PRICE
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      QTY
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      TAX
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      SUBTOTAL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5}>
                        <Skeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ) : data?.items?.length ? (
                    <>
                      {data.items.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-4 py-3">
                            {item.title.length > 50 ? item.title.slice(0, 50) + "…" : item.title}
                          </td>
                          <td className="px-4 py-3 text-left">
                            {item.unit_price.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right">-</td>
                          <td className="px-4 py-3 text-right">
                            {(item.unit_price * item.quantity).toLocaleString(
                              "en-US",
                              {
                                style: "currency",
                                currency: "USD",
                              }
                            )}
                          </td>
                        </tr>
                      ))}
                      {/* {data.prepRequired && (
                        <tr className="border-t">
                          <td className="px-4 py-3">{data.prepRequired}</td>
                          <td className="px-4 py-3 text-right">$0.75</td>
                          <td className="px-4 py-3 text-right">
                            {data.items[0]?.quantity || 1}
                          </td>
                          <td className="px-4 py-3 text-right">-</td>
                          <td className="px-4 py-3 text-right">
                            {((data.items[0]?.quantity || 1) * 0.75).toLocaleString(
                              "en-US",
                              { style: "currency", currency: "USD" }
                            )}
                          </td>
                        </tr>
                      )}
                      {data.paymentMethod === "Credit Card" && (
                        <tr className="border-t">
                          <td className="px-4 py-3">Credit Card (2.99% Fee)</td>
                          <td className="px-4 py-3 text-right">
                            {(
                              ((data.items ?? []).reduce(
                                (sum, item) =>
                                  sum + item.unit_price * item.quantity,
                                0
                              )) * 0.0299
                            ).toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </td>
                          <td className="px-4 py-3 text-right">1</td>
                          <td className="px-4 py-3 text-right">-</td>
                          <td className="px-4 py-3 text-right">
                            {(
                              ((data.items ?? []).reduce(
                                (sum, item) =>
                                  sum + item.unit_price * item.quantity,
                                0
                              )) * 0.0299
                            ).toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </td>
                        </tr>
                      )} */}
                    </>
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-400">
                        No items found.
                      </td>
                    </tr>
                  )}
                </tbody>
                {/* Totals */}
                <tfoot>
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-700">
                      Subtotal
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-700">
                      {isLoading ? (
                        <Skeleton className="h-4 w-20" />
                      ) : data
                        ? (data.items ?? []).reduce(
                          (sum, item) => sum + item.unit_price * item.quantity,
                          0
                        ).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-700">
                      Amount Due (USD)
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-blue-700 text-lg">
                      {isLoading ? (
                        <Skeleton className="h-4 w-24" />
                      ) : data
                        ? (data.items ?? []).reduce(
                          (sum, item) => sum + item.unit_price * item.quantity,
                          0
                        ).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })
                        : "-"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-6 border-t bg-gray-50 rounded-b-2xl mt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          className="rounded-full border-gray-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Button>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            variant="outline"
            onClick={reactToPrintFn}
            className="rounded-full border-gray-300"
          >
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          {/* <Button
            disabled={true}
            className="rounded-full bg-blue-700 text-white font-semibold px-8 py-2 hover:bg-blue-800"
            onClick={() => {

            }}
          >
            Pay&nbsp;
            {isLoading ? (
              <Skeleton className="h-4 w-16 inline-block" />
            ) : data ? (
              (data.items ?? []).reduce(
                (sum, item) => sum + item.unit_price * item.quantity,
                0
              ).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })
            ) : (
              ""
            )}
          </Button> */}
        </div>
      </div>
    </div>
  );
}

export default PurchaseOrderDetails;
