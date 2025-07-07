import { Request, Response } from "express";
import HttpError from "../utils/HttpError";
import axios from "axios";
import { EXTERNAL_API_URL } from "../constants";

class OverviewController {
  async getOverviewByStoreId(req: Request, res: Response) {
    const { storeId } = req.params;

    if (!storeId) throw new HttpError("Required storeId not found");

    const { data } = await axios.post(
      `${EXTERNAL_API_URL}/webhook/account-details`,
      {
        from: req.query.from,
        to: req.query.to,
      },
    );

    res.status(200).json(data);
  }
}

export default OverviewController;
