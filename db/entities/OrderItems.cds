namespace com.fahrialmd.lunchy2;

using {
    managed,
    cuid,
    Currency
} from '@sap/cds/common';

using {com.fahrialmd.lunchy2 as lunchy2} from '../index';

// Order Items Entity
entity OrderItems : cuid, managed {
    order        : Association to lunchy2.Orders;
    customerName : String(100);
    menuItemName : String(100);
    quantity     : Integer default 1;
    unitPrice    : Integer  @Semantics.amount.currencyCode: 'currency';
    itemTotal    : Integer  @Core.Computed  @Semantics.amount.currencyCode: 'currency';
    itemStatus   : Association to lunchy2.ItemStatuses;
    currency     : Currency;
}
