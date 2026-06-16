package dev.mateusznasewicz.dopaminedeliverybackend.controller;

import dev.mateusznasewicz.dopaminedeliverybackend.model.MenuItem;
import dev.mateusznasewicz.dopaminedeliverybackend.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("/api/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    public ResponseEntity<List<MenuItem>> getMenu(@RequestParam String cuisine) {
        return ResponseEntity.ok(menuService.getMenu(cuisine));
    }

    @GetMapping("/restaurant-header")
    public ResponseEntity<String> getRandomImageForCuisine(@RequestParam("cuisine") String cuisine) {
        return ResponseEntity.ok(menuService.getRandomImageForCuisine(cuisine));
    }
}
