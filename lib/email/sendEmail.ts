// import nodemailer from 'nodemailer';

// import env from '../env';

// const transporter = nodemailer.createTransport({
//   host: env.smtp.host,
//   port: env.smtp.port,
//   secure: false,
//   auth: {
//     user: env.smtp.user,
//     pass: env.smtp.password,
//   },
// });

// interface EmailData {
//   to: string;
//   subject: string;
//   html: string;
//   text?: string;
// }

// export const sendEmail = async (data: EmailData) => {
//   if (!env.smtp.host) {
//     return;
//   }

//   const emailDefaults = {
//     from: env.smtp.from,
//   };

//   await transporter.sendMail({ ...emailDefaults, ...data });
// };

// lib/email/sendEmail.ts
// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

// interface EmailData {
//   to: string;
//   subject: string;
//   html: string;
//   text?: string;
//   from?: string;
// }

// export const sendEmail = async (data: EmailData) => {
//   if (!process.env.RESEND_API_KEY) {
//     console.warn('RESEND_API_KEY not set, skipping email');
//     return;
//   }

//   try {
//     const result = await resend.emails.send({
//       from: data.from || 'CONFERIO <resend._conferio.in>', // Use your verified domain
//       to: data.to,
//       subject: data.subject,
//       html: data.html,
//       text: data.text,
//     });

//     if ('id' in result && result.id) {
//       console.log('✉️ Email sent:', result.id);
//     } else {
//       console.warn('Email sent but no ID returned:', result);
//     }
//     return result;
//   } catch (error) {
//     console.error('❌ Failed to send email:', error);
//     throw error;
//   }
// };

// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

// interface EmailData {
//   to: string;
//   subject: string;
//   html: string;
//   text?: string;
//   from?: string;
// }

// export const sendEmail = async (data: EmailData) => {
//   if (!process.env.RESEND_API_KEY) {
//     console.warn('RESEND_API_KEY not set, skipping email');
//     return;
//   }

//   try {
//     const fromAddress = 'CONFERIO <noreply@conferio.in>'; // ← hardcoded, ignores data.from entirely
//     console.log('Sending email with from:', JSON.stringify(fromAddress));

//     const result = await resend.emails.send({
//       from: fromAddress,
//       to: data.to,
//       subject: data.subject,
//       html: data.html,
//       text: data.text,
//     });

//     if (result.data?.id) {
//       console.log('✉️ Email sent:', result.data.id);
//     } else {
//       console.warn('Email sent but no ID returned:', result);
//     }
//     return result;
//   } catch (error) {
//     console.error('❌ Failed to send email:', error);
//     throw error;
//   }
// };

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export const sendEmail = async (data: EmailData) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email');
    return;
  }

  try {
    // Use your VERIFIED domain: collabium.in
    const fromAddress = data.from 
      ? `CONFERIO <${data.from}>`
      : 'CONFERIO <noreply@collabium.in>';  // ✅ Fixed domain

    console.log('Sending email with from:', fromAddress);

    const result = await resend.emails.send({
      from: fromAddress,
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    });

    if (result.data?.id) {
      console.log('✉️ Email sent:', result.data.id);
    } else {
      console.warn('Email sent but no ID returned:', result);
    }
    return result;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
};
