import { OpenFgaClient, CredentialsMethod } from "@openfga/sdk";

export const fgaClient = new OpenFgaClient({
  apiUrl: process.env.FGA_API_URL, // required
  storeId: process.env.FGA_STORE_ID, // not needed when calling `CreateStore` or `ListStores`
  authorizationModelId: process.env.FGA_MODEL_ID, // Optional, can be overridden per request
  credentials: {
    method: CredentialsMethod.ApiToken,
    config: {
      token: process.env.FGA_API_TOKEN as string, // will be passed as the "Authorization: Bearer ${ApiToken}" request header
    },
  },
});
