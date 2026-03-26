import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FinancialAssetModule = buildModule("FinancialAssetModule", (m) => {
  // Le pasamos solo 1 argumento: la cuenta que despliega el contrato
  const asset = m.contract("FinancialAsset", [m.getAccount(0)]);

  return { asset };
});

export default FinancialAssetModule;
