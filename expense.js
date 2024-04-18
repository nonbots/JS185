import de from 'dotenv';
const password = de.config().parsed.password;
import pg from 'pg'
const { Client } = pg
const client = new Client({database:'transactions', password: password});
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

const response = await client.connect();
console.log("Connection created");

async function createExpenseTable() {
  const queryStr = `CREATE TABLE IF NOT EXISTS expenses (
                                      id serial PRIMARY KEY,
                                      amount decimal(4,2) NOT NULL,
                                      memo text NOT NULL,
                                      transaction_date date NOT NULL DEFAULT current_date,
                                      CONSTRAINT postive_amount CHECK(amount > 0)
                                      )`
  await client.query(queryStr);
}

async function dropExpenseTable() {
  const queryStr = `DROP TABLE IF EXISTS expenses`;
  const data = await client.query(queryStr);
  console.log("Expenses table dropped");
}

async function add(amount, memo){
  const queryStr = `INSERT INTO expenses (
                                          amount,
                                          memo
                                        )VALUES(
                                          $1,
                                          $2
                                        )`
  const values = [amount, memo];
  try{
    const data = await client.query(queryStr, values);
    console.log("Expense added");
  }catch(error){
    console.log(error.message);
  }
}

async function list() {
  const queryStr = `SELECT 
                    id,
                    to_char(transaction_date, 'Dy Mon DD YYYY') AS transaction_date,
                    amount,
                    memo
                  FROM 
                    expenses`
  const data = await client.query(queryStr)
  console.log(formatRecords(data.rows));
}

function formatRecord(record) {
  return `${record.id} | ${record.transaction_date} | ${record.amount} | ${record.memo}`;
}
function formatRecords(records){
  return records.map(formatRecord).join('\n');
}

async function deleteById(id) {
  const queryStr = `DELETE FROM expenses WHERE id = $1`
  const values = [id];
  const data = await client.query(queryStr, values);
  console.log("Record was deleted.");
}

async function searchByMemo(memo){
  const queryStr = `SELECT 
                    id,
                    to_char(transaction_date, 'Dy Mon DD YYYY') AS transaction_date,
                    amount,
                    memo
                  FROM 
                    expenses
                  WHERE memo = $1`
  const values =[memo];
  const data = await client.query(queryStr, values);
  console.log(`There is/are ${data.rowCount} expense(s).`);
  console.log(formatRecords(data.rows));
}

async function clear() {
  let  answer = await rl.question('Are you sure you want delete all records? (y/n)\n');
  while (answer !== 'n' && answer !== 'y'){
    answer = await rl.question(`Answer with 'y' for yes or 'n' of no.\n`);
    console.log("answer", answer);
  }
  if (answer === 'n') {
    console.log(`Clear action has been canceled.`);
  } else if (answer === 'y')  {
    const queryStr = `DELETE FROM expenses`;
    const data = await client.query(queryStr);
    console.log("All records were deleted");
  }
   
  rl.close();
}
//dropExpenseTable();
createExpenseTable();
/*
add(4.66, 'picture frame');
add(9.66, 'cookies');
add(1.66, 'gum');
add(7.66, 'bread');
list();
deleteById(1);
list();
searchByMemo('bread');
dropExpenseTable();
*/
const action = process.argv[2];
const args = process.argv.splice(3);
switch (action) {
  case 'add':
    let [amount, memo] = args;
    amount = Number(amount);
    add(amount, memo);
    break;
  case 'list':
    list();
    break;
  case 'search':
    let [memoSearch] = args;
    searchByMemo(memoSearch);
    break;
  case 'delete':
    let [id] = args;
    deleteById(Number(id));
    break;
  case 'clear':
    clear();
}
