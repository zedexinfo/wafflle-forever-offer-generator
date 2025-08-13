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

// Email templates
const getOTPEmailTemplate = (otp: string) => {
  return {
    subject: '🧇 Your Waffle Forever OTP Code',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Waffle Forever - OTP Verification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #fef7ed;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="text-align: center; padding: 40px 0; background: linear-gradient(135deg, #f59e0b, #ea580c); border-radius: 20px 20px 0 0;">
              <div style="font-size: 3rem; margin-bottom: 10px;">👑</div>
              <h1 style="color: white; margin: 0; font-size: 2.5rem; font-weight: bold;">🧇 Waffle Forever</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 1.1rem;">Your Royal Offer Awaits!</p>
            </div>
            
            <!-- Main Content -->
            <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">🎁</div>
                <h2 style="color: #ea580c; margin: 0 0 10px 0; font-size: 1.8rem;">Your Verification Code</h2>
                <p style="color: #6b7280; margin: 0; font-size: 1.1rem;">Enter this code to claim your royal offer!</p>
              </div>
              
              <!-- OTP Code -->
              <div style="text-align: center; margin: 40px 0;">
                <div style="display: inline-block; background: linear-gradient(135deg, #fbbf24, #f59e0b); padding: 20px 40px; border-radius: 15px; box-shadow: 0 5px 15px rgba(245, 158, 11, 0.3);">
                  <div style="color: white; font-size: 2.5rem; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
                </div>
              </div>
              
              <!-- Instructions -->
              <div style="background: #fef3c7; padding: 20px; border-radius: 15px; border-left: 4px solid #f59e0b; margin: 30px 0;">
                <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 1.1rem;">⚡ Quick Instructions:</h3>
                <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                  <li>Enter this code on the Waffle Forever website</li>
                  <li>Code expires in 10 minutes</li>
                  <li>One-time use only</li>
                </ul>
              </div>
              
              <!-- Security Note -->
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 0.9rem; margin: 0;">🔒 This code is confidential. Never share it with anyone!</p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding: 20px; color: #9ca3af;">
              <p style="margin: 0; font-size: 0.9rem;">🧇 Waffle Forever - Delicious offers every day! 🥞</p>
              <p style="margin: 5px 0 0 0; font-size: 0.8rem;">This email was sent automatically. Please do not reply.</p>
            </div>
          </div>
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
        name: '🧇 Waffle Forever',
        address: process.env.SMTP_USER!
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