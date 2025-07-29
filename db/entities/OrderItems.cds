namespace com.fahrialmd.lunchy2;

using {
    managed,
    cuid,
    Currency
} from '@sap/cds/common';

using {com.fahrialmd.lunchy2 as lunchy2} from '../index';

// Order Items Entity
entity OrderItems : cuid, managed {
    order           : Association to lunchy2.Orders;
    user            : Association to lunchy2.Users;
    menu            : String(100);
    quantity        : Integer default 1;
    price           : Integer  @Semantics.amount.currencyCode: 'currency';
    itemDeliveryFee : Integer  @Core.Computed  @Semantics.amount.currencyCode: 'currency';
    itemDiscount    : Integer  @Core.Computed  @Semantics.amount.currencyCode: 'currency';
    itemExtra       : Integer  @Core.Computed  @Semantics.amount.currencyCode: 'currency';
    total           : Integer  @Core.Computed  @Semantics.amount.currencyCode: 'currency';
    status          : Association to lunchy2.ItemStatuses;
    currency        : Currency default 'IDR';
}
