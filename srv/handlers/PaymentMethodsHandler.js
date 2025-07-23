module.exports = function () {
    this.before('CREATE', 'PaymentMethods', async (req) => {
        const { data } = req;

        // If this is set as primary, make sure no other payment method for this user is primary
        if (data.isPrimary && data.user_ID) {
            await UPDATE('PaymentMethods')
                .set({ isPrimary: false })
                .where({ user_ID: data.user_ID });
        }

        console.log('Creating new payment method:', data);
    });

    this.before('UPDATE', 'PaymentMethods', async (req) => {
        const { data } = req;

        // Same logic for updates
        if (data.isPrimary && data.user_ID) {
            await UPDATE('PaymentMethods')
                .set({ isPrimary: false })
                .where({ user_ID: data.user_ID, ID: { '!=': req.params[0] } });
        }
    });
};