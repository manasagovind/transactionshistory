const PORT=process.env.PORT ??4000
const express=require("express");
const app=express();
const dotenv=require("dotenv");
const cors=require("cors");
dotenv.config()
const pool =require("./db");
app.use(cors());
app.use(express.json());

app.post("/transactions",async(req,res)=>{
    try{
        const { type,category,amount,transaction_date,description}=req.body;
        const newTransaction=await pool.query("INSERT INTO transactions(type,category,amount,transaction_date,description) VALUES($1,$2,$3,$4,$5) RETURNING *",[type,category,amount,transaction_date,description]);
        res.json(newTransaction.rows[0]);
    }
    catch(err){
        console.log(err.message);
    }
})

app.get ("/transactions",async(req,res)=>{
    try{
        const allTransactions=await pool.query("SELECT * FROM transactions");
        res.json(allTransactions.rows);
    }catch(err){
        console.error(err.message);
    }

})

app.get("/transactions/:id",async(req,res)=>{
    try {
        const {id}=req.params
    const getTransactions=await pool.query("SELECT * FROM transactions WHERE id=$1",[id])
    res.json(getTransactions.rows[0])
        
    } catch (err) {
        console.error(err.message);
    }
    
})

app.put("/transactions/:id",async(req,res)=>{
    try {
        const {id}=req.params
        const { type,category,amount,transaction_date,description}=req.body;
    const updateTransaction=await pool.query("UPDATE transactions SET type=$1,category=$2,amount=$3,transaction_date=$4,description=$5 WHERE id=$6",[type,category,amount,transaction_date,description,id])
    res.json("Transaction was updated")
        
    } catch (err) {
        console.error(err.message);
    }
    
})




app.delete("/transactions/:id",async(req,res)=>{
    try {
        const{id}=req.params
        const deleteTransactions=await pool.query("DELETE FROM transactions WHERE id=$1",[id])
        res.json("Transaction was deleted")
        
    } catch (err) {
        console.error(err.message);
    }
})

app.get("/summary",async(req,res)=>{
    try{
        const summarypermonth=await pool.query("SELECT to_char(transaction_date,'YYYY-MM') AS Monthly_Transactions,SUM(CASE WHEN type='INCOME' THEN amount ELSE 0 END)AS Total_Income,SUM(CASE WHEN type='EXPENSE' THEN amount ELSE 0 END) AS Total_Expenses,(SUM(CASE WHEN type='INCOME' THEN amount ELSE 0 END)-SUM(CASE WHEN type='EXPENSE' THEN amount ELSE 0 END)) AS Savings_per_month from transactions GROUP BY Monthly_Transactions ORDER BY Monthly_Transactions ASC")
        res.json(summarypermonth.rows)
    }catch (err) {
        console.error(err.message);
    }
})



app.listen(PORT,()=>{
    console.log(`Server has started running on port  ${PORT}`);
});
