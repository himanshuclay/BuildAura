const bcrypt = require('bcrypt');
const companyDAO = require('../dao/company.dao');
const mongoose = require('mongoose');
require('dotenv').config({ path: `${__dirname}/../.env` });

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to the database', process.env.MONGO_URI))
  .catch((err) => console.error('Database connection error:', err));

(async () => {
    try {
        const superAdmin = {
            company: {
                name: 'Sandeep Sana',
                email: 'sandeep@gmail.com',
                mobile: '9756500345',
                domain: 'sandeep',
                color: '#42b983',
                address: {
                    street: '123 Admin St.',
                    country: 'CountryName',
                    state: 'StateName',
                    zipCode: '123456',
                },
            },
            password: 'Sandeep@123',
            status: 'ACTIVE',
            type: 'SUPER_ADMIN',
        };

        const hashedPassword = await bcrypt.hash(superAdmin.password, 10);

        await companyDAO.insertOne({ 
            ...superAdmin,
            password: hashedPassword, 
        });

        console.log('Super admin created successfully');
    } catch (error) {
        console.error('Error creating super admin:', error);
    } finally {
        mongoose.connection.close();
    }
})();
