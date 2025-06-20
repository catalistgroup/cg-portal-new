export type CalcWholesalePriceResult = {
  profitable: boolean;
  asin: string;
  buying_price: number;
  selling_price: number;
  moq: number | null;
  buybox_price: number;
  profit: string;
  margin: string;
  roi: string;
};

export function calcWholesalePrice(
  json: any,
  opts: any = {},
): CalcWholesalePriceResult {
  const {
    minProfitForCatalist = 1.0,
    maxProfitForCatalist = 10,
    minMarginForCustomer = 0.14,
    maxMarginForCustomer = 0.36,
    midProfitForCatalist = 2.5,
  } = opts;

  let buying_price = parseFloat(json.buying_price);
  let buyBox = parseFloat(json.buybox_price);
  let fees = parseFloat(json.amazon_fee);

  const lowerBound = Math.max(
    minProfitForCatalist,
    buyBox * (1 - maxMarginForCustomer) - fees - buying_price,
  );
  const upperBound = Math.min(
    maxProfitForCatalist,
    buyBox * (1 - minMarginForCustomer) - fees - buying_price,
  );

  let profitable = true;
  let profitForCatalist = 0;
  let catlistSellingPrice = 0;
  let customer_profit = 0;

  if (lowerBound > upperBound) {
    profitable = false;
    profitForCatalist = lowerBound;
    catlistSellingPrice = buying_price + profitForCatalist;
    customer_profit = buyBox - fees - catlistSellingPrice;
  } else {
    profitForCatalist = Math.min(
      Math.max(midProfitForCatalist, lowerBound),
      upperBound,
    );
    catlistSellingPrice = buying_price + profitForCatalist;
    customer_profit = buyBox - fees - catlistSellingPrice;

    if (customer_profit < 2) {
      catlistSellingPrice = buyBox - fees - 2;
      profitForCatalist = catlistSellingPrice - buying_price;

      if (profitForCatalist < lowerBound) {
        profitable = false;
      }

      customer_profit = buyBox - fees - catlistSellingPrice;
    }
  }

  const clientMargin = (buyBox - fees - catlistSellingPrice) / buyBox;
  const moq =
    profitForCatalist !== 0 ? Math.ceil(250 / profitForCatalist) : null;

  return {
    profitable,
    asin: json.asin,
    buying_price,
    selling_price: catlistSellingPrice,
    moq,
    buybox_price: buyBox,
    profit: customer_profit.toFixed(2),
    margin: (clientMargin * 100).toFixed(2),
    roi: ((customer_profit / catlistSellingPrice) * 100).toFixed(2),
  };
}
