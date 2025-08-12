import { ReactElement } from 'react';

import { render } from '@react-email/render';
import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/sendmail-transport';

import { env } from '@/env.mjs';
import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_SECURE,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendEmail = ({
  template,
  ...options
}: Omit<MailOptions, 'html'> &
  Required<Pick<MailOptions, 'subject'>> & { template: ReactElement }) => {
  try {
    if (env.NEXT_PUBLIC_IS_DEMO) {
      return;
    }
    const html = render(template);
    return transport.sendMail({
      from: env.EMAIL_FROM,
      html,
      ...options,
    });
  } catch (error) {
    console.error(error);
  }
};

export const previewEmailRoute = async (
  req: Request,
  {
    params,
  }: {
    params: { options: [string, string?] };
  }
) => {
  // Allows debug only in development
  if (env.NODE_ENV !== 'development') {
    return new Response(undefined, {
      status: 404,
    });
  }

  const [template, language = DEFAULT_LANGUAGE_KEY] = params.options;
  const query = req.url.split('?')[1];
  const searchQuery = Object.fromEntries(new URLSearchParams(query ?? ''));

  let Email;
  try {
    const EmailModule = await import(`@/emails/templates/${template}`);
    Email = EmailModule.default;
  } catch {
    return new Response('Template not found', {
      status: 404,
    });
  }

  const html = render(<Email language={language ?? 'en'} {...searchQuery} />);

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
};
