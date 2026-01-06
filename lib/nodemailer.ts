import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Your NEOKCS Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background-color: #000000;
              color: #ffffff;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 40px 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: #ffffff;
              margin-bottom: 10px;
            }
            .content {
              background-color: #111111;
              border: 1px solid #222222;
              border-radius: 8px;
              padding: 40px;
              text-align: center;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              margin-bottom: 20px;
              color: #ffffff;
            }
            .message {
              font-size: 16px;
              color: #cccccc;
              margin-bottom: 30px;
              line-height: 1.5;
            }
            .code {
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #ffffff;
              background-color: #1a1a1a;
              padding: 20px 40px;
              border-radius: 8px;
              display: inline-block;
              margin: 20px 0;
              border: 2px solid #333333;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              font-size: 14px;
              color: #666666;
            }
            .warning {
              color: #999999;
              font-size: 14px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">NEOKCS</div>
            </div>
            <div class="content">
              <div class="title">Verification Code</div>
              <div class="message">
                Enter this code to access your NEOKCS Dashboard:
              </div>
              <div class="code">${code}</div>
              <div class="warning">
                This code will expire in 10 minutes.<br/>
                If you didn't request this code, please ignore this email.
              </div>
            </div>
            <div class="footer">
              © ${new Date().getFullYear()} NEOKCS. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Your NEOKCS verification code is: ${code}\n\nThis code will expire in 10 minutes.\nIf you didn't request this code, please ignore this email.`
  };

  await transporter.sendMail(mailOptions);
}

