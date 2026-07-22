import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  CustomerInfo,
  PurchasesOfferings,
  PurchasesPackage,
} from 'react-native-purchases';

const APPLE_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || '';
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || '';

let isConfigured = false;

/**
 * Get the appropriate public SDK key based on platform.
 */
export function getRevenueCatApiKey(): string {
  if (Platform.OS === 'ios') {
    return APPLE_API_KEY;
  } else if (Platform.OS === 'android') {
    return GOOGLE_API_KEY;
  }
  return '';
}

/**
 * Configures the RevenueCat SDK once per application session.
 * Safe to call multiple times (no-ops if already configured).
 */
export function configureRevenueCat(): boolean {
  if (isConfigured) {
    return true;
  }

  const apiKey = getRevenueCatApiKey();

  if (!apiKey) {
    if (__DEV__) {
      console.warn(
        '[RevenueCat] API Key missing. Set EXPO_PUBLIC_REVENUECAT_APPLE_KEY or EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY in your environment variables.',
      );
    }
    return false;
  }

  try {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    Purchases.configure({ apiKey });
    isConfigured = true;
    console.log('[RevenueCat] Successfully configured SDK');
    return true;
  } catch (error) {
    console.error('[RevenueCat] Failed to configure SDK:', error);
    return false;
  }
}

/**
 * Identifies the current user with RevenueCat (e.g. after login).
 */
export async function identifyRevenueCatUser(appUserID: string): Promise<CustomerInfo | null> {
  if (!isConfigured) return null;
  try {
    const { customerInfo } = await Purchases.logIn(appUserID);
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Failed to log in user:', error);
    return null;
  }
}

/**
 * Resets the RevenueCat user session (e.g. after logout).
 */
export async function resetRevenueCatUser(): Promise<CustomerInfo | null> {
  if (!isConfigured) return null;
  try {
    const customerInfo = await Purchases.logOut();
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Failed to log out user:', error);
    return null;
  }
}

/**
 * Fetches current customer info from RevenueCat.
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isConfigured) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error('[RevenueCat] Failed to get customer info:', error);
    return null;
  }
}

/**
 * Fetches available offerings from RevenueCat.
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  if (!isConfigured) return null;
  try {
    return await Purchases.getOfferings();
  } catch (error) {
    console.error('[RevenueCat] Failed to fetch offerings:', error);
    return null;
  }
}

/**
 * Purchases a RevenueCat package.
 */
export async function purchasePackage(
  pack: PurchasesPackage,
): Promise<{ customerInfo: CustomerInfo | null; userCancelled: boolean }> {
  if (!isConfigured) {
    throw new Error('RevenueCat SDK is not configured');
  }
  try {
    const { customerInfo } = await Purchases.purchasePackage(pack);
    return { customerInfo, userCancelled: false };
  } catch (error: any) {
    if (error?.userCancelled) {
      return { customerInfo: null, userCancelled: true };
    }
    console.error('[RevenueCat] Purchase failed:', error);
    throw error;
  }
}

/**
 * Restores previous purchases.
 */
export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!isConfigured) return null;
  try {
    return await Purchases.restorePurchases();
  } catch (error) {
    console.error('[RevenueCat] Failed to restore purchases:', error);
    throw error;
  }
}

/**
 * Helper to check if a specific entitlement is active in CustomerInfo.
 */
export function isEntitlementActive(
  customerInfo: CustomerInfo | null,
  entitlementId: string,
): boolean {
  if (!customerInfo) return false;
  return Boolean(customerInfo.entitlements.active[entitlementId]);
}

export const revenueCatService = {
  getApiKey: getRevenueCatApiKey,
  configure: configureRevenueCat,
  identifyUser: identifyRevenueCatUser,
  resetUser: resetRevenueCatUser,
  getCustomerInfo,
  getOfferings,
  purchasePackage,
  restorePurchases,
  isEntitlementActive,
};
