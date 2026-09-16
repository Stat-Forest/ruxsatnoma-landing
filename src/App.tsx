import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import Lenis from 'lenis';
import { I18nProvider } from './i18n';
import { router } from './routes';
import { CustomCursor } from './components/ui/CustomCursor';

export function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 2.0, // Increased duration to make scroll slower and heavier
      // Default Lenis easing is buttery smooth and standard
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0, // Reduced from 1.2 to make scroll ticks move less distance
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <I18nProvider>
      <CustomCursor />
      <div className="relative min-h-screen bg-[#F8F9FA] text-[#1A1F24]">
        <RouterProvider router={router} />
      </div>
    </I18nProvider>
  );
}

export default App;
