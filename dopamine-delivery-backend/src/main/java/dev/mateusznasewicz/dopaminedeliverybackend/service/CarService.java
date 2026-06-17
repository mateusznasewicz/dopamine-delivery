package dev.mateusznasewicz.dopaminedeliverybackend.service;

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

    public void registerCar(Car car, List<Point> route) {
        long carId = this.lastId.incrementAndGet();
        car.setId(carId);
        activeCars.put(carId, car);
        log.info("Car {} registered.", carId);
        car.startRoute(route)
                .thenRun(() -> {
                    unregisterCar(carId);
                });
    }

    public void unregisterCar(Long carId) {
        activeCars.remove(carId);
        log.info("Car {} unregistered.", carId);
    }

    @Scheduled(fixedRate = 200)
    public void broadcastAllCars() {
        webSocketHandler.broadcastCarList(activeCars.values());
    }
}
