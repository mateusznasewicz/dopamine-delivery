package dev.mateusznasewicz.dopaminedeliverybackend.model;

import dev.mateusznasewicz.dopaminedeliverybackend.dto.CarStateDTO;
import dev.mateusznasewicz.dopaminedeliverybackend.dto.Coordinates;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.geo.Point;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;

@AllArgsConstructor
@Getter
@Setter
@Slf4j
public class Car {
    private long id;
    private String guestID;

    private volatile double speed;
    private volatile double lng;
    private volatile double lat;
    private volatile double destinationLng;
    private volatile double destinationLat;
    private volatile boolean isMoving;

    public Car(String guestID, double speed, double lng, double lat, double destinationLng, double destinationLat) {
        this.guestID = guestID;
        this.speed = speed;
        this.lng = lng;
        this.lat = lat;
        this.destinationLng = destinationLng;
        this.destinationLat = destinationLat;
    }

    public CompletableFuture<Void> startRoute(List<Coordinates> route){
        return CompletableFuture.runAsync(() -> {
            this.isMoving = true;
            for(int i = 0; i < route.size() - 1; i++) {
                moveCar(route.get(i), route.get(i + 1));
            }
            this.isMoving = false;
        }, Executors.newVirtualThreadPerTaskExecutor());
    }

    public synchronized CarStateDTO toDTO() {
        return new CarStateDTO(
                this.id,
                this.guestID,
                this.lat,
                this.lng,
                this.destinationLat,
                this.destinationLng,
                this.speed
        );
    }

    public void moveCar(Coordinates origin, Coordinates destination) {
        synchronized (this) {
            this.destinationLng = destination.lng();
            this.destinationLat = destination.lat();
        }

        double speedMS = this.speed / 3.6;
        long tickRateMs = 200;
        long lastTickTime = System.currentTimeMillis();
        boolean reachedTarget = false;

        while (true) {
            long currentTickTime = System.currentTimeMillis();
            double deltaTimeSeconds = (currentTickTime - lastTickTime) / 1000.0;
            lastTickTime = currentTickTime;

            double currentLng;
            double currentLat;
            synchronized (this) {
                currentLng = this.lng;
                currentLat = this.lat;
            }

            double remainingDistance = calculateDistance(new Coordinates(currentLat, currentLng), destination);
            double distanceTraveledInThisTick = speedMS * deltaTimeSeconds;
            if (distanceTraveledInThisTick >= remainingDistance) {
                synchronized (this) {
                    this.lng = destination.lng();
                    this.lat = destination.lat();
                }
                reachedTarget = true;
            } else {
                double localProgress = distanceTraveledInThisTick / remainingDistance;
                double nextLng = currentLng + (destination.lng() - currentLng) * localProgress;
                double nextLat = currentLat + (destination.lat() - currentLat) * localProgress;

                synchronized (this) {
                    this.lng = nextLng;
                    this.lat = nextLat;
                }
            }

            log.info("Car {} moved to: ({}, {})", this.id, this.lng, this.lat);
            if (reachedTarget) {
                break;
            }

            try {
                Thread.sleep(tickRateMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }

    private double calculateDistance(Coordinates origin, Coordinates destination) {
        double R = 6371000;
        double lat1 = origin.lat();
        double lon1 = origin.lng();
        double lat2 = destination.lat();
        double lon2 = destination.lng();

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        lat1 = Math.toRadians(lat1);
        lat2 = Math.toRadians(lat2);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
