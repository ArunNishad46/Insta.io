import Brevo from "@getbrevo/brevo";
import dotenv from 'dotenv';
dotenv.config();

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

// api.setApiKey(
//   brevo.TransactionalEmailsApiApiKeys.apiKey,
//   process.env.BREVO_API_KEY
// );

export default apiInstance;
