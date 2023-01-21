

const {getCustomerData} = require("./models/re.js");


export default async function setCustomerInfo(){

    account = document.getElementById('cEmail').value
    const data = await getCustomerData(account)
    console.log(data[0])

    
}

