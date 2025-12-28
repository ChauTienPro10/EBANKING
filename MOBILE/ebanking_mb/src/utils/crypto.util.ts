import { createPrivateKey, createSign, createHash } from 'react-native-quick-crypto';

export function signPayload(payload: string, base64PrivateKey: string): string {
  if (!payload) throw new Error('Payload is empty');
  if (!base64PrivateKey) throw new Error('PrivateKey is empty');

  const pemKey = `-----BEGIN PRIVATE KEY-----\n${base64PrivateKey}\n-----END PRIVATE KEY-----`;

  const privateKey = createPrivateKey({
    key: pemKey,
    format: 'pem',
    type: 'pkcs8',
  });

  // Create signer with SHA256 algorithm
  const signer = createSign('sha256');
  signer.update(payload); // Sign the original payload, not the hash
  
  const signatureBuffer = signer.sign(privateKey);
  return signatureBuffer.toString('base64');
}
