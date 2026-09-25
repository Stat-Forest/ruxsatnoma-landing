import { RouterProvider } from 'react-router';
import { I18nProvider } from './i18n';
import { router } from './routes';
import { CustomCursor } from './components/ui/CustomCursor';

export function App() {
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
