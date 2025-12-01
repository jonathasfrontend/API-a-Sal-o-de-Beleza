import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface WhatsAppMessage {
  to: string;
  templateName?: string;
  parameters?: string[];
  body?: string;
}

export class WhatsAppService {
  private apiUrl: string;
  private accessToken: string;
  private phoneNumberId: string;

  constructor() {
    this.apiUrl = env.whatsappApiUrl;
    this.accessToken = env.whatsappAccessToken;
    this.phoneNumberId = env.whatsappPhoneNumberId;
  }

  async sendTemplate(data: WhatsAppMessage): Promise<any> {
    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;

      const payload = {
        messaging_product: 'whatsapp',
        to: data.to,
        type: 'template',
        template: {
          name: data.templateName,
          language: {
            code: 'pt_BR',
          },
          components: data.parameters ? [
            {
              type: 'body',
              parameters: data.parameters.map(param => ({
                type: 'text',
                text: param,
              })),
            },
          ] : [],
        },
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      logger.info(`WhatsApp template sent to ${data.to}`);
      return response.data;
    } catch (error: any) {
      logger.error('WhatsApp send error:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendText(to: string, body: string): Promise<any> {
    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;

      const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: {
          body,
        },
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      logger.info(`WhatsApp text sent to ${to}`);
      return response.data;
    } catch (error: any) {
      logger.error('WhatsApp send error:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendConfirmation(clientName: string, phone: string, date: string, time: string, staffName: string): Promise<void> {
    const message = `Olá ${clientName}! ✅\n\nSeu agendamento está confirmado:\n📅 ${date}\n🕐 ${time}\n💇 com ${staffName}\n\nTe esperamos! 😊`;
    
    await this.sendText(phone, message);
  }

  async sendReminder(clientName: string, phone: string, date: string, time: string, hours: number): Promise<void> {
    const message = `Olá ${clientName}! 🔔\n\nLembrete: você tem um agendamento em ${hours}h:\n📅 ${date}\n🕐 ${time}\n\nNos vemos em breve! 💖`;
    
    await this.sendText(phone, message);
  }

  async sendCancellation(clientName: string, phone: string): Promise<void> {
    const message = `Olá ${clientName},\n\nSeu agendamento foi cancelado. Se desejar reagendar, entre em contato conosco! 📞`;
    
    await this.sendText(phone, message);
  }

  async sendPromotion(clientName: string, phone: string, promotion: string): Promise<void> {
    const message = `Olá ${clientName}! 🎉\n\n${promotion}\n\nAproveite! 💅`;
    
    await this.sendText(phone, message);
  }

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === env.whatsappVerifyToken) {
      return challenge;
    }
    return null;
  }
}
