import { RouterProvider } from 'react-router';
import { I18nProvider } from './i18n';
import { router } from './routes';

export function App() {
  return (
    <I18nProvider>
      <div className="relative min-h-screen bg-[#F8F9FA] text-[#1A1F24]">
        <RouterProvider router={router} />
      </div>
    </I18nProvider>
  );
}

export default App;
