import { expect } from "chai";
import { ethers } from "hardhat";

describe("TheGmFansStudio", function () {
  it("Should return the new greeting once it's changed", async function () {

    const [admin, dao, artist, usr] = await ethers.getSigners();
    const theGmFansStudio = await ethers.getContractFactory("TheGmFansStudio");
    const gmFans = await theGmFansStudio.deploy(admin.address, dao.address);
    await gmFans.deployed();
    let adminBalance = await ethers.provider.getBalance(admin.address);

    expect(adminBalance).to.be.gt(ethers.utils.parseEther('1000'));

    expect(await gmFans.newShopIndex()).to.be.equal(1);


    await expect(await gmFans.addShop(1, 50, artist.address)).to.emit(gmFans, 'NewShop').withArgs('1','1', '50', artist.address);

    expect(await gmFans.newShopIndex()).to.be.equal(2);
    await expect(await gmFans.addShop(10, 100, artist.address)).to.emit(gmFans, 'NewShop').withArgs('2','10', '100', artist.address);

    await expect(await gmFans.connect(usr).commission('hi', 1, { value:  ethers.utils.parseEther('1')})).to.emit(gmFans, 'NewCommission').withArgs('1', 'hi', '1', ethers.utils.parseEther('1'), usr.address);

    await expect(await gmFans.connect(usr).commission('test2', 2, { value:  ethers.utils.parseEther('1')})).to.emit(gmFans, 'NewCommission').withArgs('2', 'test2', '2', ethers.utils.parseEther('1'), usr.address);

    await expect(await gmFans.connect(usr).commission('test2', 2, { value:  ethers.utils.parseEther('1')})).to.changeEtherBalance(usr, ethers.utils.parseEther('-1'));
    
    await expect(gmFans.connect(artist).processCommissions([1])).to.be.reverted;
    
    await expect(await gmFans.connect(admin).processCommissions([1])).to.changeEtherBalance(artist, ethers.utils.parseEther('0.95'));

    await expect(gmFans.connect(admin).processCommissions([1])).to.to.be.revertedWith("commission not in the queue");

    await expect(await gmFans.connect(admin).processCommissions([2])).to.changeEtherBalance(dao, ethers.utils.parseEther('0.1'));

    await expect(gmFans.connect(artist).rescindCommission([3])).to.be.revertedWith("commission not yours");

    await expect(await gmFans.connect(usr).increaseCommissionBid([3], { value:  ethers.utils.parseEther('2')})).to.emit(gmFans, 'CommissionBidUpdated').withArgs('3', ethers.utils.parseEther('2'), ethers.utils.parseEther('3'));

    // await expect(await gmFans.connect(usr).rescindCommission([3])).to.emit(gmFans, 'CommissionRescinded').withArgs('3', ethers.utils.parseEther('3'));

    await expect(await gmFans.connect(usr).rescindCommission([3])).to.changeEtherBalance(usr, ethers.utils.parseEther('3'));

    expect((await gmFans.commissions(3)).status).to.eq(2);

  });
});
