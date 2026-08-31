import { RouterProvider } from "react-router-dom";
import { AppProviders } from "@/app/providers/AppProviders";
import { AppInitializer } from "@/components/AppInitializer";
import { AppRouter } from "@/app/router"; // Import the router we just made

const App = () => (
  <AppProviders>
    <AppInitializer>
      {/* React Router v6 provides its own context, so we pass the router object here */}
      <RouterProvider router={AppRouter} />
    </AppInitializer>
  </AppProviders>
);

export default App;
