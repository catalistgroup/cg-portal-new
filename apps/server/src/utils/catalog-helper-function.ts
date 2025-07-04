import { MIN_PROFIT_PER_ITEM, PRICING_CONFIG } from "../constants";

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

// asin, buying_price, buybox_price, amazon_fee @param json
export function calcWholesalePrice(json: any): CalcWholesalePriceResult {
  let buying_price = parseFloat(json.buying_price);
  let buyBox = parseFloat(json.buybox_price);
  let fees = parseFloat(json.amazon_fee);

  const lowerBound = Math.max(
    PRICING_CONFIG.minProfitForCatalist,
    buyBox * (1 - PRICING_CONFIG.maxMarginForCustomer) - fees - buying_price,
  );
  const upperBound = Math.min(
    PRICING_CONFIG.maxProfitForCatalist,
    buyBox * (1 - PRICING_CONFIG.minMarginForCustomer) - fees - buying_price,
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
      Math.max(PRICING_CONFIG.midProfitForCatalist, lowerBound),
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
    profitForCatalist !== 0
      ? Math.ceil(MIN_PROFIT_PER_ITEM / profitForCatalist)
      : null;

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

export type CalcSellingPriceResult = {
  asin: string;
  profit: string;
  margin: string;
  roi: string;
};

//  asin, selling_price, amazon_fee, buying_price @param json
export function calcSellingPrice(json: any): CalcSellingPriceResult {
  let selling_price = parseFloat(json.selling_price);
  let buyBox = parseFloat(json.buybox_price);
  let fees = parseFloat(json.amazon_fee);
  let costOfGood = fees + selling_price;

  let customer_profit = 0;

  customer_profit = buyBox - costOfGood;

  const clientMargin = (buyBox - costOfGood) / buyBox;
  const customer_roi = (customer_profit / selling_price) * 100;

  return {
    asin: json.asin,
    profit: customer_profit.toFixed(2),
    margin: (clientMargin * 100).toFixed(2),
    roi: customer_roi.toFixed(2),
  };
}
