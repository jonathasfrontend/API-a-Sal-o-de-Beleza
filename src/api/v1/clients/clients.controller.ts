import { Request, Response } from 'express';
import { ClientService } from './clients.service';
import { asyncHandler } from '../../../middlewares/error.handler';

const clientService = new ClientService();

export const createClient = asyncHandler(
  async (req: Request, res: Response) => {
    const client = await clientService.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { client },
    });
  }
);

export const getClients = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, search, isBlocked } = req.query;

    const result = await clientService.findAll({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      isBlocked: isBlocked === 'true' ? true : isBlocked === 'false' ? false : undefined,
    });

    res.json({
      status: 'success',
      ...result,
    });
  }
);

export const getClient = asyncHandler(
  async (req: Request, res: Response) => {
    const client = await clientService.findById(req.params.id);

    res.json({
      status: 'success',
      data: { client },
    });
  }
);

export const updateClient = asyncHandler(
  async (req: Request, res: Response) => {
    const client = await clientService.update(req.params.id, req.body);

    res.json({
      status: 'success',
      data: { client },
    });
  }
);

export const deleteClient = asyncHandler(
  async (req: Request, res: Response) => {
    await clientService.delete(req.params.id);

    res.status(204).send();
  }
);

export const getClientHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const history = await clientService.getHistory(req.params.id);

    res.json({
      status: 'success',
      data: history,
    });
  }
);

export const getInactiveClients = asyncHandler(
  async (req: Request, res: Response) => {
    const days = req.query.days ? parseInt(req.query.days as string) : 60;
    const clients = await clientService.getInactiveClients(days);

    res.json({
      status: 'success',
      data: { clients },
    });
  }
);
