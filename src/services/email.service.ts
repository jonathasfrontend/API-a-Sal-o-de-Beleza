import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });
  }

  async send(options: EmailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: `"Sistema Salão" <${env.smtpUser}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      logger.info(`Email sent: ${info.messageId}`);
    } catch (error: any) {
      logger.error('Email send error:', error.message);
      throw error;
    }
  }

  async sendConfirmation(to: string, clientName: string, date: string, time: string): Promise<void> {
    const html = `
      <h2>Agendamento Confirmado!</h2>
      <p>Olá ${clientName},</p>
      <p>Seu agendamento foi confirmado:</p>
      <ul>
        <li><strong>Data:</strong> ${date}</li>
        <li><strong>Horário:</strong> ${time}</li>
      </ul>
      <p>Te esperamos! 😊</p>
    `;

    await this.send({
      to,
      subject: 'Agendamento Confirmado',
      html,
    });
  }

  async sendReminder(to: string, clientName: string, date: string, time: string): Promise<void> {
    const html = `
      <h2>Lembrete de Agendamento</h2>
      <p>Olá ${clientName},</p>
      <p>Você tem um agendamento amanhã:</p>
      <ul>
        <li><strong>Data:</strong> ${date}</li>
        <li><strong>Horário:</strong> ${time}</li>
      </ul>
      <p>Nos vemos em breve! 💖</p>
    `;

    await this.send({
      to,
      subject: 'Lembrete de Agendamento',
      html,
    });
  }
}
