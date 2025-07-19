using {com.fahrialmd.lunchy2 as lunchy2} from '../db/index.cds';

service MainService {
    entity Orders         as projection on lunchy2.Orders;
    entity OrderItems     as projection on lunchy2.OrderItems;
    entity Users          as projection on lunchy2.Users;
    entity PaymentMethods as projection on lunchy2.PaymentMethods;
}
