// adapted from https://gist.github.com/jed/982883
// under "Do what the fuck you want" license
// https://gist.github.com/jed/982883#file-license-txt

const randomByte = () => window.crypto.getRandomValues(new Uint8Array(1))[0];

const template = "00000000-0000-4000-8000-000000000000";
const randomHex = () => (randomByte() % 16).toString(16);
export const uuidv4 = () => template.replace(/0/g, randomHex);
export type UUIDv4 = ReturnType<typeof uuidv4>;
