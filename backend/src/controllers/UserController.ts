import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface CreateUserBody {
  email: string;
  password: string;
  name?: string;
  role?: 'USER' | 'ADMIN';
}

export class UserController {
  async create(req: Request<unknown, unknown, CreateUserBody>, res: Response) {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Email e senha são obrigatórios.' 
        });
      }

      const userExists = await prisma.user.findUnique({
        where: { email }
      });

      if (userExists) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Email já cadastrado.' 
        });
      }

      const hashedPassword = await bcrypt.hash(password, 8);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role || 'USER'
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });

      return res.status(201).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      console.error('[UserController] create error:', error);
      return res.status(500).json({ 
        status: 'error',
        message: 'Erro interno do servidor.' 
      });
    }
  }
}