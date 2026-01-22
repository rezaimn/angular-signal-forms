import * as uuidModule from 'uuid';

type UuidV4 = () => string;

const uuidV4: UuidV4 | undefined =
  (uuidModule as { v4?: UuidV4 }).v4 ??
  (uuidModule as { default?: { v4?: UuidV4 } }).default?.v4;

if (!uuidV4) {
  throw new Error(
    'uuid v4 export not found. Install uuid@9+ or switch to crypto.randomUUID().'
  );
}

export { uuidV4 };
