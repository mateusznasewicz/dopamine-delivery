package dev.mateusznasewicz.dopaminedeliverybackend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document(collection = "restaurants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Restaurant {
    @Id
    private String id;
    private String type;
    private Properties properties;

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private Point geometry;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Properties {
        private String name;
        private String image_name;
        private Map<String, Object> other_tags;
    }
}
