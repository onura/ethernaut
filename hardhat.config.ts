import { HardhatUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-waffle";

const PRIMARY_ACCOUNT_KEY = ""
const SECONDARY_ACCOUNT_KEY = "";

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    ropsten: {
      url: "https://eth-ropsten.alchemyapi.io/v2/",
      accounts: [`0x${PRIMARY_ACCOUNT_KEY}`, `0x${SECONDARY_ACCOUNT_KEY}`]
    },
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/",
      accounts: [`0x${PRIMARY_ACCOUNT_KEY}`, `0x${SECONDARY_ACCOUNT_KEY}`]
    },
     hardhat: {
      forking: {
        url: "https://eth-rinkeby.alchemyapi.io/v2/",
        blockNumber: 8597225,
      },
    },

  }
};

export default config;
