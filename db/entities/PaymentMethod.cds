namespace com.fahrialmd.lunchy2;

using {
    managed,
    cuid
} from '@sap/cds/common';

using {com.fahrialmd.lunchy2 as lunchy2} from '../index';

// Payment Methods Entity (Child of Buyer)
entity PaymentMethods : cuid, managed {
    buyer         : Association to lunchy2.Users              @title: 'Buyer';
    paymentMethod : Association to lunchy2.PaymentMethodTypes @title: 'Payment Method Type';
    paymentName   : String(50)                                @title: 'Payment Name'; // BRI, BCA, GOPAY, etc.
    accountNumber : String(100)                               @title: 'Account Number';
    isActive      : Boolean default true                      @title: 'Is Active';
    isPrimary     : Boolean default false                     @title: 'Is Primary Payment';
}
    