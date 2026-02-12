import nodemailer from 'nodemailer';
import { pino } from 'pino';

const logger = pino({
    name: 'EmailService',
    level: process.env.LOG_LEVEL || 'info',
});

interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
}

export class EmailService {
    private transporter: nodemailer.Transporter | null = null;
    private isConfigured = false;

    constructor() {
        this.initializeTransporter();
    }

    private initializeTransporter() {
        // Only initialize if required env vars are present
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
                pool: true, // Use connection pooling
                maxConnections: 5,
                maxMessages: 100,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            this.isConfigured = true;
            logger.info('Email service configured successfully');
        } else {
            logger.warn('Email service not configured: Missing SMTP environment variables');
        }
    }

    async sendEmail(options: EmailOptions): Promise<boolean> {
        if (!this.isConfigured || !this.transporter) {
            logger.warn('Attempted to send email but service is not configured');
            return false;
        }

        try {
            const info = await this.transporter.sendMail({
                from: options.from || process.env.SMTP_FROM || process.env.EMAIL_FROM || '"Comply" <noreply@comply.tn>',
                to: options.to,
                subject: options.subject,
                text: options.text || options.html.replace(/<[^>]*>?/gm, ''), // Simple text fallback
                html: options.html,
            });

            logger.info({ msg: 'Email sent', messageId: info.messageId, to: options.to });
            return true;
        } catch (error) {
            logger.error({ msg: 'Failed to send email', error });
            return false;
        }
    }

    // Check if service is ready
    async verifyConnection(): Promise<boolean> {
        if (!this.transporter) return false;
        try {
            await this.transporter.verify();
            return true;
        } catch (error) {
            logger.error({ msg: 'SMTP connection verification failed', error });
            return false;
        }
    }
}

export const emailService = new EmailService();
