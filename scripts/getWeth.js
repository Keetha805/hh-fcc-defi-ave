const { getNamedAccounts, ethers } = require("hardhat");

const AMOUNT = ethers.utils.parseEther("0.02");
const getWeth = async () => {
  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);

  const iweth = await ethers.getContractAt(
    "IWeth",
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    deployer
  );

  const txn = await iweth.deposit({ value: AMOUNT });
  const receipt = await txn.wait(1);

  const wethBalance = await iweth.balanceOf(deployer);
  console.log("wethBalance: ", wethBalance.toString());
};

module.exports = { getWeth, AMOUNT };
