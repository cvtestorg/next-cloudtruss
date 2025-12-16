import { OpenFgaClient, CredentialsMethod } from "@openfga/sdk";

/**
 * 获取 OpenFGA 客户端实例
 * 
 * 延迟初始化，避免在构建时因缺少环境变量而失败
 * 只在运行时（服务器端）创建客户端
 */
let fgaClientInstance: OpenFgaClient | null = null;

function getFgaClient(): OpenFgaClient {
  // 如果已经创建过，直接返回
  if (fgaClientInstance) {
    return fgaClientInstance;
  }

  // 检查必需的环境变量
  const apiUrl = process.env.FGA_API_URL;
  if (!apiUrl) {
    throw new Error(
      "FGA_API_URL environment variable is not set. " +
      "OpenFGA client cannot be initialized. " +
      "Please set FGA_API_URL, FGA_STORE_ID, FGA_MODEL_ID, and FGA_API_TOKEN environment variables."
    );
  }

  // 创建客户端实例
  fgaClientInstance = new OpenFgaClient({
    apiUrl,
    storeId: process.env.FGA_STORE_ID, // not needed when calling `CreateStore` or `ListStores`
    authorizationModelId: process.env.FGA_MODEL_ID, // Optional, can be overridden per request
    credentials: {
      method: CredentialsMethod.ApiToken,
      config: {
        token: process.env.FGA_API_TOKEN as string, // will be passed as the "Authorization: Bearer ${ApiToken}" request header
      },
    },
  });

  return fgaClientInstance;
}

/**
 * 导出 OpenFGA 客户端
 * 
 * 使用 Proxy 实现延迟初始化，避免在构建时因缺少环境变量而失败
 * 只有在实际调用方法时才会创建客户端实例
 */
export const fgaClient = new Proxy({} as OpenFgaClient, {
  get(_target, prop) {
    // 在构建时，如果环境变量未设置，返回一个安全的默认值
    // 这允许 Next.js 进行静态分析而不会失败
    if (typeof window !== "undefined" || !process.env.FGA_API_URL) {
      // 客户端环境或构建时环境变量未设置
      // 返回一个 stub 对象，避免构建错误
      if (prop === "batchCheck") {
        return async () => {
          throw new Error(
            "OpenFGA client is not available. " +
            "Please ensure FGA_API_URL and other required environment variables are set."
          );
        };
      }
      // 对于其他属性，返回 undefined
      return undefined;
    }

    // 服务器端运行时，正常创建和使用客户端
    try {
      const client = getFgaClient();
      const value = (client as any)[prop];
      
      // 如果是函数，绑定 this 上下文
      if (typeof value === "function") {
        return value.bind(client);
      }
      
      return value;
    } catch (error) {
      // 如果初始化失败，返回一个安全的 fallback
      if (prop === "batchCheck") {
        return async () => {
          throw error;
        };
      }
      throw error;
    }
  },
});
