import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';

import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';
import { trpc } from '@/lib/trpc/client';

export const useSyncAccountLanguage = () => {
  const checkAuthenticated = trpc.auth.checkAuthenticated.useQuery();
  const account = trpc.account.get.useQuery(undefined, {
    enabled: !!checkAuthenticated.data?.isAuthenticated,
  });

  const { i18n } = useTranslation();
  useEffect(() => {
    const updateLanguage = () => {
      // 如果用户有设置语言偏好，使用用户设置；否则使用默认语言（中文）
      const languageToUse = account.data?.language || DEFAULT_LANGUAGE_KEY;
      if (languageToUse) {
        i18n.changeLanguage(languageToUse);
      }
    };
    i18n.on('initialized', updateLanguage);

    updateLanguage();

    return () => {
      i18n.off('initialized', updateLanguage);
    };
  }, [account.isSuccess, account.data?.language, i18n]);
};
