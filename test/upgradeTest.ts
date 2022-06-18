import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("TheGmFansStudio", function () {
  it("Should return the new greeting once it's changed", async function () {
    const [admin, dao, artist, usr] = await ethers.getSigners();
    const gmFans_imp = await ethers.getContractFactory("CreatorDAOCommission");
    const gmFans_impv1_1 = await ethers.getContractFactory(
      "CreatorDAOCommissionV1_1"
    );
    const gmFans = await upgrades.deployProxy(gmFans_imp, [
      admin.address,
      dao.address,
    ]);
    await gmFans.deployed();
    console.log("CreatorDAOCommission deployed to:", gmFans.address);
    let adminBalance = await ethers.provider.getBalance(admin.address);

    expect(adminBalance).to.be.gt(ethers.utils.parseEther("1000"));

    expect(await gmFans.newShopIndex()).to.be.equal(1);

    await expect(await gmFans.addShop(1, 50, artist.address))
      .to.emit(gmFans, "NewShop")
      .withArgs("1", "1", "50", artist.address);

    expect(await gmFans.newShopIndex()).to.be.equal(2);
    await expect(await gmFans.addShop(10, 100, artist.address))
      .to.emit(gmFans, "NewShop")
      .withArgs("2", "10", "100", artist.address);
    console.log("add shop");

    await expect(
      gmFans
        .connect(usr)
        .commission("hi", 1, { value: ethers.utils.parseEther("1") })
    )
      .to.emit(gmFans, "NewCommission")
      .withArgs("1", "hi", "1", ethers.utils.parseEther("1"), usr.address);

    await expect(
      gmFans
        .connect(usr)
        .commission("test2", 2, { value: ethers.utils.parseEther("1") })
    )
      .to.emit(gmFans, "NewCommission")
      .withArgs("2", "test2", "2", ethers.utils.parseEther("1"), usr.address);

    console.log(
      "new commission 2",
      await ethers.provider.getBalance(usr.address)
    );

    await expect(
      await gmFans
        .connect(usr)
        .commission("test2", 2, { value: ethers.utils.parseEther("1") })
    ).to.changeEtherBalance(usr, ethers.utils.parseEther("-1"));

    console.log(
      "new commission 3",
      await ethers.provider.getBalance(usr.address)
    );

    await expect(
      gmFans
        .connect(usr)
        .commission("hi", 1, { value: ethers.utils.parseEther("1") })
    )
      .to.emit(gmFans, "NewCommission")
      .withArgs("4", "hi", "1", ethers.utils.parseEther("1"), usr.address);

    // console.log("commission 1 revert");
    await expect(gmFans.connect(artist).processCommissions([1])).to.be.reverted;

    await expect(
      await gmFans.connect(admin).processCommissions([1])
    ).to.changeEtherBalance(artist, ethers.utils.parseEther("0.95"));

    await expect(
      gmFans.connect(admin).processCommissions([1])
    ).to.to.be.revertedWith("commission not in the queue");
    console.log("sucess");

    await expect(
      await gmFans.connect(admin).processCommissions([2])
    ).to.changeEtherBalance(dao, ethers.utils.parseEther("0.1"));

    await expect(
      gmFans.connect(artist).rescindCommission([3])
    ).to.be.revertedWith("commission not yours");

    await expect(
      await gmFans
        .connect(usr)
        .increaseCommissionBid([3], { value: ethers.utils.parseEther("2") })
    )
      .to.emit(gmFans, "CommissionBidUpdated")
      .withArgs(
        "3",
        ethers.utils.parseEther("2"),
        ethers.utils.parseEther("3")
      );

    // await expect(await gmFans.connect(usr).rescindCommission([3])).to.emit(gmFans, 'CommissionRescinded').withArgs('3', ethers.utils.parseEther('3'));

    await expect(
      await gmFans.connect(usr).rescindCommission([3])
    ).to.changeEtherBalance(usr, ethers.utils.parseEther("3"));

    expect((await gmFans.commissions(3)).status).to.eq(2);

    const gmFansv1_1 = await upgrades.upgradeProxy(
      gmFans.address,
      gmFans_impv1_1
    );
    console.log("Box upgraded");

    //add commission
    //await expect(gmFansv1_1.connect(usr).commission('hi', 1, { value:  ethers.utils.parseEther('1')})).to.emit(gmFansv1_1, 'NewCommission').withArgs('4', 'hi', '1', ethers.utils.parseEther('1'), usr.address);

    await expect(
      gmFansv1_1
        .connect(usr)
        .commission("test2", 2, { value: ethers.utils.parseEther("1") })
    )
      .to.emit(gmFansv1_1, "NewCommission")
      .withArgs("5", "test2", "2", ethers.utils.parseEther("1"), usr.address);
    console.log(
      "new commission 2",
      await ethers.provider.getBalance(usr.address)
    );

    await expect(
      await gmFansv1_1
        .connect(usr)
        .commission("test2", 2, { value: ethers.utils.parseEther("1") })
    ).to.changeEtherBalance(usr, ethers.utils.parseEther("-1"));

    console.log("only owner  could accept commission");
    await expect(
      gmFansv1_1.connect(usr).processCommissions([4])
    ).to.be.revertedWith("Only shop owner could accept commission");

    console.log("owner accept commission");
    await expect(gmFansv1_1.connect(artist).processCommissions([4]))
      .to.emit(gmFansv1_1, "CommissionProcessed")
      .withArgs("4", 1);

    // admin settle comission
    await expect(
      await gmFansv1_1.connect(admin).settleCommissions([4])
    ).to.changeEtherBalance(artist, ethers.utils.parseEther("0.95"));

    // settled comission will be set finished
    await expect(
      gmFansv1_1.connect(admin).settleCommissions([4])
    ).to.be.revertedWith("commission not in the queue");

    // await expect(await gmFansv1_1.connect(admin).processCommissions([2])).to.changeEtherBalance(dao, ethers.utils.parseEther('0.1'));

    await expect(
      gmFansv1_1.connect(admin).rescindCommissionByAdmin(5)
    ).to.be.revertedWith("commission not in queue");

    await expect(gmFansv1_1.connect(artist).processCommissions([5]));
    let usrBalanceBefore = await ethers.provider.getBalance(usr.address);

    console.log("only admin could rescind accepted commission");
    await expect(gmFansv1_1.connect(admin).rescindCommissionByAdmin(5))
      .to.emit(gmFansv1_1, "CommissionRescinded")
      .withArgs("5", ethers.utils.parseEther("1"));
    let usrBalanceAfter = await ethers.provider.getBalance(usr.address);
    expect(
      usrBalanceAfter.eq(usrBalanceBefore.add(ethers.utils.parseEther("1")))
    );

    await expect(
      await gmFansv1_1
        .connect(usr)
        .increaseCommissionBid([6], { value: ethers.utils.parseEther("2") })
    )
      .to.emit(gmFansv1_1, "CommissionBidUpdated")
      .withArgs(
        "6",
        ethers.utils.parseEther("2"),
        ethers.utils.parseEther("3")
      );

    // await expect(await gmFansv1_1.connect(usr).rescindCommission([3])).to.emit(gmFansv1_1, 'CommissionRescinded').withArgs('3', ethers.utils.parseEther('3'));

    await expect(
      await gmFansv1_1.connect(usr).rescindCommission([6])
    ).to.changeEtherBalance(usr, ethers.utils.parseEther("3"));

    await expect((await gmFansv1_1.commissions(6)).status).to.eq(2);

    await expect((await gmFansv1_1.commissions(4)).status).to.eq(3);

    await expect(
      gmFans
        .connect(usr)
        .commission("hi", 1, { value: ethers.utils.parseEther("1") })
    )
      .to.emit(gmFans, "NewCommission")
      .withArgs("7", "hi", "1", ethers.utils.parseEther("1"), usr.address);

    await expect(
      gmFans
        .connect(usr)
        .commission("hi", 1, { value: ethers.utils.parseEther("1") })
    )
      .to.emit(gmFans, "NewCommission")
      .withArgs("8", "hi", "1", ethers.utils.parseEther("1"), usr.address);

    console.log("batch process test");
    await expect(gmFansv1_1.connect(artist).processCommissions([7, 8]))
      .to.emit(gmFansv1_1, "CommissionProcessed")
      .withArgs("7", 1);
    await expect((await gmFansv1_1.commissions(7)).status).to.eq(1);
    await expect((await gmFansv1_1.commissions(8)).status).to.eq(1);

    // admin settle comission
    await expect(
      await gmFansv1_1.connect(admin).settleCommissions([7, 8])
    ).to.changeEtherBalance(artist, ethers.utils.parseEther("1.9"));

    await expect((await gmFansv1_1.commissions(7)).status).to.eq(3);
    await expect((await gmFansv1_1.commissions(8)).status).to.eq(3);

    await expect(
      await gmFansv1_1.connect(artist).updateShopOwner(1, admin.address)
    )
      .to.emit(gmFansv1_1, "OwnerUpdated")
      .withArgs("1", admin.address);
  });
});
