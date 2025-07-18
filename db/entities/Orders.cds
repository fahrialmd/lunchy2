namespace com.fahrialmd.lunchy2;

using {
    managed,
    cuid,
    Currency
} from '@sap/cds/common';

using {com.fahrialmd.lunchy2 as lunchy2} from '../index';

// Order Header Entity
entity Orders : cuid, managed {
    orderNumber     : String(12);
    description     : String(255);
    user            : Association to lunchy2.Users;
    orderDate       : Date;
    orderTime       : Time;
    deliveryFee     : Integer       @Semantics.amount.currencyCode: 'currency';
    discountPercent : Decimal(5, 2) @assert.range                 : [
        0,
        100
    ];
    discountLimit   : Integer       @Semantics.amount.currencyCode: 'currency';
    totalAmount     : Integer       @Core.Computed  @Semantics.amount.currencyCode: 'currency';
    currency        : Currency default 'IDR';
    status          : Association to lunchy2.OrderStatuses;

    // Navigation to order items
    items           : Composition of many lunchy2.OrderItems
                          on items.order = $self;
}
