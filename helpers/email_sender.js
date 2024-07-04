const nodemailer = require("nodemailer");

exports.sendEmail = async (email, subject, body) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        accessToken: process.env.OAUTH_ACCESS_TOKEN,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: subject,
      text: body,
    };

    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return { message: "Email sent successfully", statusCode: 200 };
  } catch (error) {
    console.error("Error sending mail", error);
    return { message: "Error Sending email", statusCode: 500 };
  }
};
