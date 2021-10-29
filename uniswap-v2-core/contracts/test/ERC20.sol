// SPDX-License-Identifier: MIT
pragma solidity =0.5.16;

import '../NiiFiV1ERC20.sol';

contract ERC20 is NiiFiV1ERC20 {
    constructor(uint _totalSupply) public {
        _mint(msg.sender, _totalSupply);
    }
}
