require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");

/** @type import('hardhat/config').HardhatUserConfig */
const MAINNET_RPC = process.env.MAINNET_RPC;
module.exports = {
  // solidity: { compiler: [{ version: "0.8.18" }, { version: "0.4.19" }] }, -> compiler = expects string
  solidity: {
    compilers: [
      { version: "0.8.8" },
      { version: "0.4.19" },
      { version: "0.6.12" },
    ], // compilers = expects array
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: MAINNET_RPC,
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    borrower: {
      default: 1,
    },
  },
};
