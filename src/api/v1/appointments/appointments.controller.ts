import { Request, Response } from 'express';
import { AppointmentService } from './appointments.service';
import { asyncHandler } from '../../../middlewares/error.handler';

const appointmentService = new AppointmentService();

export const createAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const appointment = await appointmentService.create(req.body, req.user!.id);

    res.status(201).json({
      status: 'success',
      data: { appointment },
    });
  }
);

export const getAppointments = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, staffId, clientId, status, date, startDate, endDate } = req.query;

    const result = await appointmentService.findAll({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      staffId: staffId as string,
      clientId: clientId as string,
      status: status as string,
      date: date as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    res.json({
      status: 'success',
      ...result,
    });
  }
);

export const getAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const appointment = await appointmentService.findById(req.params.id);

    res.json({
      status: 'success',
      data: { appointment },
    });
  }
);

export const updateAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const appointment = await appointmentService.update(req.params.id, req.body);

    res.json({
      status: 'success',
      data: { appointment },
    });
  }
);

export const cancelAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const appointment = await appointmentService.cancel(req.params.id);

    res.json({
      status: 'success',
      data: { appointment },
    });
  }
);

export const markNoShow = asyncHandler(
  async (req: Request, res: Response) => {
    const appointment = await appointmentService.markNoShow(req.params.id);

    res.json({
      status: 'success',
      data: { appointment },
    });
  }
);

export const checkAvailability = asyncHandler(
  async (req: Request, res: Response) => {
    const { staffId, date } = req.query;

    const appointments = await appointmentService.checkAvailability(
      staffId as string,
      date as string
    );

    res.json({
      status: 'success',
      data: { appointments },
    });
  }
);

export const getStats = asyncHandler(
  async (req: Request, res: Response) => {
    const { staffId, startDate, endDate } = req.query;

    const stats = await appointmentService.getStats({
      staffId: staffId as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    res.json({
      status: 'success',
      data: stats,
    });
  }
);
