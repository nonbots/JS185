import de from 'dotenv';
const password = de.config().parsed.password;
import pg from 'pg'
const { Client } = pg
import {
  displayHelp, 
  createExpensesTable,
  add,
  list,
  deleteById,
  searchByMemo,
  clear,
  formatRecords
} from './expense.js'
class ExpenseData {
  constructor() {
    this.client =  new Client({database:'transactions', password: password});
 //   this.createExpensesTable();
  }
  list = list
  add = add
  searchByMemo = searchByMemo
  deleteById = deleteById
  clear = clear
  formatRecords = formatRecords
  createExpensesTable = createExpensesTable
}
class CLI {
  constructor(){
    this.expenseData = new ExpenseData();
  }
  displayHelp = displayHelp
  run(action,args) {
   switch (action) {
    case 'add':
      let [amount, memo] = args;
      amount = Number(amount);
      this.expenseData.add(amount, memo, this.expenseData.client);
      break;
    case 'list':
      this.expenseData.list(this.expenseData.client);
      break;
    case 'search':
      let [memoSearch] = args;
      this.expenseData.searchByMemo(memoSearch, this.expenseData.client);
      break;
    case 'delete':
      let [id] = args;
      this.expenseData.deleteById(Number(id), this.expenseData.client);
      break;
    case 'clear':
      this.expenseData.clear(this.expenseData.client);
      break;
    default:
      this.displayHelp();
    }   
    
  }
}
//console.log(list, createExpensesTable);
let cli = new CLI();
//console.log(cli.expenseData.list, cli.expenseData.createExpensesTable);
const action = process.argv[2];
const args = process.argv.splice(3);
cli.run(action, args);

