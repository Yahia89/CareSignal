import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import Purchases, { CustomerInfo, PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';
import { revenueCatService } from '../../services/revenuecat.service';
import { useAuth } from './AuthContext';

interface RevenueCatContextType {
  isConfigured: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
  loading: boolean;
  error: string | null;
  isEntitlementActive: (entitlementId: string) => boolean;
  purchasePackage: (
    pack: PurchasesPackage,
  ) => Promise<{ customerInfo: CustomerInfo | null; userCancelled: boolean }>;
  restorePurchases: () => Promise<CustomerInfo | null>;
  refreshCustomerInfo: () => Promise<void>;
  refreshOfferings: () => Promise<void>;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

export const RevenueCatProvider = ({ children }: { children: ReactNode }) => {
  const { state: authState } = useAuth();
  const [isConfigured, setIsConfigured] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [info, offs] = await Promise.all([
        revenueCatService.getCustomerInfo(),
        revenueCatService.getOfferings(),
      ]);
      setCustomerInfo(info);
      setOfferings(offs);
    } catch (err: any) {
      console.warn('[RevenueCatContext] Error fetching initial data:', err);
      setError(err?.message || 'Failed to fetch RevenueCat data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Configure SDK and setup listeners on mount
  useEffect(() => {
    const configured = revenueCatService.configure();
    setIsConfigured(configured);

    if (!configured) {
      setLoading(false);
      return;
    }

    fetchInitialData();

    // Listen for customer info updates
    const updateListener = (info: CustomerInfo) => {
      setCustomerInfo(info);
    };

    Purchases.addCustomerInfoUpdateListener(updateListener);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(updateListener);
    };
  }, [fetchInitialData]);

  // Sync user identity with AuthContext
  useEffect(() => {
    if (!isConfigured) return;

    const userId = authState.user?.id;
    if (userId) {
      revenueCatService.identifyUser(userId).then((info) => {
        if (info) setCustomerInfo(info);
      });
    } else if (!authState.isAuthenticated && !authState.loading) {
      revenueCatService.resetUser().then((info) => {
        if (info) setCustomerInfo(info);
      });
    }
  }, [isConfigured, authState.user?.id, authState.isAuthenticated, authState.loading]);

  const checkEntitlement = useCallback(
    (entitlementId: string): boolean => {
      return revenueCatService.isEntitlementActive(customerInfo, entitlementId);
    },
    [customerInfo],
  );

  const handlePurchase = useCallback(
    async (pack: PurchasesPackage) => {
      setError(null);
      const result = await revenueCatService.purchasePackage(pack);
      if (result.customerInfo) {
        setCustomerInfo(result.customerInfo);
      }
      return result;
    },
    [],
  );

  const handleRestore = useCallback(async () => {
    setError(null);
    const info = await revenueCatService.restorePurchases();
    if (info) {
      setCustomerInfo(info);
    }
    return info;
  }, []);

  const refreshCustomerInfo = useCallback(async () => {
    const info = await revenueCatService.getCustomerInfo();
    if (info) setCustomerInfo(info);
  }, []);

  const refreshOfferings = useCallback(async () => {
    const offs = await revenueCatService.getOfferings();
    if (offs) setOfferings(offs);
  }, []);

  const value: RevenueCatContextType = {
    isConfigured,
    customerInfo,
    offerings,
    loading,
    error,
    isEntitlementActive: checkEntitlement,
    purchasePackage: handlePurchase,
    restorePurchases: handleRestore,
    refreshCustomerInfo,
    refreshOfferings,
  };

  return <RevenueCatContext.Provider value={value}>{children}</RevenueCatContext.Provider>;
};

export const useRevenueCat = () => {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider');
  }
  return context;
};
