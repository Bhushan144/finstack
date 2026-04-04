// src/components/layout/AppLayout.jsx
import Sidebar from './Sidebar';
import Navbar  from './Navbar';

const AppLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-zinc-950">

      {/* Left sidebar */}
      <Sidebar />

      {/* Right side — navbar on top, page content below */}
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
};

export default AppLayout;