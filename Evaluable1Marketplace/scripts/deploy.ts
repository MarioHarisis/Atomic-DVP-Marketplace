import hre from "hardhat";

async function main() {
  // Accedemos a viem a través del objeto hre (Hardhat Runtime Environment)
  const viem = (hre as any).viem;

  const walletClients = await viem.getWalletClients();
  const deployer = walletClients[0];

  console.log("Desplegando con la cuenta:", deployer.account.address);

  // Desplegar DigitalCoin
  const digitalCoin = await viem.deployContract("DigitalCoin", [
    deployer.account.address,
  ]);

  console.log("--------------------------------------------------");
  console.log("DigitalCoin Address:", digitalCoin.address);
  console.log("--------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
