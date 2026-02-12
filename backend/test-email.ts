import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

async function main() {
    console.log('--- Email Test Script ---');
    console.log('SMTP Config:');
    console.log(`Host: ${process.env.SMTP_HOST}`);
    console.log(`Port: ${process.env.SMTP_PORT}`);
    console.log(`User: ${process.env.SMTP_USER}`);
    console.log(`Secure: ${process.env.SMTP_SECURE}`);
    console.log(`From: ${process.env.EMAIL_FROM}`);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 465, // Try SSL port
        secure: true, // Force SSL
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000, // 10s timeout
        debug: true,
        logger: true
    });

    try {
        console.log('\nVerifying connection...');
        await transporter.verify();
        console.log('✅ Connection verified successfully!');

        console.log('\nSending test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Comply Test" <test@comply.tn>',
            to: 'cpt.systeme@gnet.tn', // Hardcoded for testing failure specifically
            subject: 'Test Email from Debug Script',
            text: 'If you receive this, the SMTP configuration is correct.',
            html: '<b>If you receive this, the SMTP configuration is correct.</b>',
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);

    } catch (error) {
        console.error('\n❌ Error occurred:');
        console.error(error);
    }
}

main();
