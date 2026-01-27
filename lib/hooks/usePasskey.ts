"use client";

import { useState, useEffect, useCallback } from "react";
import {
  registerPasskey as register,
  authenticateWithPasskey as authenticate,
  getPasskeys as fetchPasskeys,
  deletePasskey as removePasskey,
  updatePasskeyName as renamePasskey,
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  type Passkey,
  type PasskeyAuthResult,
} from "@/lib/webauthn/client";

interface UsePasskeyReturn {
  // 상태
  isSupported: boolean;
  isPlatformAvailable: boolean;
  isLoading: boolean;
  error: string | null;
  passkeys: Passkey[];

  // 액션
  registerPasskey: (deviceName?: string) => Promise<boolean>;
  authenticateWithPasskey: () => Promise<PasskeyAuthResult>;
  loadPasskeys: () => Promise<void>;
  deletePasskey: (passkeyId: string) => Promise<void>;
  updatePasskeyName: (passkeyId: string, deviceName: string) => Promise<void>;
  clearError: () => void;
}

export function usePasskey(): UsePasskeyReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isPlatformAvailable, setIsPlatformAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);

  // 브라우저 지원 여부 확인
  useEffect(() => {
    const checkSupport = async () => {
      const supported = isWebAuthnSupported();
      setIsSupported(supported);

      if (supported) {
        const platformAvailable = await isPlatformAuthenticatorAvailable();
        setIsPlatformAvailable(platformAvailable);
      }
    };

    checkSupport();
  }, []);

  // 패스키 등록
  const registerPasskey = useCallback(async (deviceName?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await register(deviceName);
      // 등록 성공 시 목록 새로고침
      const updatedPasskeys = await fetchPasskeys();
      setPasskeys(updatedPasskeys);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "패스키 등록에 실패했습니다.";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 패스키 인증
  const authenticateWithPasskey = useCallback(async (): Promise<PasskeyAuthResult> => {
    setIsLoading(true);
    setError(null);

    try {
      return await authenticate();
    } catch (err) {
      const message = err instanceof Error ? err.message : "패스키 인증에 실패했습니다.";
      setError(message);
      return { verified: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 패스키 목록 조회
  const loadPasskeys = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchPasskeys();
      setPasskeys(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "패스키 목록을 불러오는데 실패했습니다.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 패스키 삭제
  const deletePasskey = useCallback(async (passkeyId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await removePasskey(passkeyId);
      setPasskeys(prev => prev.filter(p => p.id !== passkeyId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "패스키 삭제에 실패했습니다.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 패스키 이름 변경
  const updatePasskeyName = useCallback(
    async (passkeyId: string, deviceName: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await renamePasskey(passkeyId, deviceName);
        setPasskeys(prev => prev.map(p => (p.id === passkeyId ? { ...p, deviceName } : p)));
      } catch (err) {
        const message = err instanceof Error ? err.message : "패스키 이름 변경에 실패했습니다.";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isSupported,
    isPlatformAvailable,
    isLoading,
    error,
    passkeys,
    registerPasskey,
    authenticateWithPasskey,
    loadPasskeys,
    deletePasskey,
    updatePasskeyName,
    clearError,
  };
}
