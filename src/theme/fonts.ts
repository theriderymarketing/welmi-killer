import { useFonts } from 'expo-font';

/**
 * Custom fonts — loaded async at root.
 * Instrument Serif: open-source, by Rodrigo Fuenzalida — italic-leaning, editorial feel.
 * Inter: free, by Rasmus Andersson — workhorse sans for UI.
 *
 * Font files are bundled in assets/fonts/. Download and drop them in.
 * See FONTS.md for the exact files to fetch.
 */
export function useAppFonts() {
  return useFonts({
    'InstrumentSerif': require('../../assets/fonts/InstrumentSerif-Regular.ttf'),
    'InstrumentSerif-Italic': require('../../assets/fonts/InstrumentSerif-Italic.ttf'),
    'Inter-400': require('../../assets/fonts/Inter-Regular.ttf'),
    'Inter-500': require('../../assets/fonts/Inter-Medium.ttf'),
    'Inter-600': require('../../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-700': require('../../assets/fonts/Inter-Bold.ttf')
  });
}
