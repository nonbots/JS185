import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export function displayHelp(client) {
  console.log(`Commands:
  add AMOUNT MEMO [DATE] - record a new expense
  clear - delete all expenses
  list - list all expenses
  delete NUMBER - remove expense with id NUMBER
  search QUERY - list expenses with a matching memo field`);
}

export async function createExpensesTable(client) {
  const response = await client.connect();
  console.log("Connection created");
  const queryStr = `CREATE TABLE IF NOT EXISTS expenses (
                                      id serial PRIMARY KEY,
                                      amount decimal(4,2) NOT NULL,
                                      memo text NOT NULL,
                                      transaction_date date NOT NULL DEFAULT current_date,
                                      CONSTRAINT postive_amount CHECK(amount > 0)
                                      )`
  await client.query(queryStr);
  await client.end();
}

export async function dropExpenseTable(client) {
  const queryStr = `DROP TABLE IF EXISTS expenses`;
  const data = await client.query(queryStr);
  console.log("Expenses table dropped");
  await client.end();
}

export async function add(amount, memo, client){
  const response = await client.connect();
  console.log("Connection created");
  if(!Number.isNaN(amount) && amount > 0 && memo !== undefined){
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
  } else {
    console.log("You messed up!");
  }
  await client.end();
}

export async function list(client) {
  const response = await client.connect();
  console.log("Connection created");

  const queryStr = `SELECT 
                    id,
                    to_char(transaction_date, 'Dy Mon DD YYYY') AS transaction_date,
                    amount,
                    memo
                  FROM 
                    expenses`
  const data = await client.query(queryStr)
  console.log(`There is/are ${data.rowCount} expense(s)`);
  console.log(formatRecords(data.rows));
  await client.end();
}

function formatRecord(record) {
  return `${String(record.id).padStart(3)} | ${record.transaction_date.padStart(10)} | ${String(record.amount).padStart(12)} | ${record.memo}`;
}
export function formatRecords(records){
  return records.map(formatRecord).join('\n');
}

export async function deleteById(id,client) {
  const response = await client.connect();
  console.log("Connection created");
  if(!Number.isNaN(id)) {
    const querySelStr = `SELECT * FROM expenses WHERE id = $1`;
    const values = [id];
    const dataSel = await client.query(querySelStr, values);
    if(dataSel.rowCount === 1)  {
      const queryStr = `DELETE FROM expenses WHERE id = $1`
      const data = await client.query(queryStr, values);
      console.log(`${data.rowCount} expense(s) deleted`);
    }else{
      console.log("Record id does not exist");
    }
  } else {
    console.log("Id was not provided");
  }
  await client.end();
}

export async function searchByMemo(memo,client){
  const response = await client.connect();
  console.log("Connection created");
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
  await client.end();
}

export async function clear(client) {
  const rl = readline.createInterface({ input, output });
  const response = await client.connect();
  console.log("Connection created");
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

  await client.end();
  rl.close();
}
//dropExpenseTable();
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

//await client.end();
