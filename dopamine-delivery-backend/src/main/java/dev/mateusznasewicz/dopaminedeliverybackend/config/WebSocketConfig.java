package dev.mateusznasewicz.dopaminedeliverybackend.config;

import dev.mateusznasewicz.dopaminedeliverybackend.service.CarWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final CarWebSocketHandler carWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(carWebSocketHandler, "/ws/car-simulation")
                .setAllowedOrigins("*");
    }
}
