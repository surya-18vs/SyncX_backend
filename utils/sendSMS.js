const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (phone, message) => {

  try {

    const response = await client.messages.create({

      body: message,

      from: process.env.TWILIO_PHONE,

      to: `+91${phone}`,

    });

    console.log("SMS SENT SUCCESSFULLY");
    console.log(response.sid);

  } catch (error) {

    console.log("SMS FAILED");
    console.log(error.message);

  }

};

module.exports = sendSMS;