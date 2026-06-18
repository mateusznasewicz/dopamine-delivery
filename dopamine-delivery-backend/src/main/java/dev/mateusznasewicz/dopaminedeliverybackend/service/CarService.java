package dev.mateusznasewicz.dopaminedeliverybackend.service;

import dev.mateusznasewicz.dopaminedeliverybackend.dto.CarStateDTO;
import dev.mateusznasewicz.dopaminedeliverybackend.dto.Coordinates;
import dev.mateusznasewicz.dopaminedeliverybackend.model.Car;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.geo.Point;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
public class CarService {
    private final CarWebSocketHandler webSocketHandler;
    private final Map<Long, Car> activeCars = new ConcurrentHashMap<>();
    private final AtomicLong lastId = new AtomicLong(0);
    private final RouteService routeService;
    private boolean wasEmptyInLastTick = true;

    public void startDelivery(String guestID, double restaurantLng, double restaurantLat, double deliveryLng, double deliveryLat) {
        Car car = new Car(guestID, 50, restaurantLng, restaurantLat, deliveryLng, deliveryLat);
        long carId = this.lastId.incrementAndGet();
        car.setId(carId);
        Coordinates start = new Coordinates(restaurantLat, restaurantLng);
        Coordinates end = new Coordinates(deliveryLat, deliveryLng);

        List<Coordinates> route = routeService.getRoute(start, end);
        this.registerCar(car, route);
    }

    private void registerCar(Car car, List<Coordinates> route) {
        long carId = car.getId();
        activeCars.put(carId, car);
        log.info("Car {} registered.", carId);
        car.startRoute(route)
            .thenRun(() -> {
                unregisterCar(carId);
            });
    }

    private void unregisterCar(Long carId) {
        activeCars.remove(carId);
        log.info("Car {} unregistered.", carId);
    }

    @Scheduled(fixedRate = 200)
    public void broadcastAllCars() {
        boolean currentlyEmpty = activeCars.isEmpty();
        if (!currentlyEmpty || !wasEmptyInLastTick) {
            List<CarStateDTO> carSnapshots = activeCars.values().stream()
                    .map(Car::toDTO)
                    .toList();

            webSocketHandler.broadcastCarList(carSnapshots);
            wasEmptyInLastTick = currentlyEmpty;
        }
    }
}
