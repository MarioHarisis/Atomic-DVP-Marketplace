/**
 * @title Evaluable1Marketplace - Suite de Pruebas
 * @author Mario Harisis Garrido
 * @dev Pruebas de integración para el flujo Delivery vs Payment usando Hardhat y Viem.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAddress } from "viem";
import { network } from "hardhat";

describe("DVPMarketplace", async function () {
  async function deployFixture() {
    const { viem } = await network.connect();

    const [owner, seller, buyer] = await viem.getWalletClients();

    // Deploy CBDC
    const cbdc = await viem.deployContract("DigitalCoin", [owner.account.address]);

    // Transferir CBDC a buyer
    await cbdc.write.transfer([buyer.account.address, 1_000_000n]);

    // Deploy NFT
    const asset = await viem.deployContract("FinancialAsset", [owner.account.address]);

    // Mint NFT al seller
    await asset.write.mint([seller.account.address, "ipfs://asset-1"]);

    // Deploy marketplace
    const dvp = await viem.deployContract("DVPMarketplace", [
      cbdc.address,
      asset.address,
    ]);

    return { cbdc, asset, dvp, owner, seller, buyer };
  }

  it("permite hacer un trade correctamente", async function () {
    const { cbdc, asset, dvp, seller, buyer } = await deployFixture();

    // Seller autoriza al Marketplace para mover su NFT
    await asset.write.approve([dvp.address, 0n], { account: seller.account });

    // Buyer aprueba al marketplace
    await cbdc.write.approve([dvp.address, 1_000n], { account: buyer.account });

    // Trade
    await dvp.write.trade([seller.account.address, buyer.account.address, 0n, 1_000n], {
      account: buyer.account,
    });

    // Verificar ownership del NFT
    const newOwner = (await asset.read.ownerOf([0n])) as string;
    assert.equal(getAddress(newOwner), getAddress(buyer.account.address));

    // Verificar balances CBDC
    const sellerBalance = (await cbdc.read.balanceOf([seller.account.address])) as bigint;
    assert.equal(sellerBalance, 1_000n);

    const buyerBalance = (await cbdc.read.balanceOf([buyer.account.address])) as bigint;
    assert.equal(buyerBalance, 999_000n); // 1_000_000 - 1_000
  });

  // Rechazos de transacciones
  it("rechaza trade si buyer no aprueba CBDC", async function () {
    const { dvp, seller, buyer } = await deployFixture();

    await assert.rejects(
      dvp.write.trade([seller.account.address, buyer.account.address, 0n, 1_000n])
    );
  });

  it("rechaza trade si seller no es owner", async function () {
    const { cbdc, dvp, buyer } = await deployFixture();

    // Buyer aprueba al marketplace
    await cbdc.write.approve([dvp.address, 1_000n], { account: buyer.account });

    // Intentar trade con seller incorrecto
    await assert.rejects(
      dvp.write.trade([buyer.account.address, buyer.account.address, 0n, 1_000n])
    );
  });

  it("rechaza trade si buyer no tiene suficiente CBDC", async function () {
    const { cbdc, asset, dvp, seller, buyer } = await deployFixture();

    // Buyer aprueba al marketplace
    await cbdc.write.approve([dvp.address, 2_000n], { account: buyer.account });

    // Intentar trade con precio mayor al balance del buyer
    await assert.rejects(
      dvp.write.trade([seller.account.address, buyer.account.address, 0n, 2_000n])
    );
  });
});
