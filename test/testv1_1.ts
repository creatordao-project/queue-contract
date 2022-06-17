import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("CreatorDAOCommissionV1_1 test", function () {
  it("Should return the new greeting once it's changed", async function () {
    const [admin, dao, artist, usr] = await ethers.getSigners();
    // const theGmFansStudio = await ethers.getContractFactory("CreatorDAOCommission");
    // const beacon = await upgrades.deployBeacon(theGmFansStudio);
    // const instance = await upgrades.deployBeaconProxy(beacon, theGmFansStudio, [admin.address, dao.address]);
    const gmFans_imp = await ethers.getContractFactory(
      "CreatorDAOCommissionV1_1"
    );
    const gmFans = await upgrades.deployProxy(gmFans_imp, [
      admin.address,
      admin.address,
    ]);
    await gmFans.deployed();
    console.log("CreatorDAOCommission deployed to:", gmFans.address);

    let adminBalance = await ethers.provider.getBalance(admin.address);
    expect(adminBalance).to.be.gt(ethers.utils.parseEther("1000"));

    expect(await gmFans.newShopIndex()).to.be.equal(1);

    //add shop
    await expect(await gmFans.addShop(1, 50, artist.address))
      .to.emit(gmFans, "NewShop")
      .withArgs("1", "1", "50", artist.address);

    expect(await gmFans.newShopIndex()).to.be.equal(2);
    await expect(await gmFans.addShop(10, 100, artist.address))
      .to.emit(gmFans, "NewShop")
      .withArgs("2", "10", "100", artist.address);
    console.log("add shop");

    //add commission
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

    console.log("only owner  could accept commission");
    await expect(
      gmFans.connect(usr).processCommissions([1])
    ).to.be.revertedWith("Only shop owner could accept commission");

    console.log("owner accept commission");
    await expect(gmFans.connect(artist).processCommissions([1]))
      .to.emit(gmFans, "CommissionProcessed")
      .withArgs("1", 1);

    // admin settle comission
    await expect(
      await gmFans.connect(admin).settleCommissions([1])
    ).to.changeEtherBalance(artist, ethers.utils.parseEther("0.95"));

    // settled comission will be set finished
    await expect(
      gmFans.connect(admin).settleCommissions([1])
    ).to.be.revertedWith("commission not in the queue");

    // await expect(await gmFans.connect(admin).processCommissions([2])).to.changeEtherBalance(dao, ethers.utils.parseEther('0.1'));

    await expect(
      gmFans.connect(admin).rescindCommissionByAdmin(2)
    ).to.be.revertedWith("commission not in queue");

    await expect(gmFans.connect(artist).processCommissions([2]));
    let usrBalanceBefore = await ethers.provider.getBalance(usr.address);

    console.log("only admin could rescind accepted commission");
    await expect(gmFans.connect(admin).rescindCommissionByAdmin(2))
      .to.emit(gmFans, "CommissionRescinded")
      .withArgs("2", ethers.utils.parseEther("1"));
    let usrBalanceAfter = await ethers.provider.getBalance(usr.address);
    expect(
      usrBalanceAfter.eq(usrBalanceBefore.add(ethers.utils.parseEther("1")))
    );

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

    await expect((await gmFans.commissions(3)).status).to.eq(2);

    await expect(await gmFans.connect(artist).updateShopOwner(1, admin.address))
      .to.emit(gmFans, "OwnerUpdated")
      .withArgs("1", admin.address);

    // await expect(await gmFans.shops(1));
  });
});
