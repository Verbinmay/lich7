import nodemailer from "nodemailer";

export const emailsAdapter = {
  async sendEmail(email: string, subject: string, message: string) {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "markmaywhynot@gmail.com",
        pass: process.env.GMAIL,
      },
    });

    let info = await transporter.sendMail({
      from: '"MARKIX" <markmaywhynot@gmail.com>', // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      html: message, // html body
    });

    return info;
  },
};
