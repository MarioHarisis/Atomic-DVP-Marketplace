import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DigitalCoinModule", (m) => {
  // El nombre "DigitalCoin" debe ser igual al de tu contrato .sol
  // El segundo parámetro [] son los argumentos del constructor
  const digitalCoin = m.contract("DigitalCoin", [m.getAccount(0)]);

  return { digitalCoin };
});
