pragma solidity ^0.8.2;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract CreatorDAOCommission is Initializable {
    enum CommissionStatus {
        queued,
        accepted,
        removed
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
    bool private callStarted; // ensures no re-entrancy can occur

    modifier callNotStarted() {
        require(!callStarted, "callNotStarted");
        callStarted = true;
        _;
        callStarted = false;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "not an admin");
        _;
    }

    function initialize(address payable _admin, address payable _recipientDao)
        public
        initializer
    {
        admin = _admin;
        recipientDao = _recipientDao;
        newCommissionIndex = 1;
        newShopIndex = 1;
    }

    function updateAdmin(address payable _newAdmin)
        public
        callNotStarted
        onlyAdmin
    {
        admin = _newAdmin;
        emit AdminUpdated(_newAdmin);
    }

    function updateTaxRecipient(address payable _newRecipientDao)
        public
        callNotStarted
        onlyAdmin
    {
        recipientDao = _newRecipientDao;
    }

    function updateMinBid(uint256 _shopId, uint256 _newMinBid)
        public
        callNotStarted
        onlyAdmin
    {
        Shop storage shop = shops[_shopId];
        shop.minBid = _newMinBid;
        emit MinBidUpdated(_shopId, _newMinBid);
    }

    function commission(string memory _id, uint256 _shopId)
        public
        payable
        callNotStarted
    {
        Shop memory shop = shops[_shopId];
        require(shop.minBid != 0, "undefined shopId");
        require(msg.value >= shop.minBid, "bid below minimum"); // must send the proper amount of into the bid

        // Next, initialize the new commission
        Commission storage newCommission = commissions[newCommissionIndex];
        newCommission.shopId = _shopId;
        newCommission.bid = msg.value;
        newCommission.status = CommissionStatus.queued;
        newCommission.recipient = payable(msg.sender);

        emit NewCommission(
            newCommissionIndex,
            _id,
            _shopId,
            msg.value,
            msg.sender
        );

        newCommissionIndex++; // for the subsequent commission to be added into the next slot
    }

    function rescindCommission(uint256 _commissionIndex) public callNotStarted {
        Commission storage selectedCommission = commissions[_commissionIndex];
        require(
            msg.sender == selectedCommission.recipient,
            "commission not yours"
        ); // may only be performed by the person who commissioned it
        require(
            selectedCommission.status == CommissionStatus.queued,
            "commission not in queue"
        ); // the commission must still be queued

        // we mark it as removed and return the individual their bid
        selectedCommission.status = CommissionStatus.removed;
        (bool success, ) = selectedCommission.recipient.call{
            value: selectedCommission.bid
        }("");
        require(success, "Transfer failed.");

        emit CommissionRescinded(_commissionIndex, selectedCommission.bid);
    }

    function increaseCommissionBid(uint256 _commissionIndex)
        public
        payable
        callNotStarted
    {
        Commission storage selectedCommission = commissions[_commissionIndex];
        require(
            msg.sender == selectedCommission.recipient,
            "commission not yours"
        ); // may only be performed by the person who commissioned it
        require(
            selectedCommission.status == CommissionStatus.queued,
            "commission not in queue"
        ); // the commission must still be queued

        // then we update the commission's bid
        selectedCommission.bid = selectedCommission.bid + msg.value;

        emit CommissionBidUpdated(
            _commissionIndex,
            msg.value,
            selectedCommission.bid
        );
    }

    function processCommissions(uint256[] memory _commissionIndexes)
        public
        onlyAdmin
        callNotStarted
    {
        uint256 totalTaxAmount = 0;
        for (uint256 i = 0; i < _commissionIndexes.length; i++) {
            Commission storage selectedCommission = commissions[
                _commissionIndexes[i]
            ];

            //the queue my not be empty when processing more commissions
            require(
                selectedCommission.status == CommissionStatus.queued,
                "commission not in the queue"
            );

            selectedCommission.status = CommissionStatus.accepted; // first, we change the status of the commission to accepted

            uint256 taxAmount = (selectedCommission.bid *
                shops[selectedCommission.shopId].tax) / 1000;

            uint256 payAmount = selectedCommission.bid - taxAmount;

            totalTaxAmount = totalTaxAmount + taxAmount;

            (bool success, ) = shops[selectedCommission.shopId].owner.call{
                value: payAmount
            }(""); // next we accept the payment for the commission
            require(success, "Transfer failed.");

            emit CommissionProcessed(
                _commissionIndexes[i],
                selectedCommission.status,
                taxAmount,
                payAmount
            );
        }

        (bool success, ) = recipientDao.call{value: totalTaxAmount}("");

        require(success, "Transfer failed.");
    }

    function addShop(
        uint256 _minBid,
        uint256 _tax,
        address _owner
    ) public onlyAdmin {
        require(_minBid != 0, "minBid must not zero");
        require(_tax < 1000, "tax too high");
        Shop storage shop = shops[newShopIndex];
        shop.minBid = _minBid;
        shop.tax = _tax;
        shop.owner = payable(_owner);

        emit NewShop(newShopIndex, _minBid, _tax, _owner);
        newShopIndex++;
    }

    event AdminUpdated(address _newAdmin);
    event MinBidUpdated(uint256 _shopId, uint256 _newMinBid);
    event NewCommission(
        uint256 _commissionIndex,
        string _id,
        uint256 _shopId,
        uint256 _bid,
        address _recipient
    );
    event CommissionBidUpdated(
        uint256 _commissionIndex,
        uint256 _addedBid,
        uint256 _newBid
    );
    event CommissionRescinded(uint256 _commissionIndex, uint256 _bid);
    event CommissionProcessed(
        uint256 _commissionIndex,
        CommissionStatus _status,
        uint256 taxAmount,
        uint256 payAmount
    );
    event NewShop(
        uint256 _newShopIndex,
        uint256 _minBid,
        uint256 _tax,
        address owner
    );
}
