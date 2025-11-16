import { Outlet } from "react-router-dom";
import { ToastContainer } from "@/components/ui/toast";

function App() {
  return (
    <>
      <Outlet />
      <ToastContainer />
    </>
  );
}

export default App;
