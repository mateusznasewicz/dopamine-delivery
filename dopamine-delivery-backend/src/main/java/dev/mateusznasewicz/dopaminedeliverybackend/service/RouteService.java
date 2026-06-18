package dev.mateusznasewicz.dopaminedeliverybackend.service;

import dev.mateusznasewicz.dopaminedeliverybackend.dto.Coordinates;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
@Slf4j
public class RouteService {

    private final RestClient restClient = RestClient.builder()
            .defaultHeader("Accept-Encoding", "identity")
            .build();

    public List<Coordinates> getRoute(Coordinates start, Coordinates end) {
        String url = "https://router.project-osrm.org/route/v1/driving/" + start.lng() + "," + start.lat() + ";" + end.lng() + "," + end.lat() + "?geometries=geojson&overview=full";
        log.info("Requesting route {}", url);
        OsrmResponse res =  restClient.get()
                .uri(url)
                .retrieve()
                .body(OsrmResponse.class);
        List<double[]> rawCoordinates = res.routes().getFirst().geometry().coordinates();
        return rawCoordinates.stream().map(
                cord -> new Coordinates(cord[1], cord[0])
        ).toList();
    }
}

record OsrmResponse(String code, List<OsrmRoute> routes) {}
record OsrmRoute(OsrmGeometry geometry) {}
record OsrmGeometry(List<double[]> coordinates) {}
