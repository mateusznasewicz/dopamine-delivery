package dev.mateusznasewicz.dopaminedeliverybackend.service;

import dev.mateusznasewicz.dopaminedeliverybackend.model.MenuItem;
import dev.mateusznasewicz.dopaminedeliverybackend.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuItemRepository menuItemRepository;

    @Value("${DISH_IMAGES_PATH}")
    private String imagesPath;


    public List<MenuItem> getMenu(String cuisine) {
        List<MenuItem> menuItems = menuItemRepository.findByCuisine(cuisine);
        menuItems.forEach(item -> {
            if(!imageExists(item.getImageName())) {
                item.setImageName("default_dish.jpg");
            }
        });

        return menuItemRepository.findByCuisine(cuisine);
    }

    public String getRandomImageForCuisine(String cuisine) {
        return menuItemRepository.findRandomItemByCuisine(cuisine)
                .map(MenuItem::getImageName)
                .filter(this::imageExists)
                .orElse("default_restaurant.jpg");
    }

    private boolean imageExists(String imageName) {
        if (imageName == null || imageName.trim().isEmpty()) {
            return false;
        }
        try {
            Path path = Paths.get(imagesPath, imageName);
            return Files.exists(path) && !Files.isDirectory(path);
        } catch (Exception e) {
            return false;
        }
    }
}
