namespace com.fahrialmd.lunchy2;

using {
    managed,
    cuid
} from '@sap/cds/common';

using {com.fahrialmd.lunchy2 as lunchy2} from '../index';

// Payment Methods Entity (Child of User)
entity PaymentMethods : cuid, managed {
    user          : Association to lunchy2.Users;
    paymentName   : String(50);
    accountNumber : String(100);
    isPrimary     : Boolean default false;
}
