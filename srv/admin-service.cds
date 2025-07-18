using {com.fahrialmd.lunchy2 as lunch2} from '../db/index.cds';

service AdminService {
    entity Orders         as projection on lunch2.Orders;
    entity OrderItems     as projection on lunch2.OrderItems;
    entity Users          as projection on lunch2.Users;
    entity PaymentMethods as projection on lunch2.PaymentMethods;
}
