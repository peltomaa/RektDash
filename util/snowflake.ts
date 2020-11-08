import snowflake from 'snowflake-sdk';

export const connection = snowflake.createConnection({
    account: process.env.SNO_ACCOUNT,
    warehouse: process.env.SNO_WAREHOUSE,
    database: process.env.SNO_DATABASE,
    username: process.env.SNO_USERNAME,
    password: process.env.SNO_PASSWORD
});

connection.connect( 
    function(err, conn) {
        if (err) {
            console.error('Unable to connect: ' + err.message);
        } else {
            console.log('Successfully connected to Snowflake.');
        }
    }
);
