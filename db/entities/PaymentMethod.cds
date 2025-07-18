namespace com.fahrialmd.lunchy2;

using {
    managed,
    cuid
} from '@sap/cds/common';

using {com.fahrialmd.lunchy2 as lunchy2} from '../index';

// Payment Methods Entity (Child of Buyer)
entity PaymentMethods : cuid, managed {
    buyer         : Association to lunchy2.Users;
    paymentMethod : Association to lunchy2.PaymentMethodTypes;
    paymentName   : String(50);
    accountNumber : String(100);
    isActive      : Boolean default true;
    isPrimary     : Boolean default false;
}
