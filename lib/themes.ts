export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
  };
  typography: {
    heading: string;
    body: string;
    baseSize: string;
  };
  layout: {
    hero: 'parallax' | 'centered' | 'split' | 'minimal';
    header: 'classic' | 'transparent' | 'centered';
    grid: 'masonry' | 'standard' | 'loose';
  };
}

export const THEMES: Record<string, ThemeConfig> = {
  default: {
    id: 'default',
    name: "The Spoonbill Classic",
    description: 'The elegant original design with deep blues and crimson accents.',
    palette: {
      primary: '#d62828',
      secondary: '#0A2D4A',
      accent: '#00aa6c',
      background: '#000000',
      foreground: '#ffffff',
      muted: '#a8b5a0'
    },
    typography: {
      heading: 'font-serif',
      body: 'font-sans',
      baseSize: 'base'
    },
    layout: {
      hero: 'parallax',
      header: 'classic',
      grid: 'masonry'
    }
  },
  'fast-food': {
    id: 'fast-food',
    name: 'Energetic Express',
    description: 'High-energy red and yellow palette with bold sans-serif typography.',
    palette: {
      primary: '#e63946',
      secondary: '#f1faee',
      accent: '#ffb703',
      background: '#f1faee',
      foreground: '#1d3557',
      muted: '#a8dadc'
    },
    typography: {
      heading: 'font-sans font-black uppercase',
      body: 'font-sans',
      baseSize: 'lg'
    },
    layout: {
      hero: 'split',
      header: 'classic',
      grid: 'standard'
    }
  },
  indian: {
    id: 'indian',
    name: 'Royal Saffron',
    description: 'Warm earthy tones and elegant serif fonts inspired by Indian heritage.',
    palette: {
      primary: '#f4a261',
      secondary: '#264653',
      accent: '#e76f51',
      background: '#fffcf2',
      foreground: '#252422',
      muted: '#ccc5b9'
    },
    typography: {
      heading: 'font-serif italic',
      body: 'font-serif',
      baseSize: 'base'
    },
    layout: {
      hero: 'centered',
      header: 'centered',
      grid: 'loose'
    }
  },
  swahili: {
    id: 'swahili',
    name: 'Coastal Breeze',
    description: 'Minimalist blue and sand tones reflecting Swahili coastal culture.',
    palette: {
      primary: '#0077b6',
      secondary: '#caf0f8',
      accent: '#fb8500',
      background: '#ffffff',
      foreground: '#023047',
      muted: '#8ecae6'
    },
    typography: {
      heading: 'font-sans tracking-tighter',
      body: 'font-sans font-light',
      baseSize: 'base'
    },
    layout: {
      hero: 'parallax',
      header: 'transparent',
      grid: 'masonry'
    }
  },
  asian: {
    id: 'asian',
    name: 'Zen Harmony',
    description: 'Clean red, black, and wood tones with brush-stroke inspired accents.',
    palette: {
      primary: '#bc4749',
      secondary: '#386641',
      accent: '#a7c957',
      background: '#f2e8cf',
      foreground: '#3d405b',
      muted: '#6a994e'
    },
    typography: {
      heading: 'font-serif font-light',
      body: 'font-sans',
      baseSize: 'base'
    },
    layout: {
      hero: 'minimal',
      header: 'classic',
      grid: 'standard'
    }
  },
  pizza: {
    id: 'pizza',
    name: 'Artisan Hearth',
    description: 'Rustic green, white, and red with heavy slab-serif fonts.',
    palette: {
      primary: '#606c38',
      secondary: '#283618',
      accent: '#bc6c25',
      background: '#fefae0',
      foreground: '#283618',
      muted: '#dda15e'
    },
    typography: {
      heading: 'font-serif font-extrabold',
      body: 'font-sans font-medium',
      baseSize: 'base'
    },
    layout: {
      hero: 'split',
      header: 'classic',
      grid: 'loose'
    }
  },
  "marco-good": {
    id: "marco-good",
    name: "Marco Good",
    description: "Clean and modern design with a focus on simplicity and readability.",
    palette: {
      primary: "#d62828", // Vibrant Red
      secondary: "#fcbf49", // Warm Yellow
      accent: "#003049", // Dark Blue
      background: "#eae2b7", // Light Cream
      foreground: "#001d2d", // Very Dark Blue
      muted: "#a8dadc", // Light Blue/Gray
    },
    typography: {
      heading: "font-worksans", // Modern sans-serif
      body: "font-worksans", // Modern sans-serif
      baseSize: "base",
    },
    layout: {
      hero: "minimal",
      header: "centered",
      grid: "standard",
    },
  }
};

export function getTheme(id: string | null | undefined): ThemeConfig {
  return THEMES[id as string] || THEMES.default;
}
