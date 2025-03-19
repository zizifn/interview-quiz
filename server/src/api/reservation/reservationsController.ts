import type { Request, Response, NextFunction } from "express";
import { getCouchbaseConnection } from "@/db/couchbase";
import {
  NewReservation,
  UpdateReservation,
  UpdateStatusReservation,
} from "./reservationsModel";
import {
  getReservationsService,
  createReservationService,
  updateReservationService,
  updateStatusReservationService,
} from "./reservationServices";

export async function getReservation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.locals?.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { quizScope } = await getCouchbaseConnection();
  if (!quizScope) {
    res.status(500).json({
      message: `Service is unavailable.`,
    });
    return;
  }

  try {
    const reservationData = await getReservationsService(quizScope, user);
    res.status(200).json(reservationData);
  } catch (error: any) {
    req.log.error("Error fetching reservation data:", error);
    res.status(500).json({
      message: `Internal Server Error, ${error.message}, casue: ${error.cause?.message}`,
    });
  }
}

export async function createReservation(req: Request, res: Response) {
  const user = req.locals?.user;
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const { quizScope, couchbaseCluster } = await getCouchbaseConnection();
    if (!quizScope || !couchbaseCluster) {
      res.status(500).json({ message: "Service is unavailable." });
      return;
    }

    const reservationBody: NewReservation = req.body;
    const newReservation = await createReservationService(
      quizScope,
      couchbaseCluster,
      reservationBody,
      user
    );

    res.status(200).json(newReservation);
    return;
  } catch (error: any) {
    req.log.error("Failed to create reservation:", error);
    res.status(500).json({
      message: `Failed to create reservation, ${error.message}, casue: ${error.cause?.message}`,
    });
    return;
  }
}

export async function updateReservation(req: Request, res: Response) {
  const { id } = req.params;
  const user = req.locals?.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const updatedReservationBody: UpdateReservation = req.body;

    const { quizScope, couchbaseCluster } = await getCouchbaseConnection();
    if (!quizScope || !couchbaseCluster) {
      res.status(500).json({ message: "Service is unavailable." });
      return;
    }

    const updatedReservation = await updateReservationService(
      quizScope,
      couchbaseCluster,
      id,
      updatedReservationBody,
      user
    );

    res.status(200).json(updatedReservation);
    return;
  } catch (error: any) {
    req.log.error("Failed to update reservation:", error);
    res.status(500).json({
      message: `Failed to update reservation: ${error.message}, casue: ${error.cause?.message}`,
    });
    return;
  }
}

export async function updateStatusReservation(req: Request, res: Response) {
  const { id } = req.params;
  const user = req.locals?.user;
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const updatedReservationBody: UpdateStatusReservation = req.body;

    const { quizScope, couchbaseCluster } = await getCouchbaseConnection();
    if (!quizScope || !couchbaseCluster) {
      res.status(500).json({ message: "Service is unavailable." });
      return;
    }

    const updatedReservation = await updateStatusReservationService(
      quizScope,
      couchbaseCluster,
      id,
      updatedReservationBody,
      user
    );

    res.status(200).json(updatedReservation);
    return;
  } catch (error: any) {
    req.log.error("Failed to update reservation:", error);
    res.status(500).json({
      message: `Failed to update reservation status: ${error.message}, casue: ${error.cause?.message}`,
    });
    return;
  }
}
