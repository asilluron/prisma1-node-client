/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client as BaseClient } from './Client';
import { BaseClientOptions, Model } from './types';

export function makePrismaClientClass<T>({
  typeDefs,
  endpoint,
  secret,
  models,
}: {
  typeDefs: string
  endpoint: string
  secret?: string
  models: Model[]
}): T {
  return class Client extends BaseClient {
    constructor(options: BaseClientOptions) {
      if (!options || !options.endpoint) {
        console.log(`endpoint specifed by ${endpoint} is not used, so make sure you set it to the correct value in your client code`);
        super({ typeDefs, secret, models, ...options, endpoint});
      } else {
        super({ typeDefs, secret, models, ...options});
      }
     
    }
  } as any;
}
