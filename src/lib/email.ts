import nodemailer from 'nodemailer';

// Create transporter for SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates with iPhone/Outlook compatibility fixes
const getOTPEmailTemplate = (otp: string) => {
  return {
    subject: '🧇 Your Waffle Forever OTP Code',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light">
          <meta name="supported-color-schemes" content="light">
          <title>Waffle Forever - OTP Verification</title>
          <!--[if mso]>
          <noscript>
            <xml>
              <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
          </noscript>
          <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #fef7ed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 0;">
            <tr>
              <td align="center" style="padding: 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; margin: 0 auto;">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="background: #f59e0b; background: -webkit-linear-gradient(135deg, #f59e0b, #ea580c); background: linear-gradient(135deg, #f59e0b, #ea580c); border-radius: 20px 20px 0 0; padding: 40px 20px; text-align: center;">
                      <div style="font-size: 48px; line-height: 1; margin-bottom: 10px;">👑</div>
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-size: min(32px, 8vw); font-weight: bold; line-height: 1.2;">🧇 Waffle Forever</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px; font-size: min(18px, 4.5vw); line-height: 1.4;">Your Royal Offer Awaits!</p>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="background: #ffffff; padding: 40px 20px; border-radius: 0 0 20px 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td align="center" style="padding-bottom: 30px;">
                            <div style="font-size: 64px; line-height: 1; margin-bottom: 20px;">🎁</div>
                            <h2 style="color: #ea580c; margin: 0 0 10px 0; font-size: 24px; font-size: min(24px, 6vw); font-weight: bold; line-height: 1.3;">Your Verification Code</h2>
                            <p style="color: #6b7280; margin: 0; font-size: 16px; font-size: min(16px, 4vw); line-height: 1.5;">Enter this code to claim your royal offer!</p>
                          </td>
                        </tr>
                        
                        <!-- OTP Code -->
                        <tr>
                          <td align="center" style="padding: 40px 0;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                              <tr>
                                <td align="center" style="background: #f59e0b; background: -webkit-linear-gradient(135deg, #fbbf24, #f59e0b); background: linear-gradient(135deg, #fbbf24, #f59e0b); padding: 20px 40px; border-radius: 15px; box-shadow: 0 5px 15px rgba(245, 158, 11, 0.3);">
                                  <div style="color: #ffffff; font-size: 36px; font-size: min(36px, 9vw); font-weight: bold; letter-spacing: 6px; font-family: 'Courier New', Monaco, monospace; line-height: 1; text-align: center; min-width: 200px;">${otp}</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        
                        <!-- Instructions -->
                        <tr>
                          <td style="background: #fef3c7; padding: 20px; border-radius: 15px; border-left: 4px solid #f59e0b; margin: 30px 0;">
                            <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-size: min(16px, 4vw); font-weight: bold; line-height: 1.4;">⚡ Quick Instructions:</h3>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr><td style="color: #92400e; font-size: 14px; font-size: min(14px, 3.5vw); line-height: 1.6; padding: 2px 0;">• Enter this code on the Waffle Forever website</td></tr>
                              <tr><td style="color: #92400e; font-size: 14px; font-size: min(14px, 3.5vw); line-height: 1.6; padding: 2px 0;">• Code expires in 10 minutes</td></tr>
                              <tr><td style="color: #92400e; font-size: 14px; font-size: min(14px, 3.5vw); line-height: 1.6; padding: 2px 0;">• One-time use only</td></tr>
                            </table>
                          </td>
                        </tr>
                        
                        <!-- Security Note -->
                        <tr>
                          <td align="center" style="padding-top: 30px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; font-size: min(14px, 3.5vw); margin: 0; line-height: 1.5;">🔒 This code is confidential. Never share it with anyone!</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding: 20px; color: #9ca3af;">
                      <p style="margin: 0; font-size: 14px; font-size: min(14px, 3.5vw); line-height: 1.5;">🧇 Waffle Forever - Delicious offers every day! 🥞</p>
                      <p style="margin: 5px 0 0 0; font-size: 12px; font-size: min(12px, 3vw); line-height: 1.4;">This email was sent automatically. Please do not reply.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `
      🧇 WAFFLE FOREVER - Your Royal Offer Awaits!
      
      Your Verification Code: ${otp}
      
      Enter this 6-digit code on the Waffle Forever website to claim your royal offer!
      
      Important:
      • Code expires in 10 minutes
      • One-time use only
      • Keep this code confidential
      
      Happy snacking!
      🧇 Waffle Forever Team
    `
  };
};

// Send OTP email
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    // Check if SMTP configuration is available
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`📧 SMTP not configured. OTP for ${email}: ${otp}`);
      return true; // Return true for development when SMTP is not configured
    }

    const transporter = createTransporter();
    const template = getOTPEmailTemplate(otp);

    const mailOptions = {
      from: {
        name: '🧇 Waffle Forever Offers',
        address: process.env.SMTP_ADDRESS ?? "sales@waffleforever.com"
      },
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    // In development, still return true but log the error
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 Development mode: OTP for ${email}: ${otp}`);
      return true;
    }
    return false;
  }
}

// Send SMS (placeholder for future implementation)
export async function sendOTPSMS(phone: string, otp: string): Promise<boolean> {
  try {
    // For now, just log to console
    console.log(`📱 SMS OTP for ${phone}: ${otp}`);
    console.log(`📱 SMS functionality not implemented yet. Showing OTP in console for development.`);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP SMS:', error);
    return false;
  }
}