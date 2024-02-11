const expenseForm = document.querySelector('#expense-form');
const expenseDate = document.querySelector('#expense-date-input');
const expenseText = document.querySelector('#expense-text-input');
const expenseAmt = document.querySelector('#expense-amt-input');
const expensesDiv = document.querySelector('#expenses-div');

// DB variables
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

dbRequest.onsuccess = (event) => {
    db = event.target.result;
    getRecord();
}

function addRecord(date, expense, amt){
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
        let formattedResult = {}
        if(result?.length > 0){
            if(!date){
                result.forEach(expense => {
                    var date = expense.date;
                    if(!formattedResult[date]){
                        formattedResult[date] = [];
                    }
                    formattedResult[date].push(expense);
                });
            }else{
                formattedResult[date] = result;
            }
            displayExpenses(formattedResult);
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

expenseForm.addEventListener('submit', (event)=> {
    event.preventDefault();
    //TODO: validations

    addRecord(expenseDate.value, expenseText.value, Number(expenseAmt.value));
});

function setTodayDate(){
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    expenseDate.value = formattedDate;
}

function displayExpenses(expenseListGroup){
    for (const key in expenseListGroup) {
        if (Object.hasOwnProperty.call(expenseListGroup, key)) {
            const expenseList = expenseListGroup[key];
            let dayElement = document.createElement('div');
            let total = 0;
            dayElement.setAttribute('class','expense-day');
            dayElement.innerHTML = `
            <div class="expense-date">${key}</div>
            <div class="expense-total">Total : ₹ ${total}</div>
            `
            expensesDiv.insertAdjacentElement('beforeend',dayElement);
            console.log('key => ',key);
            expenseList.forEach(expense => {
                console.log('expense',expense.expense, expense.amt);
                let element = document.createElement('div');
                element.setAttribute('class','expense-element');
                element.innerHTML = `
                    <div class="expense-text">${expense.expense}</div>
                    <div class="expense-amt">₹ ${expense.amt}</div>
                `
                expensesDiv.insertAdjacentElement('beforeend',element);
                total += expense.amt;
            });
        }
    }
}

setTodayDate();