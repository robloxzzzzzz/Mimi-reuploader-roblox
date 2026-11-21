import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/app.css';

// Mimi Reuploader colors
function getContrastColor(hex: string) {
  const hexCode = hex.replace('#', '');
  const r = parseInt(hexCode.substr(0, 2), 16);
  const g = parseInt(hexCode.substr(2, 2), 16);
  const b = parseInt(hexCode.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1d120e' : '#ffffff';
}

function getBaseTheme(accentHex: string) {
  const contrastText = getContrastColor(accentHex);
  return extendTheme({
    config: {
      initialColorMode: 'dark',
      useSystemColorMode: false,
    },
    colors: {
      brand: {
        50: `${accentHex}10`,
        100: `${accentHex}20`,
        200: `${accentHex}40`,
        300: `${accentHex}60`,
        400: `${accentHex}80`,
        500: accentHex,
        600: accentHex, // darken later if needed
        700: `${accentHex}e0`,
        800: `${accentHex}c0`,
        900: `${accentHex}a0`,
        contrast: contrastText,
      },
      discord: {
        text: '#fff9f5',
        muted: '#e6cbb9',
        darkMuted: '#c8a895',
        border: '#38241c',
        card: '#38241c',
        input: '#291912',
        inputDark: '#1d120e',
        background: '#261711',
        sidebar: '#1d120e',
        topbar: '#1d120e',
      }
    },
    fonts: {
      heading: '"Segoe UI Variable", "Segoe UI", Arial, sans-serif',
      body: '"Segoe UI Variable", "Segoe UI", Arial, sans-serif',
    },
    styles: {
      global: {
        body: {
          bg: 'discord.background',
          color: 'discord.text',
        },
        'button, input, textarea, select, .chakra-switch__track': {
          transition: 'all 0.2s ease-in-out',
        }
      },
    },
    components: {
      Button: {
        baseStyle: {
          fontWeight: 500,
          borderRadius: '4px',
        },
        variants: {
          solid: (props: any) => {
            if (props.colorScheme === 'brand') {
              return {
                bg: 'brand.500',
                color: 'brand.contrast',
                _hover: { bg: 'brand.600', _disabled: { bg: 'brand.500' } },
                _active: { bg: 'brand.700' }
              };
            }
            return {};
          }
        }
      },
      Badge: {
        baseStyle: {
          color: 'brand.contrast'
        }
      }
    },
  });
}

function DynamicThemeProvider({ children }: { children: React.ReactNode }) {
  const [accentColor, setAccentColor] = useState('#dbad8d');

  useEffect(() => {
    async function fetchColor() {
      try {
        const secrets = await (window as any).electronAPI?.loadProfileSecrets?.();
        if (secrets && secrets.activeProfileId && secrets.profiles) {
          const p = secrets.profiles[secrets.activeProfileId];
          if (p && p.colorR !== undefined && p.colorG !== undefined && p.colorB !== undefined) {
            const hex = '#' + [p.colorR, p.colorG, p.colorB].map((x: number) => x.toString(16).padStart(2, '0')).join('');
            setAccentColor(hex.toLowerCase() === '#10b981' ? '#dbad8d' : hex);
          }
        }
      } catch (e) {
        console.error('Failed to load accent color', e);
      }
    }
    
    fetchColor();
    window.addEventListener('profile-changed', fetchColor);
    
    const handlePreview = (e: any) => setAccentColor(e.detail.hex);
    window.addEventListener('preview-color-changed', handlePreview);

    return () => {
      window.removeEventListener('profile-changed', fetchColor);
      window.removeEventListener('preview-color-changed', handlePreview);
    };
  }, []);

  const theme = React.useMemo(() => getBaseTheme(accentColor), [accentColor]);

  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DynamicThemeProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </DynamicThemeProvider>
  </React.StrictMode>
);
