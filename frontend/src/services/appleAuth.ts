import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { getApp } from '@react-native-firebase/app';
import { getAuth, AppleAuthProvider, signInWithCredential } from '@react-native-firebase/auth';

const auth = getAuth(getApp());

function randomNonce(length = 32) {
  const chars =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

type CreateAppleCredentialOptions = {
  requestScopes?: boolean;
};

export async function createAppleFirebaseCredential(
  options: CreateAppleCredentialOptions = {}
) {
  const rawNonce = randomNonce();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce
  );

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: options.requestScopes
      ? [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ]
      : [],
    nonce: hashedNonce,
  });

  if (!credential.identityToken) {
    throw new Error('Apple identity token が取得できなかった');
  }

  const firebaseCredential = AppleAuthProvider.credential(
    credential.identityToken,
    rawNonce
  );

  return { firebaseCredential, appleCredential: credential };
}

export async function signInWithApple() {
  const { firebaseCredential, appleCredential } = await createAppleFirebaseCredential({
    requestScopes: true,
  });

  const credentialResult = await signInWithCredential(auth, firebaseCredential);

  const appleFullName = [
    appleCredential.fullName?.givenName,
    appleCredential.fullName?.familyName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim() || null;

  return {
    credentialResult,
    appleFullName,
    appleEmail: appleCredential.email ?? null,
  };
}