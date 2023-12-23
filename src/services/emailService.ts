import { createTransport, Transporter } from 'nodemailer';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import { EMAIL_PASS, EMAIL_USER, EMAIL_HOST, EMAIL_PORT } from '../config/config.js';




interface EmailConfig {
    user: string;
    pass: string;
}


class EmailService {
    private transporter: Transporter;
    private static instance: EmailService;


    constructor(config: EmailConfig) {
        this.transporter = createTransport({
            host: EMAIL_HOST,
            port: Number(EMAIL_PORT),
            secure: false,
            debug: true,
            requireTLS: true,
            logger: true,
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
        });
    }

    static getInstance(): EmailService {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService({
                user: EMAIL_USER as string,
                pass: EMAIL_PASS as string,
            });
        }
        return EmailService.instance;
    }


    private getTemplateFile(template: string) {
        return fs.readFileSync(path.join(process.cwd(), 'src', 'views', template + '.html')).toString('utf8');
    }


    private async getTemplate(template: string, data: any) {
        const result = ejs.compile(this.getTemplateFile(template), {
            beautify: false
        });
        return result({
            ...data,
        });
    }

    async sendMail(to: string, subject: string, templateName: string, templateData: any) {

        try {
            await this.transporter.sendMail({
                to,
                subject,
                html: await this.getTemplate(templateName, templateData)
            });
            return true;
        } catch (error) {
            console.error("Email Error", error);
            return false;
        }
    }
}

export default EmailService;
