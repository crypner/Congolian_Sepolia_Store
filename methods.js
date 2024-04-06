const { ethers } = require("ethers");
require('dotenv').config();

const ProductsStore = require('./public/assets/contracts/ProductsStore.json');

// Initialize provider
const provider = new ethers.AlchemyProvider('sepolia', process.env.ALCHEMY_SEPOLIA_API_KEY);

// Set Arbiter Wallet
const wallet = new ethers.Wallet(process.env.ARBITER_WALLET_PRIVATE_KEY, provider);

// Smart contract ABI
const contractABI = ProductsStore.abi;
  
// Smart contract address
const contractAddress = process.env.CONTRACT_ADDRESS;

// Function to convert big numbers that JS cannot handle (eg. 1e18) to the actual number
function eToNumber(num) {
    let sign = "";
    (num += "").charAt(0) == "-" && (num = num.substring(1), sign = "-");
    let arr = num.split(/[e]/ig);
    if (arr.length < 2) return sign + num;
    let dot = (.1).toLocaleString().substr(1, 1), n = arr[0], exp = +arr[1],
        w = (n = n.replace(/^0+/, '')).replace(dot, ''),
        pos = n.split(dot)[1] ? n.indexOf(dot) + exp : w.length + exp,
        L   = pos - w.length, s = "" + BigInt(w);
        w   = exp >= 0 ? (L >= 0 ? s + "0".repeat(L) : r()) : (pos <= 0 ? "0" + dot + "0".repeat(Math.abs(pos)) + s : r());
    L= w.split(dot); if (L[0]==0 && L[1]==0 || (+w==0 && +s==0) ) w = 0; 
    return sign + w;
    function r() {return w.replace(new RegExp(`^(.{${pos}})(.)`), `$1${dot}$2`)}
}
  
module.exports = {
    getProductsCount: async function () {
        // Queries product count from contract
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const productsCount = await contract.productCount();
        var products = 0;
        for (let i = 1; i <= productsCount; i++) {
            var prod = await contract.products(i);
            if (!prod.sold){
                products++
            }
        }
        return products;
    },
    getProducts: async function () {
        // Queries list of products from contract
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const productsCount = await contract.productCount();
        var products = []
        for (let i = 1; i <= productsCount; i++) {
            var prod = await contract.products(i);
            products.push(prod)
        }
        return products;
    },
    getProductsByAddress: async function (ua) {
        // Queries products by seller address from contract
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const productsCount = await contract.productCount();
        var products = []
        for (let i = 1; i <= productsCount; i++) {
            var prod = await contract.products(i);
            if (prod.seller.toLowerCase() == ua){
                products.push(prod)
            }            
        }
        return products;
    },
    getProduct: async function (prod) {
        // Queries single product by product position from contract
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        var product = await contract.products(prod)
        return product;
    },
    getTransactionsByAddress: async function (ua) {
        // Queries transactions by seller address from contract
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const transactionCount = await contract.transactionCount();
        var transactions = []
        for (let i = 1; i <= transactionCount; i++) {
            var transaction = await contract.transactions(i);
            if (transaction.sellerAddress.toLowerCase() == ua){
                transactions.push(transaction)
            }            
        }
        return transactions;
    },
    getOrderTransactionsByAddress: async function (ua) {
        // Queries transactions by buyer address from contract
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const transactionCount = await contract.transactionCount();
        var transactions = []
        for (let i = 1; i <= transactionCount; i++) {
            var transaction = await contract.transactions(i);
            if (transaction.buyerAddress.toLowerCase() == ua){
                transactions.push(transaction)
            }            
        }
        return transactions;
    },
    getTransactionsInTransit: async function () {
        // Queries transactions with status 'In Transit' from contract
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const transactionCount = await contract.transactionCount();
        var transactions = []
        for (let i = 1; i <= transactionCount; i++) {
            var transaction = await contract.transactions(i);
            if (transaction.status == 'In Transit'){
                transactions.push(transaction)
            }            
        }
        return transactions;
    },
    updateTransaction: async function (trn_id, price ) {
        // CRON Job function to update transaction status and transfer product price from arbiter to seller
        const contract = new ethers.Contract(contractAddress, contractABI, wallet);
        try {
            
            var priceInEth = ethers.getBigInt(price) * BigInt(1000000000000);
            const transaction = await contract.updateTransactionStatus(trn_id, { value: priceInEth });
            console.log('Transaction sent:', transaction.hash);
            await transaction.wait();
            console.log('Transaction confirmed:', transaction.hash);
        } catch (error) {
            console.error('Transaction failed:', error);
        }
    },
    eToNumber: eToNumber,
};

