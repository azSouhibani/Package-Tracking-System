const Sqlite = require('better-sqlite3');

const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite')
const getDbConnection = async () => {return await sqlite.open({filename: 'test.db3',driver: sqlite3.Database})}

async function insertCustomer(name,flag,phone,email) {
    // flag = 0 ==> it is sender
    // flag = 1 ==> it is reciver
    senderFlag = -1
    reciverFlag = -1
    if(flag === 0){
        senderFlag = 1
        reciverFlag = 0
    }
    else{
        senderFlag = 0
        reciverFlag = 1
    }

    const db = await getDbConnection();
    await db.run(`insert into Customer ('name', 'senderFlag', 'reciverFlag', 'Phone', 'Email')
    values ('${name}', ${senderFlag} , ${reciverFlag}, ${phone}, ${email})`)
    await db.close()
}

function getRandElm(size){
    return Math.floor(Math.random() * size)
}

function generateDate(){
    let day = Math.floor(Math.random() * (31 - 1) + 1)
    let month = Math.floor(Math.random() * (12 - 1) + 1)
    let year = Math.floor(Math.random() * (2030 - 1996) + 1996)
    return day+'/'+month+'/'+year
}

async function insertPackageByCustomer(custID,dest, weight, dimenstions,type) {
    const db = await getDbConnection();
    let packageNum = await db.all(`select max(number) as maxNumber from package`)
    let barcodes = await db.all(`select barcode from package`)

    let eids = await db.all(`select id from employee`)
    let empID = eids[getRandElm(eids.length)].ID

    let rids = await db.all(`select id from retailer`)
    let retID = rids[getRandElm(rids.length)].id

    // let types = ['Regular','Chemical','Liquid','Fragile']
    // let type = types[getRandElm(type.length)]
    
    num = packageNum[0].maxNumber + 1
    let generated = false
    while(! generated){
        barcodeGen= Math.floor(Math.random() * 10000)
        for(i in barcodes){
            if(barcodes[i].barcode === barcodeGen){
                continue
            }
            else if (i === (barcodes.length - 1)){
                break
            }
        }
        generated = true
    }
   
    // (barcode,number,destination,insur_amount,dimensions,status,final_deliver_date,weight,eid,rid,senderid,reciverid,isPayed,type)
    let meta = await db.run(`insert into package values
    (${barcodeGen},${num},"${dest}","${Number(weight) * 2.5}","${dimenstions}",
    'in Transit',"${generateDate()}","${weight}kg",${empID},${retID},${custID},null,0,"${type}")`)
    console.log(meta)
    await db.close()

    return meta
}


async function insertPackageByEmployee(data){

    const db = await getDbConnection();
    let packageNum = await db.all(`select max(number) as maxNumber from package`)
    let barcodes = await db.all(`select barcode from package`)
    
    num = packageNum[0].maxNumber + 1
    let generated = false
    while(! generated){
        barcodeGen= Math.floor(Math.random() * 10000)
        for(i in barcodes){
            if(barcodes[i].barcode === barcodeGen){
                continue
            }
            else if (i === (barcodes.length - 1)){
                break
            }
        }
        generated = true
    }
    // console.log(num)
    // console.log(barcodeGen)
    // (barcode,number,destination,insur_amount,dimensions,status,final_deliver_date,weight,eid,rid,senderid,reciverid,isPayed,type)
    let meta = await db.run(`insert into package values
    (${barcodeGen},${num},"${data.dest}","${data.insur}","${data.dimens}","${data.status}","${data.date}","${data.weight}kg",${data.id},null,null,null,0,"${data.type}")`)
    console.log(meta)

    await db.close()

    return meta
}

async function getUser(id,isEmp){
    const db = await getDbConnection();

    if(isEmp){
        const row = await db.all(`select * from employee where id = "${id}"`)
       
        db.close()
        return row
    }

    else{
        const row = await db.all(`select * from customer where id = "${id}"`)
        
        db.close()
        return row
    }
    
}

async function getCustomerIDByEmail(email){
    const db = await getDbConnection();
    row = await db.all(`select id from customer where email = "${email}"`)
    db.close()
    return row
}

async function getCustomerData(email){
    const db = await getDbConnection();
    row = await db.all(`select name,email,password,phone from customer where email = "${email}"`)
    db.close()
    return row
}

async function queryPackage(Number) {
    const db = await getDbConnection();
    
    const rows = await db.all(`select * from package where number = ("${Number}")`)
    
    await db.close()
    return rows
    
}

async function getEmailsAndPasswords(){
    const db = await getDbConnection();

    // const rows = await db.all('select c.email, c.password, e.email, e.password from customer c, employee e')
    const crows = await db.all('select c.email, c.password from customer c')
    const erows = await db.all('select e.email, e.password from employee e')

    const allRows = crows.concat(erows)
    

    await db.close
    
    return allRows;
}

async function getCustomerPackages(email){
    const db = await getDbConnection();

    const custPackage = await db.all(`select * from package where senderid = (
        select id from customer where email = "${email}")`)

    
    await db.close

    return custPackage;
}

async function getCustPack(id){
    const db = await getDbConnection();

    const custPackage = await db.all(`select * from package where senderid = (
        select id from customer where id = ${id})`)
    
    await db.close

    return custPackage;
}

async function insertUser(data){
    const db = await getDbConnection();

    if(data.isEmp === 'employeeUser'){
        const meta = db.run(`insert into employee values (${data.id},'12/12/2022','${data.email}',${data.phone},'${data.name}',null)`)
        return meta
    }
//('id','name', 'senderFlag', 'reciverFlag', 'Phone', 'Email','password')
    else{
        let meta = db.run(`insert into Customer 
        values (${data.id},"${data.name}",0,0,${data.phone},"${data.email}",null)`)
        return meta
    }
}


async function updatePackage(data){
    const db = await getDbConnection();

    const meta = db.run(`update package
    set 
        barcode = ${data.barcode},
        destination = "${data.dest}",
        insur_amount = "${data.insur}",
        status = "${data.status}",
        final_deliver_date = "${data.date}",
        weight = "${data.w}",
        dimensions = "${data.dim}"
    where number = ${data.number}`)

    return meta
}

async function getAllPackages(){
    const db = await getDbConnection();

    const rows = db.all(`select * from package where isPayed = 1 `)

    db.close()

    return rows
}

async function queryDate(d1,d2){
    const db = await getDbConnection()

    const result = await db.all(`select * from package 
    where final_deliver_date between "${d1}" and "${d2}"`)
    db.close

    return result
}

async function countBetDates(date1,date2){
    const db = await getDbConnection()

    const result = await db.all(`select count(*) as totalNum from package 
    where final_deliver_date between "${date1}" and "${date2}"`)
    db.close

    return result
}


// queryDate('2014-6-4','2024-12-30')



module.exports = {queryPackage,getCustomerPackages,getCustomerIDByEmail,
    insertPackageByCustomer,getCustomerData,getUser,getEmailsAndPasswords,
    insertUser,insertPackageByEmployee,updatePackage,getAllPackages,queryDate,countBetDates,getCustPack}