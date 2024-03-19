import "./App.css";
import { Header } from "./components/header.tsx";
import { Production } from "./components/production.tsx";
import { DeviceSelector } from "./components/device-select.tsx";

const App = () => {
  return (
    <>
      <Header />
      <DeviceSelector />
      <Production />
    </>
  );
};

export default App;
