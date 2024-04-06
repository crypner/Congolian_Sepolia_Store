// Function to check if a query parameter address exists and return its value
function getAddressParameter() {
    var queryString = window.location.search;
    const cleanedQueryString = queryString.startsWith('?') ? queryString.slice(1) : queryString;
    const parameters = cleanedQueryString.split('&');
    for (const parameter of parameters) {
        const [key, value] = parameter.split('=');
        if (key === 'address') {
            return decodeURIComponent(value); 
        }
    }
    return null;
}

// --------------- Check for Metamask ---------------
// - if Metamask not detected ask for install
// - if Metamask detected, ask to connect
// - if previously connected, connect automatically
// --------------------------------------------------
var accounts;
var provider;
async function checkMetaMask(){
    if (window.ethereum){
        accounts = await window.ethereum.request({method: 'eth_accounts'});       
        provider = new ethers.BrowserProvider(window.ethereum);
        if (accounts.length) {
            if (getAddressParameter() !== null) {
                if (accounts[0] != getAddressParameter()){
                    window.location.href = window.location.origin;
                }
            }
            console.log("Found Metamask - Connected:" + accounts[0])
            if (document.getElementById("getWallet").hasAttribute("style")){
                document.getElementById("getWallet").removeAttribute("style");
            }
            if (document.getElementById("connectWallet").hasAttribute("style")){
                document.getElementById("connectWallet").removeAttribute("style");
            } 
            document.getElementById("connected").style.display = "block";
            document.getElementById("userImg").src = "https://robohash.org/"+accounts[0]
            document.getElementById("userImg").title = accounts[0]
            document.getElementById("mp").href = "/my-products?address=" + accounts[0]
            document.getElementById("so").href = "/sold-orders?address=" + accounts[0]
            document.getElementById("mo").href = "/my-orders?address=" + accounts[0]
        } else {       
            if (getAddressParameter() !== null) {
                window.location.href = window.location.origin;
            }
            console.log("Metamask Found - Not Connected")
            if (document.getElementById("connected").hasAttribute("style")){
                document.getElementById("connected").removeAttribute("style");
            }
            if (document.getElementById("getWallet").hasAttribute("style")){
                document.getElementById("getWallet").removeAttribute("style");
            }
            document.getElementById("connectWallet").style.display = "block"
        }
    }else{
        console.log("Metamask not found");
        if (getAddressParameter() !== null) {
            window.location.href = window.location.origin;
        }
        if (document.getElementById("connected").hasAttribute("style")){
            document.getElementById("connected").removeAttribute("style");
        }
        if (document.getElementById("connectWallet").hasAttribute("style")){
            document.getElementById("connectWallet").removeAttribute("style");
        }
        document.getElementById("getWallet").style.display = "block"
    }
}
checkMetaMask();

// Function to request accounts and connect to a Metamask Wallet
async function requestAccounts(){
    accounts = await window.ethereum.request({method: "eth_requestAccounts"});
    provider = new ethers.BrowserProvider(window.ethereum);    
    checkMetaMask();
}

// Disconnect account function
async function Disconnect() {
    await window.ethereum.request({
        "method": "wallet_revokePermissions",
        "params": [
          {
            "eth_accounts": {}
          }
        ]
    });
    checkMetaMask();
}