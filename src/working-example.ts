
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
  paymasterUrl: "https://paymaster.biconomy.io/api/v1/80001/LSztuZ-59.307c100d-f1e0-4396-b73a-395ab08814f5",
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

async function mintNFT() {
  const smartAccount = await createAccount();
  const address = await smartAccount.getAccountAddress();
  const nftInterface = new ethers.utils.Interface([
    "function safeMint(address _to)",
  ]);

  const data = nftInterface.encodeFunctionData("safeMint", ['0x33a7d139955c1B34033Fa5187D752AF986Eace9e']);

  const nftAddress = "0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e";

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
    console.log("error received ", e);
  }

  try {
    const userOpResponse = await smartAccount.sendUserOp(partialUserOp);
    const transactionDetails = await userOpResponse.wait();
    console.log(
      `transactionDetails: https://mumbai.polygonscan.com/tx/${transactionDetails.receipt.transactionHash}`
    );
    console.log(
      `view minted nfts for smart account: https://testnets.opensea.io/${address}`
    );
  } catch (e) {
    console.log("error received ", e);
  }
}

mintNFT();
