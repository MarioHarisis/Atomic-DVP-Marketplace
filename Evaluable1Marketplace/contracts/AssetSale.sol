// SPDX-License-Identifier: MIT
/**
 * @title Evaluable1Marketplace
 * @author Mario Harisis Garrido
 */
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract AssetSale is Ownable {
    // Referencias a los contratos de CBDC y activos
    IERC20 public immutable cbdc;
    IERC721 public immutable asset;

    // precio por tokenId
    mapping(uint256 => uint256) public prices;

    // Eventos
    event AssetListed(uint256 indexed tokenId, uint256 price);
    event AssetSold(
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 price
    );

    constructor(
        address initialOwner,
        address cbdcAddress,
        address assetAddress
    ) Ownable(initialOwner) {
        cbdc = IERC20(cbdcAddress);
        asset = IERC721(assetAddress);
    }

    /**
     * @notice Lista un activo para su venta
     * @dev El NFT debe estar previamente transferido al contrato
     */
    function listAsset(uint256 tokenId, uint256 price) external onlyOwner {
        require(price > 0, "Precio invalido");
        require(
            asset.ownerOf(tokenId) == address(this),
            "El contrato no posee el NFT"
        );

        prices[tokenId] = price;
        emit AssetListed(tokenId, price);
    }

    // Compra un activo pagando con CBDC
    function buy(uint256 tokenId) external {
        uint256 price = prices[tokenId];
        require(price > 0, "Activo no en venta");

        // Cobro en CBDC
        require(cbdc.transferFrom(msg.sender, owner(), price), "Pago fallido");

        // Transferencia del NFT
        asset.safeTransferFrom(address(this), msg.sender, tokenId);

        delete prices[tokenId];

        emit AssetSold(tokenId, msg.sender, price);
    }
}
