module.exports = function () {
    this.before('CREATE', 'Users', async (req) => {
        const { data } = req;

        // Validate userEmpID uniqueness
        if (data.userEmpID) {
            const existing = await SELECT.one.from('Users').where({ userEmpID: data.userEmpID });
            if (existing) {
                req.error(400, `Employee ID ${data.userEmpID} already exists`);
            }
        }

        console.log('Creating new user:', data);
    });
};