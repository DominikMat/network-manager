package com.server;

import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import java.io.IOException;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class RestApiController {

    private final NetworkManager networkManager;

    public RestApiController(NetworkManager networkManager) {
        this.networkManager = networkManager;
    }

    @PatchMapping("/devices/{id}")
    public boolean updateDevice(@PathVariable int id, @RequestBody Map<String, Boolean> body) {
        boolean active = body.get("active");
        return networkManager.toggleDeviceState(id, active);
    }

    @GetMapping(path = "/devices/{id}/reachable-devices")
    public Flux<ServerSentEvent<String>> streamReachableDevices(@PathVariable int id) throws IOException {
        if ( !networkManager.subscribeToDevice(id) ) return null; // dont return if we already subscribed (if not we subscribe)
        return networkManager.generateInitialStateEvent(id);
    }
}