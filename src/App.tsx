import { RouterProvider } from 'react-router';
import { router } from './routes';

export function App() {
  return (
    <div className="relative min-h-screen bg-[#F8F9FA] text-[#1A1F24]">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
