const twilio = require("twilio");

const sendRegistrationSMS = async (mobile, studentName, ticketNumber) => {
  try {
    // For free deployment, we'll log the SMS instead of actually sending
    // In production, use Twilio with proper credentials
    const message = `Dear ${studentName}, you have successfully registered for Dhishan'26. Your Ticket No: ${ticketNumber}. Venue: Open Theatre, GCEK. Date: 15 FEB 2026. Time: 10AM-8PM.`;

    console.log("SMS to be sent:", {
      to: mobile,
      message: message,
    });

    return true;

    // Uncomment for actual Twilio integration
    /*
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${mobile}`
    });
    
    return true;
    */
  } catch (error) {
    console.error("SMS error:", error);
    return false;
  }
};

module.exports = { sendRegistrationSMS };
