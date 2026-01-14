/**
 * @title Evaluable1Marketplace - Suite de Pruebas
 * @author Mario Harisis Garrido
 * @dev Pruebas de integración para el flujo Delivery vs Payment usando Hardhat y Viem.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAddress } from "viem";
import { network } from "hardhat";

describe("FinancialAsset", async function () {
  async function deployFixture() {
    // Conexión a la red Hardhat
    const { viem } = await network.connect();

    // Cliente de solo lectura
    const publicClient = await viem.getPublicClient();

    // Wallets (signers)
    const [owner, addr1] = await viem.getWalletClients();

    // Deploy del contrato
    const asset = await viem.deployContract("FinancialAsset", [
      owner.account.address, // initialOwner
    ]);

    return { asset, owner, addr1, publicClient };
  }

  // Mint de token por el propietario
  it("permite al propietario mintear un token", async function () {
    const { asset, owner, publicClient } = await deployFixture();

    await asset.write.mint([owner.account.address, "ipfs://Qm123"]);

    const nextId = await asset.read.nextTokenId();
    assert.equal(nextId, 1n);

    const uri = await asset.read.tokenURI([0n]);
    assert.equal(uri, "ipfs://Qm123");

    const ownerOf = (await asset.read.ownerOf([0n])) as string;
    assert.equal(getAddress(ownerOf), getAddress(owner.account.address));
  });

  it("rechaza mint si no es el owner", async function () {
    const { asset, addr1 } = await deployFixture();

    await assert.rejects(
      asset.write.mint([addr1.account.address, "ipfs://Qm456"], {
        account: addr1.account,
      })
    );
  });

  it("tokenURI falla si el token no existe", async function () {
    const { asset } = await deployFixture();

    await assert.rejects(asset.read.tokenURI([999n]));
  });
});
