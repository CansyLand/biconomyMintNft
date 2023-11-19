
# Biconomy MintNFT API

This project provides an API for minting NFTs using Biconomy on the Polygon Mumbai testnet. It's built with Express.js and integrates with Biconomy's smart contract services.

## Features

- Mint NFTs to a specified address.
- Integration with Biconomy for gasless transactions.
- Error handling for transaction failures.


## Getting Started

### Prerequisites

- Node.js
- Yarn or npm
- A wallet with a private key (for Biconomy integration)

## Installation

### 1. Clone the repository:
```bash
git clone https://github.com/CansyLand/biconomyMintNft.git
cd biconomyMintNft
```

### 2. Install dependencies:
```bash
yarn install
```

or

```bash
npm install
```

### 3. Set up environment variables:
Create a .env file in the root directory and add your private key and paymaster url:
```bash
PRIVATE_KEY=your_private_key_here
PAYMASTER_URL=your_paymaster_url_here
```

## Running the Server
Run the server using:
```bash
yarn dev
```

or

```bash
npm run dev
```

The server will be available at http://localhost:3000.

## API Usage
Endpoint: POST /mintNFT

Request Body:
```bash
{
  "sendToAddress": "0x..."
}
```

Response:

On Success:
```bash
{
  "message": "NFT minting initiated",
  "transactionDetails": {
    "success": true,
    "transactionHash": "...",
    "openseaLink": "..."
  }
}
```
On Error:
```bash
{
  "message": "Error message"
}
```

## Contributing

Contributions are welcome. Please feel free to open an issue or submit a pull request with your improvements.

## License

This project is licensed under the ISC License.