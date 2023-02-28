export const registrationMessage = (code: string) => {
  const result =
    "<h1>Thank for your registration</h1><p>To finish registration please follow the link below: <a href='https://somesite.com/confirm-email?code=" +
    code +
    "'>complete registration</a></p>";

  return { subject: "REGISTRATION", result: result };
};
