"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintNFT = void 0;
const dotenv_1 = require("dotenv");
const bundler_1 = require("@biconomy/bundler");
const core_types_1 = require("@biconomy/core-types");
const account_1 = require("@biconomy/account");
const modules_1 = require("@biconomy/modules");
const ethers_1 = require("ethers");
const paymaster_1 = require("@biconomy/paymaster");
(0, dotenv_1.config)();
const provider = new ethers_1.ethers.providers.JsonRpcProvider("https://rpc.ankr.com/polygon_mumbai");
const wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
const bundler = new bundler_1.Bundler({
    bundlerUrl: "https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
    chainId: core_types_1.ChainId.POLYGON_MUMBAI,
    entryPointAddress: account_1.DEFAULT_ENTRYPOINT_ADDRESS,
});
const paymaster = new paymaster_1.BiconomyPaymaster({
    paymasterUrl: process.env.PAYMASTER_URL || "",
});
function createAccount() {
    return __awaiter(this, void 0, void 0, function* () {
        const module = yield modules_1.ECDSAOwnershipValidationModule.create({
            signer: wallet,
            moduleAddress: modules_1.DEFAULT_ECDSA_OWNERSHIP_MODULE,
        });
        let biconomyAccount = yield account_1.BiconomySmartAccountV2.create({
            chainId: core_types_1.ChainId.POLYGON_MUMBAI,
            bundler: bundler,
            paymaster: paymaster,
            entryPointAddress: account_1.DEFAULT_ENTRYPOINT_ADDRESS,
            defaultValidationModule: module,
            activeValidationModule: module,
        });
        console.log("address", yield biconomyAccount.getAccountAddress());
        return biconomyAccount;
    });
}
function mintNFT(sendToAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const smartAccount = yield createAccount();
        const address = yield smartAccount.getAccountAddress();
        const nftInterface = new ethers_1.ethers.utils.Interface([
            "function mint(address _to, uint256 _id, uint256 amount, bytes data)",
        ]);
        // address, id, amount, data
        const data = nftInterface.encodeFunctionData("mint", [sendToAddress, 0, 1, '0x']);
        const nftAddress = "0xc85918FDC5035A922DE13Eb8B888Ab2f4f781FD1"; // PopZing Proxy
        const transaction = {
            to: nftAddress,
            data: data
        };
        let partialUserOp = yield smartAccount.buildUserOp([transaction], {
            paymasterServiceData: {
                mode: paymaster_1.PaymasterMode.SPONSORED,
            },
        });
        const biconomyPaymaster = smartAccount.paymaster;
        try {
            const paymasterAndDataResponse = yield biconomyPaymaster.getPaymasterAndData(partialUserOp);
            partialUserOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
        }
        catch (e) {
            if (e instanceof Error) {
                console.error("Error received: ", e.message);
                // Return an object with the error message
                return { success: false, error: `Error during transaction: ${e.message}` };
            }
            else {
                // Handle cases where e is not an Error object
                console.error("An unknown error occurred");
                return { success: false, error: "An unknown error occurred" };
            }
        }
        try {
            const userOpResponse = yield smartAccount.sendUserOp(partialUserOp);
            const transactionDetails = yield userOpResponse.wait();
            return {
                success: true,
                transactionHash: transactionDetails.receipt.transactionHash,
                openseaLink: `https://testnets.opensea.io/${address}`
            };
        }
        catch (e) {
            // Check if e is an instance of Error
            if (e instanceof Error) {
                // console.error("Error received: ", e.message);
                // Return an object with the error message
                return { success: false, error: `Error during transaction: ${e.message}` };
            }
            else {
                // Handle cases where e is not an Error object
                // console.error("An unknown error occurred");
                return { success: false, error: "An unknown error occurred" };
            }
        }
    });
}
exports.mintNFT = mintNFT;
