import express from 'express';
import { mintNFT } from './mintNft';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.post('/mintNFT', async (req:any, res) => {
    try {
        const { sendToAddress } = req.body;
        if (!sendToAddress) {
            return res.status(400).send('Address is required');
        }
        const result = await mintNFT(sendToAddress);
        if (result.error) {
            res.status(500).send({ message: result.error });
        } else {
            res.send({ message: 'NFT minting initiated', transactionDetails: result });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error minting NFT');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
