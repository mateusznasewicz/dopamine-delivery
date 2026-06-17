package dev.mateusznasewicz.dopaminedeliverybackend.service;

import org.springframework.data.geo.Point;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class RouteService {

    private final RestClient restClient = RestClient.create();

    public List<Point> getRoute(Point start, Point end) {
        String url = "https://router.project-osrm.org/route/v1/driving/" + start.getX() + "," + start.getY() + ";" + end.getX() + "," + end.getY() + "?geometries=geojson";
        OsrmResponse res =  restClient.get()
                .uri(url)
                .retrieve()
                .body(OsrmResponse.class);

        return res.routes().getFirst().geometry().coordinates();
    }
}

record OsrmResponse(String code, List<OsrmRoute> routes) {}
record OsrmRoute(OsrmGeometry geometry) {}
record OsrmGeometry(List<Point> coordinates) {}
