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
    customerName : String(100)                         @title: 'Customer Name';
    menuItemName : String(100)                         @title: 'Menu Item';
    quantity     : Integer default 1                   @title: 'Quantity';
    unitPrice    : Integer                             @title: 'Unit Price'  @Semantics.amount.currencyCode: 'currency';
    itemTotal    : Integer                             @title: 'Item Total'  @Core.Computed  @Semantics.amount.currencyCode: 'currency';
    itemStatus   : Association to lunchy2.ItemStatuses @title: 'Item Status';
    currency     : Currency default 'IDR'              @title: 'Currency';
}
