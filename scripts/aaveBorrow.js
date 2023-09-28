const { getNamedAccounts, ethers, network } = require("hardhat");
const { getWeth, AMOUNT } = require("./getWeth");
const { networkConfig } = require("../helper-hardhat-config");
const chainId = network.config.chainId;

async function main() {
  await getWeth();
  const { deployer } = await getNamedAccounts();
  const lendingPool = await lendingPoolAddress(deployer);
  const wethAddress = networkConfig[chainId].wethToken;
  // approving
  await approveERC20(wethAddress, lendingPool.address, AMOUNT, deployer);
  //depositing
  console.log("Depositing...");
  await lendingPool.deposit(wethAddress, AMOUNT, deployer, 0);
  console.log("Deposited!");
  //borrow
  //Borrow Data
  let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
    lendingPool,
    deployer
  );
  //  ETH conversions
  const daiAddress = networkConfig[chainId].daiToken;
  const daiPriceFeed = networkConfig[chainId].daiEthPriceFeed;
  const daiPrice = await getDAIPrice(daiPriceFeed);
  const amountDai = (
    availableBorrowsETH.toString() *
    0.95 *
    (1 / daiPrice.toNumber())
  ).toString(); // dai conversions
  console.log("amountDai: ", amountDai);
  const DaiWeiToBorrow = ethers.utils.parseEther(amountDai);

  await borrowDai(daiAddress, lendingPool, DaiWeiToBorrow, deployer);
  await getBorrowUserData(lendingPool, deployer);

  await replay(daiAddress, lendingPool, DaiWeiToBorrow, deployer);
  await getBorrowUserData(lendingPool, deployer);
}

// function repay(
//   address asset,
//   uint256 amount,
//   uint256 rateMode,
//   address onBehalfOf
async function repay(asset, lendingPool, amount, acc) {
  console.log("Repaying...");
  await approveERC20(asset, lendingPool.address, amount, acc);
  const tx = await lendingPool.repay(asset, amount, 1, acc);
  await tx.wait(1);
  console.log("Repayed!");
}

// address asset,
// uint256 amount,
// uint256 interestRateMode, -> stable = 1 / variable = 2
// uint16 referralCode,
// address onBehalfOf

const borrowDai = async (daiAddress, lendingPool, amount, acc) => {
  console.log("Borrowing...");
  const borrowTx = await lendingPool.borrow(daiAddress, amount, 1, 0, acc);
  await borrowTx.wait(1);
  console.log("Borrowed!");
};

const getDAIPrice = async (daiAddress) => {
  IAggregator = await ethers.getContractAt(
    "AggregatorV3Interface",
    daiAddress
    // no signer needed cuz we are not making any transactions
  );
  const price = (await IAggregator.latestRoundData())[1];
  console.log("price: ", price.toString());
  return price;
};

const getBorrowUserData = async (lendingPool, acc) => {
  const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
    await lendingPool.getUserAccountData(acc);
  console.log("totalDebtETH: ", totalDebtETH.toString());
  console.log("availableBorrowsETH: ", availableBorrowsETH.toString());
  console.log("totalCollateralETH: ", totalCollateralETH.toString());
  return { availableBorrowsETH, totalDebtETH };
};

const approveERC20 = async (contractAddress, spenderAdress, amount, acc) => {
  console.log("Approving...");
  const erc20 = await ethers.getContractAt("IERC20", contractAddress, acc);
  const tx = await erc20.approve(spenderAdress, amount);
  await tx.wait(1);
  console.log("Approved!");
};

const lendingPoolAddress = async (deployer) => {
  const addressProvider = await ethers.getContractAt(
    "ILendingPoolAddressesProvider",
    "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
    deployer
  );

  const lendingPoolAddress = await addressProvider.getLendingPool();
  const lendingPool = await ethers.getContractAt(
    "ILendingPool",
    lendingPoolAddress,
    deployer
  );

  return lendingPool;
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
