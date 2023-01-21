const templateEngin = require('nunjucks')
const express = require("express");
const app = express();
app.use(express.urlencoded({extended: false}))
const port = 5001;

var bodyParser = require('body-parser')
const {queryPackage, getCustomerPackages, getCustomerIDByEmail,insertPackageByCustomer, 
    getCustomerData,getEmailsAndPasswords,getUser,insertUser,
    insertPackageByEmployee,updatePackage,getAllPackages,queryDate,countBetDates,getCustPack} = require("./models/re.js");
const { json } = require('express');

templateEngin.configure('views', {
    express: app
});


app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

// nunjucks.configure(["views/"], {autoscape: false,express: app});   

let signedAccount = null;

app.route("/")
  .get((req,res)=>res.render('loginPage.html'))

app.post('/', async function(req,res){
    accounts =  await getEmailsAndPasswords()
    const em = req.body.email
    signedAccount = em;

    const pass = req.body.pass
    const opt = req.body.loginChoice

    for(i in accounts){
        if(accounts[i].email === em && accounts[i].password === pass){

            opt === 'customerUser' ? res.redirect('/Customer') : res.render('emp_nav.html')
        }
    }
    // res.send(`<h1> Email or Password is Wrong </h1>`)

})


app.get("/Customer", async (req, res)=>{
    
    res.render("CustomerPage.html",{pack: await getCustomerPackages(signedAccount),logged: await getCustomerData(signedAccount)});
    
});

app.post('/Customer',async (req, res)=>{
    
    const kg = req.body.pacWeight
    const dim = req.body.pacDim
    const dest = req.body.pacDest
    const type = req.body.pacType
    const id = await getCustomerIDByEmail(signedAccount)
    // console.log(`parameters are ${kg}, ${dim}, ${dest}, ${id[0].id}`) 
    // console.log(`parameters are ${typeof(kg)}, ${typeof(dim)}, ${typeof(dest)}, ${typeof(id[0].id)}`) 
    const meta = insertPackageByCustomer(id[0].id,dest, kg, dim, type)
    
    res.send(`<h2>Your Request has been sent to our guys :) and the parameter are ${kg}, ${dim}, ${dest}, ${id[0].id}</h2>`)
    
})

app.get("/paypal", (req,res)=>{
    res.render("payment.html")
})


app.get("/QueryPage", (req, res)=>{res.render("QueryPage.html");});

app.get("/EditPackage", async (req, res)=>{
    // console.log('heloooooo')
    // console.log(req.query.queryNumber)
    let pacNum = req.query.queryNumber
    res.render("emp_editPackage.html",{result: await queryPackage(pacNum)});
});

app.post("/EditPackage", async (req, res)=>{

    let dataForAdding = {
        id:req.body.empID,
        dest:req.body.pacDest,
        insur:req.body.pacInsur,
        status:req.body.pacStatus,
        date:req.body.pacDate,
        weight:req.body.pacW,
        dimens:req.body.pacDim,
        type: req.body.type
    }

    let dataForEdit = {
        barcode: req.body.pacBare,
        dest:req.body.pacDeste,
        insur:req.body.pacInsure,
        status:req.body.pacStatuse,
        date:req.body.pacDatee,
        w:req.body.pacWe,
        dim:req.body.pacDime,
        type:req.body.type,
        number:req.query.queryNumber
    }
    console.log(dataForAdding)
    console.log(dataForEdit)

    if(typeof(dataForEdit.barcode) === 'undefined'){
        console.log(dataForAdding)
        const meta = await insertPackageByEmployee(dataForAdding)
        console.log(meta)
        res.send("<h1> The package has been added successfully")
    }

    else{
        console.log(dataForEdit)
        const meta = await updatePackage(dataForEdit)
        console.log(meta)
        res.send("<h1> The package has been updated successfully </h1>")
    }

})

app.get("/EditUser", async (req, res)=>{
    let id = req.query.userId
    res.render("emp_editUser.html",{queryResult:await getUser(id,false)});
});

app.post("/EditUser", async (req, res)=>{
    console.log('i am here')
    let info = {
        id: req.body.userID,
        name:req.body.userName,
        email:req.body.userEmail,
        phone:req.body.userPhone,
        isEmp:req.body.addChoice
    }
    // console.log(info)
    insertUser(info)
    res.send(`<h1> We add the user with the Following information to the database ${JSON.stringify(info)} </h1>`)
    
});

app.get("/reportNav",(req,res)=>{
    res.render('GenerateReport.html')
})

app.get('/repType1',async (req,res)=>{
    res.render('type1.html',{pack: await getAllPackages()})
})

app.get('/repType2',async (req,res)=>{
    res.render('type2.html',{pack : await queryDate(req.query.date1,req.query.date2)})
})


app.get('/repType3', async (req,res)=>{
    res.render('type3.html', {result: await countBetDates(req.query.date1,req.query.date2)})
})

app.get('/repType4',async (req,res)=>{
    res.render('type4.html')
})

app.post('/repType4',async (req,res)=>{
    res.render('type4.html',{pack: await getCustPack(req.body.customer)})
})




app.listen(port,function(){
    console.log(`listening to port http://127.0.0.1:${port}`)
})