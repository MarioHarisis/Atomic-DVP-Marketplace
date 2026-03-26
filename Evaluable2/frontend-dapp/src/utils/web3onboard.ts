import { init } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";

const injected = injectedModule();

export default init({
  wallets: [injected],
  chains: [
    {
      id: "0xaa36a7", // ID hexadecimal de la red Sepolia (11155111)
      token: "ETH",
      label: "Sepolia Testnet",
      rpcUrl: "https://ethereum-sepolia.publicnode.com", // Nodo público de Sepolia
    },
  ],
  appMetadata: {
    name: "Plataforma de Activos",
    icon: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="#3b82f6"/></svg>', // Un icono básico de ejemplo
    description: "DApp de compraventa de activos tokenizados",
  },
});
