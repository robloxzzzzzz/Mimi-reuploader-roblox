import { useEffect, useState } from 'react';
import { Flex, Box, Text, IconButton, Menu, MenuButton, MenuList, MenuItem, Button, Image } from '@chakra-ui/react';
import { Minus, X, ChevronDown } from 'lucide-react';
import appIcon from '../assets/app_icon.png';

function formatVersionTag(version: string) {
  const value = String(version || '1.3.15').replace(/^-?v/i, '');
  return `v${value.replace(/-hotfix\./i, '.hotfix.')}`;
}

export default function TopBar() {
  const [profilesInfo, setProfilesInfo] = useState({ activeId: null as string | null, profiles: {} as Record<string, any> });
  const [version, setVersion] = useState('');

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const secrets = await (window as any).electronAPI?.loadProfileSecrets?.();
        if (secrets) {
          setProfilesInfo({
            activeId: secrets.activeProfileId,
            profiles: secrets.profiles || {},
          });
        }
      } catch (err) {
        console.error('Failed to load profiles for top bar', err);
      }
    };
    fetchProfiles();
    window.addEventListener('profile-changed', fetchProfiles);

    const fetchMeta = async () => {
      try {
        const appVersion = await (window as any).electronAPI?.getAppVersion?.();
        if (appVersion) setVersion(formatVersionTag(appVersion));
      } catch (err) {
        console.error('Failed to get app version for top bar', err);
      }
    };
    fetchMeta();

    return () => window.removeEventListener('profile-changed', fetchProfiles);
  }, []);

  const activeProfileName = profilesInfo.activeId && profilesInfo.profiles[profilesInfo.activeId] 
    ? profilesInfo.profiles[profilesInfo.activeId].name || 'Profile 1'
    : 'Profile 1';

  return (
    <Flex h="100%" pl="16px" justify="space-between" align="center" sx={{ WebkitAppRegion: 'drag' } as any} borderBottom="1px solid" borderColor="discord.border" bg="discord.topbar">
      <Flex gap="12px" align="center">
        <Image src={appIcon} boxSize="30px" borderRadius="8px" />
        <Text fontWeight={800} fontSize="15px" color="discord.text" letterSpacing="0.2px">Mimi Reuploader</Text>
        <Text fontSize="11px" color="discord.darkMuted" letterSpacing="0.5px" pt="2px" fontWeight={600}>{version}</Text>
      </Flex>

      <Flex align="center" sx={{ WebkitAppRegion: 'no-drag' } as any} h="100%">
        <Menu placement="bottom-end">
          <MenuButton as={Button} size="sm" variant="ghost" rightIcon={<ChevronDown size={14} />} color="discord.muted" _hover={{ bg: 'discord.card', color: 'discord.text' }} _active={{ bg: 'discord.card' }} mr="8px" h="28px" px="12px" fontSize="12px" borderRadius="4px">
            {activeProfileName}
          </MenuButton>

          <MenuList bg="discord.inputDark" borderColor="discord.border" zIndex={10} p="8px" borderRadius="8px" boxShadow="0 8px 16px rgba(0,0,0,0.24)">
            <Box px="12px" py="8px"><Text fontSize="11px" fontWeight={800} color="discord.darkMuted" textTransform="uppercase" letterSpacing="0.5px">Profiles</Text></Box>
            {Object.entries(profilesInfo.profiles).map(([id, profile]: [string, any]) => (
              <MenuItem
                key={id}
                bg="transparent"
                _hover={{ bg: 'brand.500', color: 'brand.contrast', borderRadius: '4px' }}
                onClick={async () => {
                  await (window as any).electronAPI?.saveProfileSecrets?.({
                    action: 'setActive',
                    profileId: id,
                  });
                  setProfilesInfo((prev) => ({ ...prev, activeId: id }));
                  window.dispatchEvent(new Event('profile-changed'));
                }}
                px="12px" py="8px" mb="2px"
                color="discord.muted"
              >
                <Text fontSize="13px" fontWeight={500}>{profile.name || 'Unnamed Profile'}</Text>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>

        <IconButton 
          aria-label="Minimize"
          variant="ghost" 
          size="sm" 
          h="100%" w="46px" borderRadius="0"
          color="discord.darkMuted"
          _hover={{ bg: 'discord.card', color: 'discord.text' }}
          onClick={() => (window as any).electronAPI?.minimize?.()}
          icon={<Minus size={18} strokeWidth={2} />}
        />

        <IconButton 
          aria-label="Close"
          variant="ghost" 
          size="sm" 
          h="100%" w="46px" borderRadius="0"
          color="discord.darkMuted"
          _hover={{ bg: '#ed4245', color: '#fff' }}
          onClick={() => (window as any).electronAPI?.close?.()}
          icon={<X size={18} strokeWidth={2} />}
        />
      </Flex>
    </Flex>
  );
}
