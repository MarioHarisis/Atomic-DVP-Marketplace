// SPDX-License-Identifier: MIT
/**
 * @title Evaluable1Marketplace
 * @author Mario Harisis Garrido
 */
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract DVPMarketplace {
    IERC20 public immutable cbdc;
    IERC721 public immutable asset;

    constructor(address _cbdc, address _asset) {
        cbdc = IERC20(_cbdc);
        asset = IERC721(_asset);
    }

    /**
     * @notice Compra-venta atómica Delivery vs Payment
     */
    function trade(
        address seller,
        address buyer,
        uint256 tokenId,
        uint256 price
    ) external {
        // Validar ownership
        require(asset.ownerOf(tokenId) == seller, "Seller not owner");

        // Validar que el Marketplace tiene permiso para el NFT
        require(
            asset.getApproved(tokenId) == address(this) ||
                asset.isApprovedForAll(seller, address(this)),
            "Marketplace no tiene permiso sobre el NFT"
        );

        // Transferir CBDC (Dinero del comprador al vendedor)
        require(
            cbdc.transferFrom(buyer, seller, price),
            "CBDC transfer failed"
        );

        // Transferir NFT (Del vendedor al comprador)
        asset.safeTransferFrom(seller, buyer, tokenId);
    }
}
