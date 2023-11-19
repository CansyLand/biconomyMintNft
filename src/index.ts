import express from 'express';
import { mintNFT } from './mintNft'; // Assuming mintNFT is exported from another file

const app = express();
const port = 3000; // You can choose any port

app.use(express.json()); // For parsing application/json

// Define a POST endpoint for minting NFT
app.post('/mintNFT', async (req:any, res) => {
    try {
        const { sendToAddress } = req.body;
        if (!sendToAddress) {
            return res.status(400).send('Address is required');
        }
        // await mintNFT(sendToAddress);
        // res.send('NFT minting initiated');
        const result = await mintNFT(sendToAddress);
        if (result.error) {
            // If there was an error during minting
            res.status(500).send({ message: result.error });
        } else {
            // If minting was successful
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
