let dbRequest = indexedDB.open('expenses',1);
let db;
let transaction;
let expenseStore;

dbRequest.onerror = (event) => console.log('DataBase error : ',event.target.error);

dbRequest.onupgradeneeded = (event) => {
    db = event.target.result;
    let expenseStore = db.createObjectStore('expensesList', { keyPath: 'id', autoIncrement: true });
    expenseStore.createIndex('date','date', { unique: false });
}

dbRequest.onsuccess = (event) => db = event.target.result;

function addRecord(date, expense, amt ){
    transaction = db.transaction(['expensesList'], 'readwrite')
    expenseStore = transaction.objectStore('expensesList');
    let dataObj = { date, expense, amt }
    request = expenseStore.add(dataObj);
    request.onsuccess = (event) => {
        console.log('Expense list stored successfully.\n',event.target.result);
    }
    request.onerror = (event) => {
        console.log('Unable to add expense.\n',event.target.error);
    }
}

function getRecord(date = null){
    transaction = db.transaction(['expensesList'], 'readwrite')
    expenseStore = transaction.objectStore('expensesList');
    let request;

    if(date){
        let index = expenseStore.index('date');
        request = index.getAll(date);
    }else{
        request = expenseStore.getAll();
    }

    request.onsuccess = (event) => {
        let result = event.target.result;
        if(result?.length > 0){
            console.log('Expenses : ',result);
        }else{
            console.log('Not found');
        }
    }

    request.onerror = (event) => {
        console.log('DataBse error : ',event.target.error);
    }
}

function updateRecord(id, options = {}){
    if(!id){
        console.log('Please provoid id to update.');
        return;
    }
    const { date = null, expense = null, amt = null } = options;
    transaction = db.transaction(['expensesList'], 'readwrite')
    expenseStore = transaction.objectStore('expensesList');
    let getRequest = expenseStore.get(id);
    
    getRequest.onsuccess = (event) =>{
        let result = event.target.result;
        if(result){
            result.date = date ?? result.date;
            result.expense = expense ?? result.expense;
            result.amt = amt ?? result.amt;
            let putrequest = expenseStore.put(result);
            putrequest.onsuccess = (event) => {
                console.log('Expense updated successfully.',result);
            }
        }else{
            console.log('Not found.');
        }
    }

    getRequest.onerror = (event) => {
        console.log('DataBse error : ',event.target.error);
    }
}

function deleteRecord(id){
    if(!id){
        console.log('Please provoid id to delete.');
        return;
    }
    transaction = db.transaction(['expensesList'], 'readwrite')
    expenseStore = transaction.objectStore('expensesList');
    let request = expenseStore.delete(id)

    request.onsuccess = (event) => {
        console.log('Expense deleted successfully.');
    }
    request.onerror = (event) => {
        console.log('DataBse error : ',event.target.error);
    }
}


