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

    // Deploy NFT
    const asset = await viem.deployContract("FinancialAsset", [owner.account.address]);

    // Mint NFT al seller con la cuenta del owner
    await asset.write.mint([seller.account.address, "ipfs://asset-1"], {
      account: owner.account,
    });

    // Deploy Marketplace
    const dvp = await viem.deployContract("DVPMarketplace", [
      cbdc.address,
      asset.address,
    ]);

    return { cbdc, asset, dvp, owner, seller, buyer };
  }
  // Venta de un NFT a cambio de CBDC
  it("permite vender un NFT a cambio de CBDC", async function () {
    const { cbdc, asset, dvp, seller, buyer } = await deployFixture();

    // Transferir CBDC al buyer
    await cbdc.write.transfer([buyer.account.address, 1_000n]);

    // Seller aprueba Marketplace para transferir su NFT
    await asset.write.setApprovalForAll([dvp.address, true], { account: seller.account });

    // Buyer aprueba Marketplace para gastar su CBDC
    await cbdc.write.approve([dvp.address, 1_000n], { account: buyer.account });

    // Ejecutar trade
    await dvp.write.trade([seller.account.address, buyer.account.address, 0n, 1_000n], {
      account: buyer.account,
    });

    // Verificar propietario NFT
    const newOwner = (await asset.read.ownerOf([0n])) as string;
    assert.equal(getAddress(newOwner), getAddress(buyer.account.address));

    // Verificar balances CBDC
    const sellerBalance = await cbdc.read.balanceOf([seller.account.address]);
    const buyerBalance = await cbdc.read.balanceOf([buyer.account.address]);
    assert.equal(sellerBalance, 1_000n);
    assert.equal(buyerBalance, 0n);
  });

  // Rechazos de transacciones
  it("rechaza trade si buyer no tiene suficiente CBDC", async function () {
    const { dvp, buyer, seller } = await deployFixture();

    await assert.rejects(
      dvp.write.trade([seller.account.address, buyer.account.address, 0n, 1_000n], {
        account: buyer.account,
      })
    );
  });

  it("rechaza trade si seller no es propietario del NFT", async function () {
    const { dvp, buyer, seller } = await deployFixture();

    await assert.rejects(
      dvp.write.trade([buyer.account.address, buyer.account.address, 0n, 1_000n], {
        account: buyer.account,
      })
    );
  });

  it("rechaza trade si buyer no aprueba CBDC", async function () {
    const { dvp, buyer, seller, asset } = await deployFixture();

    // Seller aprueba NFT
    await asset.write.approve([dvp.address, 0n], { account: seller.account });

    await assert.rejects(
      dvp.write.trade([seller.account.address, buyer.account.address, 0n, 1_000n], {
        account: buyer.account,
      })
    );
  });

  it("rechaza trade si seller no aprueba NFT", async function () {
    const { dvp, buyer, seller } = await deployFixture();

    // Buyer aprueba CBDC
    // Aquí se omite a propósito approval del NFT
    await assert.rejects(
      dvp.write.trade([seller.account.address, buyer.account.address, 0n, 1_000n], {
        account: buyer.account,
      })
    );
  });
});
