require('dotenv').config();

const express = require('express');
const cors = require('cors');

const supabase = require('./supabase');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


// Test Express server
app.get('/', (req, res) => {
    res.json({
        message: 'Mobile Clinic API is running',
        status: 'online'
    });
});


// Test Supabase connection
app.get('/api/test-supabase', async (req, res) => {

    try {

        const { data, error } = await supabase
            .from('services')
            .select('*');

        if (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            message: 'Successfully connected to Supabase',
            data: data
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});