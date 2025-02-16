export interface NanoRpcOptions {
  /** Base URL for the NanoRPC server in development mode. @default '/api' */
  devBaseUrl?: `/${string}`
  /** Entry file for the NanoRPC server. */
  entry: string
}
