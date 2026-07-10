const mongoose = require('mongoose');
const { User } = require('./server/models');

mongoose.connect('mongodb://127.0.0.1:27017/cgpa_db')
    .then(async () => {
        const adminUser = await User.findOne({ reg_no: 'admin' });
        console.log("Admin user in DB:", adminUser);
        
        const allUsers = await User.find({});
        console.log("Total users:", allUsers.length);
        
        process.exit(0);
    })
    .catch(err => console.error(err));
