import { Request, Response } from "express";
import { randomBytes } from "crypto";
import prisma from "../configs/database";
import HttpError from "../utils/HttpError";
import { purchaseOrderSchema } from "../validators/purchaseOrderValidator";
import axios from "axios";

export class PurchaseOrderController {
  private static async generateUniqueOrderId(): Promise<string> {
    const MAX_ATTEMPTS = 10;
    let attempts = 0;

    const generateId = () => {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const numbers = "0123456789";

      let id = "";
      for (let i = 0; i < 2; i++) {
        id += letters.charAt(Math.floor(Math.random() * letters.length));
      }
      for (let i = 0; i < 4; i++) {
        id += numbers.charAt(Math.floor(Math.random() * numbers.length));
      }
      return id;
    };

    while (attempts < MAX_ATTEMPTS) {
      try {
        const orderId = generateId();
        const existingOrder = await prisma.purchaseOrder.findUnique({
          where: { order_id: orderId },
        });

        if (!existingOrder) {
          return orderId;
        }
        attempts++;
      } catch (error) {
        console.error("Error generating order ID:", error);
        throw new Error("Failed to generate unique order ID");
      }
    }

    throw new Error(
      "Failed to generate unique order ID after maximum attempts",
    );
  }

  private static calculateOrderFees(order: any) {
    const PRE_RATE = 1;
    const CREDIT_CARD_RATE = 0.0299;

    let feeItems = [];
    let totalAmount = order.items.reduce(
      (sum: number, item: any) => sum + item.unit_price * item.quantity,
      0,
    );

    if (order.prepRequired?.toLowerCase() !== "no") {
      const totalUnits = order.items.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0,
      );
      const prepFeeTotal = totalUnits * PRE_RATE;

      feeItems.push({
        id: -1,
        asin: "PREP_AND_PACK_FEES",
        title: "Preparation and Packing Fees",
        brand: "Service Fee",
        unit_price: PRE_RATE,
        quantity: totalUnits,
        sku: "",
        upc: "",
        supplier: "AMZ Connect",
        purchase_order_id: order.id,
      });

      totalAmount += prepFeeTotal;
    }

    if (order.paymentMethod?.toLowerCase() === "credit_card") {
      const creditCardFee = totalAmount * CREDIT_CARD_RATE;

      feeItems.push({
        id: -2,
        asin: "CREDIT_CARD_FEE",
        title: "Credit Card Processing Fee (2.99%)",
        brand: "Service Fee",
        unit_price: creditCardFee,
        quantity: 1,
        sku: "",
        upc: "",
        supplier: "AMZ Connect",
        purchase_order_id: order.id,
      });
    }

    return feeItems;
  }

  async getPurchaseOrders(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ error: "User ID missing" });

    try {
      const orders = await prisma.purchaseOrder.findMany({
        where: { user_id: userId },
      });
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to fetch purchase orders" });
    }
  }

  async getPurchaseOrderById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ error: "User ID missing" });

    try {
      const order = await prisma.purchaseOrder.findFirst({
        where: { id, user_id: userId },
        include: { items: true },
      });

      if (!order)
        return res.status(404).json({ error: "Purchase order not found" });

      const feeItems = PurchaseOrderController.calculateOrderFees(order);
      const responseOrder = {
        ...order,
        items: [...order.items, ...feeItems],
      };

      res.json(responseOrder);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to fetch purchase order" });
    }
  }
  async getPurchaseOrderByOSId(req: Request, res: Response) {
    const id = Number(req.params.id);
    const storeId = Number(req.params.storeId);
    const userId = req.user?.id;
    if (!id || !storeId || !userId)
      throw new HttpError("Required id not found");

    const order = await prisma.purchaseOrder.findFirst({
      where: { id, user_id: userId },
      include: { items: true },
    });
    if (!order) throw new HttpError("Order not found");

    const feeItems = PurchaseOrderController.calculateOrderFees(order);
    const responseOrder = {
      ...order,
      items: [...order.items, ...feeItems],
    };

    res.status(200).json(responseOrder);
  }

  async getPurchaseOrdersByStoreId(req: Request, res: Response) {
    const storeId = Number(req.params.storeId);
    const userId = req.user?.id;
    if (!storeId || !userId) throw new HttpError("storeId not found");

    const orders = await prisma.purchaseOrder.findMany({
      where: { store_id: storeId, user_id: userId },
      include: {
        items: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const responseOrders = orders.map((order) => {
      const feeItems = PurchaseOrderController.calculateOrderFees(order);
      return {
        ...order,
        items: [...order.items, ...feeItems],
      };
    });

    res.status(200).json(responseOrders);
  }
  async createPurchaseOrder(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new HttpError("Authorization failed");

      const storeId = req.params.storeId;
      if (!storeId) throw new HttpError("Required storeId");

      const order_id = await PurchaseOrderController.generateUniqueOrderId();
      if (!order_id) throw new HttpError("Failed to generate order ID");

      const {
        is_draft,
        items,
        order_placed_at,
        order_status,
        paymentMethod,
        prepRequired,
        ungateAssistance,
        billingCountry,
        firstName,
        lastName,
        email,
        phone,
        company,
        storefront,
        street,
        city,
        state,
        zip,
      } = await purchaseOrderSchema.parseAsync(req.body);

      const order = await prisma.purchaseOrder.create({
        data: {
          order_id,
          is_draft,
          order_placed_at,
          order_status,
          paymentMethod,
          prepRequired,
          ungateAssistance,
          billingCountry,
          firstName,
          lastName,
          email,
          phone,
          company,
          storefront,
          street,
          city,
          state,
          zip,
          user: { connect: { id: userId } },
          store: { connect: { id: Number(storeId) } },
          items: {
            create: items.map((d) => ({
              ...d,
            })),
          },
          is_api_succeed: false,
        },
      });

      try {
        const response = await axios.post(
          "https://catalistgroup.app.n8n.cloud/webhook/post_api_order",
          {
            payment_method: paymentMethod,
            prep_required: prepRequired,
            ungate_assistance: ungateAssistance,
            company: company,
            storefront_name: storefront,
            contact_info: {
              first_name: firstName,
              last_name: lastName,
              email: email,
              phone: phone,
            },
            billing_info: {
              street: street,
              city: city,
              state: state,
              zip: zip,
              country: billingCountry,
            },
            ordered_items: items.reduce(
              (acc: Record<string, string>, item: any) => {
                acc[item.asin] = String(item.quantity);
                return acc;
              },
              {},
            ),
          },
          {
            headers: {
              Authorization:
                "Bearer umJVIiXgSMQXokdeGTBvCk5B2rpQKKrXyk8ACgMMD4iP9bc8TjQ3urEImJEtfAhZ",
              "Content-Type": "application/json",
            },
          },
        );

        await prisma.purchaseOrder.update({
          where: { id: order.id },
          data: { is_api_succeed: response.status === 200 },
        });
      } catch (err) {
        console.error("Failed to send order to external API", err);
        await prisma.purchaseOrder.update({
          where: { id: order.id },
          data: { is_api_succeed: false },
        });
      }

      res.status(200).json(order);
    } catch (error: any) {
      console.error("Error creating purchase order:", error);
      res.status(500).json({
        error: error.message || "Failed to create purchase order",
      });
    }
  }
  async resendPurchaseOrder(req: Request, res: Response) {
    try {
      const orderId = Number(req.params.id);
      const storeId = Number(req.params.storeId);
      const userId = req.user?.id;

      if (!userId) {
        throw new HttpError("Authorization failed");
      }

      // Get the order with items
      const order = await prisma.purchaseOrder.findFirst({
        where: {
          id: orderId,
          store_id: storeId,
          user_id: userId,
        },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new HttpError("Order not found");
      }

      try {
        const response = await axios.post(
          "https://catalistgroup.app.n8n.cloud/webhook/post_api_order",
          {
            payment_method: order.paymentMethod,
            prep_required: order.prepRequired,
            ungate_assistance: order.ungateAssistance,
            company: order.company,
            storefront_name: order.storefront,
            contact_info: {
              first_name: order.firstName,
              last_name: order.lastName,
              email: order.email,
              phone: order.phone,
            },
            billing_info: {
              street: order.street,
              city: order.city,
              state: order.state,
              zip: order.zip,
              country: order.billingCountry,
            },
            ordered_items: order.items.reduce(
              (acc: Record<string, string>, item: any) => {
                acc[item.asin] = String(item.quantity);
                return acc;
              },
              {}
            ),
          },
          {
            headers: {
              Authorization: "Bearer umJVIiXgSMQXokdeGTBvCk5B2rpQKKrXyk8ACgMMD4iP9bc8TjQ3urEImJEtfAhZ",
              "Content-Type": "application/json",
            },
          }
        );

        await prisma.purchaseOrder.update({
          where: { id: orderId },
          data: { is_api_succeed: response.status === 200 },
        });

        res.status(200).json({
          success: true,
          message: "Order resent successfully",
        });
      } catch (err) {
        console.error("Failed to resend order to external API", err);

        await prisma.purchaseOrder.update({
          where: { id: orderId },
          data: { is_api_succeed: false },
        });

        throw new HttpError("Failed to resend order to external API");
      }
    } catch (error: any) {
      console.error("Error resending purchase order:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to resend purchase order",
      });
    }
  }
}
