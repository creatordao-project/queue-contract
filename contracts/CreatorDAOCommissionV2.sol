pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT


import "./RoleControl.sol";


contract CreatorDAOCommissionV2 is RoleControl {

    modifier callNotStarted() {
        require(!callStarted, "callNotStarted");
        callStarted = true;
        _;
        callStarted = false;
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
        onlyOp
    {
        Shop storage shop = shops[_shopId];
        shop.minBid = _newMinBid;
        emit MinBidUpdated(_shopId, _newMinBid);
    }

    function updateTax(uint256 _shopId, uint256 _tax)
        public
        callNotStarted
    {       
        Shop storage shop = shops[_shopId];
        require(shop.owner == _msgSender() || isOp(_msgSender()), "only owner could update tax");
        shop.tax = _tax;
        emit TaxUpdated(_shopId, _tax);
    }

    function updateShopOwner(uint256 _shopId, address payable _newOwner)
        public
    {
        Shop storage shop = shops[_shopId];
        require(shop.owner == _msgSender() || isOp(_msgSender()), "only old owner could set new owner");
        shop.owner = _newOwner;
        emit OwnerUpdated(_shopId, _newOwner);
    }

     function updateAdmin(address payable _newAdmin)
        public
        callNotStarted
        
    {
        require(_msgSender() == admin, "not an admin");
        admin = _newAdmin;
        emit AdminUpdated(_newAdmin);
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
        newCommission.recipient = payable(_msgSender());

        emit NewCommission(
            newCommissionIndex,
            _id,
            _shopId,
            msg.value,
            _msgSender()
        );

        newCommissionIndex++; // for the subsequent commission to be added into the next slot
    }

    function rescindCommission(uint256 _commissionIndex) public callNotStarted {
        Commission storage selectedCommission = commissions[_commissionIndex];
        require(
            _msgSender() == selectedCommission.recipient,
            "Only recipient could rescind"
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
            _msgSender() == selectedCommission.recipient,
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
        callNotStarted
    {
        for (uint256 i = 0; i < _commissionIndexes.length; i++) {
            Commission storage selectedCommission = commissions[
                _commissionIndexes[i]
            ];

            //the queue my not be empty when processing more commissions
            require(
                selectedCommission.status == CommissionStatus.queued,
                "commission not in the queue"
            );

            require(
                _msgSender() == shops[selectedCommission.shopId].owner || isOp(_msgSender()),
                "Only shop owner could accept commission"
            );

            selectedCommission.status = CommissionStatus.accepted; // first, we change the status of the commission to accepted

            emit CommissionProcessed(
                _commissionIndexes[i],
                selectedCommission.status
            );
        }
    }

    function settleCommissions(uint256[] memory _commissionIndexes)
        public
        callNotStarted
    {
        uint256 totalTaxAmount = 0;
        for (uint256 i = 0; i < _commissionIndexes.length; i++) {
            Commission storage selectedCommission = commissions[
                _commissionIndexes[i]
            ];

            //the queue my not be empty when processing more commissions
            require(
                selectedCommission.status == CommissionStatus.accepted,
                "commission not in the queue"
            );
            require(selectedCommission.recipient == _msgSender() || isAdmin(_msgSender()), "only commission owner cloud settle it:)");
            selectedCommission.status = CommissionStatus.finished; // first, we change the status of the commission to accepted

            uint256 taxAmount = (selectedCommission.bid *
                shops[selectedCommission.shopId].tax) / 1000;

            uint256 payAmount = selectedCommission.bid - taxAmount;

            totalTaxAmount = totalTaxAmount + taxAmount;

            (bool success, ) = shops[selectedCommission.shopId].owner.call{
                value: payAmount
            }(""); // next we accept the payment for the commission
            require(success, "Transfer failed.");

            emit CommissionSettled(
                _commissionIndexes[i],
                selectedCommission.status,
                taxAmount,
                payAmount
            );
        }

        (bool success, ) = recipientDao.call{value: totalTaxAmount}("");

        require(success, "Transfer failed.");
    }

    function rescindCommissionByAdmin(uint256 _commissionIndex)
        public
        onlyAdmin
        callNotStarted
    {
        Commission storage selectedCommission = commissions[_commissionIndex];
        require(
            selectedCommission.status == CommissionStatus.accepted,
            "commission not in queue"
        ); // the commission must still be accepted

        // we mark it as removed and return the individual their bid
        selectedCommission.status = CommissionStatus.removed;
        (bool success, ) = selectedCommission.recipient.call{
            value: selectedCommission.bid
        }("");
        require(success, "Transfer failed.");

        emit CommissionRescinded(_commissionIndex, selectedCommission.bid);
    }

    function addShop(
        uint256 _minBid,
        uint256 _tax,
        address _owner
    ) public  onlyOp{
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
        CommissionStatus _status
    );
    event CommissionSettled(
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
    event OwnerUpdated(uint256 _shopId, address _newOwner);
    event TaxUpdated(
        uint256 _shopId,
        uint256 _tax
    );
}
