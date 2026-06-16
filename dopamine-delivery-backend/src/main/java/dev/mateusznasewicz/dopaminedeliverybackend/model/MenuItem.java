package dev.mateusznasewicz.dopaminedeliverybackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@Document(collection = "menu_items")
public class MenuItem {
    @JsonIgnore
    @Id
    private String id;
    private String name;
    @Field("image_name")
    private String imageName;
    private double price;
    private String description;
    private String cuisine;
}