/**
 * @title Evaluable1Marketplace - Suite de Pruebas
 * @author Mario Harisis Garrido
 * @dev Pruebas de integración para el flujo Delivery vs Payment usando Hardhat y Viem.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("DigitalCoin", async function () {
  async function deployFixture() {
    // Conectar con la red local de Hardhat obteniendo el cliente viem
    const { viem } = await network.connect();

    // Obtener wallets de prueba (signers)
    const [owner, addr1] = await viem.getWalletClients();

    // Deploy del contrato DigitalCoin
    const coin = await viem.deployContract("DigitalCoin", [
      owner.account.address, // initialOwner
    ]);

    // Devolver contrato y cuentas para los tests
    return { coin, owner, addr1 };
  }

  // Comprueba si el constructor hizo lo esperado
  it("tiene supply inicial correcto", async function () {
    // Despliega un contrato nuevo y obtiene el owner
    const { coin, owner } = await deployFixture();

    // Leer totalSupply y balance del owner
    const totalSupply = (await coin.read.totalSupply()) as bigint;
    const balance = (await coin.read.balanceOf([owner.account.address])) as bigint;

    // Verifica que se mintearon 10M tokens y que fueron al owner
    assert.equal(totalSupply, 10_000_000n);
    assert.equal(balance, 10_000_000n);
  });

  // Minteo de tokens
  it("permite al owner mintear tokens dentro del máximo", async function () {
    const { coin, owner, addr1 } = await deployFixture();

    // Minteo de 1_000_000 a addr1
    await coin.write.mint([addr1.account.address, 1_000_000n]);

    const balance = (await coin.read.balanceOf([addr1.account.address])) as bigint;
    const totalSupply = (await coin.read.totalSupply()) as bigint;

    assert.equal(balance, 1_000_000n);
    assert.equal(totalSupply, 11_000_000n); // 10M + 1M
  });

  // Rechazos de transacciones
  it("rechaza mint si supera el MAX_SUPPLY", async function () {
    const { coin, owner } = await deployFixture();

    await assert.rejects(
      coin.write.mint([owner.account.address, 1_000_001n]), // 10M + 1 = 10_000_001
      /Excede el max supply/
    );
  });

  it("rechaza mint si no es el owner", async function () {
    const { coin, addr1 } = await deployFixture();

    await assert.rejects(
      coin.write.mint([addr1.account.address, 1_000n], { account: addr1.account })
    );
  });

  // Quema de tokens
  it("permite quemar tokens", async function () {
    const { coin, owner } = await deployFixture();

    const initialBalance = (await coin.read.balanceOf([owner.account.address])) as bigint;

    // Quemar 1_000_000 tokens
    await coin.write.burn([1_000_000n], { account: owner.account });

    const finalBalance = (await coin.read.balanceOf([owner.account.address])) as bigint;
    const totalSupply = (await coin.read.totalSupply()) as bigint;

    assert.equal(finalBalance, initialBalance - 1_000_000n);
    assert.equal(totalSupply, initialBalance - 1_000_000n);
  });
});
