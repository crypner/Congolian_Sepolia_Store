const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const https = require("https");
const bodyParser = require('body-parser');
var FormData = require('form-data');
const cron = require('node-cron');
const axios = require('axios');
require('dotenv').config();

const Methods = require('./methods');

const projectId = process.env.INFURA_PROJECT_ID;
const projectSecret = process.env.INFURA_PROJECT_SECRET;

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({extended: false}))

const upload = multer({ dest: 'uploads/' });

const headers = {
  'Authorization': 'Bearer ' + process.env.SHIP24_API_KEY
};

// Function to check if tracking number is valid.
app.get('/check-track', async (req, res) => {    
  //var data = await checkTracking(req.query.t)
  var url = 'https://api.ship24.com/public/v1/trackers/search/'+ req.query.t +'/results';
  axios.get(url, { headers })
    .then(async response => {
      res.sendStatus(response.status);
    })
    .catch(error => {
      console.error('Error:', error);
      res.send(`error`);        
    });
});

function uploadFileToIPFS(fileBuffer) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append("file", fileBuffer, { filename: "file" });
  
      const options = {
        host: "ipfs.infura.io",
        port: 5001,
        path: "/api/v0/add?pin=false",
        method: "POST",
        auth: projectId + ":" + projectSecret,
        headers: form.getHeaders(),
      };
  
      const req = https.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          try {
            const response = JSON.parse(body);
            if (response && response.Hash) {
              resolve(response.Hash);
            } else {
              reject("Failed to upload file to IPFS");
            }
          } catch (error) {
            reject(error);
          }
        });
      });
  
      req.on("error", (error) => {
        reject(error);
      });
  
      form.pipe(req);
    });
}

// Function to go through all transactions that are still in transit and checks via API if the package has been deliverd.
async function updateTracking(){
  var Transactions = await Methods.getTransactionsInTransit()
  Transactions.forEach(function(transaction){
    var url = 'https://api.ship24.com/public/v1/trackers/search/'+transaction.trackingNumber+'/results';
    axios.get(url, { headers })
      .then(async response => {
          if ( response.data.data.trackings[0].shipment.statusMilestone == 'delivered'){
            await Methods.updateTransaction(transaction.position, transaction.ProductPrice)
          }  
          // Un-comment the line below to set all transactions as delivered     
          //await Methods.updateTransaction(transaction.position, transaction.ProductPrice)   
      })
      .catch(error => {
          console.error('Error:', error);
      });
  });
}
//updateTracking()

// Cron job scheduled to run every Saturday at 9am UTC
// Purpose is to check for delivered packages and releases the funds to the sellers
cron.schedule('0 9 * * 6', () => {
  updateTracking();
});

// Handle image upload and return IPFS URL
app.post('/upload', upload.single('image'), async (req, res) => {    
    try {
        const imageBuffer = fs.readFileSync(req.file.path);
        uploadFileToIPFS(imageBuffer)
            .then((ipfsHash) => {
                console.log("File uploaded to IPFS. IPFS Hash:", ipfsHash);
                res.status(200).json({ url: "https://vuqle.infura-ipfs.io/ipfs/"+ ipfsHash });
            })
            .catch((error) => {
                console.error("Error uploading file to IPFS:", error);
            });
    } catch (error) {
        console.error('Error uploading image to IPFS:', error);
        res.status(500).json({ error: 'Failed to upload image to IPFS' });
    }
});

app.get('/', async (req, res)=>{
    var PC = await Methods.getProductsCount()
    var Prods = await Methods.getProducts()
    res.render('index', {
        title: 'Home',
        productsCount: PC,
        products: Prods,
        eToNumber: Methods.eToNumber
    });
});

app.get('/add-product', async (req, res)=>{
    res.render('add', {
        title: 'Add Product'
    });
});

app.post('/add-product', async (req, res)=>{
    var product = {
        name: req.body.name,
        imageURL: req.body.imageURL,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        signer: req.body.signer
    }
    await Methods.createProduct(product)
});
app.get('/sold-orders', async (req, res)=>{
  var Transactions = await Methods.getTransactionsByAddress(req.query.address)
  var Prods = await Methods.getProductsByAddress(req.query.address)
  res.render('soldOrders', {
      title: 'Sold Orders',
      transactions: Transactions,
      products: Prods,
      eToNumber: Methods.eToNumber
  });
});

app.get('/my-products', async (req, res)=>{
    var Prods = await Methods.getProductsByAddress(req.query.address)
    res.render('myProducts', {
        title: 'My Products',
        products: Prods,
        eToNumber: Methods.eToNumber
    });
});

app.get('/edit-product', async (req, res)=>{
    var Prod = await Methods.getProduct(req.query.product)
    res.render('editProduct', {
        title: 'Edit Product',
        product: Prod,
        eToNumber: Methods.eToNumber
    });
});

app.get('/my-orders', async (req, res)=>{
    var Transactions = await Methods.getOrderTransactionsByAddress(req.query.address)
    var Prods = await Methods.getProducts()
    res.render('myOrders', {
        title: 'My Orders',
        transactions: Transactions,
        products: Prods,
        eToNumber: Methods.eToNumber
    });
});


app.listen(3000, ()=>{
    console.log('Server running on port 3000.')
})