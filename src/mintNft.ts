
import { config } from "dotenv";
import { IBundler, Bundler } from "@biconomy/bundler";
import { ChainId } from "@biconomy/core-types";
import {
  BiconomySmartAccountV2,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy/account";
import {
  ECDSAOwnershipValidationModule,
  DEFAULT_ECDSA_OWNERSHIP_MODULE,
} from "@biconomy/modules";
import { ethers } from "ethers";
import {
  IPaymaster,
  BiconomyPaymaster,
  IHybridPaymaster,
  PaymasterMode,
  SponsorUserOperationDto,
} from "@biconomy/paymaster";

config();

const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.ankr.com/polygon_mumbai"
);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);

const bundler: IBundler = new Bundler({
  bundlerUrl: "https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
  chainId: ChainId.POLYGON_MUMBAI,
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
});

const paymaster: IPaymaster = new BiconomyPaymaster({
  paymasterUrl: process.env.PAYMASTER_URL || "",
});

async function createAccount() {
  const module = await ECDSAOwnershipValidationModule.create({
    signer: wallet,
    moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
  });

  let biconomyAccount = await BiconomySmartAccountV2.create({
    chainId: ChainId.POLYGON_MUMBAI,
    bundler: bundler,
    paymaster: paymaster,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    defaultValidationModule: module,
    activeValidationModule: module,
  });
  console.log("address", await biconomyAccount.getAccountAddress());
  return biconomyAccount;
}

type MintNFTResponse = {
  success: boolean;
  transactionHash?: string;
  openseaLink?: string;
  error?: string;
};

export async function mintNFT(sendToAddress:string): Promise<MintNFTResponse> {

  const smartAccount = await createAccount();
  const address = await smartAccount.getAccountAddress();
  const nftInterface = new ethers.utils.Interface([
    "function mint(address _to, uint256 _id, uint256 amount, bytes data)",
  ]);

  // address, id, amount, data
  const data = nftInterface.encodeFunctionData("mint", [sendToAddress, 0, 1, '0x']);

  const nftAddress = "0xc85918FDC5035A922DE13Eb8B888Ab2f4f781FD1"; // PopZing Proxy

  const transaction = {
    to: nftAddress,
    data: data
  };

  let partialUserOp = await smartAccount.buildUserOp([transaction], {
    paymasterServiceData: {
      mode: PaymasterMode.SPONSORED,
    },
  });

  const biconomyPaymaster =
    smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;

  try {
    const paymasterAndDataResponse =
      await biconomyPaymaster.getPaymasterAndData(partialUserOp);
    partialUserOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
  } catch (e) {
    if (e instanceof Error) {
      console.error("Error received: ", e.message);
      // Return an object with the error message
      return { success: false, error: `Error during transaction: ${e.message}` };
    } else {
      // Handle cases where e is not an Error object
      console.error("An unknown error occurred");
      return { success: false, error: "An unknown error occurred" };
    }
  }

  try {
    const userOpResponse = await smartAccount.sendUserOp(partialUserOp);
    const transactionDetails = await userOpResponse.wait();
    return {
      success: true,
      transactionHash: transactionDetails.receipt.transactionHash,
      openseaLink: `https://testnets.opensea.io/${address}`
    };
  } catch (e) {
      // Check if e is an instance of Error
      if (e instanceof Error) {
        // console.error("Error received: ", e.message);
        // Return an object with the error message
        return { success: false, error: `Error during transaction: ${e.message}` };
      } else {
        // Handle cases where e is not an Error object
        // console.error("An unknown error occurred");
        return { success: false, error: "An unknown error occurred" };
      }
  }
}
