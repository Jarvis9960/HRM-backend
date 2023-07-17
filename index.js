import express from 'express';

const app = express();
const PORT = 5000

app.get('/', (req, res)=>{
    res.send('Durgesh Here')
})


app.listen(PORT, () => {
    console.log(`server is running on PORT ${PORT}`)
})