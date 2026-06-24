const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (phone, message) => {

  try {

    const response = await client.messages.create({

      body: message,

      from: "whatsapp:+14155238886",

      to: `whatsapp:+91${phone}`,

    });

    console.log("WHATSAPP SENT SUCCESSFULLY");
    console.log(response.sid);

  } catch (error) {

    console.log("SMS FAILED");
    console.log(error.message);

  }

};

module.exports = sendSMS;