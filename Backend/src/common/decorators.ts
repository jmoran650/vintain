// src/common/decorators/Public.ts
import "reflect-metadata";

export const IS_PUBLIC_KEY = "isPublic";

/**
 * Marks a resolver method as public (i.e. does not require authentication).
 */
export function Public(): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(IS_PUBLIC_KEY, true, descriptor.value!);
  };
}