package dev.mateusznasewicz.dopaminedeliverybackend.controller;

import dev.mateusznasewicz.dopaminedeliverybackend.service.CarService;
import dev.mateusznasewicz.dopaminedeliverybackend.service.RouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final CarService carService;

//    @PostMapping
//    public ResponseEntity<Void> handlePayment() {
//        List<Point> route = routeService.getRoute(order.getStartPoint(), order.getEndPoint());
//        return ResponseEntity.ok().build();
//    }
}
