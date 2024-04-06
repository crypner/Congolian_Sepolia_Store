
# Congolian Sepolia Store

This project consists of an online marketplace that runs on the Ethereum network. Unlike most blockchain based marketplaces which tend to be NFT centric, this marketplace operates similar to conventional stores with physical products. 

> Why Congolian? The Congolian Rainforest is the second largest forest in the world after the Amazon.

### Store Function

Just like how most marketplaces operate, users can add their products to sell and also have the capability to buy. This marketplace is set up to be the arbiter for the transactions to set the buyer's mind at ease. 

When the buyer submits a transaction, the funds are withheld with the arbiter. At this point the seller needs to send the product and add the shipping tracking number to the transaction. 

The application is setup to check updates of the tracking via an API and when the tracking returns as delivered, only then the funds will be released to the seller.

---------------------------------------

## Prerequisites 

- **Metamask** - You must add Metamask to your browser extensions.
- **Node.js** - The Project was built on Node v21.5.0
- **Ship24.com Account** - You would need a **[Ship24.com](https://dashboard.ship24.com/integrations/api-keys)** account to get a Tracking API key.
- **Alchemy Account** - You would need an **[Alchemy](https://dashboard.alchemy.com/apps)** account to get a Sepolia API key to access Alchemy's RPC.
- **INFURA Account** - You would need an **[INFURA](https://app.infura.io)** account for an API key to access their IPFS Endpoints.

## Installation

- Download or Clone this repository. 

- Open the terminal, make sure you are in the project directory and run:
```bash
  npm install
```

- Once the project is installed, create a file called `.env`. 

- Find and open the file called `.env.example` and copy all its contents to your newly created `.env` file.

### Deploy Smart Contract

For this step I would suggest first to generate a new account on Metamask and name it something like "**Contract Deployer**" not to confuse it with any other accounts where you keep your main funds. 

Make sure you have Sepolia Network on your metamask. 


**( ------ Instructions on how to add Sepolia to Metamask ----- )**
- Go to your Metamask **Settings** > **Networks** 
- Click on "**Add Network**" 
- Click on "**Add a network manually**"
    - **Network name** : Sepolia Test network
    - **New RPC URL** : https://sepolia.infura.io/v3/
    - **Chain ID** : 11155111
    - **Currency symbol** : SepoliaETH
    - **Block explorer URL** : https://sepolia.etherscan.io
- Click on "**Add Network**"
**------------------------------------------------------------------------**

Once the account is created you would need to get some Sepolia ETH. You can get Sepolia from this **[Faucet](sepolia-faucet.pk910.de/#/)**. Copy the address of your new account, paste it in the faucet and hit **Start Mining**. in a short while you will have a few SepoliaETH which should be more then enough for testing purposes.


Now that we have our account set up and topped up with SepoliaETH, it's time to deploy our smart contract.

Head over to **[Remix](https://remix.ethereum.org)**. When you open remix for the first time you may see some test and example contracts. Feel free to delete them so not to be confusing. Once deleted create a new file called **ProductsStore.sol**.

In the project directory under **public** > **assets** > **contracts** you should find a file with the same name. Copy all its contents and paste it in the new file we just created in Remix.

**Great Job!! Almost there . . .**

In Remix's left Navbar, 3rd icon from the top should be "**Solidity Compiler**". Click on that and you should see a button that says "**Compile ProductsStore.sol**"; Click on that and now you should see a green check mark next to the Solidity Compiler Icon.

Now that our contract is compiled we can move on and click the next icon below the compiler which is "**Deploy**".

Before we deploy we need to check a few things:
- Make sure that the environment is set to "**Injected Provider - Metamask**" and since Metamask should be on the Sepolia Network you should see "*Sepolia (11155111) network*" under the environment dropdown. If not change the network on Metamask and it should update automatically.
- Once Metamask is connected go to account and select the address of the new account we created earlier.
- We should be all set up so go ahead and click on the "**Deploy**" button.

Once you click **Deploy**, Metamask should open so that you can confirm the transaction. Click "**Confirm**" and wait for the transaction to be validated.

When the transaction gets validated you should be able to see your contract under "**Deployed/unpinned Contracts**" in the **Deploy** tab in Remix.

Now that we have our contract deployed copy the contract address and lets head back to our `.env` file.

### Update `.env` file

In your `.env` file paste your contract address as the value for the **CONTRACT_ADDRESS** variable.

> The reason why we had to setup a new account on Metamask earlier is because we need to get the accounts PrivateKey and use it in the application. From the `.env` file it shouldn't be able for the key to be accessed but human error might get us unwantingly sharing the key on Github so better play it safe.

Open your Metamask and click on your accounts' dropdown. Next to your "**Contract Depolyer**" account click on the 3 dots and select "**Account Details**". You should see a QR Code and also a button "**Show private key**". Click on the button to get amd copy your private key, head back to your `.env` file and paste the key as the value for the "**ARBITER_WALLET_PRIVATE_KEY**" variable.

At this point you should be able to fill in the other values for the other variables.

"**SHIP24_API_KEY**" - Go to **[Ship24.com](https://dashboard.ship24.com/integrations/api-keys)** and you should find already a default API key under "Tracking API key". Important that it is a "Tracking API key" and not a "Tracking Webhook"

"**ALCHEMY_SEPOLIA_API_KEY**" - Go to **[Alchemy](https://dashboard.alchemy.com/apps)** Click on the button "**Create new app**". Change the network from "*Ethereum Mainnet*" to "*Ethereum Sepolia*", Give the app a name and some description and click on "**Create app**" button. Once the app is created, from your apps dashboard, next to your app click on "**API Key**" and click on "**Copy**" next to the API Key.

"**INFURA_PROJECT_ID**" & "**INFURA_PROJECT_SECRET**" - Go to **[INFURA](https://app.infura.io)** and make sure you are on the "**API Keys**" tab. If you haven't already created one during the account creation click on "**Create new api key**". Give it a name and once done you should see it on your API Keys dashboard. Click on your API Key's name and this should take you to the Key's page. Under "**All Endpoints**" make sure that the **Ethereum** > **Sepolia** is ticked. Now switch to the "**Settings**" tab and from here you can now see both the API Key which is on the top left of the page and if you click on "**Reveal secret**" you should be able to see the secret key. Copy and paste these keys to "**INFURA_PROJECT_ID**" & "**INFURA_PROJECT_SECRET**" respectively.

Now that all values in the `.env` file have been filled accordingly make sure to "**Save**" the file and you can close it.

## Deployment

We should now be all set up to deploy our project. 

> If you don't have already, ideally you should have a couple more Metamask accounts with some Sepolia in them so you can test out the app from a seller and buyer perspective. Try not to use the "**Contract Depolyer**" account so you can see the funds moving between accounts.

Open your terminal and make sure you are in the project directory and run:

```
  npm start
```

The project is set to run on Localhost port 3000 - (**[localhost:3000](http://localhost:3000)**)

If it turns out that your port 3000 is busy with some other app feel free to change it from the **index.js** file at the bottom of the page.


## Using the app

Once you launch the Congolian app there will be no products since it is a fresh new contract. 

Start by Connecting your wallet. 

Once you connect your wallet go ahead and click on the profile image. This should open a dropdown with options. Click on "**Sell a product**".

### Sell a product
From the "Add product" page you should be able to add a product image, which will upload to IPFS via INFURA, add product details and set a product price.

To keep figures relatively reasonable the price we enter should be in TWEI which is one of the denominators of Ethereum. 1 TWEI is 0.00001 of Ethereum. To also keep prices easy to understand, the price we enter is instantly converted and shown in USD. The Ethereum price is being fed via an API so it is always the current Ethereum/USD value.

When you are done entering the product details go ahead and click on "**Post Product**".

This will trigger Metamask to open as since you are posting the product to the blockchain the transaction needs to be confirmed.

#### **There you go...Well Done!! You have your first product on your store.**

Apart from the fact that anyone can now see your product when they visit the store. You can also find your product under "**My Products**" page. From there as long as the product is not sold, you can edit your product details by clicking on the "**Edit**" button.

### Buy a product

To make things interesting try disconnecting your wallet from the store and connect with another wallet.

Now that you are connected with another wallet try buying the product you just posted. This will ask you for a physical address. Since it is a physical product it needs to be delivered somewhere. Enter your address or any test address and click "**Buy**". 

Once again this will trigger Metamask to open. This time apart from just confirming the transaction we are also sending funds which are equivalent to the product price to the Contract's arbiter account. Go ahead and click "**Confirm**" in Metamask.

#### **Confessions of a shopaholic!! You just made your first purchase of many.**

If you go to the "**My Orders**" page you should be able to see your first purchase. Under tracking number you will see "*Tracking not available*" and the status as "*Processing*".

### Adding Tracking Information

Assuming that you did change your wallet to buy the product, disconnect your wallet again and re-connect with the wallet that you posted the product with.

Once connected if you go to the "**My Products**" page you should see that your product is now sold.

Go to ""**Sold Orders**" page and next to your product you should see a button to "**Add Tracking**". Click on it and there you can place a tracking number of the product you just "shipped". 

For testing purpose try and locate a valid tracking number from other platforms like Amazon or Ebay. Note the tracking number needs to be a vaild one for this step as there is the **Ship24** API validating it.

Once you added the tracking number the status of the transaction will change to "In Transit".


## CRON Job 

The application has a CRON Job set up so that once a week (specifically every Saturday at 9am UTC) it runs a function that goes through every transaction with an "In Transit" status and checks its tracking number for delivery updates. 

If the tracking returns "delivered" the function updates the transaction status to delivered and transfers the funds from the smart contract's arbiter account to the seller's account.

The CRON Job function is found in the **index.js** file on lines 86 to 110. For testing purposes on line 97 there is a commented line that calls the "*updateTransaction*" function no matter the delivery status from the tracking. To test the application un-comment that line and and line 104 to run the function straight away and bypass the CRON Job. You should see that the transaction status should now show as delivered and the funds have been transfered from the arbiter account to the sellers account.


## Possible Future Features

This project is far from ready and there are more features that can and might be added in the future.

Additional features that can be added:
- Smart Contract function integrated with **[Chainlink Functions](https://functions.chain.link/)** to refund buyers if shipment gets lost.
- Use **[Chainlink Functions](https://functions.chain.link/)** instead of a CRON Job to have the app more decentralized.
- Improve UI by adding product filters.
- Better Shipping API to cover more couriers.
- Adding a user profile to store Account data like address and contact details relevant to shipping a product.
- Have customer support tickets.
