package dev.mateusznasewicz.dopaminedeliverybackend.repository;

import dev.mateusznasewicz.dopaminedeliverybackend.model.Restaurant;
import org.springframework.data.domain.Pageable;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RestaurantRepository extends MongoRepository<Restaurant, String> {
    List<Restaurant> findByGeometryNear(Point location, Distance maxDistance, Pageable pageable);
}
