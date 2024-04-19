CREATE TABLE expenses (
  id serial PRIMARY KEY,
  amount numeric(6,2) NOT NULL,
  memo text NOT NULL,
  transaction_date date NOT NULL DEFAULT current_date,
  CONSTRAINT postive_amount CHECK(amount > 0)
);
