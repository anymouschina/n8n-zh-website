import React, { ReactNode } from 'react';

import { Box, BoxProps, Container, Flex } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LuFolderOpen, LuHeart, LuUser, LuUsers } from 'react-icons/lu';

import { Icon } from '@/components/Icons';
import { ROUTES_ACCOUNT } from '@/features/account/routes';
import { ROUTES_WORKFLOWS } from '@/features/workflows/routes';

const HEIGHT = 'calc(60px + env(safe-area-inset-bottom))';

export const AppNavBarMobile = (props: BoxProps) => {
  const { t } = useTranslation(['app']);
  return (
    <Box display={{ base: 'block', md: 'none' }} {...props}>
      <Box h={HEIGHT} />
      <Flex
        zIndex={3}
        align="center"
        pb="safe-bottom"
        position="fixed"
        direction="column"
        bottom={0}
        insetStart={0}
        insetEnd={0}
        bg="white"
        color="gray.800"
        borderTop="1px solid transparent"
        boxShadow="layout"
        _dark={{
          bg: 'gray.900',
          color: 'white',
          borderTopColor: 'gray.800',
          boxShadow: 'dark-lg',
        }}
        h={HEIGHT}
      >
        <Container display="flex" flexDirection="row" w="full" flex={1}>
          <AppNavBarMobileMainMenuItem
            icon={LuFolderOpen}
            href={ROUTES_WORKFLOWS.app.root()}
          >
            {t('app:layout.mainMenu.workflows')}
          </AppNavBarMobileMainMenuItem>
          <AppNavBarMobileMainMenuItem href="/app/likes" icon={LuHeart}>
            {t('app:layout.mainMenu.likes')}
          </AppNavBarMobileMainMenuItem>
          <AppNavBarMobileMainMenuItem href="/app/community" icon={LuUsers}>
            {t('app:layout.mainMenu.community')}
          </AppNavBarMobileMainMenuItem>
          <AppNavBarMobileMainMenuItem
            icon={LuUser}
            href={ROUTES_ACCOUNT.app.root()}
          >
            {t('app:layout.mainMenu.account')}
          </AppNavBarMobileMainMenuItem>
        </Container>
      </Flex>
    </Box>
  );
};

const AppNavBarMobileMainMenuItem = ({
  children,
  href,
  icon,
  isExact,
}: {
  children: ReactNode;
  href: string;
  isExact?: boolean;
  icon?: React.FC;
}) => {
  const pathname = usePathname() ?? '';
  const isActive = isExact ? pathname === href : pathname.startsWith(href);

  return (
    <Flex
      as={Link}
      href={href}
      bg="transparent"
      flex={1}
      justifyContent="center"
      alignItems="center"
      direction="column"
      position="relative"
      opacity={isActive ? 1 : 0.6}
      fontWeight="semibold"
      borderRadius="md"
      p={2}
      fontSize="xs"
      gap={1}
      transition="0.2s"
      _hover={{
        bg: 'gray.200',
      }}
      _dark={{
        _hover: {
          bg: 'gray.800',
        },
      }}
    >
      {!!icon && <Icon fontSize="1.2em" icon={icon} />}
      {children}
    </Flex>
  );
};
