import twilio from 'twilio';

/**
 * Send SMS using either Fast2SMS or Twilio based on environment config.
 * Falls back to logging to console if no keys are provided.
 * 
 * @param {string} mobile 10-digit mobile number
 * @param {string} message SMS body
 * @returns {Promise<boolean>} Resolves to true if message was sent via real gateway
 */
export async function sendSms(mobile, message) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, FAST2SMS_API_KEY } = process.env;
  const mobileStr = String(mobile).trim();
  const formattedMobile = mobileStr.startsWith('+') ? mobileStr : `+91${mobileStr}`;
  const cleanMobileForFast2SMS = mobileStr.startsWith('+91') ? mobileStr.substring(3) : mobileStr;

  // 1. Fast2SMS Integration (Ideal for Indian mobile number routes)
  if (FAST2SMS_API_KEY) {
    try {
      console.log(`[SMS SENDER] Routing via Fast2SMS to ${cleanMobileForFast2SMS}...`);
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'q',
          message: message,
          language: 'english',
          numbers: cleanMobileForFast2SMS
        })
      });
      const resData = await response.json();
      if (resData.return) {
        console.log(`[SMS SUCCESS] Fast2SMS message delivered successfully to ${mobileStr}`);
        return true;
      } else {
        console.error(`[SMS ERROR] Fast2SMS gateway returned rejection:`, resData);
      }
    } catch (err) {
      console.error(`[SMS ERROR] Failed to send via Fast2SMS to ${mobileStr}:`, err.message);
    }
  }

  // 2. Twilio Integration (Global standard route)
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
    try {
      console.log(`[SMS SENDER] Routing via Twilio to ${formattedMobile}...`);
      const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: message,
        from: TWILIO_PHONE_NUMBER,
        to: formattedMobile
      });
      console.log(`[SMS SUCCESS] Twilio message delivered successfully to ${formattedMobile}`);
      return true;
    } catch (err) {
      console.error(`[SMS ERROR] Failed to send via Twilio to ${formattedMobile}:`, err.message);
    }
  }

  // 3. Graceful Fallback Log
  console.log(`\n======================================================================`);
  console.log(`[SMS LOGIC FALLBACK] To: ${formattedMobile}`);
  console.log(`[SMS LOGIC FALLBACK] Message: "${message}"`);
  console.log(`💡 Setup actual SMS notifications in .env using either:`);
  console.log(`   - FAST2SMS_API_KEY`);
  console.log(`   - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER`);
  console.log(`======================================================================\n`);
  return false;
}
