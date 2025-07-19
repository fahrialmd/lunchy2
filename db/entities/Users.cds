namespace com.fahrialmd.lunchy2;

using {
    managed,
    cuid
} from '@sap/cds/common';

using {com.fahrialmd.lunchy2 as lunchy2} from '../index';

// Buyer Entity
entity Users : cuid, managed {
    userName       : String(25);
    userEmpID      : String(5);
    // Navigation to orders
    orders         : Association to many lunchy2.Orders
                         on orders.user = $self;
    // Navigation to payment methods
    paymentMethods : Association to many lunchy2.PaymentMethods
                         on paymentMethods.user = $self;
}
