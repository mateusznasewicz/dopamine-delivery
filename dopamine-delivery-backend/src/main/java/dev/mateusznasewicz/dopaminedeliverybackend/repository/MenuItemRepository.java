package dev.mateusznasewicz.dopaminedeliverybackend.repository;

import dev.mateusznasewicz.dopaminedeliverybackend.model.MenuItem;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface MenuItemRepository extends MongoRepository<MenuItem, String> {
    List<MenuItem> findByCuisine(String cuisine);

    @Aggregation(pipeline = {
            "{ '$match': { 'cuisine': ?0 } }",
            "{ '$sample': { 'size': 1 } }"
    })
    Optional<MenuItem> findRandomItemByCuisine(String cuisine);
}
