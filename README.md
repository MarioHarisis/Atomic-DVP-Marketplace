# Proyecto Blockchain: Tokenización de Activos y CBDC Simulada

## 1. Descripción del proyecto

Este proyecto implementa un sistema básico de tokenización de activos financieros utilizando **Solidity**,**Hardhat** y test en **TypeSccript**.  
Se modelizan dos tipos de tokens:

1. **DigitalCoin (CBDC simulada)**

   - Token **fungible** basado en **ERC20 + ERC20Burnable + Ownable**.
   - Representa la moneda digital de la plataforma, utilizada para comprar activos financieros tokenizados.
   - Tiene **supply máximo** y puede ser minteado solo por el owner.

2. **FinancialAsset**

   - Token **no fungible (NFT)** basado en **ERC721**.
   - Cada NFT representa un activo financiero tokenizado del fondo de inversión.
   - Puede ser minteado solo por el owner del contrato.

3. **AssetSale**

   - Permite a los inversores **comprar NFTs directamente del contrato** utilizando la CBDC.
   - Incluye lógica de **listado de activos y precios**.
   - Controla que solo el owner pueda listar los activos y que se pague la cantidad correcta de CBDC.

4. **DVPMarketplace**
   - Implementa **Delivery vs Payment (DVP)** entre inversores.
   - Permite a un inversor vender un NFT a otro a cambio de CBDC de forma atómica.
   - Valida ownership, aprobaciones y balances antes de transferir NFT y CBDC.

---

## 2. Decisiones de diseño

- **ERC20 + ERC20Burnable + Ownable** para el token CBDC:

  - Permite controlar minteo por el owner y quemar tokens si es necesario.

- **ERC721** para los activos financieros:

  - Cada activo es único, ideal para representar inversiones tokenizadas.

- **AssetSale y DVPMarketplace** separados:

  - AssetSale: adquisición inicial desde el fondo.
  - DVPMarketplace: compraventa entre inversores (DVP).

- Uso de **viem + node:test** para los tests en TypeScript:
  - Evita dependencias externas como Mocha/Chai.
  - Compatible con Hardhat y tests nativos de Node 18+.

---

## 3. Estructura del proyecto

contracts/
DigitalCoin.sol
FinancialAsset.sol
AssetSale.sol
DVPMarketplace.sol

test/
DigitalCoin.ts
FinancialAsset.ts
AssetSale.ts
DVPMarketplace.ts

hardhat.config.ts
package.json
README.md

## 4 Compilar y hacer tests

- npm install
- npx hardhat compile
- npx hardhat test

Todos los tests están implementados en TypeScript usando viem y cubren:

- Supply inicial y minteo del token CBDC.
- Mint y propiedades de FinancialAsset.
- Compra inicial de NFTs con CBDC (AssetSale).
- Compras y ventas entre inversores (DVPMarketplace).
- Rechazos de operaciones incorrectas (sin aprobación, sin saldo, owner incorrecto, activos no listados).

## 5 Flujo de uso principal

1. Compra inicial (AssetSale)

El owner mintea NFTs al contrato FinancialAsset.
Los NFTs se transfieren al contrato AssetSale.
Los inversores pagan la cantidad de CBDC indicada para adquirir el NFT.
El contrato transfiere el NFT al inversor y la CBDC al owner.

2. Compraventa entre inversores (DVPMarketplace)

Un inversor aprueba al marketplace para gastar su CBDC.
El seller y buyer acuerdan un precio.
El marketplace transfiere la CBDC del buyer al seller.
El marketplace transfiere el NFT del seller al buyer.

## 6 Funcionalidad de tests

1. DigitalCoin.ts: supply inicial, minteo, quemado, control de owner.

2. FinancialAsset.ts: mint, owner, tokenURI, errores de acceso.

3. AssetSale.ts: listado de activos, compra inicial, errores por falta de approval o activos no listados.

4. DVPMarketplace.ts: trade exitoso, rechazos por ownership, falta de aprobación o saldo insuficiente.

## 7. Notas finales

- Todos los contratos son **compatibles con Solidity 0.8.27+**, usando prácticas modernas de seguridad y gas efficiency.

- Los tests utilizan **TypeScript** y el framework nativo de Node 18+.

- Los contratos están diseñados para ser **extendibles**: se podrían añadir múltiples activos, subastas, o diferentes tipos de tokens CBDC o NFT sin alterar la arquitectura principal.

- Se ha priorizado la **claridad en la separación de responsabilidades**: cada contrato tiene un rol único y bien definido, facilitando mantenimiento y auditoría.

- El proyecto incluye **tests completos** que cubren tanto escenarios exitosos como errores de acceso, saldo insuficiente, y aprobaciones faltantes.

- Los ejemplos de uso reflejan **flujos reales de adquisición inicial y compraventa entre inversores**, permitiendo una rápida comprensión de cómo interactuar con los contratos desde un frontend o scripts de automatización.

- La elección de **viem** para la interacción en tests facilita un control preciso sobre cuentas, transacciones y lectura de blockchain, acercándose a un entorno de producción sin depender de frameworks adicionales.
