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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mintNft_1 = require("./mintNft");
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use(express_1.default.json());
app.post('/mintNFT', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sendToAddress } = req.body;
        if (!sendToAddress) {
            return res.status(400).send('Address is required');
        }
        const result = yield (0, mintNft_1.mintNFT)(sendToAddress);
        if (result.error) {
            res.status(500).send({ message: result.error });
        }
        else {
            res.send({ message: 'NFT minting initiated', transactionDetails: result });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error minting NFT');
    }
}));
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});