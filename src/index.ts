import express from 'express';
import cors from 'cors';
import { mintNFT } from './mintNft';

const app = express();
const port = process.env.PORT || 3001;

// Enable preflight across-the-board
app.options('*', cors());

app.use(express.json());

// app.use(cors());
// app.use(express.json());
// mintNFT("0x33a7d139955c1B34033Fa5187D752AF986Eace9e");
app.post('/mintNFT', cors(),async (req, res) => {
    try {
        const { sendToAddress } = req.body;
        if (!sendToAddress) {
            return res.status(400).send('Address is required');
        }
        const result = await mintNFT(sendToAddress);
        // if (result.error) {
        //     res.status(500).send({ message: result.error });
        // } else {
        //     res.send({ message: 'NFT minting initiated', transactionDetails: result });
        // }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error minting NFT');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
