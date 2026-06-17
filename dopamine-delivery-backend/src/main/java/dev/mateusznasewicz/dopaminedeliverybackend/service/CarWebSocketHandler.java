package dev.mateusznasewicz.dopaminedeliverybackend.service;

import dev.mateusznasewicz.dopaminedeliverybackend.model.Car;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Collection;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class CarWebSocketHandler extends TextWebSocketHandler {
    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();
    private final ObjectMapper objectMapper;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("session {} established.", session.getId());
        sessions.add(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status){
        log.info("session {} closed.", session.getId());
        sessions.remove(session);
    }

    public void broadcastCarList(Collection<Car> cars){
        String jsonMessage = objectMapper.writeValueAsString(cars);
        TextMessage message = new TextMessage(jsonMessage);

        for(WebSocketSession session: sessions){
            if(session.isOpen()) {
                try {
                    session.sendMessage(message);
                } catch (IOException e) {
                    System.err.println("Błąd wysyłki: " + session.getId());
                }
            }
        }

    }

}
