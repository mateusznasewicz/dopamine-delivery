package dev.mateusznasewicz.dopaminedeliverybackend.model;

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
    private double id;
    private volatile double speed;
    private volatile double lng;
    private volatile double lat;
    private volatile double destinationLng;
    private volatile double destinationLat;
    private volatile boolean isMoving = true;

    public CompletableFuture<Void> startRoute(List<Point> route){
        return CompletableFuture.runAsync(() -> {
            for(int i = 0; i < route.size() - 1; i++) {
                this.destinationLng = route.get(i + 1).getX();
                this.destinationLat = route.get(i + 1).getY();
                moveCar(route.get(i), route.get(i + 1));
            }
        }, Executors.newVirtualThreadPerTaskExecutor());
    }

    public void moveCar(Point origin , Point destination) {
        double speedMS = this.speed / 3.6;
        double distance = calculateDistance(origin, destination);
        double duration = (distance / speedMS) * 1000;
        double progress = 0;
        double startTime = System.currentTimeMillis();
        long tickRateMs = 200;

        while(progress < 1){
            double elapsedTime = System.currentTimeMillis() - startTime;
            progress = Math.min(elapsedTime / duration, 1);
            this.lng = origin.getX() + (destination.getX() - origin.getX()) * progress;
            this.lat = origin.getY() + (destination.getY() - origin.getY()) * progress;
            log.info("Car {} moved to: ({}, {})", this.id, this.lng, this.lat);
            if(progress >= 1){
                break;
            }
            try {
                Thread.sleep(tickRateMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        this.isMoving = false;
    }

    private double calculateDistance(Point origin, Point destination) {
        double R = 6371000;
        double lat1 = origin.getY();
        double lon1 = origin.getX();
        double lat2 = destination.getY();
        double lon2 = destination.getX();

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
