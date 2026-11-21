import { useEffect, useState } from 'react';
import { Alert, AlertIcon, Box, Button, Flex, Heading, Image, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { ArrowRight, Download } from 'lucide-react';
import guidePortrait from '../assets/mimi-guide.jpg';

const steps = [
  { title: 'Установи плагин', detail: 'Сохрани .rbxmx. В Roblox Studio открой Plugins → Plugins Folder, положи файл туда и перезапусти Studio. Если установлен прежний плагин, замени его.' },
  { title: 'Подключи Studio', detail: 'Оставь Mimi Reuploader открытым. В Studio нажми Mimi Reuploader → Connect и разреши доступ к 127.0.0.1:3100, если появится запрос.' },
  { title: 'Собери ассеты', detail: 'Вставь только ID ассетов, по одному на строку или через запятую. Mimi определит тип и владельца. В Studio можно выбрать Animations, Sounds или Both, чтобы заполнить список автоматически.' },
  { title: 'Перенеси и проверь', detail: 'Настрой профиль и запусти перенос. После загрузки нажми Push to Studio, сверь число замен, затем проверь анимации в Play.' },
];

export default function GuideView({ onStart }: { onStart: () => void }) {
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const [bridgeError, setBridgeError] = useState('');

  useEffect(() => {
    let active = true;
    const checkBridge = async () => {
      try {
        const bridge = await (window as any).electronAPI?.getStudioBridgeStatus?.();
        if (active) setBridgeError(bridge?.error || '');
      } catch {
        if (active) setBridgeError('Не удалось проверить локальный мост Studio.');
      }
    };
    void checkBridge();
    return () => { active = false; };
  }, []);

  async function downloadPlugin() {
    setSaving(true);
    setNotice(null);
    try {
      const result = await (window as any).electronAPI?.saveStudioPlugin?.();
      if (result?.cancelled) return;
      setNotice(result?.ok
        ? { ok: true, message: 'Плагин сохранён. Теперь установи его в Roblox Studio.' }
        : { ok: false, message: result?.error || 'Не удалось сохранить файл плагина.' });
    } catch {
      setNotice({ ok: false, message: 'Приложение не смогло сохранить файл плагина.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box h="100%" overflowY="auto" px={{ base: 5, lg: 9 }} py={7}>
      <Stack maxW="1060px" mx="auto" spacing={6}>
        <Flex as="section" bg="#38231a" border="1px solid" borderColor="#6d4736" borderRadius="24px"
          overflow="hidden" minH="260px" align="stretch" direction={{ base: 'column', md: 'row' }}>
          <Stack flex={1} spacing={4} p={{ base: 6, lg: 9 }} justify="center" align="flex-start">
            <Heading as="h1" size="xl" fontWeight={800} lineHeight={1.1}>Привет, я Мими</Heading>
            <Text maxW="430px" color="discord.muted" lineHeight={1.6}>
              Помогу подключить Roblox Studio, перенести анимации и звуки и проверить, что ID заменились в проекте.
            </Text>
            <Flex gap={3} wrap="wrap">
              <Button colorScheme="brand" leftIcon={<Download size={17} />} isLoading={saving} onClick={downloadPlugin}>
                Скачать плагин
              </Button>
              <Button variant="outline" borderColor="#8d624d" color="discord.text" rightIcon={<ArrowRight size={17} />} onClick={onStart}>
                К переносу
              </Button>
            </Flex>
          </Stack>
          <Box w={{ base: '100%', md: '38%' }} bg="#f8e7da" maxH={{ base: '220px', md: '320px' }}>
            <Image src={guidePortrait} alt="Мими, проводник по приложению" w="100%" h="100%" objectFit="cover" objectPosition="center 38%" />
          </Box>
        </Flex>
        {notice && <Alert status={notice.ok ? 'success' : 'error'} variant="subtle" borderRadius="10px"><AlertIcon />{notice.message}</Alert>}
        {bridgeError && <Alert status="warning" variant="subtle" borderRadius="10px"><AlertIcon />{bridgeError}</Alert>}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {steps.map(({ title, detail }) => (
            <Stack key={title} bg="discord.card" border="1px solid" borderColor="#5d3d2e" borderRadius="16px" p={5} spacing={2}>
              <Heading as="h2" size="sm">{title}</Heading>
              <Text color="discord.muted" fontSize="sm" lineHeight={1.55}>{detail}</Text>
            </Stack>
          ))}
        </SimpleGrid>
        <Box as="section" pb={3}>
          <Heading as="h2" size="sm" mb={2}>Если перенос остановился</Heading>
          <Text fontSize="sm" color="discord.muted">
            <b>401</b> — проверь сессию или API-ключ. <b>403</b> — проверь доступ к ассету. <b>429</b> — Roblox ограничил частоту запросов. Подробности и ID отдельных ассетов есть во вкладке Activity.
          </Text>
        </Box>
      </Stack>
    </Box>
  );
}
