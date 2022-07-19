// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CreatorDAOCommissionStorage {
    enum CommissionStatus {
        queued,
        accepted,
        removed,
        finished
    }

    struct Shop {
        uint256 minBid;
        uint256 tax; // e.g 50 represent for 5%
        address payable owner;
    }

    struct Commission {
        address payable recipient;
        uint256 shopId;
        uint256 bid;
        CommissionStatus status;
    }

    address payable public admin;
    address payable public recipientDao;

    mapping(uint256 => Commission) public commissions;
    mapping(uint256 => Shop) public shops;

    //uint256public minBid; // the number of wei required to create a commission
    uint256 public newCommissionIndex; // the index of the next commission which should be created in the mapping
    uint256 public newShopIndex;
    bool public callStarted; // ensures no re-entrancy can occur
}