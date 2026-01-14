// SPDX-License-Identifier: MIT
/**
 * @title Evaluable1Marketplace
 * @author Mario Harisis Garrido
 */
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract DigitalCoin is ERC20, ERC20Burnable, Ownable {
    // cantidad total máxima de tokens que podrían existir (10M)
    uint256 constant MAX_SUPPLY = 11000000;

    // prettier-ignore
    constructor(address initialOwner) ERC20("DigitalCoin", "DGC") Ownable(initialOwner) {
        mint(msg.sender, 10000000);
    }

    // minteo de tokens
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Excede el max supply");
        _mint(to, amount);
    }
}
