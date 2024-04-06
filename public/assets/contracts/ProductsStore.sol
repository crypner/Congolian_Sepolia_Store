// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract ProductsStore {
    // Product object Structure
    struct Product {
        uint256 position;
        string name;
        string imageIPFSHash;
        string description;
        string category;
        address seller;
        uint256 price;
        bool sold;
    }
    // Transaction object Structure
    struct Transaction {
        uint256 position;
        uint256 productId;
        uint256 ProductPrice;
        string buyerPhysicalAddress;
        address sellerAddress;
        address buyerAddress;
        string trackingNumber;
        string status;
    }

    // Value conversion from TWEI to Ether
    //TWEI was the chosen denominator as a reasonable Integer figures for Product prices in the $0 - $1000 range
    uint256 constant TWEI_TO_WEI = 1000000000000;

    address payable arbiter;

    mapping(uint256 => Product) public products;
    uint256 public productCount;

    mapping(uint256 => Transaction) public transactions;
    uint256 public transactionCount;
    
    // Set contract deployer as the arbiter
    constructor() {
        arbiter = payable(msg.sender); 
    }
    
    modifier onlyArbiter() {
        require(msg.sender == arbiter, "Only arbiter can call this function");
        _;
    }

    // Arbiter can be updated only by current arbiter
    function updateArbiter(address _newArbiter) public onlyArbiter {
        arbiter = payable(_newArbiter);
    }

    event ProductCreated(uint256 productId);
    
    // Create Product function to add new products to the store
    function createProduct (
        string memory _name,
        string memory _imageIPFSHash,
        string memory _description,
        string memory _category,
        uint256 _price
    ) public {
        productCount++;
        products[productCount] = Product({
            position: productCount,
            name: _name,
            imageIPFSHash: _imageIPFSHash,
            description: _description,
            category: _category,
            seller: msg.sender,
            price: _price,
            sold: false
        });
        emit ProductCreated(productCount);
    }

    event ProductUpdated(uint256 productId);

    // Function to update product details except sold status which can 
    // only be updated once shipping tracking status is set to delivered
    function updateProductDetails(
        uint256 _productId,
        string memory _name,
        string memory _imageIPFSHash,
        string memory _description,
        string memory _category,
        uint256 _price
    ) public {
        require(_productId <= productCount && _productId > 0, "Invalid product ID");

        Product storage product = products[_productId];

        require(product.seller == msg.sender, "Only the seller can update the product details");

        product.name = _name;
        product.imageIPFSHash = _imageIPFSHash;
        product.description = _description;
        product.category = _category;
        product.price = _price;

        emit ProductUpdated(_productId);
    }
    
    event TransactionStatusUpdated(uint256 transactionId);

    // Upon purchase a transaction record is created and the contract arbiter 
    // holds the value of the product until it is delivered and the value is then transfered to the seller
    function createTransaction(
            uint256 _productId, 
            uint256 _ProductPrice, 
            address _sellerAddress, 
            string memory _buyerPhysicalAddress
        ) external payable {
            require(_productId <= productCount && _productId > 0, "Invalid product ID");
            // Find Product to check validity
            Product storage product = products[_productId];
            require(product.sold == false, "Product sold out");
            uint256 productPriceInWei = _ProductPrice * TWEI_TO_WEI;
            require(msg.value == productPriceInWei, "Insufficient funds sent");
            transactionCount++;
            transactions[transactionCount] = Transaction({
                position: transactionCount,
                productId: _productId,
                ProductPrice: _ProductPrice,
                sellerAddress: _sellerAddress,
                trackingNumber: '',
                buyerPhysicalAddress: _buyerPhysicalAddress,
                buyerAddress: msg.sender,
                status: 'Processing'
            });

            // Transfer Product Price to Arbiter
            payable(arbiter).transfer(msg.value);
            
            // Set product as Sold
            product.sold = true;
            
            emit TransactionStatusUpdated(transactionCount);
    }   

    // Function that allows the seller to add the tracking number to the shipped product
    function updateTransactionTracking(uint256 _transactionId, string memory _trackingNumber) public {
        require(transactions[_transactionId].sellerAddress == msg.sender, "Only the seller can add a tracking number");
        require(_transactionId <= transactionCount && _transactionId > 0, "Invalid transaction ID");
        require(bytes(transactions[_transactionId].trackingNumber).length == 0, "Tracking number has been already added and cannot be changed");
        transactions[_transactionId].trackingNumber = _trackingNumber;
        transactions[_transactionId].status = 'In Transit';
        emit TransactionStatusUpdated(_transactionId);
    }

    // Function that  can only be triggered by the arbiter once a delivered status is recieved.
    // this function updates the transaction status to delivered and transfers the value from the 
    // contract arbiter's account to the seller.
    function updateTransactionStatus(uint256 _transactionId) public payable onlyArbiter{
        require(arbiter == msg.sender, "Only the seller can add a tracking number");
        require(_transactionId <= transactionCount && _transactionId > 0, "Invalid transaction ID");
        transactions[_transactionId].status = 'Delivered';        
        payable(transactions[_transactionId].sellerAddress).transfer(msg.value);
        emit TransactionStatusUpdated(_transactionId);
    }
}