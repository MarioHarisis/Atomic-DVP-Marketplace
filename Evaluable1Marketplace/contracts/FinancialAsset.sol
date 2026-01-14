// SPDX-License-Identifier: MIT
/**
 * @title Evaluable1Marketplace
 * @author Mario Harisis Garrido
 */
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract FinancialAsset is ERC721, Ownable {
    uint256 private _nextTokenId; // ID incremental de tokens
    mapping(uint256 => string) private _tokenURIs; // Metadata por token

    constructor(
        address initialOwner
    ) ERC721("FinancialAsset", "FA") Ownable(initialOwner) {}

    // funcion para mintear nuevos tokens
    function mint(address to, string memory metadataURI) external onlyOwner {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = metadataURI;
    }

    // Retornar la metadata de un token
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        // Verifica si existe el token
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenURIs[tokenId];
    }

    /// @notice Retorna el siguiente ID disponible
    function nextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }
}
